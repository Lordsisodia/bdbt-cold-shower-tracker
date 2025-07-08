import React, { useState } from 'react';
import { Lightbulb, Code, Palette, Search, Zap } from 'lucide-react';
import { Button } from '../ui';
import { InspirationPanel } from './InspirationPanel';
import { MCPDashboard } from './MCPDashboard';

export const DevTools: React.FC = () => {
  const [showInspiration, setShowInspiration] = useState(false);
  const [showMCPDashboard, setShowMCPDashboard] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development mode
  const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  if (!isDev) {
    return null;
  }

  return (
    <>
      {/* Floating Dev Tools */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end gap-2">
          {/* Expanded Tools */}
          {isExpanded && (
            <div className="flex flex-col gap-2 mb-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setShowMCPDashboard(true)}
                className="shadow-lg"
                title="MCP Optimization Dashboard"
              >
                <Zap size={20} />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setShowInspiration(true)}
                className="shadow-lg"
                title="Design Inspiration Hub"
              >
                <Palette size={20} />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  console.log('Component Library opened');
                  // Future: Open component library
                }}
                className="shadow-lg"
                title="Component Library"
              >
                <Code size={20} />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  console.log('UI Explorer opened');
                  // Future: Open UI explorer
                }}
                className="shadow-lg"
                title="UI Pattern Explorer"
              >
                <Search size={20} />
              </Button>
            </div>
          )}
          
          {/* Main Toggle Button */}
          <Button
            variant="primary"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shadow-xl animate-pulse"
            title="Development Tools"
          >
            <Lightbulb size={20} />
          </Button>
        </div>
      </div>

      {/* Inspiration Panel */}
      <InspirationPanel
        isOpen={showInspiration}
        onClose={() => setShowInspiration(false)}
      />

      {/* MCP Dashboard */}
      <MCPDashboard
        isOpen={showMCPDashboard}
        onClose={() => setShowMCPDashboard(false)}
      />
    </>
  );
};