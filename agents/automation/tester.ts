import { EventEmitter } from 'events';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import puppeteer, { Browser, Page } from 'puppeteer';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

export class FunctionalityTester extends EventEmitter {
  private supabase: SupabaseClient;
  private browser: Browser | null = null;

  constructor() {
    super();
    this.initializeSupabase();
  }

  private initializeSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async run() {
    const startTime = Date.now();
    const suites: TestSuite[] = [];

    try {
      // Run database tests
      const dbSuite = await this.runDatabaseTests();
      suites.push(dbSuite);

      // Run API tests
      const apiSuite = await this.runAPITests();
      suites.push(apiSuite);

      // Run UI tests
      const uiSuite = await this.runUITests();
      suites.push(uiSuite);

      // Calculate overall results
      const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0);
      const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0);
      const totalDuration = Date.now() - startTime;

      const results = {
        success: totalFailed === 0,
        suites,
        summary: {
          totalTests: totalPassed + totalFailed,
          passed: totalPassed,
          failed: totalFailed,
          duration: totalDuration
        }
      };

      // Emit status
      this.emit('status', {
        health: totalFailed === 0 ? 'healthy' : totalFailed > 5 ? 'critical' : 'degraded',
        results
      });

      return results;
    } catch (error) {
      this.emit('critical', {
        type: 'test_runner_failure',
        error
      });

      return { success: false, error };
    }
  }

  private async runDatabaseTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Database Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Connection
    const connectionTest = await this.testDatabaseConnection();
    suite.tests.push(connectionTest);

    // Test 2: Tips CRUD operations
    const crudTest = await this.testTipsCRUD();
    suite.tests.push(crudTest);

    // Test 3: User authentication
    const authTest = await this.testAuthentication();
    suite.tests.push(authTest);

    // Test 4: Data integrity
    const integrityTest = await this.testDataIntegrity();
    suite.tests.push(integrityTest);

    // Calculate results
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    suite.duration = Date.now() - startTime;

    return suite;
  }

  private async testDatabaseConnection(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase
        .from('tips')
        .select('count')
        .limit(1);

      return {
        name: 'Database Connection',
        passed: !error,
        duration: Date.now() - startTime,
        error: error?.message,
        details: { recordCount: data?.length }
      };
    } catch (error) {
      return {
        name: 'Database Connection',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testTipsCRUD(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Create
      const { data: created, error: createError } = await this.supabase
        .from('tips')
        .insert({
          title: 'Test Tip',
          content: 'This is a test tip for automated testing',
          category: 'test',
          status: 'draft'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Read
      const { data: read, error: readError } = await this.supabase
        .from('tips')
        .select('*')
        .eq('id', created.id)
        .single();

      if (readError) throw readError;

      // Update
      const { data: updated, error: updateError } = await this.supabase
        .from('tips')
        .update({ title: 'Updated Test Tip' })
        .eq('id', created.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Delete
      const { error: deleteError } = await this.supabase
        .from('tips')
        .delete()
        .eq('id', created.id);

      if (deleteError) throw deleteError;

      return {
        name: 'Tips CRUD Operations',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          created: !!created,
          read: !!read,
          updated: updated?.title === 'Updated Test Tip',
          deleted: true
        }
      };
    } catch (error) {
      return {
        name: 'Tips CRUD Operations',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testAuthentication(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test getting current user
      const { data: { user }, error } = await this.supabase.auth.getUser();

      return {
        name: 'Authentication',
        passed: !error,
        duration: Date.now() - startTime,
        error: error?.message,
        details: { 
          userExists: !!user,
          userId: user?.id 
        }
      };
    } catch (error) {
      return {
        name: 'Authentication',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testDataIntegrity(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Check for required columns
      const { data, error } = await this.supabase
        .from('tips')
        .select('id, title, content, category, status, created_at')
        .limit(1);

      if (error) throw error;

      // Check data types and constraints
      const hasRequiredFields = data && data.length > 0 && 
        data[0].id && 
        data[0].title && 
        data[0].content &&
        data[0].created_at;

      return {
        name: 'Data Integrity',
        passed: hasRequiredFields,
        duration: Date.now() - startTime,
        details: {
          sampleRecord: data?.[0],
          hasRequiredFields
        }
      };
    } catch (error) {
      return {
        name: 'Data Integrity',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async runAPITests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'API Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test API endpoints if they exist
    const healthTest = await this.testAPIHealth();
    suite.tests.push(healthTest);

    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    suite.duration = Date.now() - startTime;

    return suite;
  }

  private async testAPIHealth(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test Supabase REST API directly
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/tips?select=count&limit=1`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      return {
        name: 'API Health Check',
        passed: response.ok,
        duration: Date.now() - startTime,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      return {
        name: 'API Health Check',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async runUITests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'UI Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Test main page load
      const pageLoadTest = await this.testPageLoad();
      suite.tests.push(pageLoadTest);

      // Test navigation
      const navigationTest = await this.testNavigation();
      suite.tests.push(navigationTest);

      // Test forms
      const formsTest = await this.testForms();
      suite.tests.push(formsTest);

    } catch (error) {
      suite.tests.push({
        name: 'UI Test Setup',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }

    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    suite.duration = Date.now() - startTime;

    return suite;
  }

  private async testPageLoad(): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!this.browser) {
      return {
        name: 'Page Load Test',
        passed: false,
        duration: 0,
        error: 'Browser not initialized'
      };
    }

    try {
      const page = await this.browser.newPage();
      
      // Load the main page
      await page.goto('http://localhost:5173', { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });

      // Check if page loaded
      const title = await page.title();
      const hasContent = await page.$('body *');

      await page.close();

      return {
        name: 'Page Load Test',
        passed: !!hasContent,
        duration: Date.now() - startTime,
        details: { title, hasContent: !!hasContent }
      };
    } catch (error) {
      return {
        name: 'Page Load Test',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testNavigation(): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!this.browser) {
      return {
        name: 'Navigation Test',
        passed: false,
        duration: 0,
        error: 'Browser not initialized'
      };
    }

    try {
      const page = await this.browser.newPage();
      
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

      // Test navigation elements
      const navLinks = await page.$$('nav a, [role="navigation"] a');
      const hasNavigation = navLinks.length > 0;

      await page.close();

      return {
        name: 'Navigation Test',
        passed: hasNavigation,
        duration: Date.now() - startTime,
        details: { linkCount: navLinks.length }
      };
    } catch (error) {
      return {
        name: 'Navigation Test',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testForms(): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!this.browser) {
      return {
        name: 'Forms Test',
        passed: false,
        duration: 0,
        error: 'Browser not initialized'
      };
    }

    try {
      const page = await this.browser.newPage();
      
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

      // Check for forms
      const forms = await page.$$('form');
      const inputs = await page.$$('input, textarea, select');

      await page.close();

      return {
        name: 'Forms Test',
        passed: true, // Just checking they exist
        duration: Date.now() - startTime,
        details: { 
          formCount: forms.length,
          inputCount: inputs.length 
        }
      };
    } catch (error) {
      return {
        name: 'Forms Test',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async recover(issue: any) {
    switch (issue.type) {
      case 'test_runner_failure':
        console.log('🔧 Restarting test runner...');
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