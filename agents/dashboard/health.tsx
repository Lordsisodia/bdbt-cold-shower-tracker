import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface AgentStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastCheck: Date;
  health: 'healthy' | 'degraded' | 'critical';
}

interface HealthData {
  timestamp: Date;
  agents: [string, AgentStatus][];
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

export function HealthDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to agent dashboard');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('healthUpdate', (data: HealthData) => {
      setHealthData(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🟢';
      case 'stopped': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Connecting to Agent System</h1>
          <p className="text-gray-600">Please wait while we establish connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 BDBT Autonomous Agent Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(healthData?.overallHealth || 'healthy')}`}>
              {healthData?.overallHealth?.toUpperCase() || 'UNKNOWN'}
            </span>
            <span className="text-gray-500">
              Last updated: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {healthData?.agents.map(([name, agent]) => (
            <div key={name} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <span className="text-2xl">{getStatusIcon(agent.status)}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    agent.status === 'running' ? 'bg-green-100 text-green-800' :
                    agent.status === 'stopped' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Health:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getHealthColor(agent.health)}`}>
                    {agent.health.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Check:</span>
                  <span className="text-sm text-gray-800">
                    {new Date(agent.lastCheck).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Active Agents</h4>
            <div className="text-3xl font-bold text-green-600">
              {healthData?.agents.filter(([, agent]) => agent.status === 'running').length || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Total Agents</h4>
            <div className="text-3xl font-bold text-blue-600">
              {healthData?.agents.length || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Degraded</h4>
            <div className="text-3xl font-bold text-yellow-600">
              {healthData?.agents.filter(([, agent]) => agent.health === 'degraded').length || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Critical</h4>
            <div className="text-3xl font-bold text-red-600">
              {healthData?.agents.filter(([, agent]) => agent.health === 'critical').length || 0}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {healthData?.agents.map(([name, agent]) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span>{getStatusIcon(agent.status)}</span>
                  <span className="font-medium capitalize">{name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(agent.lastCheck).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}