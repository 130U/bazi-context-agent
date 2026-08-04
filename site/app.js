const reportEl = document.getElementById("report");
const birthDateEl = document.getElementById("birthDate");
const birthTimeEl = document.getElementById("birthTime");
const contextEl = document.getElementById("contextProfile");
const questionEl = document.getElementById("forecastQuestion");
const actionStatusEl = document.getElementById("actionStatus");

let latestPayload = null;

function buildPayload() {
  const birthDate = birthDateEl.value.trim();
  const birthTime = birthTimeEl.value.trim();
  const contextProfile = contextEl.value.trim();
  const question = questionEl.value.trim();

  return {
    generated_at: new Date().toISOString(),
    demo_only: true,
    birth_input: {
      birth_date: birthDate,
      recorded_time: birthTime
    },
    derivative_function: {
      source: "illustrative_fixture",
      summary: "Illustrative derived-profile fixture; no chart calculation runs in this static page.",
      signals: [
        "timing structure",
        "mobility and transition signal",
        "education-career pressure signal"
      ]
    },
    initial_value: {
      context_profile: contextProfile,
      note: "In the production pipeline, the context profile is user-controlled and can be hidden, deleted, or excluded."
    },
    forecast_question: question,
    forecast_preview: {
      summary: "This fixture demonstrates where a bounded forecast summary would appear after deterministic rectification and explicit context review.",
      opportunity_windows: [
        "0-6 months: clarity and consolidation",
        "6-18 months: positioning and collaboration"
      ],
      risk_windows: [
        "overextension",
        "over-reading weak signals",
        "context leakage if privacy controls are ignored"
      ]
    },
    policy: {
      static_demo: true,
      fixture_based: true,
      no_login: true,
      no_api_key: true,
      ai_used_for_ranking: false,
      data_leaves_browser: false
    }
  };
}

function renderReport(payload) {
  reportEl.innerHTML = `
    <div class="report-lead">
      <p>Illustrative fixture · not a personal prediction</p>
      <h3>${escapeHtml(payload.forecast_question)}</h3>
    </div>
    <dl>
      <div>
        <dt>Birth input</dt>
        <dd>${escapeHtml(payload.birth_input.birth_date)} · ${escapeHtml(payload.birth_input.recorded_time)}</dd>
      </div>
      <div>
        <dt>Derived structure</dt>
        <dd>${escapeHtml(payload.derivative_function.summary)}</dd>
      </div>
      <div>
        <dt>User context</dt>
        <dd>${escapeHtml(payload.initial_value.context_profile)}</dd>
      </div>
      <div>
        <dt>Output position</dt>
        <dd>${escapeHtml(payload.forecast_preview.summary)}</dd>
      </div>
      <div>
        <dt>Example windows</dt>
        <dd>${payload.forecast_preview.opportunity_windows.map(escapeHtml).join(" · ")}</dd>
      </div>
    </dl>
    <div class="report-boundary">Static fixture · no login · no API key · no data leaves this browser</div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function setActionStatus(message, tone = "") {
  actionStatusEl.textContent = message;
  actionStatusEl.dataset.tone = tone;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Copy command was unavailable.");
}

function toMarkdown(payload) {
  return `# BaZi Context Agent — Illustrative Demo Report

> Fixture-based public walkthrough. This is not a calculated chart or personal prediction.

## Question
${payload.forecast_question}

## Birth input
- Date: ${payload.birth_input.birth_date}
- Recorded time: ${payload.birth_input.recorded_time}

## Derived function
${payload.derivative_function.summary}

## Initial value
${payload.initial_value.context_profile}

## Forecast preview
${payload.forecast_preview.summary}

## Policy
- Static demo: ${payload.policy.static_demo}
- Fixture based: ${payload.policy.fixture_based}
- No login: ${payload.policy.no_login}
- No API key: ${payload.policy.no_api_key}
- Data leaves browser: ${payload.policy.data_leaves_browser}
`;
}

function generate() {
  latestPayload = buildPayload();
  renderReport(latestPayload);
}

document.getElementById("generateBtn").addEventListener("click", () => {
  generate();
  setActionStatus("Illustrative report refreshed.", "success");
});

document.getElementById("copyBtn").addEventListener("click", async () => {
  if (!latestPayload) generate();
  try {
    await copyText(toMarkdown(latestPayload));
    setActionStatus("Markdown copied to the clipboard.", "success");
  } catch {
    setActionStatus("Copy was unavailable. Download the Markdown file instead.", "error");
  }
});

document.getElementById("jsonBtn").addEventListener("click", () => {
  if (!latestPayload) generate();
  download("bazi-context-demo.json", JSON.stringify(latestPayload, null, 2), "application/json");
  setActionStatus("JSON download prepared.", "success");
});

document.getElementById("mdBtn").addEventListener("click", () => {
  if (!latestPayload) generate();
  download("bazi-context-demo.md", toMarkdown(latestPayload), "text/markdown");
  setActionStatus("Markdown download prepared.", "success");
});

generate();
