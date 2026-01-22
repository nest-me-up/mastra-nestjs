# @nest-me-up/mastra-nestjs

A NestJS module for integrating the [Mastra](https://mastra.ai/) framework seamlessly into your NestJS applications.

## Goal

The goal of this package is to provide an idiomatic NestJS wrapper for Mastra, allowing you to:
- Register agents and workflows using NestJS dependency injection.
- Configure Mastra storage and memory through NestJS configuration.
- Expose Mastra's server capabilities within a NestJS/Express bootstrap process.
- Leverage Mastra's orchestration and agentic capabilities alongside NestJS features.

## Installation

```bash
npm install @nest-me-up/mastra-nestjs
```

## Peer Dependencies

This package requires the following peer dependencies to be installed in your project:

```json
{
  "peerDependencies": {
    "@mastra/client-js": ">=0.12.0",
    "@mastra/core": ">=0.20.0",
    "@mastra/loggers": ">=0.10.0",
    "@mastra/memory": ">=0.15.0",
    "@nest-me-up/common": ">=1.0.0"
  }
}
```

## Getting Started

### 1. Configuration

The `MastraModule` expects a `mastra` configuration object to be available via NestJS `ConfigService`. You can define this in your YAML configuration file.

```yaml
# config.yaml
mastra:
  logger:
    level: debug
```

### 2. Registering the Module

Import the `MastraModule` into your root `AppModule`. You can use `forRoot` to provide a global storage implementation. Ensure you load your YAML configuration using `ConfigModule`.

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MastraModule } from '@nest-me-up/mastra-nestjs';
import { PostgresStorage } from '@mastra/core';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        () => {
          return yaml.load(readFileSync(join(__dirname, 'config.yaml'), 'utf8')) as Record<string, any>;
        },
      ],
      isGlobal: true,
    }),
    MastraModule.forRoot({
      // Optional: provide custom storage implementation (supports memory)
      mastraStorage: new PostgresStorage({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
  ],
})
export class AppModule {}
```

### 3. Registering Agents and Workflows

Register agents and workflows by injecting `MastraService` in your module's initialization phase (e.g., in a service's constructor or onModuleInit ).

**Note:** Registration must occur before the `OnApplicationBootstrap` lifecycle hook (where the `Mastra` instance is initialized).

```typescript
import { Injectable } from '@nestjs/common';
import { MastraService } from '@nest-me-up/mastra-nestjs';
import { Agent } from '@mastra/core/agent';
import { Workflow, Step } from '@mastra/core/workflows';

@Injectable()
export class MyMastraRegistry {
  constructor(private readonly mastraService: MastraService) {
    this.registerAgent();
    this.registerWorkflow();
  }

  private registerAgent() {
    const agent = new Agent({
      name: 'WeatherAgent',
      instructions: 'You are a weather assistant.',
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4o',
      },
    });

    this.mastraService.registerAgent({
      name: 'WeatherAgent',
      agent,
    });
  }

  private registerWorkflow() {
    const workflow = new Workflow({
      id: 'my-workflow',
      trigger: {
        type: 'manual',
      },
    });

    workflow.step(new Step({ id: 'step1', execute: async () => ({ ok: true }) }));

    this.mastraService.registerWorkflow({
      id: 'my-workflow',
      workflow,
    });
  }
}
```

### 4. Memory with Mastra

Mastra uses the provided `storage` to persist memory. To enable memory features, ensure you pass a storage implementation (like `PostgresStorage` or `SQLiteStorage`) to `MastraModule.forRoot()`.

When defining an agent, you can then enable memory support:

```typescript
const agent = new Agent({
  name: 'Assistant',
  instructions: '...',
  model: { ... },
  memory: {
    // Memory is handled by the storage provided in MastraModule
  }
});
```

## Bootstrapping with MastraServer

To expose Mastra's API endpoints (e.g., for CopilotKit or the Mastra UI), register the `MastraServer` from `@mastra/express` in your `main.ts`.

```typescript
import { NestFactory } from '@nestjs/core';
import { MastraServer } from '@mastra/express';
import { MastraService } from '@nest-me-up/mastra-nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize the NestJS application (triggers OnApplicationBootstrap)
  await app.init();

  // Get the Mastra instance from the service
  const mastraService = app.get(MastraService);
  const mastra = mastraService.getMastraInstance();

  // Attach MastraServer to the Express instance
  const expressApp = app.getHttpAdapter().getInstance();
  const mastraServer = new MastraServer({
    app: expressApp,
    mastra,
    prefix: '/api/mastra', // Optional: customize the route prefix
  });

  await mastraServer.init();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

## License

MIT
