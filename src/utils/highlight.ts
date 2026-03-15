import Prism from 'prismjs'
// Core languages included in base Prism
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-go'

export const PRISM_LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  jsx:        'jsx',
  typescript: 'typescript',
  tsx:        'tsx',
  python:     'python',
  css:        'css',
  scss:       'scss',
  html:       'markup',
  json:       'json',
  markdown:   'markdown',
  sql:        'sql',
  bash:       'bash',
  rust:       'rust',
  go:         'go',
  text:       '',
}

/**
 * Highlight code using Prism.js.
 * Returns an HTML string ready to inject into a <pre> element.
 */
export function highlightCode(code: string, language: string): string {
  const prismLang = PRISM_LANGUAGE_MAP[language] ?? ''
  if (!prismLang || !Prism.languages[prismLang]) {
    // Fallback: escape HTML and return plain
    return escapeHtml(code)
  }
  return Prism.highlight(code, Prism.languages[prismLang], prismLang)
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
