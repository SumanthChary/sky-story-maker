# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/02f651f6-f687-4f39-a7da-02110e6d0392

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/02f651f6-f687-4f39-a7da-02110e6d0392) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/02f651f6-f687-4f39-a7da-02110e6d0392) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Deploying to Whop

- Build the production bundle with `npm run build`; the optimized site is written to the `dist/` folder.
- Archive the bundle for upload by running `zip -r whop-app.zip dist` from the project root; this repository already contains the latest archive.
- In the Whop Developer Console, open your app, choose **Upload new version**, and provide the generated `whop-app.zip` file.
- Store server-side credentials such as `WHOP_API_KEY` only in Whop or Supabase function environment settings; expose client values with a `VITE_` prefix (for example `VITE_WHOP_APP_ID`).
- After uploading, test the staging preview Whop provides before publishing your update.
- Configure Supabase Edge Functions with `WHOP_APP_ID` (matching `VITE_WHOP_APP_ID`) so the backend can verify access before generating stories; optionally set `WHOP_ACCESS_CHECK_DISABLED=true` locally if you need to bypass the gate during development.
