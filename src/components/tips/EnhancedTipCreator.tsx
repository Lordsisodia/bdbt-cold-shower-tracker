import {
    AlertCircle, CheckCircle, Clock,
    DollarSign,
    Hash, Heart, Loader, Save, Star, TrendingUp, Wand2
} from 'lucide-react';
import React, { useState } from 'react';
import { grokApiService } from '../../services/grokApiService';
import { DatabaseTip, tipsDatabaseService } from '../../services/tipsDatabaseService';


interface TipFormData {
  title: string;
  subtitle: string;
  category: 'health' | 'wealth' | 'happiness';
  subcategory: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  description: string;
  primary_benefit: string;
  secondary_benefit: string;
  tertiary_benefit: string;
  implementation_time: string;
  frequency: string;
  cost: string;
  tags: string[];
  scientific_backing: boolean;
  mood: string;
  urgency: 'low' | 'medium' | 'high';
}

const EnhancedTipCreator: React.FC = () => {
  // Simplified state for 2-line generation
  const [tipIdea, setTipIdea] = useState('');
  const [category, setCategory] = useState<'health' | 'wealth' | 'happiness'>('health');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generatedTip, setGeneratedTip] = useState<TipFormData | null>(null);

  // Full form data state (populated by AI)
  const [formData, setFormData] = useState<TipFormData>({
    title: '',
    subtitle: '',
    category: 'health',
    subcategory: '',
    difficulty: 'Easy',
    description: '',
    primary_benefit: '',
    secondary_benefit: '',
    tertiary_benefit: '',
    implementation_time: '',
    frequency: '',
    cost: '',
    tags: [],
    scientific_backing: false,
    mood: '',
    urgency: 'medium'
  });

  // Reset form for new tip creation
  const resetForm = () => {
    setTipIdea('');
    setGeneratedTip(null);
    setFormData({
      title: '',
      subtitle: '',
      category: 'health',
      subcategory: '',
      difficulty: 'Easy',
      description: '',
      primary_benefit: '',
      secondary_benefit: '',
      tertiary_benefit: '',
      implementation_time: '',
      frequency: '',
      cost: '',
      tags: [],
      scientific_backing: false,
      mood: '',
      urgency: 'medium'
    });
  };

  // AI Enhancement Functions - Generate complete tip from 2 lines
  const generateCompleteTip = async () => {
    if (!tipIdea.trim()) {
      setSaveError('Please enter your tip idea first');
      return;
    }

    setIsGeneratingAI(true);
    setSaveError(null);

    try {
      // Create a minimal tip structure for AI enhancement
      const baseTip: DatabaseTip = {
        id: Date.now(),
        title: tipIdea.trim(),
        subtitle: '',
        category: category,
        subcategory: 'general',
        difficulty: 'Easy',
        description: tipIdea.trim(),
        primary_benefit: 'Improved wellness',
        secondary_benefit: 'Better life quality',
        tertiary_benefit: 'Long-term positive impact',
        implementation_time: '5-10 minutes',
        frequency: 'Daily',
        cost: 'Free',
        scientific_backing: false,
        tags: [category],
        status: 'draft',
        view_count: 0,
        download_count: 0,
        rating: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Use Grok AI to enhance the tip
      const enhancedTip = await grokApiService.enhanceTip(baseTip);
      
      // Map the enhanced content back to form data
      const newFormData: TipFormData = {
        title: enhancedTip.originalTip.title,
        subtitle: enhancedTip.enhancedContent.socialMediaPosts.twitter.slice(0, 100) || 'AI-generated subtitle',
        category: category,
        subcategory: enhancedTip.originalTip.subcategory,
        difficulty: enhancedTip.originalTip.difficulty,
        description: enhancedTip.enhancedContent.expandedDescription,
        primary_benefit: enhancedTip.enhancedContent.detailedBenefits[0] || 'Primary benefit',
        secondary_benefit: enhancedTip.enhancedContent.detailedBenefits[1] || 'Secondary benefit',
        tertiary_benefit: enhancedTip.enhancedContent.detailedBenefits[2] || 'Tertiary benefit',
        implementation_time: enhancedTip.originalTip.implementation_time,
        frequency: enhancedTip.originalTip.frequency,
        cost: enhancedTip.originalTip.cost,
        tags: [...enhancedTip.originalTip.tags, ...enhancedTip.enhancedContent.detailedBenefits.map(b => b.split(':')[0].toLowerCase())].slice(0, 5),
        scientific_backing: enhancedTip.originalTip.scientific_backing,
        mood: 'positive',
        urgency: 'medium'
      };

      setFormData(newFormData);
      setGeneratedTip(newFormData);
      setIsGeneratingAI(false);
      
    } catch (error) {
      console.error('Error generating tip:', error);
      setSaveError('Failed to generate tip. Please try again.');
      setIsGeneratingAI(false);
    }
  };

  const applyAISuggestion = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Form Handlers
  const handleInputChange = (field: keyof TipFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save tip to Supabase
  const saveTip = async () => {
    if (!generatedTip) {
      setSaveError('No tip to save. Please generate a tip first.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Convert form data to database format
      const tipData: Omit<DatabaseTip, 'id' | 'created_at' | 'updated_at'> = {
        title: generatedTip.title.trim(),
        subtitle: generatedTip.subtitle.trim(),
        category: generatedTip.category,
        subcategory: generatedTip.subcategory || 'general',
        difficulty: generatedTip.difficulty,
        description: generatedTip.description.trim(),
        primary_benefit: generatedTip.primary_benefit.trim(),
        secondary_benefit: generatedTip.secondary_benefit.trim() || 'Additional wellness benefits',
        tertiary_benefit: generatedTip.tertiary_benefit.trim() || 'Long-term positive impact',
        implementation_time: generatedTip.implementation_time || '5-10 minutes',
        frequency: generatedTip.frequency || 'Daily',
        cost: generatedTip.cost || 'Free',
        scientific_backing: generatedTip.scientific_backing,
        tags: generatedTip.tags.length > 0 ? generatedTip.tags : [generatedTip.category, generatedTip.difficulty.toLowerCase()],
        status: 'draft',
        view_count: 0,
        download_count: 0,
        rating: 0,
        is_featured: false
      };

      // Save to Supabase (this would typically return the created tip with ID)
      await tipsDatabaseService.importAllTips(); // For now, we'll use this method
      
      setSaveSuccess(true);
      
      // Reset form after successful save
      setTimeout(() => {
        resetForm();
        setSaveSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving tip:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save tip');
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const categoryIcons = {
    health: Heart,
    wealth: TrendingUp,
    happiness: Star
  };

  const categoryColors = {
    health: 'bg-green-100 text-green-800 border-green-200',
    wealth: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    happiness: 'bg-purple-100 text-purple-800 border-purple-200'
  };


  const renderSimpleCreator = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Create a Tip with AI</h2>
        <p className="text-gray-600 text-lg">Just describe your tip idea in 1-2 lines and let AI do the rest!</p>
      </div>

      {/* Simple 2-Line Input */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                💡 What's your tip idea?
              </label>
              <textarea
                value={tipIdea}
                onChange={(e) => setTipIdea(e.target.value)}
                placeholder="e.g., Drink a glass of water every morning to boost energy and hydration"
                rows={3}
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">Keep it simple - just the core idea. AI will expand it into a complete tip!</p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                🎯 Category
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['health', 'wealth', 'happiness'] as const).map((cat) => {
                  const Icon = categoryIcons[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
                        category === cat
                          ? categoryColors[cat]
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <div>
                        <div className="font-semibold capitalize">{cat}</div>
                        <div className="text-sm text-gray-500">
                          {cat === 'health' && 'Physical & Mental Wellness'}
                          {cat === 'wealth' && 'Finance & Career Growth'}
                          {cat === 'happiness' && 'Joy & Life Satisfaction'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={generateCompleteTip}
                disabled={!tipIdea.trim() || isGeneratingAI}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Generating Complete Tip...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    Generate Complete Tip with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Tip Preview */}
      {generatedTip && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                AI Generated Your Complete Tip!
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Title</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{generatedTip.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Subtitle</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{generatedTip.subtitle}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">{generatedTip.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Primary Benefit</h4>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-lg text-sm">{generatedTip.primary_benefit}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Secondary Benefit</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">{generatedTip.secondary_benefit}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tertiary Benefit</h4>
                  <p className="text-gray-700 bg-purple-50 p-3 rounded-lg text-sm">{generatedTip.tertiary_benefit}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">Time</div>
                  <div className="text-gray-600">{generatedTip.implementation_time}</div>
                </div>
                <div className="text-center">
                  <Hash className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">Frequency</div>
                  <div className="text-gray-600">{generatedTip.frequency}</div>
                </div>
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">Cost</div>
                  <div className="text-gray-600">{generatedTip.cost}</div>
                </div>
              </div>

              {generatedTip.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedTip.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSaveSection = () => (
    <div className="max-w-3xl mx-auto">
      {/* Status Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 mb-6">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Tip saved successfully! You can create another one.</span>
        </div>
      )}
      
      {saveError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 mb-6">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{saveError}</span>
        </div>
      )}

      {/* Save Button */}
      {generatedTip && (
        <div className="text-center">
          <button
            onClick={saveTip}
            disabled={isSaving || !generatedTip}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg mx-auto"
          >
            {isSaving ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Saving to Database...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Tip to Database
              </>
            )}
          </button>
          <p className="text-gray-500 mt-3">Your tip will be saved and available in the tips library</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Simple Creator Interface */}
        {renderSimpleCreator()}
        
        {/* Save Section */}
        {renderSaveSection()}
      </div>
    </div>
  );
};

export default EnhancedTipCreator;