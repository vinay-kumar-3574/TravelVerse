# TravelVerse API Setup Guide

## Environment Configuration

Create a `.env` file in the frontend root directory (`TravelVerse-main/`) with the following variables:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Service Configuration
VITE_USE_MOCK_DATA=true    # Enable mock data for prototype
VITE_USE_REAL_API=true     # Enable real API calls to backend
```

## How It Works

### 1. **Hybrid Service Architecture**
- **Mock Data**: Shows prototype functionality with fake data
- **Real API**: Connects to backend for actual data persistence
- **Automatic Fallback**: If backend fails, falls back to mock data

### 2. **Data Flow**
```
Frontend → Hybrid Service → Real API → Backend → Database
                ↓
            Mock Data (if API fails or for demo)
```

### 3. **Service Priority**
1. **Real API First**: Tries to connect to backend
2. **Mock Fallback**: If backend fails, uses mock data
3. **Prototype Mode**: Always shows mock data for demo purposes

## Starting the Application

### Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### Frontend (Port 5173)
```bash
npm install
npm run dev
```

## API Endpoints Available

- **Authentication**: `/api/auth/login`, `/api/auth/signup`
- **Trips**: `/api/trips` (GET, POST, PUT, DELETE)
- **Transport**: `/api/transport/search`, `/api/transport/book`
- **Hotels**: `/api/hotels/search`, `/api/hotels/book`
- **Dashboard**: `/api/dashboard/stats`
- **Users**: `/api/users/profile`

## Benefits

✅ **Prototype Ready**: Always shows mock data for demonstrations
✅ **Real Functionality**: Can connect to backend when available
✅ **Seamless Fallback**: Automatically switches between mock and real
✅ **Development Friendly**: Easy to test both scenarios

## Testing

1. **With Backend**: Set `VITE_USE_REAL_API=true` and start backend
2. **Mock Only**: Set `VITE_USE_REAL_API=false` for pure prototype
3. **Hybrid**: Set both to `true` for best of both worlds
