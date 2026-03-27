# AI Agent Instructions for Project Operations (AGENTS.md)

Welcome, fellow agent. This document provides the authoritative guidelines, commands, and context required to successfully operate within this repository. Follow these instructions meticulously to ensure code quality, architectural consistency, and alignment with the project's design goals.

## 1. Project Overview & Architecture

This is an AI-powered video generation tool that uses an AI agent to generate Remotion video scenes.
The repository is structured as a monorepo with three main components:
*   **`client/`**: React + Vite frontend using `shadcn/ui`, Tailwind CSS, and Framer Motion.
*   **`server/`**: Express backend integrating the AI SDK (ToolLoopAgent with Claude Sonnet 4).
*   **`remotion/`**: Video rendering workspace with reusable animation components.

## 2. Setup & Development Commands

### General
*   **Install Dependencies**: `npm install` (run once at the root)
*   **Start All Workspaces**: `npm run dev:all` (Client, Server, and Remotion Studio)
*   **Start Client & Server**: `npm run dev`

### Client Commands (`cd client/`)
*   **Start Dev Server**: `npm run dev` (Port 8080)
*   **Build**: `npm run build`
*   **Lint**: `npm run lint`

### Server Commands (`cd server/`)
*   **Start Dev Server**: `npm run dev` (Port 3001)
*   **Start Production**: `npm run start`

### Remotion Commands (`cd remotion/`)
*   **Start Studio**: `npm run dev` (Port 3100)
*   **Bundle**: `npm run build`
*   **Render**: `npm run render`

## 3. Testing Guidelines & Commands

We use **Vitest** for both the client and server.

### Running Tests
*   **Client All Tests**: `cd client && npm run test`
*   **Client Watch Mode**: `cd client && npm run test:watch`
*   **Server All Tests**: `cd server && npm run test`

### Running a Single Test (Crucial for Agents)
To run a specific test file or suite, use the Vitest CLI directly via `npx` or by passing arguments through npm:
*   **Run a specific test file (Client)**: `cd client && npx vitest path/to/your.test.ts`
*   **Run a specific test file (Server)**: `cd server && npx vitest path/to/your.test.ts`
*   **Run a single test by name**: `cd client && npx vitest -t "test name to match"`

## 4. Code Style & Engineering Guidelines

### Types & TypeScript
*   **Strict Mode**: Ensure `strict` mode is maintained. No `any` types unless absolutely necessary (use `unknown` if possible).
*   **Interfaces over Types**: Prefer `interface` for object shapes, use `type` for unions and primitives.
*   **Exporting Types**: Keep types close to where they are used or in dedicated `types.ts` files.

### Imports & Exports
*   **Path Aliases**: Use `@/` which resolves to `src/` for the respective workspace (e.g., `import { Button } from "@/components/ui/button"`).
*   **Group Imports**: Group external dependencies first, internal path-aliased imports second, and relative imports last.
*   **Named Exports**: Prefer named exports over default exports (except where frameworks strictly require default exports, like Remotion compositions or Vite configs).

### Formatting & Naming Conventions
*   **File Names**:
    *   React Components/Remotion Scenes: `PascalCase.tsx`
    *   Utilities, Hooks, Configs: `kebab-case.ts`
*   **Variables/Functions**: `camelCase`.
*   **Constants**: `UPPER_SNAKE_CASE` for global constants.
*   **React Components**: Functional components only.

### Error Handling
*   **Server**: Use standard Express error handling middleware. Throw specific, typed errors. Never swallow errors silently.
*   **Client**: Use Error Boundaries for UI safety. Handle API errors gracefully with Toast notifications or inline alerts.

## 5. Remotion Specific Rules

When writing or modifying Remotion code (`remotion/src/`):
*   **No CSS Animations**: All animations **MUST** use `useCurrentFrame()` and `spring()`. Avoid Tailwind `animate-` classes for video timing.
*   **Spring Configuration**: Use `spring()` for smooth entrances. Remember `spring()` does NOT have a delay parameter—subtract from the current frame instead.
*   **Interpolation**: Always clamp interpolations with `extrapolateRight: 'clamp'` to prevent unexpected values after an animation finishes.
*   **Imports**: Scene components must import shared components using the alias: `import { Component } from "@/components/Component"`.
*   **Scene Files**: Place AI-generated scenes in `remotion/src/scenes/`.

## 6. Design & Aesthetic Context

The visual tone of this application is **Magical, Effortless, and Modern**. Keep these design principles in mind when building UI:
*   **Aesthetic Reference**: Inspired by Vercel, Linear, and Notion.
*   **Typography**: `Plus Jakarta Sans` for headings, `Inter` for body text.
*   **Theming**: Full support for Light and Dark modes. Rely on subtle borders, shimmer effects, and clean layouts instead of heavy blocks of color.
*   **Interactions**: Use fluid animations (Framer Motion) and micro-interactions during loading and generation states to make complex video generation feel magical and simple.
*   **Accessibility**: Adhere to WCAG AA standards. Ensure the interface is accessible by default.

## 7. AI Agent Workflow Requirements

1.  **Think First**: Always plan your approach before writing code.
2.  **Verify**: If creating a scene, use the `triggerPreview` and `renderScene` workflow correctly (videos are not auto-generated).
3.  **Validate**: Always run linting (`npm run lint`) and build checks (`npm run build`) before concluding a significant task.