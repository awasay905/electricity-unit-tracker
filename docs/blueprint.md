# **App Name**: VoltVision

## Core Features:

- User Authentication: User authentication and authorization using Firebase Auth, with distinct roles for house owners and members.
- House Management: House management functionality: creation, joining (via code), request management (approve/reject).
- Dashboard: Dashboard displaying current and historical electricity usage data with unit goals.
- Data Input Forms: Input form for entering electricity meter readings, billing dates and monthly goals, subject to date validation, accessible based on user role.
- Data Visualization: Visual representation of usage patterns via graphs, showing monthly cycles and goal progress/safety. A circular fillable bar indicating percentage goal achieved.
- Settings Page: Settings page enabling profile updates (name), house details modification, request management, and historical data edits by the homeowner.
- AI-Driven Safety Gauge: AI-powered tool providing insights into energy consumption safety based on current usage compared to the monthly goal and historical data; presented visually with intuitive charts and colors.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and stability.
- Background color: Very light gray (#F5F5F5) in light mode and dark gray (#333333) in dark mode.
- Accent color: Amber (#FFC107) for highlights and calls to action, contrasting with the primary blue.
- Font pairing: 'Poppins' (sans-serif) for headings and 'PT Sans' (sans-serif) for body text; a contemporary and readable combination.
- Material Design icons to maintain consistency and readability across the application. For example, consider the 'power' icon, or 'bolt'.
- Responsive layout utilizing Tailwind CSS for a seamless experience on both desktop and mobile devices.
- Subtle transitions and animations using React Transition Group for a smooth user experience when toggling between different sections of the application.