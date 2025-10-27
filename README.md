# FinanceFlow

FinanceFlow is a simple and intuitive web application designed to help you manage your personal finances with ease. Track your expenses and earnings, set budgets, and gain insights into your spending habits to take control of your financial health.

## Core Features

-   **Dual Data Storage:**
    -   **Guest Mode:** Use the app immediately without an account. All data is stored locally in your browser.
    -   **Cloud Sync:** Sign in with your Google account to securely save your data to Firestore and sync it across all your devices.

-   **Financial Tracking:**
    -   **Expense Entry:** Easily input expenses with descriptions, amounts, and dates.
    -   **Earning Entry:** Track your income sources just as easily as your expenses.
    -   **Recent Transactions:** View chronological lists of your recent expenses and earnings.

-   **Categorization & Budgeting:**
    -   **Custom Categories:** Create, edit, and delete expense categories to fit your lifestyle.
    -   **Icon Picker:** Personalize each category by choosing from a rich library of icons.
    -   **Budget Setting:** Set monthly budget goals for different expense categories.
    -   **Progress Tracking:** Monitor spending against your budget in real-time with progress bars. The view is automatically sorted to show the highest-spending categories first.

-   **Dashboard & Insights:**
    -   **Financial Overview:** See a clear summary of your total earnings, total spending, and remaining cash.
    -   **Spending Charts:** Visualize your spending breakdown with an interactive pie chart for categories and a bar chart for top items within a category.
    -   **Expense Search:** Quickly find specific transactions using the search feature.

-   **Data Management:**
    -   **Export Data:** Download all your financial data (expenses, earnings, categories, and budgets) as a JSON file for backup.
    -   **Import Data:** Restore your data from a previously exported JSON file.
    -   **Clear Data:** Option to permanently delete all your data to start fresh.

## Style Guidelines

The visual design of FinanceFlow is crafted to be clean, modern, and easy on the eyes, ensuring a pleasant user experience.

-   **Primary Color:** Teal (`#008080`) for a sense of calm and security.
-   **Background Color:** Light gray (`#F0F0F0`) for a clean and neutral backdrop.
-   **Accent Color:** Muted Blue (`#4682B4`) to complement the teal and highlight key interactive elements.
-   **Font:** 'PT Sans', a humanist sans-serif for both body and headlines.
-   **Icons:** A wide selection of minimalist icons from the `lucide-react` library.
-   **Layout:** A clean, grid-based layout with clear separation of sections.
-   **Animations:** Subtle transitions and animations to provide visual feedback and make the app feel more dynamic.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18.x or later)
-   npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/awtawsif/finance-flow.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Run the development server
    ```sh
    npm run dev
    ```

Open local url with your browser to see the result.

## Technologies Used

-   [Next.js](https://nextjs.org/) - React Framework
-   [React](https://reactjs.org/) - A JavaScript library for building user interfaces
-   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale
-   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
-   [Firebase](https://firebase.google.com/) - for Authentication and Firestore Database
-   [Genkit](https://firebase.google.com/docs/genkit) - AI framework for summarization
-   [ShadCN UI](https://ui.shadcn.com/) - for UI components
-   [Lucide React](https://lucide.dev/) - for icons
