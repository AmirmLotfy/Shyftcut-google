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
-   **Backend**: Node.js, Express.js (for secure API proxy)
-   **Database & Auth**: Firebase (Authentication, Firestore, Storage)
-   **AI Model**: Google Gemini API (`@google/genai`)
-   **Deployment**: Docker, Google Cloud Run

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

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Install backend server dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Set up Firebase Project:**
    -   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    -   Enable **Authentication** (Email/Password, Google, Email Link), **Firestore Database**, and **Storage**.
    -   Register a new **Web App** and copy the `firebaseConfig` object into `src/services/firebase.ts`.
    -   Generate a **service account private key** for the backend server:
        -   In Firebase, go to Project Settings > Service accounts.
        -   Click "Generate new private key".
        -   Save the downloaded JSON file as `server/serviceAccountKey.json`.
        -   **Important**: This file is sensitive. It's included in `.gitignore` and should never be committed to source control.

5.  **Set up Google Gemini API Key:**
    -   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Create a file named `.env` in the `server/` directory.
    -   Add your API key to the `.env` file:
        ```
        GEMINI_API_KEY=your_gemini_api_key_here
        ```

### Running the Project Locally

This project uses `concurrently` to run both the React development server and the backend API server at the same time.

1.  **Start the local development environment:**
    From the project's root directory, run:
    ```bash
    npm run dev
    ```
    This will:
    -   Start the React development server (usually on `http://localhost:3000`).
    -   Start the Node.js backend server (on `http://localhost:8080`). The React app is configured to proxy API requests to this server.

2.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

---

## 🚀 Deployment to Cloud Run

The included `Dockerfile` is configured to build and serve the entire application (React frontend and Node.js backend) as a single container.

1.  **Enable Google Cloud Services:**
    Make sure you have the following APIs enabled in your Google Cloud project:
    -   Cloud Run API
    -   Artifact Registry API
    -   Cloud Build API

2.  **Deploy using gcloud CLI:**
    From the root directory of the project, run the following command. This command will build the container image using Cloud Build, push it to Artifact Registry, and deploy it to Cloud Run.

    ```bash
    gcloud run deploy shyftcut-app --source . --region YOUR_REGION --allow-unauthenticated
    ```
    -   Replace `shyftcut-app` with your desired service name.
    -   Replace `YOUR_REGION` with your preferred Google Cloud region (e.g., `us-central1`).

3.  **Set Environment Variables on Cloud Run:**
    After the first deployment, you must set the required environment variables for your service to function correctly.
    -   Navigate to your service in the Cloud Run section of the Google Cloud Console.
    -   Click "Edit & Deploy New Revision".
    -   Go to the "Variables & Secrets" tab.
    -   Add the following environment variables:
        -   `GEMINI_API_KEY`: Your Gemini API key. For best practice, use Google Secret Manager to store this.
        -   `GOOGLE_APPLICATION_CREDENTIALS`: Set this to `/app/server/serviceAccountKey.json`. This tells the Firebase Admin SDK where to find the credentials inside the container.
        -   `NODE_ENV`: `production`.

4.  **Redeploy the revision with the new environment variables.** Your application is now live!

---

## 📁 Project Structure

```
.
├── server/                 # Node.js Express backend server
│   ├── src/index.ts        # Main server file (API routes, auth middleware)
│   ├── package.json
│   ├── serviceAccountKey.json # (Git-ignored) Firebase Admin credentials
│   └── .env                # (Git-ignored) Gemini API key for local dev
├── src/                    # React application source
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks (useAuth, useGenerateRoadmap)
│   ├── pages/              # Top-level page components
│   └── ...
├── Dockerfile              # Docker configuration for Cloud Run
├── firebase.json           # Firebase project configuration (for Firestore rules)
└── README.md               # This file
```
