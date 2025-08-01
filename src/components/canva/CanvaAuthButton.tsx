import React, { useState, useEffect } from 'react';
import { Palette, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { canvaService } from '../../services/canvaIntegration';

interface CanvaAuthButtonProps {
  onAuthSuccess?: (token: string) => void;
  onAuthError?: (error: string) => void;
  className?: string;
}

const CanvaAuthButton: React.FC<CanvaAuthButtonProps> = ({
  onAuthSuccess,
  onAuthError,
  className = ''
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated
    setIsAuthenticated(canvaService.isAuthenticated());

    // Listen for auth callback
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        const errorMessage = urlParams.get('error_description') || 'Authentication failed';
        setAuthError(errorMessage);
        onAuthError?.(errorMessage);
        return;
      }

      if (code) {
        setIsLoading(true);
        try {
          const token = await canvaService.exchangeCodeForToken(code);
          setIsAuthenticated(true);
          setAuthError(null);
          onAuthSuccess?.(token);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
          setAuthError(errorMessage);
          onAuthError?.(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuthCallback();
  }, [onAuthSuccess, onAuthError]);

  const handleConnect = () => {
    const authUrl = canvaService.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    localStorage.removeItem('canva_access_token');
    setIsAuthenticated(false);
    setAuthError(null);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg ${className}`}>
        <Loader className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Connecting to Canva...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-2">
        <div className={`flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg ${className}`}>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">Connected to Canva</span>
          <button
            onClick={handleDisconnect}
            className="ml-auto text-xs text-green-600 hover:text-green-700 underline"
          >
            Disconnect
          </button>
        </div>
        <p className="text-xs text-gray-500 px-4">
          You can now create and export Canva designs directly from BDBT tips.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        className={`flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors ${className}`}
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">Connect to Canva</span>
        <ExternalLink className="w-3 h-3" />
      </button>
      
      {authError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">{authError}</span>
        </div>
      )}
      
      <p className="text-xs text-gray-500 px-4">
        Connect your Canva account to automatically generate professional tip designs.
      </p>
    </div>
  );
};

export default CanvaAuthButton;