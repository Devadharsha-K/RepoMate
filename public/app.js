// --- Tab switching ---
const tabs = document.querySelectorAll('.tab');
const panels = {
  explain: document.getElementById('panel-explain'),
  debug: document.getElementById('panel-debug'),
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    Object.values(panels).forEach((p) => p.classList.remove('active'));
    panels[tab.dataset.tab].classList.add('active');
  });
});

// --- Repo explainer ---
const explainBtn = document.getElementById('explainBtn');
const explainStatus = document.getElementById('explainStatus');
const explainOutput = document.getElementById('explainOutput');

explainBtn.addEventListener('click', async () => {
  const repoUrl = document.getElementById('repoUrl').value.trim();
  if (!repoUrl) {
    explainStatus.textContent = 'Paste a GitHub repo URL first.';
    return;
  }

  explainBtn.disabled = true;
  explainStatus.textContent = 'Reading the repo and asking Bob...';
  explainOutput.hidden = true;

  try {
    const res = await fetch('/api/explain-repo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    explainStatus.textContent = `Looked at ${data.filesSeen} files.`;
    explainOutput.textContent = data.explanation;
    explainOutput.hidden = false;
  } catch (err) {
    explainStatus.textContent = `Error: ${err.message}`;
  } finally {
    explainBtn.disabled = false;
  }
});

// --- Bug explainer ---
const debugBtn = document.getElementById('debugBtn');
const debugStatus = document.getElementById('debugStatus');
const debugOutput = document.getElementById('debugOutput');

debugBtn.addEventListener('click', async () => {
  const errorMessage = document.getElementById('errorMessage').value.trim();
  const code = document.getElementById('codeSnippet').value.trim();
  if (!errorMessage) {
    debugStatus.textContent = 'Paste an error message first.';
    return;
  }

  debugBtn.disabled = true;
  debugStatus.textContent = 'Asking Bob...';
  debugOutput.hidden = true;

  try {
    const res = await fetch('/api/debug-bug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorMessage, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    debugStatus.textContent = 'Done.';
    debugOutput.textContent = data.analysis;
    debugOutput.hidden = false;
  } catch (err) {
    debugStatus.textContent = `Error: ${err.message}`;
  } finally {
    debugBtn.disabled = false;
  }
});
