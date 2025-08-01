import React from 'react';
import { UserNavigation } from '../components/user/UserNavigation';

export const UserDashboard = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <UserNavigation />
      <main className='max-w-7xl mx-auto px-4 pt-20'>
        <h1>User Dashboard</h1>
      </main>
    </div>
  );
};