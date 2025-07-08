import React from 'react';
import { Card, Button } from '../ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-sm w-full">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Authentication Coming Soon
        </h3>
        <p className="text-gray-600 mb-4">
          Sign up and sync features are in development. For now, your data is saved locally in your browser.
        </p>
        <Button onClick={onClose} variant="primary" fullWidth>
          Continue as Guest
        </Button>
      </Card>
    </div>
  );
};

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-sm w-full">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          User Profile
        </h3>
        <p className="text-gray-600 mb-4">
          Profile features coming soon!
        </p>
        <Button onClick={onClose} variant="primary" fullWidth>
          Close
        </Button>
      </Card>
    </div>
  );
};