function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const scripts = tempDiv.getElementsByTagName('script');
  while (scripts.length > 0) {
    scripts[0].parentNode?.removeChild(scripts[0]);
  }

  return escapeHTML(tempDiv.innerHTML);
}; 