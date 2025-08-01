import { GrokEnhancedTip } from './grokApiService';
import { DatabaseTip } from './tipsDatabaseService';

export class WebPageGenerator {
  // Generate a complete tip landing page
  async generateTipPage(tip: DatabaseTip, enhanced?: GrokEnhancedTip | null): Promise<string> {
    const categoryColors = this.getCategoryColors(tip.category);
    const content = enhanced?.enhancedContent;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tip.title} - BDBT Tips</title>
    <meta name="description" content="${tip.subtitle}">
    <meta property="og:title" content="${tip.title}">
    <meta property="og:description" content="${tip.subtitle}">
    <meta property="og:type" content="article">
    <style>
        ${this.generateStyles(categoryColors)}
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">BDBT</div>
            <nav>
                <a href="#benefits">Benefits</a>
                <a href="#implementation">Implementation</a>
                <a href="#tips">Pro Tips</a>
                <a href="#download" class="cta-button">Download PDF</a>
            </nav>
        </div>
    </header>

    <main>
        <!-- Hero Section -->
        <section class="hero">
            <div class="container">
                <div class="category-badge ${tip.category}">${tip.category.toUpperCase()}</div>
                <h1>${tip.title}</h1>
                <p class="subtitle">${tip.subtitle}</p>
                <div class="meta">
                    <span class="difficulty">${tip.difficulty}</span>
                    <span class="time">${tip.implementation_time}</span>
                    <span class="cost">${tip.cost}</span>
                </div>
            </div>
        </section>

        <!-- Description Section -->
        <section class="description">
            <div class="container">
                <h2>Overview</h2>
                <div class="content">
                    ${content?.expandedDescription ? 
                      content.expandedDescription.split('\n').map(p => `<p>${p}</p>`).join('') :
                      `<p>${tip.description}</p>`
                    }
                </div>
            </div>
        </section>

        <!-- Benefits Section -->
        <section id="benefits" class="benefits">
            <div class="container">
                <h2>Key Benefits</h2>
                <div class="benefits-grid">
                    ${content?.detailedBenefits ? 
                      content.detailedBenefits.map((benefit, i) => `
                        <div class="benefit-card">
                            <div class="benefit-number">${i + 1}</div>
                            <p>${benefit}</p>
                        </div>
                      `).join('') :
                      `
                        <div class="benefit-card">
                            <div class="benefit-icon">🎯</div>
                            <h3>Primary Benefit</h3>
                            <p>${tip.primary_benefit}</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">💡</div>
                            <h3>Secondary Benefit</h3>
                            <p>${tip.secondary_benefit}</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">🚀</div>
                            <h3>Additional Benefit</h3>
                            <p>${tip.tertiary_benefit}</p>
                        </div>
                      `
                    }
                </div>
            </div>
        </section>

        <!-- Implementation Section -->
        <section id="implementation" class="implementation">
            <div class="container">
                <h2>How to Implement</h2>
                <div class="steps">
                    ${content?.implementationSteps ? 
                      content.implementationSteps.map((step, i) => `
                        <div class="step">
                            <div class="step-number">${i + 1}</div>
                            <div class="step-content">
                                <p>${step}</p>
                            </div>
                        </div>
                      `).join('') :
                      `
                        <div class="implementation-details">
                            <p><strong>Time Required:</strong> ${tip.implementation_time}</p>
                            <p><strong>Frequency:</strong> ${tip.frequency}</p>
                            <p><strong>Cost:</strong> ${tip.cost}</p>
                        </div>
                      `
                    }
                </div>
            </div>
        </section>

