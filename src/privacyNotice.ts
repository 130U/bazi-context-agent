export const STAGE8_PRIVACY_NOTICE = [
  "This MVP is local-first: no account, no server-side data store, no remote sync, and no telemetry.",
  "Context facts do not participate in ranking or rectification.",
  "You can hide facts from forecast, hide facts from export, delete facts, export a redacted JSON session, import a session, or clear local data.",
  "Exports may contain user-provided personal information after redaction, so review them before sharing.",
  "API keys, .env contents, local file paths, and deleted fact values are not exported."
].join("\n");

export function buildPrivacyNotice(): string {
  return STAGE8_PRIVACY_NOTICE;
}
