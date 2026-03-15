# 🛸 ORBIT IDE — PRD Digest & SOP Reference
**Version:** v1.0 | **Date:** March 2026 | **Status:** Draft — For Review
**Classification:** CONFIDENTIAL — Internal Use Only

---

## 1. PRODUCT OVERVIEW

**ORBIT IDE** is a browser-based, cross-platform Integrated Development Environment (IDE) that runs on any device with a modern browser — phones, tablets, Chromebooks, smart TVs — with zero installation required.

**Tagline:** *"Zero-Gravity Coding — Anywhere, Any Device"*

---

## 2. CORE PILLARS

| Pillar | Description |
|---|---|
| **Universality** | Runs identically on Chrome, Safari, Firefox, Edge on any OS or hardware |
| **Intelligence** | Native AI assistant powered by Claude for code gen, debug, and explanation |
| **Collaboration** | Real-time multi-user editing, commenting, and live preview sharing (v2.0) |
| **Performance** | Sub-second load times, offline via PWA, smooth 60fps on mid-range mobile |

---

## 3. TARGET USERS & PERSONAS

| Persona | Profile | Key Need |
|---|---|---|
| **Kai** (Mobile Dev, 26) | Full-stack dev at startup, 90-min daily commute | Push fixes from phone with VS Code continuity |
| **Amara** (Student, 19) | CS undergrad on school Chromebook | Python/JS/HTML + AI explanations + offline capability |
| **Priya** (Eng. Manager, 35) | Manager at 50-person tech company | SSO, audit logs, data residency, quick PR reviews |

---

## 4. FEATURE REQUIREMENTS

**Priority Scale:** P0 = Must-have for launch | P1 = Strongly desired | P2 = Nice-to-have | P3 = Future roadmap

### 4.1 Core Editor

| Feature | Description | Priority |
|---|---|---|
| Syntax Highlighting | JS, TS, JSX, TSX, Python, CSS, SCSS, HTML, JSON, Markdown, SQL, Bash, Rust, Go | P0 |
| Multi-Tab Editing | Open/close/reorder/pin multiple files simultaneously | P0 |
| Line Numbers | Gutter with line numbers; click to jump; highlight active line | P0 |
| Tab / Indent | Configurable 2/4 spaces; auto-indent on newline; block indent/unindent | P0 |
| Find & Replace | In-file search with regex, case-sensitive, whole-word options | P0 |
| Auto-Save | Save to localStorage every 30s; cloud sync when signed in | P0 |
| Code Folding | Collapse/expand functions, classes, blocks, comments | P1 |
| Bracket Matching | Highlight matching brackets; jump-to-match shortcut | P1 |
| Multi-Cursor | Ctrl+Click or Alt+Click; Ctrl+D to select next occurrence | P1 |
| Global Search | Search across all files in the workspace | P1 |
| Word Wrap Toggle | Toggle soft wrap; status bar indicator | P1 |
| Minimap | Scrollable code minimap on wide screens | P2 |

### 4.2 AI Assistant

| Feature | Description | Priority |
|---|---|---|
| Contextual Chat | Side panel chat with full awareness of current file and cursor selection | P0 |
| Explain Code | Select any code block; AI explains in plain English | P0 |
| Fix Bug | One-click "Fix" on error squiggles; AI proposes a corrected snippet | P0 |
| Refactor | AI rewrites selected code for clarity, performance, or style | P1 |
| Inline Completion | Ghost-text autocomplete (accept with Tab) | P1 |
| Generate Function | Describe intent in natural language; AI produces implementation | P1 |
| Chat History | Persist conversation per file; clear/export history | P1 |
| Test Generation | Generate unit tests for selected function | P2 |
| Docs Generation | Auto-generate JSDoc / Python docstrings | P2 |
| Model Selection | Switch between Claude Haiku (fast) and Claude Sonnet (powerful) | P2 |

### 4.3 File System & Project Management

