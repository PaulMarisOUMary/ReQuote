const QUOTE_PATTERN = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/;

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

export function targetQuote(quote: string, inner: string): string {
  if (quote === "`" && hasInterpolation(inner)) { return "`"; }
  const isMultiChar = [...inner].length > 1;
  return isMultiChar ? '"' : "'";
}

export function reEscape(inner: string, from: string, to: string): string {
  return inner
    .replace(new RegExp(`\\\\${from}`, "g"), from)
    .replace(new RegExp(to === "`" ? "`" : to, "g"), `\\${to}`);
}

export function flipQuotes(text: string): string {
    const regex = new RegExp(QUOTE_PATTERN.source, "g");
    return text.replace(regex, (_, quote, inner) => {
        const next = targetQuote(quote, inner);
        if (next === quote) { return _; }
        return next + reEscape(inner, quote, next) + next;
    });
}
