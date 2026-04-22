# Marine Monitoring System

Ship monitoring and berth management system located at Kopli 103, Tallinn.

## Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Leaflet.js + OpenStreetMap
- Axios, Lucide React

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- WebSocket (ws)
- AISStream API integration

## Project Structure

```
MarineMonitoring/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   └── ...
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── websocket/      # AIS WebSocket
│   │   └── types/          # TypeScript types
│   └── ...
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- AISStream API key (optional)

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

#### Server (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/marine_monitoring
PORT=3001
NODE_ENV=development
AIS_STREAM_API_KEY=your_api_key_here
AIS_STREAM_WS_URL=wss://stream.aisstream.io/v0/stream
CLIENT_URL=http://localhost:5173
```

#### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
```

### 3. Running the Application

```bash
# Start server (in server folder)
npm run dev

# Start client (in client folder)
npm run dev
```

The application will be available at http://localhost:5173

## Features

### Map
- Centered on Kopli 103 coordinates (59.462, 24.650)
- 21 berths displayed as markers
- Each berth has a status: FREE (green), REPAIR (yellow), AWAITING (red)
- Click on a berth opens a popup to change its status

### Ships
- Real-time ship positions via AISStream WebSocket
- Displayed on the map with direction indicator
- Sidebar with list of active ships

### Sidebar
- Overview of berth statuses (FREE/REPAIR/AWAITING)
- List of berths with status filtering
- List of active ships with speed and course information
- WebSocket connection indicator

## API Endpoints

### Berths
- `GET /api/berths` - List all berths
- `GET /api/berths/:id` - Get berth information
- `PATCH /api/berths/:id` - Update berth status
- `GET /api/berths/stats/overview` - Berth statistics

### Ships
- `GET /api/ships` - List active ships
- `GET /api/ships/stats` - Ship statistics

### WebSocket
- `ws://localhost:3001/ws` - Ship position update stream

## License

MIT
