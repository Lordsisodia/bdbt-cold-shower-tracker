// Supabase Edge Function for secure Grok API integration
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TipEnhancementRequest {
  tip: {
    id: number;
    title: string;
    category: string;
    description?: string;
  };
  enhancementType: 'simple' | 'comprehensive';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      return new Response(
        JSON.stringify({ error: 'Grok API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const requestBody: TipEnhancementRequest = await req.json();
    const { tip, enhancementType } = requestBody;

    // Validate input
    if (!tip || !tip.title || !tip.category) {
      return new Response(
        JSON.stringify({ error: 'Invalid tip data provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create enhancement prompt based on type
    const prompt = enhancementType === 'comprehensive' 
      ? createComprehensivePrompt(tip)
      : createSimplePrompt(tip);

    // Call Grok API
    const grokResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert wellness coach and content creator. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: enhancementType === 'comprehensive' ? 4000 : 2000
      })
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('Grok API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to enhance tip' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const grokData = await grokResponse.json();
    const enhancedContent = JSON.parse(grokData.choices[0].message.content);

    // Return enhanced tip
    return new Response(
      JSON.stringify({
        success: true,
        originalTip: tip,
        enhancedContent,
        metadata: {
          enhancementType,
          processingTime: Date.now(),
          model: 'llama-3.3-70b-versatile',
          tokens: grokData.usage?.total_tokens || 0
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function createSimplePrompt(tip: any): string {
  return `
You are an expert ${tip.category} coach and content strategist. I need you to expand this tip into a comprehensive, actionable tip with all the necessary details.

TIP INPUT:
Title: "${tip.title}"
Category: ${tip.category}
Description: "${tip.description || ''}"

Please expand this into a complete tip with the following structure. Respond with ONLY valid JSON:

{
  "title": "Catchy, actionable title (6-8 words max)",
  "subtitle": "Compelling description that explains the benefit (10-15 words)",
  "subcategory": "Specific subcategory within ${tip.category}",
  "difficulty": "Easy|Moderate|Advanced",
  "expandedDescription": "Detailed 2-3 sentence explanation of exactly what to do and why",
  "primaryBenefit": "Main immediate benefit (1 sentence)",
  "secondaryBenefit": "Secondary benefit that develops over time (1 sentence)",
  "tertiaryBenefit": "Long-term transformational benefit (1 sentence)",
  "implementationTime": "How long it takes to do (e.g., '5 minutes', '2 weeks')",
  "frequency": "How often to do it (e.g., 'Daily', 'Weekly', '3x per week')",
  "cost": "Cost level (Free, Low, Medium, High)",
  "scientificBacking": true/false,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Make it practical, specific, and immediately actionable. Focus on making the benefits clear and compelling.
  `;
}

function createComprehensivePrompt(tip: any): string {
  return `
You are a world-class expert in ${tip.category} optimization, behavioral psychology, and content strategy. 
Create comprehensive, research-backed content for a premium tip guide.

ORIGINAL TIP DATA:
Title: ${tip.title}
Category: ${tip.category}
Description: ${tip.description || ''}

Generate detailed, premium content following this exact JSON structure. Be specific, actionable, and evidence-based.

REQUIREMENTS:
1. All content must be original, detailed, and valuable
2. Include specific numbers, timeframes, and measurable outcomes
3. Reference real psychological/scientific principles
4. Provide multiple difficulty levels and personalizations
5. Create content suitable for premium PDF design
6. Make it highly engaging and visually descriptive

Focus on ${tip.category} category best practices. Make every piece of content actionable and valuable.
  `;
}