# API Keys Required for BDBT Cold Shower Tracker

To enable all features of the BDBT Cold Shower Tracker, you'll need to set up the following API keys:

## Required API Keys

### 1. Supabase (Database & Authentication)
- **Purpose**: User authentication, data persistence, real-time sync
- **Free Tier**: Yes (50,000 monthly active users)
- **Setup**: 
  - Sign up at [supabase.com](https://supabase.com)
  - Create a new project
  - Get your project URL and anon key from Settings > API
- **Environment Variables**:
  ```
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

### 2. OpenWeatherMap (Weather Integration) - Optional
- **Purpose**: Cold shower difficulty rating based on local weather
- **Free Tier**: Yes (60 calls/minute, 1,000,000 calls/month)
- **Setup**:
  - Sign up at [openweathermap.org](https://openweathermap.org/api)
  - Get your free API key
- **Environment Variables**:
  ```
  VITE_OPENWEATHER_API_KEY=your-weather-api-key
  ```

## Future API Integrations (Coming Soon)

### 3. Pusher/Ably (Real-time Features) - Optional
- **Purpose**: Live leaderboards, real-time notifications
- **Setup**: Choose either Pusher or Ably for WebSocket connections

### 4. OpenAI/Anthropic (AI Coaching) - Optional
- **Purpose**: Personalized coaching tips and insights
- **Setup**: API key from OpenAI or Anthropic

### 5. Stripe (Premium Features) - Optional
- **Purpose**: Subscription management for premium features
- **Setup**: Stripe account and API keys

### 6. Twilio/SendGrid (Notifications) - Optional
- **Purpose**: SMS reminders and email notifications
- **Setup**: Account with either service

### 7. Google Calendar API (Calendar Integration) - Optional
- **Purpose**: Sync cold shower schedule with Google Calendar
- **Setup**: Google Cloud Console API credentials

## How to Set Up Environment Variables

1. Create a `.env` file in your project root
2. Add the required variables:

```bash
# Required for core functionality
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional for weather features
VITE_OPENWEATHER_API_KEY=your-weather-api-key

# Future integrations (optional)
VITE_OPENAI_API_KEY=your-openai-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-key
VITE_PUSHER_APP_KEY=your-pusher-key
```

3. Restart your development server after adding environment variables

## Current Feature Status

- ✅ **Works without API keys**: Basic tracking, local storage, PWA features
- ✅ **Enhanced with Supabase**: User accounts, cloud sync, multi-device support  
- ✅ **Enhanced with Weather API**: Difficulty ratings, location-based challenges
- 🔄 **Coming Soon**: AI coaching, real-time features, premium subscriptions

## Notes

- The app works perfectly fine without any API keys for basic functionality
- API keys are only needed for cloud features and integrations
- All API keys should be kept secure and never committed to version control
- Free tiers are available for all recommended services
- Set up API keys incrementally as you need the features

For detailed setup instructions for each service, see the individual documentation in the `/docs` folder.