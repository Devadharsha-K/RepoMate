# RepoMate

A small tool with two modes, built for the IBM Bob 2.0 Hackathon:

- **Understand a repo** — paste a public GitHub repo URL, get a plain-English explanation of what it does and where to start reading.
- **Explain a bug** — paste an error message and the relevant code, get a plain-English root cause and fix.

Right now Bob 2.0 isn't connected yet — `askBob()` in `server.js` returns a placeholder so the rest of the app can be built and tested. Once we have real API access, only that one function needs to change.

## Setup (first time only)

1. Install [Node.js](https://nodejs.org) (LTS version) if you don't have it.
2. Open this folder in VS Code.
3. Open a terminal inside VS Code (`Terminal` menu → `New Terminal`).
4. Run:
   ```
   npm install
   ```
5. Copy `.env.example` to a new file named `.env`. Leave the Bob values empty for now — the placeholder response still works without them.
6. Recommended: create a [GitHub personal access token](https://github.com/settings/tokens) (no special scopes needed) and put it in `.env` as `GITHUB_TOKEN`. Without it, GitHub only allows 60 API requests/hour per IP, shared across everyone on your network — easy to hit with 4 people testing. With a token it's 5000/hour, and each person can use their own.

## Running it

```
npm start
```

Then open http://localhost:3000 in your browser.

## Where to plug in real Bob 2.0 access

Open `server.js` and find the `askBob()` function near the top — it has a commented-out example of what the real call will probably look like. Replace the placeholder `return` with the real fetch call once we have:
- The API URL
- The API key
- The exact request/response shape from Bob's docs

Put the URL and key into `.env` (not directly in the code) so they're never accidentally pushed to GitHub.

## Project structure

```
repomate-starter/
├── server.js           backend: reads repos from GitHub, calls Bob, serves the two API routes
├── public/
│   ├── index.html       the two-tab UI
│   ├── style.css
│   └── app.js            talks to the backend from the browser
├── .env.example          copy to .env and fill in Bob's real URL/key when we have them
└── package.json
```
