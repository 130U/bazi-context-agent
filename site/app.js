const reportEl = document.getElementById("report");
const birthDateEl = document.getElementById("birthDate");
const birthTimeEl = document.getElementById("birthTime");
const contextEl = document.getElementById("contextProfile");
const questionEl = document.getElementById("forecastQuestion");

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
      source: "static_demo",
      summary: "Demo BaZi-derived structure generated from the recorded-time placeholder.",
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
      summary: "Over the selected horizon, the demo suggests focusing on clearer prioritization, fewer parallel tracks, and stronger alignment between actual path and preferred direction.",
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
      no_login: true,
      no_api_key: true,
      ai_used_for_ranking: false,
      data_leaves_browser: false
    }
  };
}

function renderReport(payload) {
  reportEl.innerHTML = `
    <p><strong>Question:</strong> ${escapeHtml(payload.forecast_question)}</p>
    <p><strong>Birth input:</strong> ${escapeHtml(payload.birth_input.birth_date)} / ${escapeHtml(payload.birth_input.recorded_time)}</p>
    <p><strong>Derived function:</strong> ${escapeHtml(payload.derivative_function.summary)}</p>
    <p><strong>Initial value:</strong> ${escapeHtml(payload.initial_value.context_profile)}</p>
    <p><strong>Forecast preview:</strong> ${escapeHtml(payload.forecast_preview.summary)}</p>
    <p><strong>Opportunity windows:</strong> ${payload.forecast_preview.opportunity_windows.map(escapeHtml).join("; ")}</p>
    <p><strong>Boundary:</strong> Static demo; no login; no API key; no data leaves browser.</p>
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

function toMarkdown(payload) {
  return `# BaZi Context Agent Demo Report

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
- No login: ${payload.policy.no_login}
- No API key: ${payload.policy.no_api_key}
- Data leaves browser: ${payload.policy.data_leaves_browser}
`;
}

function generate() {
  latestPayload = buildPayload();
  renderReport(latestPayload);
}

document.getElementById("generateBtn").addEventListener("click", generate);

document.getElementById("copyBtn").addEventListener("click", async () => {
  if (!latestPayload) generate();
  await navigator.clipboard.writeText(toMarkdown(latestPayload));
});

document.getElementById("jsonBtn").addEventListener("click", () => {
  if (!latestPayload) generate();
  download("bazi-context-demo.json", JSON.stringify(latestPayload, null, 2), "application/json");
});

document.getElementById("mdBtn").addEventListener("click", () => {
  if (!latestPayload) generate();
  download("bazi-context-demo.md", toMarkdown(latestPayload), "text/markdown");
});

generate();
