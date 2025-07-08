import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Instagram, Link, Download, Trophy, Flame, Target } from 'lucide-react';
import { Button, Card } from '../ui';

interface SocialSharingProps {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

interface ShareableAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  shareText: string;
  hashtags: string[];
}

export const SocialSharing: React.FC<SocialSharingProps> = ({
  currentStreak,
  longestStreak,
  totalCompletions,
  completionRate
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<ShareableAchievement | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const achievements: ShareableAchievement[] = [
    {
      id: 'first-week',
      title: '7-Day Warrior',
      description: 'Completed 7 days of cold showers',
      icon: <Trophy className="w-6 h-6 text-yellow-600" />,
      unlocked: currentStreak >= 7 || longestStreak >= 7,
      shareText: `Just completed my first week of cold showers! 🚿❄️ Building mental toughness one shower at a time.`,
      hashtags: ['ColdShowerChallenge', 'MentalToughness', 'BigDaddyBigTips', 'ColdTherapy']
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Achieved a 30-day streak',
      icon: <Flame className="w-6 h-6 text-orange-600" />,
      unlocked: currentStreak >= 30 || longestStreak >= 30,
      shareText: `30 days of cold showers complete! 🔥 Proving to myself that discomfort builds character. Who's ready to join the challenge?`,
      hashtags: ['ColdShowerChallenge', '30DayChallenge', 'BigDaddyBigTips', 'DisciplineEqualsFreedom']
    },
    {
      id: 'consistency-king',
      title: 'Consistency Champion',
      description: 'Maintained 80%+ completion rate',
      icon: <Target className="w-6 h-6 text-green-600" />,
      unlocked: completionRate >= 80,
      shareText: `${Math.round(completionRate)}% consistency rate on my cold shower challenge! 🎯 Small daily actions compound into massive results.`,
      hashtags: ['ColdShowerChallenge', 'Consistency', 'BigDaddyBigTips', 'HabitBuilding']
    },
    {
      id: 'centurion',
      title: 'Cold Shower Centurion',
      description: 'Completed 100 cold showers',
      icon: <Trophy className="w-6 h-6 text-purple-600" />,
      unlocked: totalCompletions >= 100,
      shareText: `100 cold showers complete! 💪 Every single one was a vote for the person I'm becoming. The journey continues!`,
      hashtags: ['ColdShowerChallenge', '100Days', 'BigDaddyBigTips', 'Transformation']
    }
  ];

  const generateShareText = (achievement?: ShareableAchievement) => {
    if (achievement) {
      return `${achievement.shareText}\n\n${achievement.hashtags.map(tag => `#${tag}`).join(' ')}\n\n@bigdaddysbigtips`;
    }
    
    return `Just crushed day ${currentStreak} of my cold shower challenge! 🚿❄️ Building mental toughness one cold shower at a time.\n\n#ColdShowerChallenge #MentalToughness #BigDaddyBigTips #ColdTherapy\n\n@bigdaddysbigtips`;
  };

  const generateProgressStats = () => {
    return `📊 My Cold Shower Progress:\n• Current Streak: ${currentStreak} days 🔥\n• Best Streak: ${longestStreak} days 🏆\n• Total Completed: ${totalCompletions} 💪\n• Success Rate: ${Math.round(completionRate)}% 🎯\n\nEvery cold shower is a vote for the person you're becoming! Who's ready to join the challenge?\n\n#ColdShowerChallenge #BigDaddyBigTips #MentalToughness #ColdTherapy\n\n@bigdaddysbigtips`;
  };

  const shareToTwitter = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`;
    window.open(url, '_blank', 'width=580,height=400');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct text sharing, so we copy to clipboard
    const text = selectedAchievement ? generateShareText(selectedAchievement) : generateProgressStats();
    copyToClipboard(text);
    alert('Text copied to clipboard! Now open Instagram and paste in your story or post.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const downloadProgressCard = () => {
    // Create a simple HTML canvas for the progress card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('COLD SHOWER CHALLENGE', 300, 60);

    // Stats
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Current Streak: ${currentStreak} days`, 300, 120);
    ctx.fillText(`Best Streak: ${longestStreak} days`, 300, 160);
    ctx.fillText(`Total Completed: ${totalCompletions}`, 300, 200);
    ctx.fillText(`Success Rate: ${Math.round(completionRate)}%`, 300, 240);

    // Quote
    ctx.font = 'italic 18px Arial';
    ctx.fillText('"Every cold shower is a vote for the person you\'re becoming"', 300, 300);

    // Handle
    ctx.font = 'bold 16px Arial';
    ctx.fillText('@bigdaddysbigtips', 300, 350);

    // Download the image
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cold-shower-progress-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const shareCurrentProgress = () => {
    setSelectedAchievement(null);
    setShowShareOptions(true);
  };

  const shareAchievement = (achievement: ShareableAchievement) => {
    if (!achievement.unlocked) return;
    setSelectedAchievement(achievement);
    setShowShareOptions(true);
  };

  const closeShareOptions = () => {
    setShowShareOptions(false);
    setSelectedAchievement(null);
  };

  return (
    <div className="space-y-6">
      {/* Share Current Progress */}
      <Card padding="lg">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Progress</h3>
          <p className="text-gray-600 mb-6">
            Inspire others with your cold shower journey and celebrate your achievements!
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentStreak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          <Button
            onClick={shareCurrentProgress}
            leftIcon={<Share2 size={16} />}
            className="mb-4"
          >
            Share My Progress
          </Button>
        </div>
      </Card>

      {/* Achievements to Share */}
      <Card padding="lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements to Share</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                achievement.unlocked
                  ? 'border-green-300 bg-green-50 hover:bg-green-100'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
              onClick={() => shareAchievement(achievement)}
            >
              <div className="flex items-center gap-3 mb-2">
                {achievement.icon}
                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              {achievement.unlocked ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Trophy size={16} />
                  <span className="text-sm font-medium">Unlocked - Click to Share!</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Keep going to unlock this achievement!</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Share Options Modal */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedAchievement ? `Share "${selectedAchievement.title}"` : 'Share Your Progress'}
              </h3>
              <p className="text-gray-600">Choose how you'd like to share your achievement</p>
            </div>

            <div className="space-y-3 mb-6">
              <Button
                onClick={() => shareToTwitter(selectedAchievement ? generateShareText(selectedAchievement) : generateProgressStats())}
                leftIcon={<Twitter size={16} />}
                variant="outline"
                className="w-full justify-start"
              >
                Share on Twitter
              </Button>

              <Button
                onClick={() => shareToFacebook(selectedAchievement ? generateShareText(selectedAchievement) : generateProgressStats())}
                leftIcon={<Facebook size={16} />}
                variant="outline"
                className="w-full justify-start"
              >
                Share on Facebook
              </Button>

              <Button
                onClick={shareToInstagram}
                leftIcon={<Instagram size={16} />}
                variant="outline"
                className="w-full justify-start"
              >
                Share on Instagram
              </Button>

              <Button
                onClick={() => copyToClipboard(selectedAchievement ? generateShareText(selectedAchievement) : generateProgressStats())}
                leftIcon={<Link size={16} />}
                variant="outline"
                className="w-full justify-start"
              >
                {copySuccess ? 'Copied to Clipboard!' : 'Copy Text'}
              </Button>

              <Button
                onClick={downloadProgressCard}
                leftIcon={<Download size={16} />}
                variant="outline"
                className="w-full justify-start"
              >
                Download Progress Card
              </Button>
            </div>

            {/* Preview Text */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-2">Preview:</div>
              <div className="text-sm text-gray-800 whitespace-pre-line">
                {selectedAchievement ? generateShareText(selectedAchievement) : generateProgressStats()}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={closeShareOptions} variant="secondary" className="flex-1">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Share Tips */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing Tips</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">💡</span>
            <div>
              <strong>Best times to share:</strong> After completing a milestone, achieving a new streak record, or when you feel extra motivated
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">📸</span>
            <div>
              <strong>Add a photo:</strong> Take a selfie right after your cold shower to show your commitment and inspire others
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">🎯</span>
            <div>
              <strong>Tag friends:</strong> Challenge friends to join you and create accountability partners
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">💪</span>
            <div>
              <strong>Use hashtags:</strong> #ColdShowerChallenge #BigDaddyBigTips #MentalToughness help others find your content
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};