| Feature | Description | Priority |
|---|---|---|
| File Explorer | Sidebar tree: create, rename, delete, move files and folders | P0 |
| Project Persistence | All files stored in IndexedDB; survive page refresh and browser restart | P0 |
| Drag & Drop | Reorder files; drag files between folders | P1 |
| File Templates | New-file wizard with language-specific boilerplate | P1 |
| Import / Export | Import a ZIP; export entire workspace as ZIP | P1 |
| Recents | Recently opened files list; jump back in one click | P1 |
| GitHub Integration | Clone public repo; commit and push via GitHub OAuth | P2 |

### 4.4 Terminal

| Feature | Description | Priority |
|---|---|---|
| Simulated Shell | Browser-based shell: `ls`, `cat`, `touch`, `mkdir`, `rm`, `echo`, `clear`, `date` | P0 |
| Command History | Arrow keys cycle through previous commands | P1 |
| ANSI Colours | Full ANSI escape code support for coloured output | P1 |
| Resize | Drag terminal panel to any height; collapse to icon | P1 |
| Multiple Panels | Open multiple terminal tabs simultaneously | P2 |
| WebContainer (v2) | Node.js / Python runtime via WebContainers API | P2 |

### 4.5 Mobile & Touch UX

| Feature | Description | Priority |
|---|---|---|
| Bottom Navigation | Tab bar: Explorer / Editor / AI / Terminal on screens < 720px | P0 |
| Touch Keyboard Toolbar | Floating toolbar above soft keyboard with Tab, `{}`, `[]`, `()`, Undo, Redo | P0 |
| Scroll Sync | Code highlight overlay stays perfectly synced with textarea scroll on all platforms | P0 |
| Swipe Gestures | Swipe right to open sidebar; swipe left to close; pinch-to-zoom font size | P1 |
| Landscape Optimisation | Two-column layout in landscape: editor left, file tree right | P1 |
| Font Size Control | Pinch-to-zoom or +/- buttons; setting persisted | P1 |
| Haptic Feedback | Vibration on save, error, AI response on supported devices | P2 |

### 4.6 Theming & Personalisation

| Feature | Description | Priority |
|---|---|---|
| Dark / Light Theme | One-click toggle; respect `prefers-color-scheme` by default | P0 |
| Colour Schemes | GitHub Dark, GitHub Light, Dracula, Solarized, Monokai, High Contrast | P1 |
| Font Selection | JetBrains Mono, Fira Code, Cascadia Code, or system monospace | P1 |
| Custom Key Bindings | Remap any shortcut via JSON config | P2 |
| UI Density | Compact / Comfortable / Spacious layout modes | P2 |

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance Targets

| Metric | Target |
|---|---|
| Time to Interactive (mid-range Android, 4G) | < 2.0 s |
| Largest Contentful Paint — Desktop | < 1.5 s |
| Largest Contentful Paint — Mobile | < 2.5 s |
| Typing latency (keydown → visible character) | < 16 ms (one render frame) |
| File open (up to 1 MB) | < 200 ms |
| AI response first token | < 800 ms |
| Scrolling on files up to 5,000 lines | 60 fps |
| Editor cold load time | < 800 ms (v1.0) / < 400 ms (v2.0) |

### 5.2 Browser & Device Compatibility

- **Browsers:** Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **Devices:** iPhone (iOS 15+), Android 8.0+, iPad, Android tablet, Chromebook, Windows, macOS, Linux
- **Screen sizes:** 320px – 5120px width; portrait and landscape
- **Input methods:** Touch, mouse, keyboard, stylus, voice-to-text (OS level)

### 5.3 Accessibility

- WCAG 2.1 AA compliance across all views
- Full keyboard navigability — no mouse/touch-only interactions
- ARIA labels on all interactive controls; screen-reader tested with VoiceOver and TalkBack
- Minimum contrast: 4.5:1 for body text, 3:1 for UI components
- Respect `prefers-reduced-motion`; all animations can be disabled

### 5.4 Security & Privacy

