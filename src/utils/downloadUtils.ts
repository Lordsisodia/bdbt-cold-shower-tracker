// Utility functions for handling downloads

export const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadPDF = (filename: string, content: string) => {
  // For now, we'll create a simple PDF-like content
  // In a real app, you'd use a PDF generation library like jsPDF
  const pdfContent = `
BDBT - ${filename}
${'='.repeat(50)}

${content}

${'='.repeat(50)}
Visit bdbt.com for more resources
  `;
  
  downloadFile(`${filename}.pdf`, pdfContent, 'application/pdf');
};

export const downloadTip = (tipTitle: string, tipDescription: string, tipIncludes: string[]) => {
  const content = `
${tipTitle}
${'='.repeat(tipTitle.length)}

Description:
${tipDescription}

What's Included:
${tipIncludes.map(item => `• ${item}`).join('\n')}

---
Downloaded from BDBT - Your transformation starts here!
Visit bdbt.com for more free resources.
  `;
  
  downloadFile(`${tipTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, content, 'text/plain');
};

export const downloadBlueprint = () => {
  const blueprintContent = `
THE SOURCE BLUEPRINT
Complete Operating System for Health, Wealth & Happiness
By Big Daddy - BDBT

${'='.repeat(60)}

TABLE OF CONTENTS
${'='.repeat(60)}

1. 20 Daily Wins Framework
2. 20 Daily Drifts to Avoid  
3. Weekly Identity Check-in System
4. Habit Stacking Templates
5. Progress Tracking Sheets
6. Transformation Triggers
7. Accountability Systems
8. Success Metrics Dashboard

${'='.repeat(60)}

KEY TAKEAWAYS
${'='.repeat(60)}

1. MOMENTUM OVER MOTIVATION
   One tick is a "vote" for your future self
   
2. WINS SPARK WINS
   Identity shifts trigger better choices and higher energy
   
3. TRACK PATTERNS, NOT PERFECTION
   See which habits ignite positive chain reactions

${'='.repeat(60)}

DAILY WINS FRAMEWORK
${'='.repeat(60)}

Morning Foundation:
• 5 AM wake-up (consistency builds identity)
• 10-minute meditation or mindfulness practice
• Physical movement (walk, stretch, or exercise)
• Healthy breakfast with protein
• Review daily priorities

Mid-Day Momentum:
• Complete most important task first
• Take breaks every 90 minutes
• Stay hydrated (8 glasses of water)
• Connect with someone meaningful
• Practice gratitude

Evening Excellence:
• Reflect on daily wins
• Prepare for tomorrow
• Digital sunset 1 hour before bed
• Read or journal
• Quality sleep (7-9 hours)

${'='.repeat(60)}

WEEKLY IDENTITY CHECK-IN
${'='.repeat(60)}

Ask yourself these questions every Sunday:

1. What identity am I building with my actions?
2. Which habits served me well this week?
3. What patterns need adjustment?
4. How can I compound my wins next week?
5. What support do I need to succeed?

${'='.repeat(60)}

HABIT STACKING TEMPLATE
${'='.repeat(60)}

After I [EXISTING HABIT], I will [NEW HABIT].

Examples:
• After I pour my morning coffee, I will write down 3 things I'm grateful for
• After I sit down at my desk, I will review my top 3 priorities
• After I finish dinner, I will take a 10-minute walk

${'='.repeat(60)}

PROGRESS TRACKING
${'='.repeat(60)}

Track these metrics weekly:
• Consistency percentage (habits completed)
• Energy levels (1-10 scale)
• Mood and motivation (1-10 scale)
• Progress toward major goals
• Wins and challenges

${'='.repeat(60)}

TRANSFORMATION TRIGGERS
${'='.repeat(60)}

Powerful questions to ask yourself:
• "What would the person I want to become do in this situation?"
• "How can I make this easier for my future self?"
• "What's the smallest step I can take right now?"
• "How does this action align with my values?"

${'='.repeat(60)}

Remember: Transformation happens one decision at a time.
Start small, stay consistent, and trust the process.

For more resources and community support, visit bdbt.com

© BDBT - Building Dreams, Building Tomorrow
  `;
  
  downloadFile('The_Source_Blueprint.txt', blueprintContent, 'text/plain');
};