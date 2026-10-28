export function safeNext(value: string | null | undefined): string {
  if (!value) return "/feed";
  try {
    const decoded = decodeURIComponent(value);
    if (![value, decoded].every(path => path.startsWith("/") && !path.startsWith("//") && !/[\\\u0000-\u0020]/.test(path))) return "/feed";
    if (new URL(value, "https://cipher.local").origin !== "https://cipher.local") return "/feed";
    return value;
  } catch { return "/feed"; }
}
