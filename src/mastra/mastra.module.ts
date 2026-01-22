import { MastraStorage } from '@mastra/core'
import { ContextModule } from '@nest-me-up/common'
import { Module } from '@nestjs/common'
import { MASTRA_STORAGE_PROVIDER } from './mastra.constants'
import { MastraService } from './mastra.service'

@Module({
  imports: [ContextModule],
  providers: [
    {
      provide: MASTRA_STORAGE_PROVIDER,
      useValue: null,
    },
    MastraService,
  ],
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
