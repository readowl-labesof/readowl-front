// Very lightweight bot/user-agent filter. Extend as needed.
const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /slurp/i,
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /httpclient/i,
  /HeadlessChrome/i,
];

export function isLikelyBot(userAgent: string | null | undefined) {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((re) => re.test(userAgent));
}
