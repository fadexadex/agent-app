# Fusion (formerly MotionAI) 🎬✨

**Fusion** is an AI-powered video generation tool that solves the "blank canvas" problem by allowing users to instantly generate, orchestrate, and edit code-based video scenes (Remotion) through conversational AI and data uploads. 

Built for modern creators, marketers, and developers, Fusion democratizes motion graphics by combining the effortless generation of AI with the deterministic precision of a multi-track timeline.

## ✨ Key Features
*   **Conversational Video Generation:** An intuitive, Replit-style conversational AI interface powered by Claude Sonnet 4.
*   **Code-Based Scenes:** Generates perfectly crisp, infinitely editable React components using Remotion.
*   **Deterministic Editing:** A tactile, multi-track timeline component with snap-to-grid for precise timing adjustments.
*   **Brand Asset Extraction:** Seamless URL-drop extraction for logos, colors, and typography to keep videos on-brand.
*   **Data-Driven Pipelines:** Turn structured data (PDFs/Images) directly into animated scenes.

## 👥 Team Contributions

> **⚠️ NOTE FOR JUDGES:** The following section details the specific technical and non-technical contributions of each team member. 

*   **Daniel Fadehan** — *Software Engineer (Lead Developer)*
    *   **Technical:** Spearheaded the vast majority of the repository's technical execution. Implemented the Vercel AI SDK `ToolLoopAgent` on the Node.js backend, built the core React/Vite frontend (including the multi-track timeline), and authored the Remotion video generation workspace. Developed the URL brand extraction and data-driven pipelines.
    *   **Non-Technical:** Managed the complex monorepo architecture and deployment processes across the client, server, and Remotion workspaces.

*   **Taiwo Ayomide** — *Software Engineer (Product & UI)*
    *   **Technical:** Executed UI modifications and refinements in the frontend to align the application's aesthetic. Ensured accessible, clean interface components,developed the URL brand extraction.
    *   **Non-Technical:** Involved in the crucial planning phase of the project. Contributed to defining the product requirements, structured the initial architecture plans.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
From the root of the project, run:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server` directory (`server/.env`) and add the necessary API keys for the AI providers:
```ini
AI_GATEWAY_API_KEY=your_ai_gateway_api_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Run the Application
You can start the app from the root directory using the scripts defined in `package.json`:

- **Start Everything (Client, Server, & Remotion Studio):**
  ```bash
  npm run dev:all
  ```
- **Start the Client & Server only:**
  ```bash
  npm run dev
  ```
- **Start Only Remotion Studio:**
  ```bash
  npm run dev:remotion
  ```

## 📁 Project Structure
The repository is structured as a monorepo with three main components:
- `client/` - React + Vite frontend using shadcn/ui, Tailwind CSS, and Framer Motion.
- `server/` - Express backend integrating the Vercel AI SDK (ToolLoopAgent).
- `remotion/` - Video rendering workspace with reusable React animation components.