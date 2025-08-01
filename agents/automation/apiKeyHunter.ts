import { EventEmitter } from 'events';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';

interface APIKeyConfig {
  service: string;
  loginUrl: string;
  dashboardUrl: string;
  selectors: {
    username?: string;
    password?: string;
    loginButton?: string;
    apiKeyLocation: string;
  };
  credentials?: {
    username: string;
    password: string;
  };
}

export class APIKeyHunter extends EventEmitter {
  private browser: Browser | null = null;
  private configs: APIKeyConfig[] = [];

  constructor() {
    super();
    this.loadConfigurations();
  }

  private async loadConfigurations() {
    // Load API key hunting configurations
    this.configs = [
      {
        service: 'supabase',
        loginUrl: 'https://app.supabase.io/sign-in',
        dashboardUrl: 'https://app.supabase.io/project/_/settings/api',
        selectors: {
          username: 'input[type="email"]',
          password: 'input[type="password"]',
          loginButton: 'button[type="submit"]',
          apiKeyLocation: '[data-testid="anon-key"]'
        }
      },
      {
        service: 'openai',
        loginUrl: 'https://platform.openai.com/login',
        dashboardUrl: 'https://platform.openai.com/api-keys',
        selectors: {
          username: 'input[name="username"]',
          password: 'input[name="password"]',
          loginButton: 'button[type="submit"]',
          apiKeyLocation: '.api-key-value'
        }
      },
      {
        service: 'notion',
        loginUrl: 'https://www.notion.so/login',
        dashboardUrl: 'https://www.notion.so/my-integrations',
        selectors: {
          username: 'input[type="email"]',
          password: 'input[type="password"]',
          loginButton: 'div[role="button"]',
          apiKeyLocation: '.integration-token'
        }
      }
    ];
  }

  async run() {
    const results = {
      success: true,
      keysFound: {} as Record<string, string>,
      errors: [] as any[]
    };

    try {
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Hunt for each configured service
      for (const config of this.configs) {
        try {
          console.log(`🔍 Hunting for ${config.service} API key...`);
          const key = await this.huntAPIKey(config);
          
          if (key) {
            results.keysFound[config.service] = key;
            console.log(`✅ Found ${config.service} API key`);
          }
        } catch (error) {
          console.error(`❌ Failed to get ${config.service} key:`, error);
          results.errors.push({ service: config.service, error });
          results.success = false;
        }
      }

      // Save found keys
      if (Object.keys(results.keysFound).length > 0) {
        await this.saveAPIKeys(results.keysFound);
      }

      return results;
    } catch (error) {
      this.emit('critical', {
        type: 'browser_launch_failure',
        error
      });
      
      return { success: false, error };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async huntAPIKey(config: APIKeyConfig): Promise<string | null> {
    if (!this.browser) return null;

    const page = await this.browser.newPage();
    
    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

      // Check if we have stored session
      const cookies = await this.loadCookies(config.service);
      if (cookies) {
        await page.setCookie(...cookies);
      }

      // Navigate to dashboard first to check if already logged in
      await page.goto(config.dashboardUrl, { waitUntil: 'networkidle2' });

      // Check if redirected to login
      if (page.url().includes('login') || page.url().includes('sign-in')) {
        // Need to login
        if (!config.credentials) {
          console.log(`⚠️  No credentials provided for ${config.service}`);
          return null;
        }

        await this.performLogin(page, config);
      }

      // Extract API key
      const apiKey = await this.extractAPIKey(page, config);
      
      // Save cookies for next time
      const newCookies = await page.cookies();
      await this.saveCookies(config.service, newCookies);

      return apiKey;
    } catch (error) {
      throw error;
    } finally {
      await page.close();
    }
  }

  private async performLogin(page: Page, config: APIKeyConfig) {
    if (!config.credentials) return;

    // Navigate to login page
    await page.goto(config.loginUrl, { waitUntil: 'networkidle2' });

    // Fill in credentials
    if (config.selectors.username) {
      await page.waitForSelector(config.selectors.username);
      await page.type(config.selectors.username, config.credentials.username);
    }

    if (config.selectors.password) {
      await page.waitForSelector(config.selectors.password);
      await page.type(config.selectors.password, config.credentials.password);
    }

    // Click login button
    if (config.selectors.loginButton) {
      await page.click(config.selectors.loginButton);
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Handle 2FA if needed
    await this.handle2FA(page, config);
  }

  private async handle2FA(page: Page, config: APIKeyConfig) {
    // Check for 2FA prompt
    const has2FA = await page.$('input[type="text"][autocomplete="one-time-code"]');
    
    if (has2FA) {
      console.log(`⚠️  2FA required for ${config.service}`);
      
      // Could implement:
      // - Wait for user input
      // - Read from authenticator app
      // - SMS integration
      
      // For now, wait for manual entry
      await page.waitForNavigation({ 
        waitUntil: 'networkidle2',
        timeout: 120000 // 2 minutes for user to enter 2FA
      });
    }
  }

  private async extractAPIKey(page: Page, config: APIKeyConfig): Promise<string | null> {
    try {
      // Navigate to API key page if not already there
      if (!page.url().includes(config.dashboardUrl)) {
        await page.goto(config.dashboardUrl, { waitUntil: 'networkidle2' });
      }

      // Wait for API key element
      await page.waitForSelector(config.selectors.apiKeyLocation, { timeout: 10000 });

      // Extract the key
      const apiKey = await page.$eval(config.selectors.apiKeyLocation, el => {
        return el.textContent?.trim() || el.getAttribute('value') || '';
      });

      return apiKey || null;
    } catch (error) {
      console.error(`Failed to extract API key for ${config.service}:`, error);
      return null;
    }
  }

  private async saveAPIKeys(keys: Record<string, string>) {
    const envPath = path.join(process.cwd(), '.env.local');
    
    try {
      // Read existing env file
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf-8');
      } catch {
        // File doesn't exist, will create
      }

      // Update or add keys
      for (const [service, key] of Object.entries(keys)) {
        const envKey = `VITE_${service.toUpperCase()}_API_KEY`;
        const regex = new RegExp(`^${envKey}=.*$`, 'm');
        
        if (regex.test(envContent)) {
          // Update existing
          envContent = envContent.replace(regex, `${envKey}=${key}`);
        } else {
          // Add new
          envContent += `\n${envKey}=${key}`;
        }
      }

      // Write back
      await fs.writeFile(envPath, envContent.trim() + '\n');
      
      console.log('✅ API keys saved to .env.local');
    } catch (error) {
      console.error('❌ Failed to save API keys:', error);
      throw error;
    }
  }

  private async loadCookies(service: string): Promise<any[] | null> {
    try {
      const cookiePath = path.join(process.cwd(), `.cookies/${service}.json`);
      const data = await fs.readFile(cookiePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async saveCookies(service: string, cookies: any[]) {
    try {
      const cookieDir = path.join(process.cwd(), '.cookies');
      await fs.mkdir(cookieDir, { recursive: true });
      
      const cookiePath = path.join(cookieDir, `${service}.json`);
      await fs.writeFile(cookiePath, JSON.stringify(cookies, null, 2));
    } catch (error) {
      console.error('Failed to save cookies:', error);
    }
  }

  async recover(issue: any) {
    switch (issue.type) {
      case 'browser_launch_failure':
        // Try alternative browser options
        console.log('🔧 Trying alternative browser configuration...');
        break;
      
      default:
        console.log('Unknown issue type:', issue.type);
    }
  }

  cleanup() {
    if (this.browser) {
      this.browser.close();
    }
  }
}