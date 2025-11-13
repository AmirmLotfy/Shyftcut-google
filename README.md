
# Shyftcut: AI Learning Roadmap Generator

**Your personalized AI mentor for the future of work.**

![Shyftcut Landing Page Hero](https://storage.googleapis.com/shyftcutnew.appspot.com/readme-assets/shyftcut-hero.png)

Shyftcut is a feature-rich, AI-powered learning roadmap generator designed for students, professionals, and career-shifters. It provides personalized, step-by-step learning paths based on user goals, experience, and preferences, with a special focus on the Egyptian and GCC markets.

---

## ✨ Key Features

-   **🤖 AI-Powered Personalization**: Generates unique learning paths using the Google Gemini API, tailored to your specific career goals, experience level, weekly commitment, learning style, and resource budget.
-   **🌐 Up-to-Date & Relevant Resources**: Leverages Google Search grounding via the Gemini API to find the latest and most relevant courses, articles, projects, and books from across the web, ensuring your learning material isn't outdated.
-   **🗺️ Structured Milestones**: Breaks down your learning journey into manageable, multi-week milestones with clear tasks, success criteria, and time estimates.
-   **🧠 Interactive Quizzes & AI Grading**: Tests your knowledge at the end of each milestone with a mix of multiple-choice and short-answer questions. Features intelligent, AI-powered grading for open-ended answers to provide nuanced feedback.
-   **📊 Dynamic Progress Tracking**: Visualize your progress on an interactive dashboard. Track completed tasks and courses, and see your overall completion percentage update in real-time.
-   **🍅 Focus Mode Timer**: Stay productive with a built-in focus timer to manage your study sessions effectively for any task on your roadmap.
-   **🔐 Secure & Flexible Authentication**: Easy and secure sign-up/sign-in with Email & Password, Google, or passwordless email links.
-   **💰 Free Trial & Subscription Tiers**: A free "Starter" plan and a "Pro" plan with a generous 1-month free trial to access all premium features without requiring a credit card.
-   **🔗 Public Roadmap Sharing**: Make your learning journey public and share it with a unique link, perfect for portfolios or social media.
-   **✍️ Integrated Blog**: Explore articles on learning science, career advice, and the future of work directly within the app.
-   **🎮 Gamified Experience**: A fun Tic-Tac-Toe game on the landing page where beating the AI rewards you with a discount code for the Pro plan.
-   **📱 Fully Responsive Design**: A seamless experience across all devices, from mobile phones to desktops.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
-   **Backend & Database**: Firebase (Authentication, Firestore, Storage, Cloud Functions)
-   **AI Model**: Google Gemini API (`@google/genai`)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.0 or later)
-   [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/shyftcut.git
    cd shyftcut
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Install Firebase Functions dependencies:**
    ```bash
    cd functions
    npm install
    cd ..
    ```

4.  **Set up Firebase Project:**
    -   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    -   Enable the following services:
        -   **Authentication**: Enable Email/Password, Google, and Email Link (passwordless) sign-in methods.
        -   **Firestore Database**: Create a new database in production mode. The security rules are already defined in `firestore.rules`.
        -   **Storage**: Create a new storage bucket. The rules are in `storage.rules`.
        -   **Functions**.
    -   Register a new **Web App** in your Firebase project settings.
    -   Copy the `firebaseConfig` object and replace the placeholder in `src/services/firebase.ts`.

5.  **Set up Google Gemini API Key:**
    -   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Set this key as a secret for your Firebase Functions. This is more secure than hardcoding it. Run this command in your project root:
    ```bash
    firebase functions:secrets:set GEMINI_API_KEY
    ```
    -   When prompted, enter your API key. This will make it securely available to your Cloud Functions as `process.env.GEMINI_API_KEY`.

### Running the Project Locally

Using the Firebase Emulators is highly recommended for local development.

1.  **Start the Firebase emulators:**
    This command will start local emulators for Authentication, Firestore, Functions, and Storage.
    ```bash
    firebase emulators:start
    ```

2.  **Start the React development server:**
    In a **new terminal window**, start the React app.
    ```bash
    npm start
    ```

3.  **Access the application:**
    -   The frontend will be available at `http://localhost:3000` (or the port specified by your dev server).
    -   The Firebase Emulator UI will be available at `http://localhost:4000`.

---

## 🧪 Testing

This project is set up with a testing framework for both the frontend application and the backend functions.

### Frontend Tests (React)

We use **Jest** and **React Testing Library** for unit and component testing.

-   **Running Tests**: To run the frontend tests, execute the following command from the root directory:
    ```bash
    npm test
    ```
-   **Test Location**: Test files should be co-located with the components they are testing (e.g., `Button.tsx` and `Button.test.tsx`).

### Firebase Functions Tests

We use **Jest** and `firebase-functions-test` to test the backend logic against the emulators.

1.  **Setup (Offline Testing)**:
    -   Ensure the Firebase Emulators are running (`firebase emulators:start`).
    -   The test scripts are pre-configured to connect to the local emulators.

2.  **Running Tests**: To run the functions tests, navigate to the `functions` directory and run the test command:
    ```bash
    cd functions
    npm test
    ```

---

## 🚀 Deployment

1.  **Build the React application:**
    From the root directory, run the build command. This will create a `dist` folder (or similar, depending on the build tool).
    ```bash
    npm run build
    ```
2.  **Deploy to Firebase:**
    This single command will deploy your hosting files, cloud functions, and Firestore rules/indexes.
    ```bash
    firebase deploy
    ```

---

## 📁 Project Structure

```
.
├── functions/              # Firebase Cloud Functions
│   ├── src/index.ts        # Main functions file (AI logic, triggers, API endpoints)
│   ├── package.json
│   └── tsconfig.json
├── src/                    # React application source
│   ├── components/         # Reusable UI components (Button, Card, etc.)
│   ├── constants/          # App-wide constants (career tracks, blog posts)
│   ├── contexts/           # React context providers (e.g., AuthContext)
│   ├── hooks/              # Custom React hooks (useAuth, useWizardState)
│   ├── layouts/            # Page layout components (DashboardLayout)
│   ├── pages/              # Top-level page components
│   ├── services/           # Service integrations (Firebase, Gemini)
│   ├── types.ts            # TypeScript type definitions
│   └── App.tsx             # Main app component with routing
├── firebase.json           # Firebase project configuration
├── firestore.indexes.json  # Firestore index definitions
├── README.md               # This file
└── index.html              # Main HTML entry point
```

---

## 📄 License

This project is licensed under the MIT License.
