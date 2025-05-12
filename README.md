# Ajali! Frontend

The frontend application for Ajali! - an emergency incident reporting system for Kenya.

# render backend deployed link -  https://ajali-alert-now-wu16.onrender.com

# render frontend deployed link - https://ajali-alert-frontend.onrender.com

## Features

- User authentication (signup, login, JWT tokens)
- Role-based access (users vs. admins)
- Incident reporting with location and media upload
- Interactive map integration with Google Maps
- Real-time incident status updates
- Admin dashboard for incident management
- Responsive design with Tailwind CSS

## Prerequisites

- npm or yarn package manager
- Google Maps API key
- Backend API running (Flask)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add the following:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── incident/       # Incident-related components
│   ├── layout/         # Layout components
│   ├── map/           # Map-related components
│   └── ui/            # UI components
├── pages/              # Page components
│   ├── admin/         # Admin pages
│   ├── auth/          # Authentication pages
│   └── incidents/     # Incident pages
├── store/              # Redux store setup
│   └── slices/        # Redux slices
├── App.jsx            # Main application component
└── main.jsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests through axios interceptors.

## Maps Integration

Google Maps integration is used for:
- Selecting incident locations
- Displaying incident markers on maps
- Viewing incident locations in detail

## State Management

Redux Toolkit is used for state management with the following slices:
- `auth` - Authentication state
- `incidents` - Incident management
- `admin` - Admin-specific functionality

## API Integration

Axios is used for API requests with the following features:
- Automatic JWT token inclusion
- Base URL configuration
- Error handling
- Request/response interceptors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
