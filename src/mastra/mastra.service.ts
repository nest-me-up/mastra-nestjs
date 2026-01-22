import { Mastra, MastraStorage, Workflow } from '@mastra/core'
import { Agent } from '@mastra/core/agent'
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { AgentRegistration, MastraConfig, WorkflowRegistration } from './mastra.interface'
import { MastraLoggerWrapper } from './mastra.logger'
import { MASTRA_STORAGE_PROVIDER } from './mastra.module'

@Injectable()
export class MastraService implements OnApplicationBootstrap {
  private mastra: Mastra = null
  private readonly config: MastraConfig
  private readonly agents: Record<string, Agent> = {}
  private readonly workflows: Record<string, Workflow> = {}
  constructor(
    @InjectPinoLogger(MastraService.name)
    private readonly logger: PinoLogger,
    @Inject(MASTRA_STORAGE_PROVIDER)
    private readonly storage: MastraStorage,
    private readonly configService: ConfigService,
  ) {
    this.config = configService.get<MastraConfig>('mastra')
  }

  public getMastraInstance(): Mastra {
    return this.mastra
  }

  public getStorage(): MastraStorage {
    return this.storage
  }

  public registerAgent(agentRegistration: AgentRegistration) {
    if (this.mastra) {
      throw new Error('Mastra is already initialized, cannot register new agents after initialization')
    }

    this.logger.info('Mastra: Registering agent: %s', agentRegistration.name)
    this.agents[agentRegistration.name] = agentRegistration.agent
  }

  public registerWorkflow(workflowRegistration: WorkflowRegistration) {
    if (this.mastra) {
      throw new Error('Mastra is already initialized, cannot register new workflows after initialization')
    }

    this.logger.info('Mastra: Registering workflow: %s', workflowRegistration.id)
    this.workflows[workflowRegistration.id] = workflowRegistration.workflow
  }

  public getAgent(name: string): Agent {
    return this.mastra.getAgent(name)
  }

  public getAgents(): Record<string, Agent> {
    return this.mastra.getAgents()
  }

  public getWorkflows(): Record<string, Workflow> {
    return this.mastra.getWorkflows()
  }

  onApplicationBootstrap() {
    this.logger.info('Mastra: Initializing Mastra (storage: %s)', this.storage ? 'Yes' : 'No')

    this.mastra = new Mastra({
      agents: this.agents,
      workflows: this.workflows,
      storage: this.storage,
      logger: new MastraLoggerWrapper(this.logger, this.config.logger?.level || 'debug'),
    })

    this.logger.info('Mastra: Mastra initialized')
  }
}
