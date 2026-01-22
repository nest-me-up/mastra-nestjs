import { Workflow } from '@mastra/core'
import { Agent } from '@mastra/core/agent'

export interface MastraConfig {
  logger: {
    level: string
  }
}

export interface AgentRegistration {
  name: string
  agent: Agent
}

export interface WorkflowRegistration {
  id: string
  workflow: Workflow
}
