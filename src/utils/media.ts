/** B 站封面常因 Referer 防盗链裂图；统一 https + 前端配合 referrerPolicy="no-referrer" */
export function normalizeCoverUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
}
