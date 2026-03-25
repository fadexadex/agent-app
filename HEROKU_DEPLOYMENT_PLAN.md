# Heroku Deployment Plan (Server + Remotion)

To deploy the backend server and Remotion integration to Heroku smoothly without Docker, we will leverage Heroku's native Node.js support and NPM Workspaces.

## Answers to Your Questions

**1. Do I have to set a root dir?**
**No.** Keep the default root directory. Because your root `package.json` defines the `workspaces` (client, server, remotion), Heroku's Node.js buildpack will automatically detect it, run `npm install` at the root, and correctly link all the workspaces. 

**2. Will Heroku auto-handle dependencies after adding the start script?**
**Yes, but with one crucial catch regarding `devDependencies`:**
By default, Heroku strips out all `devDependencies` before starting the app. However, your `server/package.json` relies on `tsx` (which is currently a devDependency) to run the `start` script (`tsx src/index.ts`). If Heroku strips `tsx`, the server will crash on startup. 
To fix this, you must explicitly tell Heroku to keep dev dependencies by running:
`heroku config:set NPM_CONFIG_PRODUCTION=false`
Once you do this, Heroku will flawlessly handle all the dependencies across the server and remotion workspaces.

---

## 1. Codebase Adjustments

### Update Root `package.json`
Heroku looks for the `start` script in the root folder to spin up the application.
- Add a `start` script to the root `package.json` to boot the server workspace:
  ```json
  "scripts": {
    "start": "npm run start -w server",
    // existing scripts...
  }
  ```
- Specify the Node version using the `engines` field so Heroku provisions the correct environment:
  ```json
  "engines": {
    "node": "22.x"
  }
  ```

### Update Server `package.json` (Optional Alternative)
If you'd rather not set `NPM_CONFIG_PRODUCTION=false`, you can instead move `tsx` and `typescript` from `devDependencies` to `dependencies` in `server/package.json`.

## 2. Environment Variables (Config Vars)

On the Heroku dashboard (or via CLI `heroku config:set`), you need to configure the following variables:

- **`AI_GATEWAY_API_KEY`**: Your API key for the AI agent to generate the scenes.
- **`CORS_ORIGIN`**: The full URL of your separately deployed frontend (e.g., `https://my-frontend.vercel.app`). The server is already set up to parse this variable and apply it to the Express CORS middleware.
- **`NPM_CONFIG_PRODUCTION`**: Set to `false` (as explained above) so `tsx` doesn't get uninstalled.
- *Note: Heroku dynamically assigns the `PORT` variable. The server's Express setup natively handles `process.env.PORT` already, so no code changes are needed there.*

## 3. Important Caveat: Ephemeral Filesystem

Heroku dynos use an **ephemeral filesystem**. 
When the server shells out to `remotion render`, it outputs the generated `.mp4` files to `server/public/previews`. 

- **What this means**: These video files will disappear whenever the Heroku dyno restarts (this happens at least once every 24 hours, or upon any new deployment/config change). 
- **Resolution**: For an MVP, this is perfectly fine. For production, you will eventually need to update the `render-scene.ts` tool to upload the completed MP4 to a cloud storage bucket (like AWS S3 or Supabase Storage) rather than keeping it on the local disk.