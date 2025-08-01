# Tips Template Preview System

## 🎨 Overview

The Template Preview System allows you to visualize and test how your tips will look when processed through the Canva API. This helps you refine templates and see the final output before batch processing all 1000+ tips.

## 🚀 Quick Access

Visit: **http://localhost:3000/template-preview** (when running the development server)

## 📋 Features

### 1. **Design Preview Tab**
- **4-Page Professional Templates**: Cover, Benefits, What's Included, Call-to-Action
- **Live Preview**: See exactly how tips will appear in Canva
- **Category Colors**: Automatic color schemes for Health (Green), Wealth (Yellow), Happiness (Purple)
- **Page Navigation**: Click through all template pages
- **Real Content**: Uses actual tips from your database

### 2. **Customize Tab**
- **Color Picker**: Customize primary, secondary, and accent colors
- **Typography**: Select fonts for headings and body text
- **Branding**: Update logo text and tagline
- **Live Updates**: See changes reflected immediately

### 3. **Export Options Tab**
- **Open in Canva**: Direct integration with Canva API
- **Download PDF**: Generate PDF preview
- **Web Page Preview**: See how it looks as a web page
- **API Status**: Real-time connection status

### 4. **Live Demo Tab** ⭐
- **Batch Processing**: Test the full pipeline with sample tips
- **Progress Tracking**: Real-time progress bar and status
- **Multiple Designs**: Generate several designs at once
- **Mock Mode**: Works without API keys for testing

## 🔧 Setup Instructions

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Add your API keys (optional for preview)
REACT_APP_CANVA_API_KEY=your_canva_api_key
REACT_APP_CANVA_BRAND_ID=your_brand_id
REACT_APP_GROK_API_KEY=your_grok_api_key
```

### 2. Start Development Server

```bash
npm run dev
# Visit: http://localhost:3000/template-preview
```

## 🎯 How to Use

### Testing Templates

1. **Select a Tip**: Choose from your database tips
2. **Pick Template Style**: 4-page, single page, social media, etc.
3. **Enhance with Grok** (optional): Click "Enhance with Grok" for AI-generated content
4. **Preview Design**: Navigate through template pages
5. **Customize**: Adjust colors, fonts, and branding
6. **Export**: Generate real Canva designs or PDFs

### Running Live Demo

1. Go to **Live Demo** tab
2. Click **"Generate Canva Designs"**
3. Watch real-time processing of 3 sample tips
4. View generated designs with preview thumbnails
5. Click **"Edit in Canva"** to open designs
6. Export as PDF when ready

## 🎨 Template Structure

### 4-Page Professional Template

#### Page 1: Cover
- Gradient background with category colors
- Tip title and subtitle
- Category and difficulty badges
- Time/cost indicators
- BDBT branding

#### Page 2: Benefits
- 3 key benefits with numbered icons
- Clean typography and spacing
- Category-specific accent colors
- Professional layout

#### Page 3: What's Included
- Implementation steps (AI-enhanced)
- Checkmarks and clear formatting
- Actionable content
- Progress indicators

#### Page 4: Call to Action
- Next steps checklist
- BDBT branding and website
- QR code placeholder
- Contact information

## 🔄 API Integration

### Canva API Features
- **Automated Design Creation**: Generate designs programmatically
- **Template Management**: Use predefined templates
- **Brand Consistency**: Apply your brand colors and fonts
- **Bulk Processing**: Create hundreds of designs efficiently
- **Export Options**: PDF, PNG, JPG formats

### Mock Mode (No API Key Required)
- **Full Functionality**: Test all features without API keys
- **Realistic Delays**: Simulates actual API response times
- **Sample Data**: Uses realistic mock responses
- **Perfect for Testing**: Validate workflow before going live

## 📊 Template Customization

### Colors
```javascript
// Category-specific color schemes
const categoryColors = {
  health: { 
    primary: '#22c55e',   // Green
    secondary: '#86efac', 
    accent: '#15803d' 
  },
  wealth: { 
    primary: '#eab308',   // Yellow
    secondary: '#fde047', 
    accent: '#a16207' 
  },
  happiness: { 
    primary: '#a855f7',   // Purple
    secondary: '#d8b4fe', 
    accent: '#7c3aed' 
  }
};
```

### Typography
- **Headings**: Montserrat, Playfair Display, Roboto
- **Body Text**: Inter, Open Sans, Lato
- **Accent**: Custom brand fonts

### Branding
- **Logo**: Customizable text/image
- **Tagline**: "Better Days, Better Tomorrow"
- **Website**: www.bdbt.com
- **Colors**: Brand-consistent palette

## 🚦 Status Indicators

- 🟢 **Green Dot**: API Connected - Full functionality
- 🟡 **Yellow Dot**: Mock Mode - Testing without API
- 🔴 **Red Dot**: API Error - Check configuration

## 💡 Tips for Best Results

1. **Test First**: Always preview templates before batch processing
2. **Customize Colors**: Match your brand identity
3. **Review Content**: Ensure AI-enhanced content is accurate
4. **Check All Pages**: Navigate through complete template
5. **Test Export**: Verify Canva integration works
6. **Mobile Preview**: Check responsiveness on different screen sizes

## 🔧 Troubleshooting

### Common Issues

**Templates not loading?**
- Check database connection
- Verify tips data exists
- Refresh the page

**Canva integration not working?**
- Verify API key in .env file
- Check brand ID configuration
- Use mock mode for testing

**Colors not updating?**
- Clear browser cache
- Check customization tab
- Verify CSS variables

### Debug Mode

Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

## 📈 Next Steps

After testing templates:
1. **Run Batch Processing**: Use CLI tool to process all 1000 tips
2. **Deploy Templates**: Upload to Canva for team use
3. **Generate PDFs**: Create downloadable content
4. **Build Web Pages**: Create online tip library

---

**Ready to create professional tip designs with Canva API integration!** 🎨✨