- All data in browser-origin storage (IndexedDB, localStorage) in offline mode
- API calls to Claude proxied through ORBIT backend — user API keys never stored in client
- Content Security Policy (CSP) headers to prevent XSS
- OAuth 2.0 with PKCE for GitHub and SSO integrations
- No third-party tracking or advertising SDKs
- Target SOC 2 Type II certification within 12 months of launch

### 5.5 Availability & Reliability

- PWA offline mode: all cached files and settings available without network
- Cloud sync: < 5s after reconnect from offline session
- Service uptime SLA (cloud features): 99.9% monthly
- Graceful degradation: AI panel hidden when API unreachable; editor always functional

---

## 6. TECHNICAL ARCHITECTURE

### 6.1 Frontend Stack

| Layer | Decision |
|---|---|
| Framework | React 18 (concurrent rendering) |
| State Management | Zustand (global) + React Context (theme/settings) |
| Editor Core (v1.0) | Custom `textarea` + `<pre>` overlay |
| Editor Core (v1.5+) | Monaco Editor integration |
| Styling | CSS Modules + CSS custom properties — **NO CSS-in-JS** |
| PWA | Workbox service worker; Cache-first assets, Network-first AI API |
| Build | Vite 5 with code splitting; bundle target **< 350 kB gzipped** |

### 6.2 Backend Stack

| Layer | Decision |
|---|---|
| Runtime | Node.js 20 LTS on Google Cloud Run |
| API | REST with OpenAPI 3.1 spec; WebSocket for collaboration (v2) |
| AI Proxy | ORBIT backend → Anthropic API (rate-limited per user tier) |
| Auth | Auth0 — JWT (1 hr access token, 30-day refresh token) |
| Storage | Firestore (metadata) + Cloud Storage (project ZIPs) |
| CDN | Cloudflare — edge caching in 200+ cities |

### 6.3 AI Data Flow

```
User query in AI panel
  → Frontend attaches file context (up to 4,000 tokens)
  → ORBIT backend validates JWT + applies rate limit + strips PII
  → Forwarded to Anthropic /v1/messages (claude-sonnet-4)
  → Streaming response via SSE back to client
  → Frontend renders markdown with code block highlighting
```

---

## 7. PRODUCT ROADMAP

| Phase | Timeline | Key Deliverables |
|---|---|---|
| **Alpha — Core Editor** | Month 1–2 | Syntax highlighting (6 langs), multi-tab, file explorer, local auto-save, dark/light theme |
| **Alpha — AI v1** | Month 2–3 | AI chat panel, explain/fix/refactor, context-aware responses, conversation history |
| **Beta — Mobile Polish** | Month 3–4 | Touch toolbar, bottom nav, landscape layout, scroll sync, PWA manifest + service worker |
| **Beta — Terminal** | Month 4 | Shell emulator, command history, ANSI colours, resizable panel |
| **v1.0 — Launch** | Month 5 | Public launch, auth, cloud sync, ZIP import/export, 10+ themes, onboarding tour |
| **v1.5 — Editor Pro** | Month 6–7 | Monaco editor, code folding, multi-cursor, bracket matching, global search |
| **v2.0 — Collaboration** | Month 8–10 | Real-time co-editing (OT/CRDT), presence cursors, inline comments, shared sessions |
| **v2.5 — Runtime** | Month 10–12 | WebContainer Node.js, Python execution, npm in-browser, live preview iframe |
| **v3.0 — Enterprise** | Month 13–18 | SSO/SAML, audit logs, private AI inference, admin console, SLA, SOC 2 |

---

## 8. MONETISATION

| Feature | Free | Pro ($9/mo) | Team ($20/seat/mo) |
|---|---|---|---|
| AI Queries | 50 / month | Unlimited | Unlimited + audit log |
| Cloud Sync | Browser only | 5 GB | 50 GB shared |
| Collaboration | Read-only share | Up to 3 collaborators | Unlimited |
| Themes | 3 built-in | All + custom | All + custom |
| AI Model | Claude Haiku | Claude Sonnet | Sonnet + Opus |
| Private Repos | Public only | Unlimited | Unlimited |
| Support | Community | Email (48h SLA) | Dedicated (4h SLA) |
| SSO / SAML | ✗ | ✗ | ✓ |

