export function generateTipImageUrl(tip: { id: string; category: string; title: string }): string {
  // Generate a unique color based on the tip ID
  const hash = tip.id.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash) % 360;
  const saturation = 70 + (Math.abs(hash) % 30);
  const lightness = 60 + (Math.abs(hash) % 20);
  
  // Create a gradient based on category
  const gradients = {
    health: `linear-gradient(135deg, hsl(120, ${saturation}%, ${lightness}%) 0%, hsl(180, ${saturation}%, ${lightness}%) 100%)`,
    wealth: `linear-gradient(135deg, hsl(45, ${saturation}%, ${lightness}%) 0%, hsl(60, ${saturation}%, ${lightness}%) 100%)`,
    happiness: `linear-gradient(135deg, hsl(270, ${saturation}%, ${lightness}%) 0%, hsl(330, ${saturation}%, ${lightness}%) 100%)`
  };
  
  // Use Unsplash for placeholder images with specific category queries
  const categoryQueries = {
    health: ['fitness', 'wellness', 'healthy', 'exercise', 'nutrition', 'yoga', 'running', 'meditation'],
    wealth: ['money', 'finance', 'business', 'success', 'investment', 'savings', 'growth', 'prosperity'],
    happiness: ['happy', 'joy', 'smile', 'peaceful', 'mindfulness', 'gratitude', 'friends', 'nature']
  };
  
  const queries = categoryQueries[tip.category as keyof typeof categoryQueries] || ['lifestyle'];
  const query = queries[Math.abs(hash) % queries.length];
  
  // Return Unsplash image with consistent dimensions
  return `https://source.unsplash.com/800x400/?${query}`;
}

// Generate social media preview image (1200x630 for OpenGraph)
export function generateSocialPreviewSVG(tip: { category: string; title: string; difficulty: string }): string {
  const colors = {
    health: { primary: '#10b981', secondary: '#34d399', light: '#d1fae5' },
    wealth: { primary: '#f59e0b', secondary: '#fbbf24', light: '#fef3c7' },
    happiness: { primary: '#8b5cf6', secondary: '#a78bfa', light: '#ede9fe' }
  };
  
  const categoryColor = colors[tip.category as keyof typeof colors] || colors.health;
  
  const difficultyColors = {
    Easy: '#22c55e',
    Moderate: '#f59e0b', 
    Advanced: '#ef4444'
  };
  
  const difficultyColor = difficultyColors[tip.difficulty as keyof typeof difficultyColors] || '#6b7280';
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${categoryColor.primary}" />
          <stop offset="100%" style="stop-color:${categoryColor.secondary}" />
        </linearGradient>
        <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="${categoryColor.light}" opacity="0.1"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      <rect width="1200" height="630" fill="url(#pattern)"/>
      
      <!-- Brand Section -->
      <text x="60" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="white">BDBT</text>
      <text x="60" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="rgba(255,255,255,0.9)">Better Days, Better Tomorrow</text>
      
      <!-- Title (centered, word-wrapped) -->
      <foreignObject x="60" y="200" width="1080" height="300">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 48px;
          font-weight: bold;
          line-height: 1.2;
          padding: 0 40px;
        ">
          ${tip.title}
        </div>
      </foreignObject>
      
      <!-- Category Badge -->
      <rect x="60" y="450" width="140" height="40" rx="20" fill="rgba(255,255,255,0.2)"/>
      <text x="130" y="475" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${tip.category.toUpperCase()}</text>
      
      <!-- Difficulty Badge -->
      <rect x="220" y="450" width="120" height="40" rx="20" fill="${difficultyColor}"/>
      <text x="280" y="475" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${tip.difficulty}</text>
      
      <!-- Bottom Branding -->
      <text x="1140" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="end">bdbt.com</text>
    </svg>
  `)}`
}

export function generatePlaceholderSVG(tip: { category: string; title: string }): string {
  const colors = {
    health: '#22c55e',
    wealth: '#eab308',
    happiness: '#a855f7'
  };
  
  const icons = {
    health: 'M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z',
    wealth: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.66 1.64 2.08 1.64 1.56 0 2.1-.68 2.1-1.39 0-.69-.49-1.15-1.58-1.41l-1.67-.39c-1.63-.38-2.7-1.32-2.7-2.82 0-1.72 1.39-2.84 3.11-3.21V5h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 1.67 1.63l1.38.32c1.88.42 2.86 1.3 2.86 2.85 0 1.85-1.47 3.06-3.18 3.18z',
    happiness: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  };
  
  const color = colors[tip.category as keyof typeof colors] || '#6b7280';
  const icon = icons[tip.category as keyof typeof icons] || '';
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#gradient)"/>
      <g transform="translate(400, 200)">
        <path d="${icon}" fill="${color}" transform="scale(4)"/>
      </g>
      <text x="400" y="320" font-family="Arial, sans-serif" font-size="24" fill="${color}" text-anchor="middle">
        ${tip.title.substring(0, 30)}${tip.title.length > 30 ? '...' : ''}
      </text>
    </svg>
  `)}`;
}