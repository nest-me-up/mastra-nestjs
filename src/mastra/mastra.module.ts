import { ContextModule } from '@nest-me-up/common'
import { Module } from '@nestjs/common'
import { MastraService } from './mastra.service'
import { MastraStorage } from '@mastra/core'

export const MASTRA_STORAGE_PROVIDER = 'MASTRA_STORAGE'
@Module({
  imports: [ContextModule],
  providers: [MastraService],
  exports: [MastraService],
})
export class MastraModule {
  static forRoot(options?: { mastraStorage?: MastraStorage }) {
    return {
      module: MastraModule,
      imports: [ContextModule],
      providers: [
        {
          provide: MASTRA_STORAGE_PROVIDER,
          useValue: options?.mastraStorage ?? null,
        },
        MastraService,
      ],
      exports: [MastraService],
    }
  }
}
