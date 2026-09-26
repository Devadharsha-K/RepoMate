// ── Tab switching ─────────────────────────────────────────────────────
const tabs = document.querySelectorAll('.tab');
const panels = {
  explain: document.getElementById('panel-explain'),
  debug:   document.getElementById('panel-debug'),
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

// ── Shared helpers ────────────────────────────────────────────────────

/**
 * Put a button into a loading state (spinner on, text dimmed, disabled).
 * Call stopLoading() with the same button to reverse it.
 */
function startLoading(btn) {
  btn.disabled = true;
  btn.classList.add('loading');
}

function stopLoading(btn) {
  btn.disabled = false;
  btn.classList.remove('loading');
}

/**
 * Show a status message. Pass isError=true to colour it red.
 */
function setStatus(el, message, isError = false) {
  el.textContent = message;
  el.classList.toggle('is-error', isError);
}

// ── Repo explainer ────────────────────────────────────────────────────
const explainBtn    = document.getElementById('explainBtn');
const explainStatus = document.getElementById('explainStatus');
const explainResult = document.getElementById('explainResult');
const explainOutput = document.getElementById('explainOutput');
const explainBadge  = document.getElementById('explainBadge');

explainBtn.addEventListener('click', async () => {
  const repoUrl = document.getElementById('repoUrl').value.trim();
  if (!repoUrl) {
    setStatus(explainStatus, 'Paste a GitHub repo URL first.', true);
    return;
  }

  startLoading(explainBtn);
  setStatus(explainStatus, 'Reading the repo and asking Bob…');
  explainResult.hidden = true;

  try {
    const res  = await fetch('/api/explain-repo', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ repoUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    const n = data.filesSeen ?? 0;
    setStatus(explainStatus, '');
    explainBadge.textContent = `${n} file${n !== 1 ? 's' : ''} scanned`;
    explainOutput.textContent = data.explanation;
    explainResult.hidden = false;
  } catch (err) {
    setStatus(explainStatus, `Error: ${err.message}`, true);
    explainResult.hidden = true;
  } finally {
    stopLoading(explainBtn);
  }
});

// ── Bug explainer ─────────────────────────────────────────────────────
const debugBtn    = document.getElementById('debugBtn');
const debugStatus = document.getElementById('debugStatus');
const debugResult = document.getElementById('debugResult');
const debugOutput = document.getElementById('debugOutput');

debugBtn.addEventListener('click', async () => {
  const errorMessage = document.getElementById('errorMessage').value.trim();
  const code         = document.getElementById('codeSnippet').value.trim();

  if (!errorMessage) {
    setStatus(debugStatus, 'Paste an error message first.', true);
    return;
  }

  startLoading(debugBtn);
  setStatus(debugStatus, 'Asking Bob…');
  debugResult.hidden = true;

  try {
    const res  = await fetch('/api/debug-bug', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ errorMessage, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    setStatus(debugStatus, '');
    debugOutput.textContent = data.analysis;
    debugResult.hidden = false;
  } catch (err) {
    setStatus(debugStatus, `Error: ${err.message}`, true);
    debugResult.hidden = true;
  } finally {
    stopLoading(debugBtn);
  }
});
