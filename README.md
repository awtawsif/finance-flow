# FinanceFlow

FinanceFlow is a modern, feature-rich personal finance management application built with Next.js and Firebase. It provides comprehensive financial tracking, budgeting, and insights with a beautiful, intuitive interface that works both online and offline.

## 🌟 Key Features

### 🔄 Dual Mode Operation
- **Guest Mode**: Start immediately without registration. All data is stored locally in your browser using localStorage.
- **Cloud Sync Mode**: Sign in with Google to securely sync your data across all devices via Firebase Firestore.

### 💰 Financial Tracking
- **Expense Management**: Add, edit, and delete expenses with detailed descriptions, amounts, dates, and categories
- **Earning Tracking**: Record income sources with the same level of detail as expenses
- **Recent Activity**: View chronological lists of your latest transactions with color-coded indicators
- **Search Functionality**: Quickly find specific transactions using the powerful search feature

### 🏷️ Smart Categorization
- **Custom Categories**: Create personalized expense categories tailored to your lifestyle
- **Rich Icon Library**: Choose from 70+ beautiful icons from Lucide React to visually represent each category
- **Category Management**: Edit or delete categories anytime with full data integrity preservation
- **Color Coding**: Assign custom colors to categories for instant visual recognition

### 📊 Budget Management
- **Monthly Budgets**: Set budget goals for each expense category
- **Real-time Progress Tracking**: Visual progress bars show spending against budget limits
- **Smart Sorting**: Automatically displays categories by highest spending percentage for quick insights
- **Budget Alerts**: Visual indicators when approaching or exceeding budget limits

### 📈 Dashboard & Analytics
- **Financial Overview**: Complete summary of total earnings, expenses, and remaining balance
- **Interactive Charts**: 
  - Pie chart for category-wise spending breakdown
  - Bar chart for top expenses within specific categories
  - Color-coded visualization for better understanding
- **Date Filtering**: Analyze finances by custom date ranges with intuitive date picker controls

### 🎨 User Experience
- **Modern UI**: Clean, responsive design using shadcn/ui components
- **Dark Mode Support**: Toggle between light and dark themes (if implemented)
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Smooth Animations**: Subtle transitions and micro-interactions for delightful UX

### 💾 Data Management
- **Export Functionality**: Download all financial data as JSON for backup or migration
- **Import Capability**: Restore data from previously exported JSON files
- **Data Validation**: Ensures data integrity during import/export operations
- **Clear Data Option**: Start fresh with the ability to permanently delete all data

## 🛠️ Technical Stack

### Frontend Framework
- **Next.js 15.5.9** with App Router for optimal performance and SEO
- **React 18.3.1** with modern hooks and patterns
- **TypeScript** with strict mode for type safety and better development experience

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for high-quality, accessible UI components
- **Lucide React** for beautiful, consistent iconography
- **Class Variance Authority (CVA)** for component variants
- **Tailwind CSS Animate** for smooth animations

### Backend & Database
- **Firebase Firestore** for real-time cloud database
- **Firebase Authentication** with Google OAuth integration
- **Non-blocking updates** for optimal user experience during data operations

### Form Handling & Validation
- **React Hook Form** for efficient form management
- **Zod** for runtime type validation and schema definitions
- **Resolver integration** for seamless form validation

### Data Visualization
- **Recharts** for interactive financial charts and graphs
- **Custom chart components** with consistent theming

### Development Tools
- **ESLint** for code quality and consistency
- **TypeScript Compiler** for type checking
- **Turbopack** for fast development builds

## 🎨 Design System

### Color Palette
- **Primary**: Vibrant Blue (`hsl(221.2 83.2% 53.3%)`) for primary actions and branding
- **Background**: Light Gray (`hsl(0 0% 98%)`) for clean, modern interface
- **Card/Popover**: Pure white (`hsl(0 0% 100%)`) for content areas
- **Muted**: Light gray (`hsl(210 40% 96.1%)`) for secondary elements
- **Success**: Green (`hsl(142.1 76.2% 36.3%)`) for positive feedback
- **Destructive**: Red (`hsl(0 84.2% 60.2%)`) for delete actions and errors

### Typography
- **Font Family**: PT Sans (humanist sans-serif) for readability
- **Font Weights**: Regular (400), Medium (500), Bold (700)
- **Responsive Sizing**: Scalable text that adapts to screen sizes

### Layout Patterns
- **Grid-based layouts** for organized content presentation
- **Card-based design** for clear content separation
- **Responsive breakpoints** for mobile-first design
- **Consistent spacing** using Tailwind's spacing system

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.x or later
- **npm**: Latest stable version
- **Google Firebase Account** (for cloud features)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/awtawsif/finance-flow.git
   cd finance-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Google provider
   - Set up Firestore Database
   - Create a `.env.local` file with your Firebase configuration:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002` to view the application.

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server on port 9002 with Turbopack
npm run build        # Build production version
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint for code quality checks
npm run typecheck    # Run TypeScript compiler for type checking
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home/dashboard page
│   └── login/             # Login page
├── components/             # Reusable React components
│   ├── ui/               # shadcn/ui base components
│   ├── add-category.tsx   # Category creation form
│   ├── add-expense.tsx    # Expense entry form
│   ├── add-earning.tsx    # Earning entry form
│   ├── budget-overview.tsx # Budget management interface
│   ├── dashboard.tsx      # Main dashboard component
│   ├── icon-picker.tsx    # Custom icon selector
│   └── ...               # Other feature components
├── context/               # React Context providers
│   └── data-context.tsx   # Global state management
├── firebase/              # Firebase configuration and utilities
│   ├── config.ts         # Firebase initialization
│   ├── provider.tsx      # Firebase context provider
│   └── ...              # Firebase utilities
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and constants
│   ├── definitions.ts    # TypeScript type definitions
│   ├── icons.ts          # Icon mappings and utilities
│   └── utils.ts          # General utility functions
└── styles/               # Additional style files
```

## 🔧 Configuration

### Firebase Setup
1. Authentication → Sign-in method → Enable Google
2. Firestore Database → Create database in test mode
3. Configure Firestore security rules for production use

### Environment Variables
Create a `.env.local` file in the root directory:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🌐 Browser Support

FinanceFlow supports all modern browsers:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## 📱 Mobile Compatibility

The application is fully responsive and optimized for:
- iOS Safari 12+
- Chrome Mobile (Android)
- Samsung Internet
- Firefox Mobile

## 🔒 Security Features

- **Google OAuth Integration**: Secure authentication through Firebase
- **Data Encryption**: All data transmission is encrypted via HTTPS
- **Input Validation**: Comprehensive validation using Zod schemas
- **Firestore Security Rules**: Configurable database access controls
- **XSS Protection**: Built-in protections from React and Next.js

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and patterns
- Use TypeScript for all new code
- Write meaningful commit messages
- Ensure all tests pass before submitting
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Firebase** - For providing backend infrastructure
- **shadcn/ui** - For beautiful, accessible UI components
- **Lucide** - For the comprehensive icon library
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub Issues](https://github.com/awtawsif/finance-flow/issues)
- Check the [FAQ](docs/faq.md) for common questions
- Review the [documentation](docs/) for detailed guides

---

**Built with ❤️ for better financial management**