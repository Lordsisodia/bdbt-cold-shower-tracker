import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { AgentOrchestrator } from '../orchestrator/index';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize orchestrator
const orchestrator = new AgentOrchestrator();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Dashboard client connected:', socket.id);
  
  // Send initial status
  socket.emit('healthUpdate', orchestrator.getStatus());
  
  socket.on('disconnect', () => {
    console.log('Dashboard client disconnected:', socket.id);
  });
  
  // Handle client requests
  socket.on('getStatus', () => {
    socket.emit('healthUpdate', orchestrator.getStatus());
  });
  
  socket.on('restartAgent', (agentName: string) => {
    console.log(`Manual restart requested for agent: ${agentName}`);
    // Could implement manual agent restart here
  });
});

// Listen for orchestrator events
orchestrator.on('healthUpdate', (data) => {
  io.emit('healthUpdate', data);
});

orchestrator.on('agentComplete', (data) => {
  io.emit('agentUpdate', data);
});

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json(orchestrator.getStatus());
});

app.get('/api/agents', (req, res) => {
  const status = orchestrator.getStatus();
  res.json(status.agents);
});

app.post('/api/agents/:name/restart', (req, res) => {
  const { name } = req.params;
  // Implement agent restart logic
  res.json({ success: true, message: `Restart requested for ${name}` });
});

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BDBT Agent Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body class="bg-gray-100">
        <div id="app">
            <div class="min-h-screen p-8">
                <div class="max-w-7xl mx-auto">
                    <!-- Header -->
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">
                            🤖 BDBT Autonomous Agent Dashboard
                        </h1>
                        <div class="flex items-center space-x-4">
                            <span id="health-status" class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                CONNECTING...
                            </span>
                            <span id="last-updated" class="text-gray-500">
                                Connecting to agents...
                            </span>
                        </div>
                    </div>
                    
                    <!-- Agent Grid -->
                    <div id="agent-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <!-- Agents will be populated here -->
                    </div>
                    
                    <!-- System Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h4 class="text-sm font-medium text-gray-600 mb-2">Active Agents</h4>
                            <div id="active-count" class="text-3xl font-bold text-green-600">0</div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h4 class="text-sm font-medium text-gray-600 mb-2">Total Agents</h4>
                            <div id="total-count" class="text-3xl font-bold text-blue-600">0</div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h4 class="text-sm font-medium text-gray-600 mb-2">Degraded</h4>
                            <div id="degraded-count" class="text-3xl font-bold text-yellow-600">0</div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h4 class="text-sm font-medium text-gray-600 mb-2">Critical</h4>
                            <div id="critical-count" class="text-3xl font-bold text-red-600">0</div>
                        </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div id="activity-list" class="space-y-2">
                            <!-- Activity will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            const socket = io();
            
            function getHealthColor(health) {
                switch (health) {
                    case 'healthy': return 'text-green-600 bg-green-50';
                    case 'degraded': return 'text-yellow-600 bg-yellow-50';
                    case 'critical': return 'text-red-600 bg-red-50';
                    default: return 'text-gray-600 bg-gray-50';
                }
            }
            
            function getStatusIcon(status) {
                switch (status) {
                    case 'running': return '🟢';
                    case 'stopped': return '🟡';
                    case 'error': return '🔴';
                    default: return '⚪';
                }
            }
            
            function updateDashboard(data) {
                // Update header
                const healthStatus = document.getElementById('health-status');
                const lastUpdated = document.getElementById('last-updated');
                
                healthStatus.className = 'px-3 py-1 rounded-full text-sm font-medium ' + getHealthColor(data.overallHealth);
                healthStatus.textContent = (data.overallHealth || 'UNKNOWN').toUpperCase();
                lastUpdated.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
                
                // Update agent grid
                const agentGrid = document.getElementById('agent-grid');
                agentGrid.innerHTML = '';
                
                data.agents.forEach(([name, agent]) => {
                    const agentCard = document.createElement('div');
                    agentCard.className = 'bg-white rounded-lg shadow-md p-6';
                    agentCard.innerHTML = \`
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 capitalize">
                                \${name.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <span class="text-2xl">\${getStatusIcon(agent.status)}</span>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Status:</span>
                                <span class="px-2 py-1 rounded text-xs font-medium \${
                                    agent.status === 'running' ? 'bg-green-100 text-green-800' :
                                    agent.status === 'stopped' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }">
                                    \${agent.status.toUpperCase()}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Health:</span>
                                <span class="px-2 py-1 rounded text-xs font-medium \${getHealthColor(agent.health)}">
                                    \${agent.health.toUpperCase()}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Last Check:</span>
                                <span class="text-sm text-gray-800">
                                    \${new Date(agent.lastCheck).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    \`;
                    agentGrid.appendChild(agentCard);
                });
                
                // Update stats
                const runningCount = data.agents.filter(([, agent]) => agent.status === 'running').length;
                const degradedCount = data.agents.filter(([, agent]) => agent.health === 'degraded').length;
                const criticalCount = data.agents.filter(([, agent]) => agent.health === 'critical').length;
                
                document.getElementById('active-count').textContent = runningCount;
                document.getElementById('total-count').textContent = data.agents.length;
                document.getElementById('degraded-count').textContent = degradedCount;
                document.getElementById('critical-count').textContent = criticalCount;
                
                // Update activity
                const activityList = document.getElementById('activity-list');
                activityList.innerHTML = '';
                
                data.agents.forEach(([name, agent]) => {
                    const activity = document.createElement('div');
                    activity.className = 'flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0';
                    activity.innerHTML = \`
                        <div class="flex items-center space-x-3">
                            <span>\${getStatusIcon(agent.status)}</span>
                            <span class="font-medium capitalize">\${name}</span>
                        </div>
                        <div class="text-sm text-gray-500">
                            \${new Date(agent.lastCheck).toLocaleString()}
                        </div>
                    \`;
                    activityList.appendChild(activity);
                });
            }
            
            socket.on('connect', () => {
                console.log('Connected to agent dashboard');
            });
            
            socket.on('healthUpdate', (data) => {
                updateDashboard(data);
            });
            
            // Request initial status
            socket.emit('getStatus');
            
            // Auto-refresh every 30 seconds
            setInterval(() => {
                socket.emit('getStatus');
            }, 30000);
        </script>
    </body>
    </html>
  `);
});

// Start server
server.listen(PORT, () => {
  console.log(\`🚀 Agent Dashboard running on http://localhost:\${PORT}\`);
  
  // Start the orchestrator
  orchestrator.start();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down agent system...');
  orchestrator.stop();
  server.close(() => {
    process.exit(0);
  });
});