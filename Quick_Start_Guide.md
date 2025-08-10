# ATAS Messenger - Quick Start Guide

## Immediate Implementation Steps

### 1. Project Initialization (30 minutes)

```bash
# Create project structure
mkdir atas-messenger && cd atas-messenger
mkdir frontend backend shared

# Initialize backend
cd backend
npm init -y
npm install express mongoose socket.io cors dotenv bcryptjs jsonwebtoken openai
npm install --save-dev nodemon @types/node typescript

# Initialize frontend
cd ../frontend
npx create-react-app . --template typescript
npm install @reduxjs/toolkit react-redux socket.io-client axios
npm install tailwindcss @headlessui/react @heroicons/react react-router-dom
```

### 2. Backend Quick Setup (1 hour)

Create these essential files:

**`backend/src/server.ts`**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ATAS Messenger API is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**`backend/.env`**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/atas-messenger
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
```

**`backend/package.json` scripts**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "build": "tsc"
  }
}
```

### 3. Frontend Quick Setup (1 hour)

**`frontend/src/App.tsx`**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
```

**`frontend/src/pages/Login.tsx`**
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login attempt:', { email, password });
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ATAS Messenger
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your Personal AI Assistant
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

**`frontend/src/pages/Chat.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('message', (msg: string) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit('message', message);
      setMessages(prev => [...prev, `You: ${message}`]);
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">ATAS Messenger</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-gray-800">{msg}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-white border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
```

### 4. Run the Application (5 minutes)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit `http://localhost:3000` to see the application running!

### 5. Next Steps (Priority Order)

1. **Database Integration** - Set up MongoDB and create user/message models
2. **Authentication** - Implement JWT-based login/register
3. **Real-time Messaging** - Complete Socket.io implementation
4. **AI Integration** - Add OpenAI API for AI chat features
5. **UI Polish** - Enhance design and add more features

### 6. Development Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Frontend
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
```

This quick start guide gets you a basic working version of ATAS Messenger in under 3 hours. From here, you can follow the detailed blueprint to add more advanced features systematically.