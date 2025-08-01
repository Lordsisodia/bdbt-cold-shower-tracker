# 🎨 Canva API Setup Guide for BDBT

## Step-by-Step Setup Instructions

### 1. Create Canva Developer Account
1. Go to [Canva Developers](https://www.canva.com/developers/)
2. Click "Get Started" or "Sign In" 
3. Use your existing Canva account or create a new one

### 2. Apply for Partner Program (Required for Production)
⚠️ **Important**: Canva's API requires approval through their Partner Program
1. Visit [Canva Partner Program](https://www.canva.com/developers/partnerships/)
2. Fill out the partnership application
3. Explain your use case: "Automated tip design generation for Better Days Better Tomorrow wellness platform"
4. Wait for approval (can take 1-2 weeks)

### 3. Create Your App (After Approval)
1. Go to the [Canva Developer Console](https://www.canva.com/developers/apps)
2. Click "Create an app"
3. Fill out the app details:
   - **App Name**: "BDBT Tip Generator"
   - **Description**: "Automated wellness tip design generation"
   - **App Type**: "Content autofill API"

### 4. Configure OAuth Settings
In your app settings:
1. **Redirect URIs**: Add these URLs:
   ```
   http://localhost:3000/auth/canva/callback
   https://yourdomain.com/auth/canva/callback
   ```
2. **Scopes**: Select these permissions:
   - `design:content:read` - Read design content
   - `design:content:write` - Modify design content
   - `asset:read` - Access user assets
   - `folder:read` - Access folders

### 5. Get Your Credentials
After creating the app, you'll receive:
- **Client ID**: Your public app identifier
- **Client Secret**: Keep this secure and never expose it!

### 6. Set Up Environment Variables

Copy your `.env.example` to `.env` and fill in:

```bash
# Copy the example file
cp .env.example .env
```

Update the Canva section in your `.env` file:
```bash
# Canva API Configuration
CANVA_CLIENT_ID=your_client_id_here
CANVA_CLIENT_SECRET=your_client_secret_here
CANVA_REDIRECT_URI=http://localhost:3000/auth/canva/callback
CANVA_BRAND_KIT_ID=your_brand_kit_id_here
REACT_APP_CANVA_CLIENT_ID=your_client_id_here
```

### 7. Create BDBT Brand Kit (Optional but Recommended)
1. In Canva, go to "Brand Kit"
2. Upload your BDBT logo
3. Set brand colors (the system will use these automatically):
   - Health: `#22c55e` (Green)
   - Wealth: `#eab308` (Yellow)
   - Happiness: `#a855f7` (Purple)
4. Save the Brand Kit ID for later use

### 8. Create Templates (Advanced)
For best results, create templates in Canva with these placeholders:
- `{{title}}` - Tip title
- `{{subtitle}}` - Tip subtitle  
- `{{category}}` - Health/Wealth/Happiness
- `{{primary_benefit}}` - Main benefit
- `{{secondary_benefit}}` - Secondary benefit
- `{{tertiary_benefit}}` - Third benefit
- `{{implementation_time}}` - Time required
- `{{frequency}}` - How often to do it
- `{{cost}}` - Cost level

### 9. Test the Integration
1. Start your development server:
   ```bash
   npm start
   ```
2. Go to Template Preview page
3. Try exporting a tip as "Canva Design"
4. Click "Connect to Canva" when prompted
5. Authorize the app
6. The design should be created in your Canva account

## Development vs Production

### Development Mode
- Uses mock data when API keys aren't configured
- Shows placeholder designs and URLs
- Perfect for testing the UI flow

### Production Mode  
- Requires approved Canva Partner status
- Creates real designs in user's Canva account
- Full API functionality

## Troubleshooting

### Common Issues:

**"Not authenticated with Canva"**
- Make sure you've connected your Canva account
- Check if the access token is stored in localStorage
- Try disconnecting and reconnecting

**"Partnership approval required"**
- This is normal - Canva requires approval for production use
- Apply through their partner program
- Use development mode for testing

**OAuth redirect issues**
- Ensure redirect URI exactly matches what's configured in Canva
- Check for typos in the URL
- Make sure the domain is accessible

**Template not found**
- Template IDs in the code are placeholders
- Create actual templates in Canva and update the IDs
- Or use the autofill API with existing templates

## API Rate Limits
- 1000 requests per hour per application
- 10 concurrent requests maximum
- Built-in rate limiting in the integration service

## Next Steps
1. Apply for Canva Partner Program
2. Create branded templates
3. Set up production environment variables
4. Test with real user accounts

---

**Need Help?** Check the [Canva Developer Docs](https://developers.canva.com/docs/api/) or contact Canva support.