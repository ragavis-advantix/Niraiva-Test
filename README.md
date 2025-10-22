# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d4eecc4f-9187-4c0b-a149-f5b42bbdfe84

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d4eecc4f-9187-4c0b-a149-f5b42bbdfe84) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

````markdown
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d4eecc4f-9187-4c0b-a149-f5b42bbdfe84

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d4eecc4f-9187-4c0b-a149-f5b42bbdfe84) and start prompting.

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

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d4eecc4f-9187-4c0b-a149-f5b42bbdfe84) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

````

## Local proxy for file uploads -> n8n

A tiny Express proxy is provided at `server/index.js` to accept uploads from the frontend and forward the file to the configured n8n webhook. This is useful when you need to hide the n8n URL from the browser or add server-side processing.

Start it with:

```powershell
# install server dependencies
cd server
npm install express node-fetch@2 multer form-data cors
# then from project root run
node server/index.js
```

By default the server listens on port 4000 and forwards to `http://localhost:5678/webhook/test` (override with `N8N_WEBHOOK` env var).

### Example frontend upload call

```js
// send a file from a <input type="file" /> element
const input = document.querySelector('#file');
const form = new FormData();
form.append('file', input.files[0]);

const res = await fetch('http://localhost:4000/api/upload', {
	method: 'POST',
	body: form,
});

const json = await res.json();
console.log('n8n returned:', json);
```

The proxy will return whatever n8n returns (JSON or text). If n8n extracts and returns JSON, the frontend will receive it and can visualize the values.
