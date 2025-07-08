import React, { useState, useEffect } from 'react';
import { RefreshCw, Heart, Share2 } from 'lucide-react';
import { Button, Card } from '../ui';

const COLD_SHOWER_QUOTES = [
  {
    text: "Every cold shower is a vote for the person you're becoming",
    author: "James Clear (adapted)"
  },
  {
    text: "Comfort is the enemy of progress. Choose discomfort, choose growth.",
    author: "BDBT"
  },
  {
    text: "The cold doesn't care about your feelings. That's what makes it the perfect teacher.",
    author: "Wim Hof"
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    text: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell"
  },
  {
    text: "Small daily improvements are the key to staggering long-term results.",
    author: "Robin Sharma"
  },
  {
    text: "What seems impossible today will one day become your warm-up.",
    author: "Greg Plitt"
  },
  {
    text: "The cold shower is a metaphor for life - sometimes you have to endure discomfort to find clarity.",
    author: "BDBT"
  },
  {
    text: "Your comfort zone is a beautiful place, but nothing ever grows there.",
    author: "John Assaraf"
  },
  {
    text: "Champions don't become champions in the ring. They become champions in their training.",
    author: "Muhammad Ali"
  },
  {
    text: "The cold is your friend. It shows you who you really are.",
    author: "BDBT"
  },
  {
    text: "You are not a victim of your circumstances, you are a product of your decisions.",
    author: "Stephen Covey"
  },
  {
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson"
  },
  {
    text: "Cold showers: Where mental toughness meets physical resilience.",
    author: "BDBT"
  },
  {
    text: "What you do today can improve all your tomorrows.",
    author: "Ralph Marston"
  },
  {
    text: "The only way to do great work is to love what you do - even if it's freezing.",
    author: "Steve Jobs (adapted)"
  },
  {
    text: "Every morning you have two choices: continue to sleep with your dreams, or wake up and chase them.",
    author: "Carmelo Anthony"
  },
  {
    text: "The cold is not your enemy - it's your trainer.",
    author: "BDBT"
  },
  {
    text: "You don't have to be extreme, just consistent.",
    author: "James Clear"
  },
  {
    text: "30 seconds of cold water can change your entire day.",
    author: "BDBT"
  }
];

const MOTIVATIONAL_TIPS = [
  "Start with 30 seconds and gradually increase the duration",
  "Focus on your breathing - long, deep breaths help manage the shock",
  "End your regular shower with cold water for easier transition",
  "Play energizing music to pump yourself up before the cold",
  "Remember: the anticipation is worse than the actual experience",
  "Cold showers boost your metabolism for hours afterward",
  "Think of it as training your willpower muscle",
  "The first 10 seconds are the hardest - push through",
  "Cold exposure releases endorphins - your natural high",
  "Use positive self-talk: 'I am strong, I can do this'",
  "Visualize yourself completing the challenge successfully",
  "Each cold shower is building mental resilience",
  "The cold teaches you to stay calm under pressure",
  "Remember why you started this challenge",
  "Celebrate small wins - every day completed matters"
];

export const MotivationalQuotes: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(COLD_SHOWER_QUOTES[0]);
  const [currentTip, setCurrentTip] = useState(MOTIVATIONAL_TIPS[0]);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Set random quote and tip on component mount
    setCurrentQuote(COLD_SHOWER_QUOTES[Math.floor(Math.random() * COLD_SHOWER_QUOTES.length)]);
    setCurrentTip(MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)]);
  }, []);

  const getNewQuote = () => {
    const newQuote = COLD_SHOWER_QUOTES[Math.floor(Math.random() * COLD_SHOWER_QUOTES.length)];
    setCurrentQuote(newQuote);
    setIsLiked(false);
  };

  const getNewTip = () => {
    const newTip = MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)];
    setCurrentTip(newTip);
  };

  const shareQuote = async () => {
    const shareText = `"${currentQuote.text}" - ${currentQuote.author}\n\n#ColdShowerChallenge #BDBT`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cold Shower Motivation',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // Fall back to clipboard
        navigator.clipboard.writeText(shareText);
      }
    } else {
      // Fall back to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Quote copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Daily Quote */}
      <Card className="bg-gradient-to-br from-blue-600 to-teal-600 text-white" padding="lg">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Daily Motivation</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewQuote}
            className="text-white hover:bg-white/20 p-2"
            aria-label="Get new quote"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
        
        <blockquote className="text-lg italic mb-4 leading-relaxed">
          "{currentQuote.text}"
        </blockquote>
        
        <div className="flex justify-between items-center">
          <cite className="text-sm opacity-90">— {currentQuote.author}</cite>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={`text-white hover:bg-white/20 p-2 ${isLiked ? 'text-red-300' : ''}`}
              aria-label={isLiked ? 'Unlike quote' : 'Like quote'}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={shareQuote}
              className="text-white hover:bg-white/20 p-2"
              aria-label="Share quote"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Tip */}
      <Card className="bg-teal-50 border-teal-200" padding="lg">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-teal-800">💡 Quick Tip</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewTip}
            className="text-teal-600 hover:bg-teal-100 p-2"
            aria-label="Get new tip"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
        
        <p className="text-teal-700 leading-relaxed">
          {currentTip}
        </p>
      </Card>

      {/* Weekly Challenge */}
      <Card className="bg-orange-50 border-orange-200" padding="lg">
        <h3 className="text-lg font-semibold text-orange-800 mb-3">🏆 This Week's Challenge</h3>
        
        <div className="space-y-3">
          <div className="bg-orange-100 p-3 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-1">Breath Work Focus</h4>
            <p className="text-sm text-orange-700">
              Practice the 4-7-8 breathing technique during your cold shower: 
              breathe in for 4, hold for 7, breathe out for 8.
            </p>
          </div>
          
          <div className="text-xs text-orange-600">
            <strong>Why it helps:</strong> Controlled breathing activates your parasympathetic nervous system, 
            helping you stay calm and composed during the cold exposure.
          </div>
        </div>
      </Card>
    </div>
  );
};