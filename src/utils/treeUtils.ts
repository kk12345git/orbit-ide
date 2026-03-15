export interface TreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: TreeNode[]
}

export function buildTree(files: { path: string; name: string }[]): TreeNode[] {
  const root: TreeNode[] = []
  const map: Record<string, TreeNode> = {}

  files.forEach(file => {
    const parts = file.path.split('/')
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isFile = index === parts.length - 1

      if (!map[currentPath]) {
        const node: TreeNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
        }
        if (!isFile) node.children = []

        map[currentPath] = node

        if (index === 0) {
          root.push(node)
        } else {
          const parentPath = parts.slice(0, index).join('/')
          if (map[parentPath]) {
            map[parentPath].children?.push(node)
          }
        }
      } else if (isFile) {
          // If it's a file but somehow marked as folder before (unlikely with valid paths)
          map[currentPath].type = 'file';
          delete map[currentPath].children;
      }
    })
  })

  // Sort: Folders first, then alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
    nodes.forEach(node => {
      if (node.children) sortNodes(node.children)
    })
  }

  sortNodes(root)
  return root
}

export function getParentPath(path: string): string {
  const parts = path.split('/')
  if (parts.length <= 1) return ''
  return parts.slice(0, -1).join('/')
}
