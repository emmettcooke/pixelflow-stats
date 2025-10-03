# Metrics Dashboard

A modern, responsive dashboard for tracking business metrics over time. Built with React, TypeScript, and Tailwind CSS.

## Features

- 📊 **Interactive Metric Cards**: Display current values, trends, and percentage changes
- 📈 **Trend Visualization**: Beautiful line charts showing metric progression over time
- ➕ **Add Custom Metrics**: Create and track your own business metrics
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 💾 **Local Storage**: Data persists between sessions
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Adding Metrics

1. Click the "Add Metrics" button in the header
2. Fill in the metric details:
   - **Title**: Name of your metric (e.g., "Revenue", "Active Users")
   - **Current Value**: The current value of the metric
   - **Unit**: Optional unit (Dollar, Percentage, Users, etc.)
   - **Change %**: Optional percentage change from previous period
   - **Timeframe**: Time period for the change calculation

### Viewing Trends

Each metric card displays:
- Current value with appropriate formatting
- Percentage change (if provided) with color coding
- Interactive trend chart showing historical data
- Time period labels on the x-axis

### Managing Metrics

- Use the three-dot menu on each metric card for additional options
- Data is automatically saved to local storage
- Dark mode preference is also saved

## Built With

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Beautiful, composable charts for React
- **Lucide React**: Beautiful & consistent icon toolkit

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Dashboard header
│   ├── MetricCard.tsx  # Individual metric display
│   └── AddMetricModal.tsx # Add new metric modal
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts # Local storage hook
├── types.ts            # TypeScript type definitions
├── utils/              # Utility functions
│   └── generateSampleData.ts # Sample data generator
└── App.tsx             # Main application component
```

## Customization

### Adding New Metric Types

To add support for new metric types or units, modify the `AddMetricModal.tsx` component and update the unit options in the select dropdown.

### Styling

The dashboard uses Tailwind CSS for styling. You can customize the appearance by:
- Modifying `tailwind.config.js` for theme customization
- Updating component classes in the React components
- Adding custom CSS in `src/index.css`

### Data Persistence

Currently, data is stored in browser local storage. To implement server-side persistence:
1. Create API endpoints for CRUD operations
2. Replace `useLocalStorage` hook with API calls
3. Add loading states and error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

