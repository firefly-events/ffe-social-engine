export interface ContentSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  platforms: string[]
  rootNode: ContentNode
}

export interface ContentNode {
  id: string
  parentId: string | null
  content: {
    text: string
    imageUrl?: string
    audioUrl?: string
    videoUrl?: string
  }
  metadata: {
    aiModel: string
    prompt: string
    platform: string
    generatedAt: Date
  }
  status: 'draft' | 'approved' | 'posted' | 'archived'
  isTrunk: boolean // true = on the main branch lineage
  children: ContentNode[]
}

export type NodeStatus = ContentNode['status']

export interface CompareTarget {
  nodeId: string
  sessionId: string
}

export interface ForkOptions {
  changeType: 'prompt' | 'model' | 'platform' | 'style'
  value: string
}
