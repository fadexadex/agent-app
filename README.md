# Agent App

Welcome to the Agent App! This project contains three workspaces: `client`, `server`, and `remotion`. 

## Prerequisites
- Node.js (v18+)
- npm

## Getting Started

1. **Install Dependencies**
   From the root of the project, run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `server` directory (`server/.env`) and add the necessary API keys for the AI providers:
   ```ini
   AI_GATEWAY_API_KEY=your_ai_gateway_api_key
   GROQ_API_KEY=your_groq_api_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
   ```

3. **Run the Application**

   You can start the app from the root directory using the scripts defined in `package.json`:

   - **Start the Client & Server:**
     ```bash
     npm run dev
     ```
   
   - **Start Everything (Client, Server, & Remotion Studio):**
     ```bash
     npm run dev:all
     ```
   
   - **Start Only Remotion Studio:**
     ```bash
     npm run dev:remotion
     ```

## Project Structure
- `client/` - Frontend application
- `server/` - Backend API
- `remotion/` - Remotion studio for video rendering