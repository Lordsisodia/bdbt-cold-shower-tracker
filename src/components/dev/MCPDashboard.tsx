import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, Target, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, Badge, Modal } from '../ui';
import { mcpOptimizer } from '../../services/mcpOptimizer';
import { promptTemplateService } from '../../services/promptTemplates';

interface MCPDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MCPDashboard: React.FC<MCPDashboardProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
      loadRecommendations();
    }
  }, [isOpen]);

  const loadAnalytics = () => {
    const sessionAnalytics = mcpOptimizer.getSessionAnalytics();
    setAnalytics(sessionAnalytics);
  };

  const loadRecommendations = () => {
    const recs = mcpOptimizer.getOptimizationRecommendations();
    setRecommendations(recs);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = promptTemplateService.getTemplate(templateId);
    if (template) {
      const initialVariables: Record<string, string> = {};
      template.variables.forEach(variable => {
        initialVariables[variable] = '';
      });
      setTemplateVariables(initialVariables);
    }
  };

  const generateOptimizedPrompt = () => {
    if (!selectedTemplate) return;
    
    try {
      const prompt = promptTemplateService.renderTemplate(selectedTemplate, templateVariables);
      setGeneratedPrompt(prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const templates = promptTemplateService.getAllTemplates();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="⚡ MCP Optimization Dashboard">
      <div className="space-y-6">
        {/* Analytics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.successRate?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </Card>

          <Card padding="sm" className="text-center">
            <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.efficiency?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600">Efficiency</div>
          </Card>

          <Card padding="sm" className="text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.avgIterations?.toFixed(1) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Iterations</div>
          </Card>

          <Card padding="sm" className="text-center">
            <BarChart3 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.contextResets || 0}
            </div>
            <div className="text-sm text-gray-600">Context Resets</div>
          </Card>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Optimization Recommendations
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Template Selection */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Optimized Prompt Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <Badge variant="secondary" size="sm">
                    {template.type}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">{template.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ~{template.estimatedTokens} tokens
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Template Configuration */}
        {selectedTemplate && (
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Template Configuration</h3>
            <div className="space-y-4">
              {promptTemplateService.getTemplate(selectedTemplate)?.variables.map(variable => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <textarea
                    value={templateVariables[variable] || ''}
                    onChange={(e) => setTemplateVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={2}
                    placeholder={`Enter ${variable}...`}
                  />
                </div>
              ))}
              
              <Button
                onClick={generateOptimizedPrompt}
                disabled={!selectedTemplate || Object.values(templateVariables).some(v => !v.trim())}
                className="w-full"
              >
                Generate Optimized Prompt
              </Button>
            </div>
          </Card>
        )}

        {/* Generated Prompt */}
        {generatedPrompt && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🚀 Generated Prompt</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(generatedPrompt)}
                  variant="outline"
                  size="sm"
                >
                  Copy
                </Button>
                <Button
                  onClick={() => setGeneratedPrompt('')}
                  variant="ghost"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {generatedPrompt}
              </pre>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => {
                mcpOptimizer.startSession(`session-${Date.now()}`);
                loadAnalytics();
              }}
              variant="outline"
              leftIcon={<Clock size={16} />}
            >
              Start New Session
            </Button>
            
            <Button
              onClick={loadAnalytics}
              variant="outline"
              leftIcon={<BarChart3 size={16} />}
            >
              Refresh Analytics
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Optimization Tips</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Use batch requests for related operations to maximize efficiency</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Provide complete context upfront to avoid iterations</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Use /clear command when switching between different types of tasks</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Leverage parallel tool execution for independent operations</span>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};