import { openDB, DBSchema, IDBPDatabase } from 'idb'

// ==================== Schema ====================
interface OrbitSchema extends DBSchema {
  files: {
    key: string   // full path: "project-id/src/index.ts"
    value: {
      path: string
      name: string
      content: string
      language: string
      lastModified: number
      projectId: string
    }
    indexes: { 'by-project': string }
  }
  projects: {
    key: string   // project id
    value: {
      id: string
      name: string
      createdAt: number
      activeFilePath: string | null
    }
  }
  recents: {
    key: string   // file path
    value: {
      filePath: string
      name: string
      accessedAt: number
    }
  }
}

const DB_NAME = 'orbit-ide'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<OrbitSchema>> | null = null

function getDB(): Promise<IDBPDatabase<OrbitSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<OrbitSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const fileStore = db.createObjectStore('files', { keyPath: 'path' })
        fileStore.createIndex('by-project', 'projectId')
        db.createObjectStore('projects', { keyPath: 'id' })
        db.createObjectStore('recents', { keyPath: 'filePath' })
      }
    })
  }
  return dbPromise
}

// ==================== Projects ====================
export async function createProject(name: string, id?: string): Promise<string> {
  const db = await getDB()
  const projectId = id ?? `proj-${Date.now()}`
  await db.put('projects', { id: projectId, name, createdAt: Date.now(), activeFilePath: null })
  return projectId
}

export async function getAllProjects() {
  const db = await getDB()
  return db.getAll('projects')
}

export async function setProjectActiveFile(projectId: string, filePath: string | null) {
  const db = await getDB()
  const project = await db.get('projects', projectId)
  if (project) {
    await db.put('projects', { ...project, activeFilePath: filePath })
  }
}

// ==================== Files ====================
export async function createFile(
  projectId: string,
  name: string,
  content = '',
  language = detectLanguage(name)
): Promise<string> {
  const db = await getDB()
  const path = `${projectId}/${name}`
  await db.put('files', { path, name, content, language, lastModified: Date.now(), projectId })
  return path
}

export async function readFile(path: string): Promise<string | null> {
  const db = await getDB()
  const file = await db.get('files', path)
  return file?.content ?? null
}

export async function updateFile(path: string, content: string): Promise<void> {
  const db = await getDB()
  const file = await db.get('files', path)
  if (file) {
    await db.put('files', { ...file, content, lastModified: Date.now() })
  }
}

export async function renameFile(oldPath: string, newName: string): Promise<string> {
  const db = await getDB()
  const file = await db.get('files', oldPath)
  if (!file) throw new Error(`File not found: ${oldPath}`)
  const newPath = oldPath.replace(/[^/]+$/, newName)
  await db.delete('files', oldPath)
  await db.put('files', { ...file, path: newPath, name: newName, language: detectLanguage(newName) })
  return newPath
}

export async function deleteFile(path: string): Promise<void> {
  const db = await getDB()
  await db.delete('files', path)
}

export async function listFiles(projectId: string) {
  const db = await getDB()
  return db.getAllFromIndex('files', 'by-project', projectId)
}

// ==================== Recents ====================
export async function addRecent(filePath: string, name: string): Promise<void> {
  const db = await getDB()
  await db.put('recents', { filePath, name, accessedAt: Date.now() })
  // Keep only 10
  const all = (await db.getAll('recents')).sort((a, b) => b.accessedAt - a.accessedAt)
  for (const old of all.slice(10)) {
    await db.delete('recents', old.filePath)
  }
}

export async function getRecents() {
  const db = await getDB()
  const all = await db.getAll('recents')
  return all.sort((a, b) => b.accessedAt - a.accessedAt).slice(0, 10)
}

// ==================== Language detection ====================
const EXT_MAP: Record<string, string> = {
  js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
  py: 'python', css: 'css', scss: 'scss', html: 'html',
  json: 'json', md: 'markdown', sql: 'sql', sh: 'bash',
  bash: 'bash', rs: 'rust', go: 'go', txt: 'text',
}

export function detectLanguage(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return EXT_MAP[ext] ?? 'text'
}

// ==================== Default project initialization ====================
const WELCOME_CONTENT = `// Welcome to ORBIT IDE 🛸
// Zero-Gravity Coding — Anywhere, Any Device

function greet(name) {
  return \`Hello, \${name}! Let's build something great.\`;
}

console.log(greet('World'));
`

export async function ensureDefaultProject(): Promise<{ projectId: string; activeFilePath: string }> {
  const projects = await getAllProjects()
  if (projects.length > 0) {
    const project = projects[0]
    const files = await listFiles(project.id)
    const activeFilePath = project.activeFilePath ?? files[0]?.path ?? ''
    return { projectId: project.id, activeFilePath }
  }
  // Create welcome project
  const projectId = await createProject('My Project')
  const filePath = await createFile(projectId, 'index.js', WELCOME_CONTENT)
  await createFile(projectId, 'README.md', '# My Project\n\nBuilt with ORBIT IDE 🛸\n')
  await setProjectActiveFile(projectId, filePath)
  return { projectId, activeFilePath: filePath }
}