        <!-- Pro Tips Section -->
        ${content?.proTips ? `
        <section id="tips" class="pro-tips">
            <div class="container">
                <h2>Pro Tips for Success</h2>
                <div class="tips-grid">
                    ${content.proTips.map(protip => `
                        <div class="tip-card">
                            <div class="tip-icon">💎</div>
                            <p>${protip}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        ` : ''}

        <!-- Common Mistakes Section -->
        ${content?.commonMistakes ? `
        <section class="mistakes">
            <div class="container">
                <h2>Common Mistakes to Avoid</h2>
                <div class="mistakes-list">
                    ${content.commonMistakes.map(mistake => `
                        <div class="mistake-item">
                            <div class="mistake-icon">⚠️</div>
                            <p>${mistake}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        ` : ''}

        <!-- Success Metrics Section -->
        ${content?.successMetrics ? `
        <section class="metrics">
            <div class="container">
                <h2>How to Measure Success</h2>
                <div class="metrics-grid">
                    ${content.successMetrics.map(metric => `
                        <div class="metric-card">
                            <div class="metric-icon">📊</div>
                            <p>${metric}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        ` : ''}

        <!-- CTA Section -->
        <section id="download" class="cta-section">
            <div class="container">
                <h2>Ready to Get Started?</h2>
                <p>Download this tip as a beautifully designed PDF guide</p>
                <div class="cta-buttons">
                    <button class="cta-button primary" onclick="downloadPDF(${tip.id})">
                        Download PDF Guide
                    </button>
                    <button class="cta-button secondary" onclick="viewMore()">
                        Browse More Tips
                    </button>
                </div>
                ${content?.socialMediaPosts ? `
                <div class="share-section">
                    <h3>Share This Tip</h3>
                    <div class="share-buttons">
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(content.socialMediaPosts.twitter)}" 
                           target="_blank" class="share-button twitter">Twitter</a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
                           target="_blank" class="share-button linkedin">LinkedIn</a>
                    </div>
                </div>
                ` : ''}
            </div>
        </section>

        <!-- Related Tips Section -->
        ${content?.relatedTips ? `
        <section class="related">
            <div class="container">
                <h2>Related Tips You Might Like</h2>
                <div class="related-grid">
                    ${content.relatedTips.map(related => `
                        <div class="related-card">
                            <div class="related-category ${tip.category}">${tip.category}</div>
                            <h3>${related}</h3>
                            <a href="#" class="related-link">Learn More →</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        ` : ''}
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <h3>BDBT</h3>
                    <p>Better Days, Better Tomorrow</p>
                </div>
                <div class="footer-links">
                    <h4>Categories</h4>
                    <a href="/health">Health</a>
                    <a href="/wealth">Wealth</a>
                    <a href="/happiness">Happiness</a>
                </div>
                <div class="footer-contact">
                    <h4>Get in Touch</h4>
                    <p>Transform your life one tip at a time</p>
                    <a href="mailto:hello@bdbt.com">hello@bdbt.com</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 BDBT. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>
    `;
  }

  // Generate CSS styles
  private generateStyles(colors: any): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-color: ${colors.primary};
            --secondary-color: ${colors.secondary};
            --accent-color: ${colors.accent};
            --text-color: #1f2937;
            --bg-color: #ffffff;
            --gray-light: #f3f4f6;
            --gray-medium: #9ca3af;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--text-color);
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Header */
        header {
            background: var(--bg-color);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 20px;
        }

        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
        }

        nav {
            display: flex;
            gap: 2rem;
            align-items: center;
        }

        nav a {
            text-decoration: none;
            color: var(--text-color);
            font-weight: 500;
            transition: color 0.3s;
        }

        nav a:hover {
            color: var(--primary-color);
        }

        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            padding: 4rem 0;
            text-align: center;
        }

        .category-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.2);
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            line-height: 1.2;
        }

        .subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto 2rem;
        }

        .meta {
            display: flex;
            gap: 2rem;
            justify-content: center;
            font-size: 0.875rem;
        }

        .meta span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 0.5rem;
        }

        /* Content Sections */
        section {
            padding: 4rem 0;
        }

        section:nth-child(even) {
            background: var(--gray-light);
        }

        h2 {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            text-align: center;
            color: var(--text-color);
        }

        /* Benefits */
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .benefit-card {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .benefit-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 12px rgba(0,0,0,0.15);
        }

        .benefit-number {
            width: 40px;
            height: 40px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        /* Implementation Steps */
        .steps {
            max-width: 800px;
            margin: 0 auto;
        }

        .step {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
            align-items: flex-start;
        }

        .step-number {
            width: 50px;
            height: 50px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }

        .step-content {
            flex: 1;
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Pro Tips */
        .tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .tip-card {
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            border-left: 4px solid var(--accent-color);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tip-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        /* CTA Section */
        .cta-section {
            background: var(--primary-color);
            color: white;
            text-align: center;
            padding: 4rem 0;
        }

        .cta-section h2 {
            color: white;
        }

        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        .cta-button {
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }

        .cta-button.primary {
            background: white;
            color: var(--primary-color);
        }

        .cta-button.secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Footer */
        footer {
            background: var(--text-color);
            color: white;
            padding: 3rem 0 1rem;
        }

        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .footer-links a {
            display: block;
            color: var(--gray-medium);
            text-decoration: none;
            margin-bottom: 0.5rem;
            transition: color 0.3s;
        }

        .footer-links a:hover {
            color: white;
        }

        .footer-bottom {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: var(--gray-medium);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }
            
            nav {
                flex-direction: column;
                gap: 1rem;
            }
            
            .meta {
                flex-direction: column;
                gap: 1rem;
            }
            
            .cta-buttons {
                flex-direction: column;
            }
        }

        /* Category Colors */
        .health {
            --primary-color: #22c55e;
            --secondary-color: #86efac;
            --accent-color: #15803d;
        }

        .wealth {
            --primary-color: #eab308;
            --secondary-color: #fde047;
            --accent-color: #a16207;
        }

        .happiness {
            --primary-color: #a855f7;
            --secondary-color: #d8b4fe;
            --accent-color: #7c3aed;
        }
    `;
  }

  // Generate JavaScript
  private generateJavaScript(): string {
    return `
        // Download PDF function
        function downloadPDF(tipId) {
            // Track download
            fetch('/api/tips/' + tipId + '/download', { method: 'POST' });
            
            // Trigger download
            window.location.href = '/api/tips/' + tipId + '/pdf';
        }

        // View more tips
        function viewMore() {
            window.location.href = '/tips';
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                tip_id: ${tip.id || 0}
            });
        }
    `;
  }

  // Get category colors
  private getCategoryColors(category: string): any {
    const colors = {
      health: {
        primary: '#22c55e',
        secondary: '#86efac',
        accent: '#15803d'
      },
      wealth: {
        primary: '#eab308',
        secondary: '#fde047',
        accent: '#a16207'
      },
      happiness: {
        primary: '#a855f7',
        secondary: '#d8b4fe',
        accent: '#7c3aed'
      }
    };
    return colors[category as keyof typeof colors] || colors.health;
  }

  // Generate collection page
  async generateCollectionPage(tips: DatabaseTip[], enhanced?: GrokEnhancedTip[]): Promise<string> {
    // Group tips by category
    const categories = {
      health: tips.filter(t => t.category === 'health'),
      wealth: tips.filter(t => t.category === 'wealth'),
      happiness: tips.filter(t => t.category === 'happiness')
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BDBT Tips Collection - ${tips.length} Tips for Better Living</title>
    <meta name="description" content="Explore our collection of ${tips.length} actionable tips for health, wealth, and happiness.">
    <style>
        ${this.generateCollectionStyles()}
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>BDBT Tips Collection</h1>
            <p>${tips.length} Tips for Better Days, Better Tomorrow</p>
        </div>
    </header>

    <main>
        <div class="container">
            <div class="filters">
                <button class="filter-btn active" data-category="all">All (${tips.length})</button>
                <button class="filter-btn" data-category="health">Health (${categories.health.length})</button>
                <button class="filter-btn" data-category="wealth">Wealth (${categories.wealth.length})</button>
                <button class="filter-btn" data-category="happiness">Happiness (${categories.happiness.length})</button>
            </div>

            <div class="tips-grid">
                ${tips.map(tip => `
                    <div class="tip-item ${tip.category}" data-category="${tip.category}">
                        <div class="tip-header">
                            <span class="category-tag ${tip.category}">${tip.category}</span>
                            <span class="difficulty">${tip.difficulty}</span>
                        </div>
                        <h3>${tip.title}</h3>
                        <p>${tip.subtitle}</p>
                        <div class="tip-meta">
                            <span>${tip.implementation_time}</span>
                            <span>${tip.cost}</span>
                        </div>
                        <a href="/tips/${tip.id}" class="tip-link">Learn More →</a>
                    </div>
                `).join('')}
            </div>
        </div>
    </main>

    <script>
        ${this.generateCollectionJavaScript()}
    </script>
</body>
</html>
    `;
  }

  // Generate collection styles
  private generateCollectionStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f9fafb;
            color: #1f2937;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        header {
            background: #1e3a8a;
            color: white;
            padding: 3rem 0;
            text-align: center;
        }

        header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        main {
            padding: 3rem 0;
        }

        .filters {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-bottom: 3rem;
            flex-wrap: wrap;
        }

        .filter-btn {
            padding: 0.75rem 1.5rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }

        .filter-btn:hover {
            border-color: #3b82f6;
            color: #3b82f6;
        }

        .filter-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }

        .tips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
        }

        .tip-item {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
        }

        .tip-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }

        .tip-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .category-tag {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .category-tag.health {
            background: #d1fae5;
            color: #065f46;
        }

        .category-tag.wealth {
            background: #fef3c7;
            color: #92400e;
        }

        .category-tag.happiness {
            background: #ede9fe;
            color: #5b21b6;
        }

        .difficulty {
            font-size: 0.875rem;
            color: #6b7280;
        }

        .tip-item h3 {
            margin-bottom: 0.5rem;
            color: #1f2937;
        }

        .tip-item p {
            color: #4b5563;
            flex: 1;
            margin-bottom: 1rem;
        }

        .tip-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 1rem;
        }

        .tip-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            transition: gap 0.3s;
        }

        .tip-link:hover {
            gap: 0.5rem;
        }

        .tip-item.hidden {
            display: none;
        }
    `;
  }

  // Generate collection JavaScript
  private generateCollectionJavaScript(): string {
    return `
        // Filter functionality
        const filterBtns = document.querySelectorAll('.filter-btn');
        const tipItems = document.querySelectorAll('.tip-item');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter tips
                tipItems.forEach(tip => {
                    if (category === 'all' || tip.dataset.category === category) {
                        tip.classList.remove('hidden');
                    } else {
                        tip.classList.add('hidden');
                    }
                });
            });
        });
    `;
  }
}

// Export singleton instance
export const webPageGenerator = new WebPageGenerator();