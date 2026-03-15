// Language → Prism language id mapping (tree-shakeable)
export const LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  jsx: 'jsx',
  typescript: 'typescript',
  tsx: 'tsx',
  python: 'python',
  css: 'css',
  scss: 'scss',
  html: 'markup',
  json: 'json',
  markdown: 'markdown',
  sql: 'sql',
  bash: 'bash',
  rust: 'rust',
  go: 'go',
  text: 'text',
}

// File extension → human-readable label
export const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  jsx: 'JSX',
  typescript: 'TypeScript',
  tsx: 'TSX',
  python: 'Python',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  json: 'JSON',
  markdown: 'Markdown',
  sql: 'SQL',
  bash: 'Bash',
  rust: 'Rust',
  go: 'Go',
  text: 'Plain Text',
}

// File extension → icon name (using emoji as placeholder for v1)
export const FILE_ICONS: Record<string, string> = {
  js: '📄', jsx: '⚛️', ts: '📘', tsx: '⚛️',
  py: '🐍', css: '🎨', scss: '🎨', html: '🌐',
  json: '📋', md: '📝', sql: '🗄️', sh: '⚡',
  rs: '🦀', go: '🐹', txt: '📄',
}

export function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return FILE_ICONS[ext] ?? '📄'
}

export function getFolderIcon(expanded: boolean): string {
  return expanded ? '📂' : '📁'
}

// Estimate token count (rough: 4 chars ≈ 1 token)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Truncate text to approximate token limit
export function truncateToTokens(text: string, maxTokens = 4000): string {
  const maxChars = maxTokens * 4
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars)
}
