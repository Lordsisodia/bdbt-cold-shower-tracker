import React from 'react';
import { Download, X } from 'lucide-react';
import { Button, Card } from './';
import { usePWA } from '../../hooks/usePWA';

interface InstallPromptProps {
  onDismiss: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
  const { installApp, isInstallable, isOnline } = usePWA();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    await installApp();
    onDismiss();
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 mx-auto max-w-sm z-50 border-blue-200 bg-blue-50/95 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Install BDBT Tracker</h3>
          <p className="text-sm text-blue-700 mb-3">
            Install our app for the best experience - work offline, get notifications, and quick access!
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              variant="primary"
              size="sm"
              leftIcon={<Download size={16} />}
              className="flex-1"
            >
              Install App
            </Button>
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="px-2"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {!isOnline && (
        <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
          <p className="text-xs text-yellow-800">
            📱 You're offline. Install the app to use it without internet!
          </p>
        </div>
      )}
    </Card>
  );
};