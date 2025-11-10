# Shyftcut: AI Learning Roadmap Generator

**Your personalized AI mentor for the future of work.**

Shyftcut is an AI-powered learning roadmap generator designed for students, professionals, and career-shifters. It provides personalized, step-by-step learning paths based on user goals, experience, and preferences, with a special focus on the Egyptian and GCC markets.

---

## ✨ Key Features

-   **🤖 AI-Powered Personalization**: Generates unique learning paths using Google's Gemini Pro, tailored to your specific career goals, experience level, and learning style.
-   **🌐 Up-to-Date & Relevant Resources**: Leverages Google Search to find the latest and most relevant courses, articles, projects, and books from across the web.
-   **🗺️ Structured Milestones**: Breaks down your learning journey into manageable, weekly milestones with clear tasks, success criteria, and time estimates.
-   **🧠 Interactive Quizzes**: Tests your knowledge at the end of each milestone with a mix of multiple-choice and short-answer questions, featuring AI-powered grading for open-ended answers.
-   **📊 Progress Tracking**: Visualize your progress through an intuitive dashboard, track completed tasks, and see your skills grow.
-   **🍅 Pomodoro Study Timer**: Stay focused and productive with a built-in Pomodoro timer to manage your study sessions effectively.
-   **🔐 Secure Authentication**: Easy and secure sign-up/sign-in with Email & Password or Google.
-   **💰 Subscription Tiers**: A free "Starter" plan and a "Pro" plan with a generous 1-month free trial to access premium features.
-   **📱 Fully Responsive**: A seamless experience across all devices, from mobile phones to desktops.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
-   **Backend & Database**: Firebase (Authentication, Firestore, Storage, Cloud Functions)
-   **AI Model**: Google Gemini API

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.0 or later)
-   [Firebase CLI](https://firebase.google.com/docs/cli)

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

4.  **Set up Firebase:**
    -   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    -   Enable the following services:
        -   **Authentication**: Enable Email/Password and Google sign-in methods.
        -   **Firestore Database**: Create a new database.
        -   **Storage**.
    -   Register a new **Web App** in your Firebase project settings.
    -   Copy the `firebaseConfig` object and replace the placeholder in `src/services/firebase.ts`.

5.  **Set up Google Gemini API Key:**
    -   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Set this key as a secret for your Firebase Functions. Run this command in your project root:
    ```bash
    firebase functions:secrets:set GEMINI_API_KEY
    ```
    -   When prompted, enter your API key. This will make it securely available to your `generateRoadmap` function.

6.  **Run the project locally:**
    -   Start the Firebase emulators (recommended for local development):
    ```bash
    firebase emulators:start
    ```
    -   In a new terminal, start the React development server:
    ```bash
    # Assuming a standard React scripts setup
    npm start
    ```
    -   Open your browser and navigate to `http://localhost:3000` (or the port specified by your dev server).

---

## 📁 Project Structure

The project is organized into two main parts: the frontend React application (`src`) and the backend Cloud Functions (`functions`).

```
.
├── functions/              # Firebase Cloud Functions
│   ├── src/index.ts        # Main functions file (AI logic, triggers)
│   └── package.json
├── src/                    # React application source
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers (e.g., AuthContext)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layout components (e.g., DashboardLayout)
│   ├── pages/              # Top-level page components
│   ├── services/           # Service integrations (Firebase, Gemini)
│   ├── types.ts            # TypeScript type definitions
│   └── App.tsx             # Main app component with routing
└── index.html              # Main HTML file
```

---

## 📄 License

This project is licensed under the MIT License.
