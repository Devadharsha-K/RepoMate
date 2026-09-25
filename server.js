import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------
// Pulls basic context out of a PUBLIC GitHub repo: its file list and
// README. No auth needed for public repos, but GitHub's public rate
// limit is low (60 req/hour per IP) - fine for demoing, not for heavy use.
// ---------------------------------------------------------------------
async function fetchRepoContext(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error('Please paste a valid GitHub repo URL, like https://github.com/owner/repo');
  }
  const [, owner, rawRepo] = match;
  const repo = rawRepo.replace(/\.git$/, '');

  // GitHub's API rejects requests with no User-Agent header (403), so always send one.
  // Unauthenticated requests are capped at 60/hour per IP - easy to hit with 4 people
  // testing at once. Add a GITHUB_TOKEN in .env (a personal access token, no special
  // scopes needed for public repos) to raise that to 5000/hour.
  const githubHeaders = { 'User-Agent': 'repomate-hackathon-app' };
  if (process.env.GITHUB_TOKEN) {
    githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
    headers: githubHeaders,
  });
  if (!treeRes.ok) {
    throw new Error(`Could not read that repo (status ${treeRes.status}). Is it public and spelled correctly?`);
  }
  const treeData = await treeRes.json();
  const filePaths = (treeData.tree || [])
    .filter((item) => item.type === 'blob')
    .map((item) => item.path)
    .slice(0, 200); // keep the prompt small

  let readme = '';
  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...githubHeaders, Accept: 'application/vnd.github.raw' },
    });
    if (readmeRes.ok) readme = await readmeRes.text();
  } catch {
    // README is optional, ignore failures
  }

  return { owner, repo, filePaths, readme: readme.slice(0, 4000) };
}

// ---------------------------------------------------------------------
// PLACEHOLDER for the real Bob 2.0 API call.
// Swap the body of this function once you have Bob's real endpoint,
// SDK, and API key from tonight's kickoff. Everything else in this
// file (the two routes below) can stay exactly as it is.
// ---------------------------------------------------------------------
async function askBob(prompt) {
  // --- Example of what the real call will probably look like ---
  // const res = await fetch(`${process.env.BOB_API_URL}/chat`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${process.env.BOB_API_KEY}`,
  //   },
  //   body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  // });
  // const data = await res.json();
  // return data.reply; // <- adjust this line to match Bob's real response shape

  return (
    `[PLACEHOLDER - Bob 2.0 is not connected yet]\n\n` +
    `This is the exact prompt that will be sent to Bob once we plug in the real API:\n\n` +
    prompt.slice(0, 600) +
    (prompt.length > 600 ? '\n...(truncated)' : '')
  );
}

// ---------------------------------------------------------------------
// Route 1: "Understand my repo" (onboarding mode)
// ---------------------------------------------------------------------
app.post('/api/explain-repo', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });

    const context = await fetchRepoContext(repoUrl);

    const prompt = `You are helping a new developer understand a codebase for the first time.

Repository: ${context.owner}/${context.repo}

README:
${context.readme || '(no README found)'}

File list:
${context.filePaths.join('\n')}

In plain English, explain:
1. What this project does
2. Its main components/modules and how they relate
3. Where a new developer should start reading first`;

    const explanation = await askBob(prompt);
    res.json({ explanation, filesSeen: context.filePaths.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// Route 2: "Explain my bug" (debugging mode)
// ---------------------------------------------------------------------
app.post('/api/debug-bug', async (req, res) => {
  try {
    const { errorMessage, code } = req.body;
    if (!errorMessage) return res.status(400).json({ error: 'errorMessage is required' });

    const prompt = `A developer hit this error/bug:

${errorMessage}

Relevant code:
${code || '(no code provided)'}

In plain English:
1. Explain the likely root cause
2. Suggest a concrete fix
3. Note anything else that might break because of this change`;

    const analysis = await askBob(prompt);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`RepoMate running at http://localhost:${PORT}`);
});
