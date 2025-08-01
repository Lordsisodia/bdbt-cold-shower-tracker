import { AlertCircle, Loader, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import { enhancedGrokService } from '../../services/enhancedGrokService';

interface CustomPDFGeneratorProps {
  onGenerate: (tip: any) => void;
}

const CustomPDFGenerator: React.FC<CustomPDFGeneratorProps> = ({ onGenerate }) => {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<'health' | 'wealth' | 'happiness'>('health');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter your tip idea');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Use Grok to expand the simple input into full content
      const expanded = await enhancedGrokService.expandSimpleTipToFull(input, category);
      
      // Create full tip object for PDF generation
      const fullTip = {
        id: Date.now(),
        title: expanded.title,
        subtitle: expanded.subtitle,
        category,
        subcategory: expanded.subcategory,
        difficulty: expanded.difficulty,
        description: expanded.expandedDescription,
        primary_benefit: expanded.primaryBenefit,
        secondary_benefit: expanded.secondaryBenefit,
        tertiary_benefit: expanded.tertiaryBenefit,
        implementation_time: expanded.implementationTime,
        frequency: expanded.frequency,
        cost: expanded.cost,
        scientific_backing: expanded.scientificBacking,
        tags: expanded.tags,
        images: {
          hero: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80`,
          benefits: `https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=400&fit=crop&q=80`,
          implementation: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&q=80`,
          cta: `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80`
        }
      };

      onGenerate(fullTip);
      setInput(''); // Clear input after success
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    { text: "Join a local sports club to build community", cat: "health" },
    { text: "Set up automatic weekly savings transfers", cat: "wealth" },
    { text: "Practice 5-minute morning meditation", cat: "happiness" }
  ];

  return (
    <div className="space-y-4">
      {/* AI Instruction Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🤖 AI-Powered Content Generation</h4>
        <p className="text-sm text-blue-800">
          Just type a simple tip idea (1-2 sentences) and AI will expand it into a complete 
          professional PDF with all pages filled:
        </p>
        <ul className="mt-2 text-xs text-blue-700 space-y-1">
          <li>• Cover Page with professional design</li>
          <li>• Introduction with expanded description</li>
          <li>• Comprehensive benefits analysis</li>
          <li>• 30+ implementation steps</li>
          <li>• Progress tracking guide</li>
          <li>• Troubleshooting & final thoughts</li>
        </ul>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {(['health', 'wealth', 'happiness'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Single Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Tip Idea (1-2 sentences)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: Drink a glass of water first thing in the morning to boost metabolism and hydration."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      {/* Example Prompts */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Try these examples:</p>
        <div className="space-y-1">
          {examplePrompts.map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(example.text);
                setCategory(example.cat as any);
              }}
              className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="font-medium text-gray-700">{example.cat}:</span>{' '}
              <span className="text-gray-600">{example.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !input.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Generating PDF Content...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate Full PDF Content
          </>
        )}
      </button>

      {/* What Happens Next */}
      <div className="text-xs text-gray-500 text-center">
        AI will create all content → Preview in template → Export as PDF
      </div>
    </div>
  );
};

export default CustomPDFGenerator;