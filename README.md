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
-   **Backend Services**: Firebase (Authentication, Firestore, Storage, Functions for triggers)
-   **AI Model**: Google Gemini API (`@google/genai`)
-   **Deployment**: Can be deployed to any static hosting provider (e.g., Firebase Hosting, Vercel, Netlify).

---

## 🚀 Getting Started

Follow these instructions to get the project running locally for development.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.0 or later)
-   [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
-   An active Google Cloud project with the Gemini API enabled.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/shyftcut.git
    cd shyftcut
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase Project:**
    -   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    -   Enable **Authentication** (Email/Password, Google, Email Link), **Firestore Database**, and **Storage**.
    -   Register a new **Web App** and copy the `firebaseConfig` object into `src/services/firebase.ts`.

4.  **Set up Google Gemini API Key:**
    -   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Create a file named `.env` in the project's root directory.
    -   Add your API key to the `.env` file:
        ```
        API_KEY=your_gemini_api_key_here
        ```

### Running the Project Locally

1.  **Start the local development environment:**
    From the project's root directory, run:
    ```bash
    npm run dev
    ```
    This will start the React development server (usually on `http://localhost:3000`).

2.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

---

## 📁 Project Structure

```
.
├── src/                    # React application source
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks (useAuth, useGenerateRoadmap)
│   ├── pages/              # Top-level page components
│   └── ...
├── functions/              # Firebase Functions for triggers and scheduled jobs
├── .env.example            # Example environment file
├── firebase.json           # Firebase project configuration (for Firestore rules)
└── README.md               # This file
```
