# Field Force Tracking System

A comprehensive field force tracking and management system built with React.js, designed to help sales managers monitor and optimize their field sales teams.

## Features

### 1. User & Role Management
- **User Roles**: Salesperson, Sales Manager, Admin
- **Authentication**: Email/Phone + Password, OTP login
- **Permissions & Access Control**: Role-based access to features

### 2. Real-Time Location Tracking
- Live GPS tracking of field personnel
- Timestamped location history
- Interactive map view using Leaflet
- Route tracking and visualization
- Geo-fencing support (planned vs actual routes)

### 3. Attendance & Work Activity
- Check-in / Check-out functionality
- Auto and manual attendance modes
- Daily attendance reports
- Location-based attendance verification
- Work mode tracking (Office/Field/Remote)

### 4. Visit & Route Management
- Customer visit logging with timestamps
- Location and duration tracking
- Route planning and optimization
- Planned vs actual route comparison

### 5. Task & Lead Management
- Daily task assignment and tracking
- Task status management (New/In Progress/Completed)
- Lead pipeline tracking
- Follow-up reminders
- Priority-based task organization

### 6. Order & Sales Management
- Order creation from field
- Product catalog with pricing
- Sales tracking and reporting
- Lead conversion tracking

### 7. Reporting & Analytics
- Sales performance dashboards
- Distance traveled metrics
- Time spent per customer analysis
- Conversion rate tracking
- Target vs achievement monitoring
- ROI and efficiency metrics

### 8. Manager Dashboard
- Live team location view
- Team performance comparison
- Activity monitoring
- Real-time alerts and notifications

### 9. Expense Tracking
- Daily expense entry
- Receipt upload capability
- Approval workflow
- Expense vs sales analysis
- Category-wise breakdown

### 10. Territory Management
- Custom territory definition
- Map-based territory visualization
- Territory assignment to salespeople
- Coverage analysis

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Maps**: Leaflet + React Leaflet
- **Date Handling**: date-fns
- **Charts**: Recharts (for future analytics)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Common UI components (Card, Badge, etc.)
│   └── layout/         # Layout components (Sidebar, Header, etc.)
├── modules/            # Feature modules
│   ├── auth/           # Authentication
│   ├── dashboard/      # Main dashboard & team dashboard
│   ├── attendance/     # Attendance management
│   ├── tasks/          # Task management
│   ├── visits/         # Visit tracking
│   ├── sales/          # Sales & orders
│   ├── reports/        # Analytics & reporting
│   ├── expenses/       # Expense management
│   └── territory/      # Territory management
├── store/              # Zustand stores
│   ├── authStore.js
│   ├── attendanceStore.js
│   ├── tasksStore.js
│   ├── locationStore.js
│   └── uiStore.js
├── services/           # API services & mock data
│   ├── api.js          # API service layer
│   └── mockData.js     # Mock data
├── utils/              # Utility functions
│   └── helpers.js      # Helper functions
└── hooks/              # Custom React hooks
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Demo Login Credentials

The application comes with pre-configured demo accounts:

**Salesperson**
- Email: albert.ramirez@company.com
- Password: demo123 (any password works)

**Sales Manager**
- Email: rahul.kumar@company.com
- Password: demo123 (any password works)

**Admin**
- Email: admin@company.com
- Password: demo123 (any password works)

**OTP Login**
- Any phone number
- OTP: 123456

## Key Features Implementation

### Mock Data & API Services

All API calls return mock data for now. The API service layer in `src/services/api.js` is structured to easily replace mock data with real API calls. Each function:

1. Simulates network delay
2. Returns data in a consistent format: `{ success: boolean, data: any, error?: string }`
3. Can be replaced with actual fetch/axios calls without changing component code

### State Management

The application uses Zustand for state management with separate stores for:
- Authentication (with persistence)
- Attendance
- Tasks
- Location tracking
- UI state

### Routing & Access Control

- Public routes: Login
- Protected routes: All dashboard and feature pages
- Role-based sidebar navigation
- Route guards for authenticated access

### Modular Architecture

Each feature is organized as a module with its own components, making the codebase:
- Easy to maintain
- Scalable
- Easy to test
- Clear separation of concerns

## Customization

### Replacing Mock Data with Real API

1. Update the functions in `src/services/api.js`
2. Replace the mock data import with actual API calls
3. Adjust the response structure if needed
4. Update error handling

Example:
```javascript
// Before (Mock)
export const tasksApi = {
  getByUserId: async (userId) => {
    await delay();
    const userTasks = mockData.tasks.filter(t => t.userId === userId);
    return { success: true, data: userTasks };
  },
};

// After (Real API)
export const tasksApi = {
  getByUserId: async (userId) => {
    try {
      const response = await fetch(`/api/tasks/user/${userId}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
```

### Theming

Colors and styles can be customized in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },
      success: { ... },
      // Add your custom colors
    },
  },
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Real-time notifications using WebSocket
- [ ] Offline mode with data sync
- [ ] Mobile app version (React Native)
- [ ] Advanced analytics with Recharts
- [ ] Excel/PDF export functionality
- [ ] Voice-based task updates
- [ ] AI-powered route optimization
- [ ] Integration with popular CRM systems
- [ ] Multi-language support
- [ ] Dark mode

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is proprietary and confidential.

## Support

For support, contact your system administrator or open an issue in the project repository.
