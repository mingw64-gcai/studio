# Drishti AI - Crowd Monitoring and Analysis Platform

Drishti AI is an advanced, AI-powered web application designed for real-time crowd monitoring, analysis, and management. It leverages computer vision and generative AI to provide actionable insights from live video feeds, helping to enhance public safety and operational efficiency at large-scale events and venues.

![Drishti AI Dashboard](https://res.cloudinary.com/dtwt3cwfo/image/upload/v1753542455/crowd_analysis/job_20250726_164055_e62f7ced/Screenshot_2025-07-26_203612_ktbnza.png)

## ✨ Key Features

- **Real-time Dashboard**: A central hub displaying key metrics like crowd density, threat levels, active alerts, and system status.
- **Live Video Analysis**: 
    - Ingests live video from a user's camera.
    - Uses an AI model to perform real-time face counting to determine crowd density.
    - Automatically adjusts the threat level (Low, Moderate, High) based on density.
- **Lost and Found**:
    - An AI-powered search tool to find a person in a crowd by uploading their photo.
    - Utilizes an external image recognition API to identify individuals.
    - A "Recently Found" panel that updates in real-time when a person is successfully located.
- **AI-Generated Crowd Analytics**:
    - **Chart Analysis**: After processing an uploaded video, the system generates and displays a crowd distribution chart and provides a detailed text-based analysis of crowd hotspots.
    - **Path Prediction**: Generates a visual prediction of crowd movement paths and offers an AI-powered interpretation of the flow and potential congestion points.
    - **Historical Analytics**: Displays charts of historical alert data to identify trends over time.
- **Crowd Problem Solver**: An interactive tool where users can describe a crowding issue (e.g., "long queues at the entrance"), and a Genkit AI flow provides a detailed analysis of root causes and a structured, actionable solution.
- **SOS Alerts**: A prominent SOS button that can be used to send an emergency alert to a predefined cloud function endpoint.
- **User Authentication**: A secure login page to protect access to the dashboard and its features.
- **Responsive Design**: A modern, responsive UI built with ShadCN components that works seamlessly on both desktop and mobile devices.

## 🛠️ Technology Stack

This project is built with a modern, robust technology stack focused on performance and developer experience.

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative AI**: [Genkit (by Firebase)](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charting**: [Recharts](https://recharts.org/)
- **Deployment**: Firebase App Hosting (or any Node.js compatible platform)

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

- [Node.js](httpshttps://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project. This is where you'll store your API keys and other secrets. The primary key needed is for the Genkit AI flows.

    ```env
    # .env
    GOOGLE_API_KEY=<Your_Google_AI_API_Key>
    ```

### Running the Development Server

Once the dependencies are installed and the environment variables are set, you can run the application locally:

```bash
npm run dev
```

This will start the Next.js development server, typically on `http://localhost:9002`. Open this URL in your browser to see the application.

## 📁 Project Structure

The project follows a standard Next.js App Router structure:

-   `src/app/`: Contains all the pages and routes of the application.
    -   `layout.tsx`: The root layout for the entire application.
    -   `page.tsx`: The main dashboard page.
    -   `login/page.tsx`: The authentication page.
    -   `api/`: Contains backend API routes proxied by Next.js.
-   `src/components/`: Contains all reusable React components.
    -   `ui/`: Auto-generated ShadCN UI components.
    -   `sidebar.tsx`: The main navigation sidebar.
    -   `video-feed.tsx`: Component for handling the camera feed.
-   `src/ai/`: Contains all Genkit-related code.
    -   `genkit.ts`: Genkit configuration file.
    -   `flows/`: All the defined AI flows for features like problem-solving and image analysis.
-   `src/hooks/`: Custom React hooks for managing state and side effects (e.g., `useAuth`, `useToast`).
-   `public/`: Static assets like images and fonts.
-   `tailwind.config.ts`: Configuration file for Tailwind CSS.
-   `next.config.ts`: Configuration file for Next.js.

