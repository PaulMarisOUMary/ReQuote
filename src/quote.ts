const QUOTE_PATTERN = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/;

const TRIPLE_QUOTE_PATTERN = /^("""[\s\S]*"""|'''[\s\S]*''')$/;

export const SUPPORTED_LANGUAGES = new Set([
  "c",
  "cpp",
  "csharp",
  "dart",
  "javascript",
  "javascriptreact",
  "php",
  "python",
  "ruby",
  "rust",
  "svelte",
  "typescript",
  "typescriptreact",
  "vue",
]);

function hasInterpolation(inner: string): boolean {
  return /\$\{/.test(inner);
}

export function isCompleteString(text: string): boolean {
  if (TRIPLE_QUOTE_PATTERN.test(text.trim())) { return false; }
  return QUOTE_PATTERN.test(text);
}

export function targetQuote(quote: string, inner: string): string {
  if (quote === '`' && hasInterpolation(inner)) {
    return '`';
  }
  const isMultiChar = [...inner].length > 1;
  return isMultiChar ? '"' : "'";
}

export function reEscape(inner: string, from: string, to: string): string {
  return inner
    .replace(new RegExp(`\\\\${from}`, 'g'), from)
    .replace(new RegExp(to === '`' ? '`' : to, 'g'), `\\${to}`);
}

export function flipQuotes(text: string): string {
  const regex = new RegExp(QUOTE_PATTERN.source, 'g');
  return text.replace(regex, (match, quote, inner) => {
    if (TRIPLE_QUOTE_PATTERN.test(match)) { return match; }

    if (!isCompleteString(match)) { return match; }

    const next = targetQuote(quote, inner);
    if (next === quote) {
      return match;
    }
    return next + reEscape(inner, quote, next) + next;
  });
}
