/**
 * Strip common Markdown markers so chat bubbles show plain text.
 * Keeps line breaks; converts bullets to "· ".
 */
export function stripMarkdown(input: string): string {
  let text = input.replace(/\r\n/g, '\n');

  // fenced code → inner text
  text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1');

  // links / images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // headings
  text = text.replace(/^#{1,6}\s+/gm, '');

  // bold / italic / strike
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/\*([^*\n]+)\*/g, '$1');
  text = text.replace(/_([^_\n]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // inline code
  text = text.replace(/`([^`]+)`/g, '$1');

  // list markers
  text = text.replace(/^\s*[-*+]\s+/gm, '· ');
  text = text.replace(/^\s*\d+[.)]\s+/gm, (m) => m.replace(/^(\s*)(\d+)[.)]\s+/, '$1$2）'));

  // blockquote
  text = text.replace(/^\s*>\s?/gm, '');

  // leftover emphasis asterisks used as bullets mid-line
  text = text.replace(/(^|\n)\s*\*\s+/g, '$1· ');

  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}
