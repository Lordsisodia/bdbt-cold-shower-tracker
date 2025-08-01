# Canva API Setup Guide for BDBT Tips System

## 🚀 Quick Start (Mock Mode)

**You can test the entire system without API keys!**

```bash
# 1. Start the development server
npm run dev

# 2. Visit the template preview
http://localhost:3000/template-preview

# 3. Test all features in mock mode
# - Preview templates ✓
# - Customize designs ✓  
# - Batch processing ✓
# - Export functionality ✓
```

## 🔑 Getting Real Canva API Access

### Step 1: Apply for Canva Connect API

1. **Visit Canva Developers Portal**
   ```
   https://www.canva.com/developers/
   ```

2. **Click "Apply for Access"**

3. **Fill out Application Form**
   ```
   Company: BDBT (Better Days, Better Tomorrow)
   Use Case: Automated tip design generation
   Description: 
   "We're building a system to automatically generate professional 
   PDF guides from our database of 1000+ health, wealth, and 
   happiness tips. Each tip needs to be formatted into a 4-page 
   design with consistent branding and category-specific colors."
   
   Expected Volume: 1000+ designs per month
   Integration Type: Server-to-server API calls
   Business Model: Digital content sales and coaching
   ```

4. **Wait for Approval** (typically 1-2 weeks)

### Step 2: Alternative - Canva for Teams API

If Connect API isn't available, try the Teams API:

1. **Upgrade to Canva Pro/Teams**
   ```
   https://www.canva.com/pricing/
   ```

2. **Access Brand Kit API**
   ```
   - Brand colors and fonts
   - Template consistency  
   - Bulk design operations
   ```

3. **Use Automation Features**
   ```
   - Canva's built-in automation
   - Zapier integration
   - Bulk upload tools
   ```

## 🛠️ API Configuration

### Step 3: Get Your API Credentials

Once approved, you'll receive:

```env
# Add to your .env file
REACT_APP_CANVA_API_KEY=your_api_key_here
REACT_APP_CANVA_BRAND_ID=your_brand_id_here
CANVA_API_SECRET=your_api_secret_here
```

### Step 4: Configure Brand Assets

```javascript
// Update in src/services/canvaIntegration.ts
const brandConfig = {
  colors: {
    health: { primary: '#22c55e', secondary: '#86efac', accent: '#15803d' },
    wealth: { primary: '#eab308', secondary: '#fde047', accent: '#a16207' },
    happiness: { primary: '#a855f7', secondary: '#d8b4fe', accent: '#7c3aed' }
  },
  fonts: {
    heading: 'Montserrat',
    body: 'Inter',
    accent: 'Playfair Display'
  },
  logo: 'https://your-logo-url.com/logo.png',
  templates: {
    'health-easy': 'template_id_1',
    'health-moderate': 'template_id_2', 
    'wealth-easy': 'template_id_3',
    // ... more template IDs
  }
};
```

## 🎨 Template Setup

### Step 5: Create Canva Templates

1. **Design Base Templates in Canva**
   ```
   Template 1: Health Tips (Green theme)
   Template 2: Wealth Tips (Yellow theme)  
   Template 3: Happiness Tips (Purple theme)
   
   Each with 4 pages:
   - Cover page
   - Benefits page
   - Implementation page
   - Call-to-action page
   ```

2. **Add Text Placeholders**
   ```
   {{title}}
   {{subtitle}}
   {{benefit_1}}
   {{benefit_2}}
   {{benefit_3}}
   {{implementation_step_1}}
   {{implementation_step_2}}
   {{cta_text}}
   ```

3. **Get Template IDs**
   ```javascript
   // From Canva URL: canva.com/design/DAFxxxxx/edit
   const templateId = 'DAFxxxxx';
   ```

### Step 6: Test API Integration

```bash
# Test with a single tip
npm run process-tips -- test

# Check API connectivity
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.canva.com/v1/me
```

## 🔄 Alternative Solutions (If API Unavailable)

### Option A: Canva Automation (No API)

1. **Use Canva's Bulk Create**
   ```
   - Upload CSV with tip data
   - Apply to template
   - Bulk download PDFs
   ```

2. **Zapier Integration**
   ```
   Database → Zapier → Canva → Google Drive
   ```

### Option B: Custom PDF Generation

Use our existing PDF generator (already built):

```bash
# Generate PDFs without Canva
npm run process-tips -- process --pdf -n 100

# Outputs professional PDFs with:
# - Category-specific colors
# - BDBT branding  
# - Multi-page layouts
# - Professional typography
```

### Option C: Other Design APIs

Alternative APIs while waiting for Canva:

```javascript
// 1. Adobe Creative API
const adobeAPI = 'https://api.adobe.io/';

// 2. Bannerbear API  
const bannerbearAPI = 'https://api.bannerbear.com/';

// 3. HTML/CSS to PDF
const puppeteerPDF = require('puppeteer');
```

## 📊 Testing Your Setup

### Mock Mode Testing

```bash
# Test all features without API
npm run dev
# Visit: http://localhost:3000/template-preview
# Go to "Live Demo" tab
# Click "Generate Canva Designs"
```

### API Mode Testing  

```bash
# With real API keys configured
REACT_APP_CANVA_API_KEY=your_key npm run dev

# Should show green status indicator
# "Edit in Canva" buttons will open real designs
```

## 🚦 Status Indicators

Check your integration status:

- 🟢 **Green**: Real API connected
- 🟡 **Yellow**: Mock mode (no API key)  
- 🔴 **Red**: API error (check credentials)

## 💡 Pro Tips

1. **Start with Mock Mode**: Test all functionality first
2. **Apply Early**: Canva API approval takes time
3. **Prepare Templates**: Design your templates while waiting
4. **Consider Alternatives**: PDF generation works great too
5. **Batch Smartly**: Respect API rate limits

## 🆘 Troubleshooting

### Common Issues

**"API Key Not Found"**
```bash
# Check .env file exists and has correct format
REACT_APP_CANVA_API_KEY=your_key_here
```

**"Template Not Found"**
```bash
# Verify template IDs in canvaIntegration.ts
# Make sure templates are shared/public
```

**"Rate Limit Exceeded"**
```bash
# Reduce batch size in configuration
batchSize: 5  // Instead of 10
```

## 📞 Getting Help

1. **Canva Developer Support**: developers@canva.com
2. **API Documentation**: https://www.canva.com/developers/docs
3. **Community Forum**: https://community.canva.com/developers

---

## ⚡ Quick Alternative: Use Built-in PDF Generator

**Don't want to wait for Canva API approval?** 

Our system already includes a professional PDF generator:

```bash
# Generate beautiful PDFs right now
npm run process-tips -- quick-pdf -n 100

# Features:
# ✓ Professional layouts
# ✓ Category-specific colors  
# ✓ BDBT branding
# ✓ Multi-page designs
# ✓ Batch processing
# ✓ No API keys needed
```

**Result**: 100 professional PDF tip guides ready for download! 🎉