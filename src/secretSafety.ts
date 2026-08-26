export const SENSITIVE_FIELD_NAMES = new Set([
  "api_key",
  "apikey",
  "authorization",
  "headers.authorization",
  "openai_api_key",
  "anthropic_api_key",
  "github_token",
  "access_token",
  "refresh_token",
  "raw_provider_request",
  "raw_provider_response",
  "process_env"
]);

export const SECRET_VALUE_PATTERNS = [
  /(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN)\s*=\s*[^\s"']+/gi,
  /\b(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN)\b/gi,
  /sk-(?:proj-)?[A-Za-z0-9_-]{8,}/g,
  /github_pat_[A-Za-z0-9_]{8,}/g,
  /gh[pousr]_[A-Za-z0-9_]{8,}/g,
  /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/gi,
  /\.env(?:\.[A-Za-z0-9_-]+)?\s*[:=]\s*[^\s"']+/gi
];

export function containsSecretValue(input: unknown): boolean {
  const text = typeof input === "string" ? input : JSON.stringify(input ?? "");
  return SECRET_VALUE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

export function redactSecretString(input: string, replacement = "[REDACTED:api_key]"): { value: string; count: number } {
  let value = input;
  let count = 0;
  for (const pattern of SECRET_VALUE_PATTERNS) {
    pattern.lastIndex = 0;
    value = value.replace(pattern, () => {
      count += 1;
      return replacement;
    });
  }
  return { value, count };
}