---

## 9. RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Browser textarea limitations block Monaco-quality editing | High | High | Ship Monaco Editor in v1.5; custom overlay for v1.0 |
| Scroll sync drift on iOS Safari causes unusable UX | Medium | High | Dedicated iOS test device in CI; regression bounty |
| Anthropic API cost spike from abuse or viral growth | Medium | High | Per-user rate limits in proxy; Free tier hard cap at 50/month |
| WebContainer not supported on iOS/Firefox | High | Medium | Simulated shell for v1.0; gate WebContainer behind Chromium-only flag |
| VS Code for Web adds strong mobile support before launch | Medium | High | Accelerate AI differentiation; ship inline completion early |
| PWA storage limits hit on large projects (> 50 MB) | Low | Medium | Compress with LZ4; prompt users to export ZIP before limit |

---

## 10. OUT OF SCOPE (v1.0)

The following are explicitly deferred to maintain v1.0 focus and quality:

- ❌ Real-time collaboration and multiplayer cursors → v2.0
- ❌ In-browser code execution / WebContainers runtime → v2.5
- ❌ Git blame, diff view, or merge conflict resolution UI → v1.5
- ❌ Plugin / extension marketplace → post-v3.0
- ❌ Desktop Electron or native mobile app wrappers → revisit after v2.0
- ❌ Video or voice calls integrated into the IDE → post-v3.0
- ❌ Custom AI model fine-tuning or BYOM → Enterprise roadmap

---

## 11. KEYBOARD SHORTCUT REFERENCE

| Action | Windows / Linux | macOS |
|---|---|---|
| Save File | `Ctrl + S` | `Cmd + S` |
| Find in File | `Ctrl + F` | `Cmd + F` |
| Global Search | `Ctrl + Shift + F` | `Cmd + Shift + F` |
| Toggle Terminal | `Ctrl + `` ` | `Ctrl + `` ` |
| Toggle AI Panel | `Ctrl + I` | `Cmd + I` |
| Toggle File Explorer | `Ctrl + B` | `Cmd + B` |
| Command Palette | `Ctrl + Shift + P` | `Cmd + Shift + P` |
| New File | `Ctrl + N` | `Cmd + N` |
| Close Tab | `Ctrl + W` | `Cmd + W` |
| Switch Tab Right | `Ctrl + Tab` | `Ctrl + Tab` |
| Add Cursor Below | `Ctrl + Alt + Down` | `Cmd + Opt + Down` |
| Select All Occurrences | `Ctrl + Shift + L` | `Cmd + Shift + L` |
| Toggle Comment | `Ctrl + /` | `Cmd + /` |
| Indent Line | `Tab` | `Tab` |
| Unindent Line | `Shift + Tab` | `Shift + Tab` |
| Zoom In | `Ctrl + =` | `Cmd + =` |
| Zoom Out | `Ctrl + -` | `Cmd + -` |

---

## 12. OPEN QUESTIONS

| # | Question | Owner | Due |
|---|---|---|---|
| 1 | Should v1.0 use Monaco Editor or the custom textarea + overlay approach? | Engineering Lead | Week 3 |
| 2 | What is the per-user monthly AI token budget for the Free tier? | Finance + Product | Week 2 |
| 3 | Will the Anthropic API proxy be multi-region from day 1 for latency? | Infrastructure | Week 4 |
| 4 | Should we open-source the editor core to drive community contributions? | CEO + Legal | Month 2 |
| 5 | iOS App Store PWA listing: is it worth submitting a WKWebView wrapper? | Mobile Lead | Month 3 |
| 6 | Which analytics platform respects EU GDPR for user event tracking? | Data + Legal | Week 4 |

---

*ORBIT IDE · PRD Digest & SOP Reference · v1.0 · March 2026*
*CONFIDENTIAL — INTERNAL USE ONLY*
*© 2026 ORBIT IDE. All rights reserved.*
