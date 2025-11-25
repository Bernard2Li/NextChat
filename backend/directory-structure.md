# NextChat 后端目录结构

## 1. 整体目录结构

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── validators/
│   ├── config/
│   ├── core/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── logger/
│   │   ├── monitoring/
│   │   └── security/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   │   ├── llm/
│   │   ├── user/
│   │   ├── session/
│   │   └── message/
│   ├── utils/
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── docker/
├── .env.example
├── .env.development
├── .env.test
├── .env.production
├── package.json
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── nodemon.json
└── README.md
```

## 2. 目录详细说明

### 2.1 src/
主源码目录，包含所有应用代码。

#### 2.1.1 src/api/
API层，处理HTTP请求和响应。

##### 2.1.1.1 src/api/controllers/
控制器，负责处理请求逻辑和调用服务层。
```
controllers/
├── auth.controller.ts
├── user.controller.ts
├── session.controller.ts
├── message.controller.ts
├── api-key.controller.ts
├── chat.controller.ts
└── config.controller.ts
```

##### 2.1.1.2 src/api/middleware/
中间件，处理跨域、认证、日志等横切关注点。
```
middleware/
├── auth.middleware.ts
├── cors.middleware.ts
├── error.middleware.ts
├── logger.middleware.ts
├── rate-limit.middleware.ts
└── validation.middleware.ts
```

##### 2.1.1.3 src/api/routes/
路由定义，映射URL到控制器。
```
routes/
├── auth.routes.ts
├── user.routes.ts
├── session.routes.ts
├── message.routes.ts
├── api-key.routes.ts
├── chat.routes.ts
├── config.routes.ts
└── index.ts
```

##### 2.1.1.4 src/api/validators/
请求验证器，确保输入数据的合法性。
```
validators/
├── auth.validators.ts
├── user.validators.ts
├── session.validators.ts
├── message.validators.ts
└── api-key.validators.ts
```

#### 2.1.2 src/config/
配置管理，处理环境变量和应用配置。
```
config/
├── index.ts
├── database.config.ts
├── server.config.ts
├── security.config.ts
└── logging.config.ts
```

#### 2.1.3 src/core/
核心功能模块，提供基础服务。

##### 2.1.3.1 src/core/auth/
认证相关功能，包括JWT、密码处理等。
```
auth/
├── jwt.service.ts
├── password.service.ts
├── oauth.service.ts
└── access-control.service.ts
```

##### 2.1.3.2 src/core/database/
数据库连接和ORM配置。
```
database/
├── connection.ts
├── migrations/
├── seeds/
└── transaction-manager.ts
```

##### 2.1.3.3 src/core/logger/
日志系统配置和实现。
```
logger/
├── index.ts
├── console.logger.ts
├── file.logger.ts
└── winston.config.ts
```

##### 2.1.3.4 src/core/monitoring/
监控和指标收集。
```
monitoring/
├── metrics.service.ts
├── prometheus.config.ts
└── health-check.service.ts
```

##### 2.1.3.5 src/core/security/
安全相关功能，如加密、解密等。
```
security/
├── encryption.service.ts
├── sanitization.service.ts
└── csrf.service.ts
```

#### 2.1.4 src/models/
数据模型定义，使用TypeORM或其他ORM。
```
models/
├── user.model.ts
├── session.model.ts
├── message.model.ts
├── api-key.model.ts
├── access-code.model.ts
└── usage-stat.model.ts
```

#### 2.1.5 src/repositories/
数据访问层，封装数据库操作。
```
repositories/
├── user.repository.ts
├── session.repository.ts
├── message.repository.ts
├── api-key.repository.ts
└── usage-stat.repository.ts
```

#### 2.1.6 src/services/
业务逻辑层，处理核心业务逻辑。

##### 2.1.6.1 src/services/llm/
LLM集成服务，处理与各提供商的通信。
```
llm/
├── llm.service.ts
├── providers/
│   ├── base-provider.ts
│   ├── openai-provider.ts
│   ├── azure-provider.ts
│   ├── google-provider.ts
│   ├── anthropic-provider.ts
│   └── baidu-provider.ts
├── model-registry.ts
└── token-counter.ts
```

##### 2.1.6.2 src/services/user/
用户相关业务逻辑。
```
user/
├── user.service.ts
├── profile.service.ts
└── role.service.ts
```

##### 2.1.6.3 src/services/session/
会话相关业务逻辑。
```
session/
├── session.service.ts
└── session-history.service.ts
```

##### 2.1.6.4 src/services/message/
消息相关业务逻辑。
```
message/
├── message.service.ts
├── message-validator.service.ts
└── message-formatter.service.ts
```

#### 2.1.7 src/utils/
通用工具函数和辅助方法。
```
utils/
├── date-utils.ts
├── string-utils.ts
├── error-utils.ts
├── response-utils.ts
└── validation-utils.ts
```

#### 2.1.8 src/app.ts
应用入口文件，设置Express/Koa/NestJS应用。

### 2.2 tests/
测试目录，包含单元测试、集成测试和端到端测试。

#### 2.2.1 tests/unit/
单元测试，测试独立的函数和组件。

#### 2.2.2 tests/integration/
集成测试，测试组件间的交互。

#### 2.2.3 tests/e2e/
端到端测试，测试整个应用流程。

### 2.3 scripts/
辅助脚本，如数据库迁移、种子数据等。
```
scripts/
├── migrate-db.ts
├── seed-db.ts
├── generate-api-docs.ts
└── build-scripts.ts
```

### 2.4 docker/
Docker相关配置。
```
docker/
├── Dockerfile
└── docker-compose.yml
```

## 3. 代码组织原则

### 3.1 分层架构
严格遵循分层架构，各层职责清晰：
- **API层**：处理HTTP请求/响应
- **服务层**：实现业务逻辑
- **数据访问层**：负责数据持久化
- **模型层**：定义数据结构

### 3.2 文件命名规范
- 使用kebab-case（短横线分隔）命名目录
- 使用camelCase（驼峰式）命名文件，对于组件类文件使用PascalCase
- 文件名与导出的主要类/函数名保持一致
- 服务、控制器、中间件等添加类型后缀

### 3.3 模块划分
- 按功能域划分模块
- 每个模块内部再按职责细分子模块
- 模块间通过明确的接口进行通信

### 3.4 依赖注入
使用依赖注入模式管理组件间依赖关系，提高代码可测试性和可维护性。

### 3.5 类型安全
全面使用TypeScript，确保类型安全，减少运行时错误。

### 3.6 错误处理
统一的错误处理机制，按错误类型和严重程度分类处理。

## 4. 示例文件结构与内容

### 4.1 控制器示例 (auth.controller.ts)
```typescript
import { Request, Response } from 'express';
import { AuthService } from '../../services/user/auth.service';
import { LoginDto, RegisterDto } from '../../api/validators/auth.validators';

class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request<{}, {}, LoginDto>, res: Response) {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    return res.json(result);
  }

  async register(req: Request<{}, {}, RegisterDto>, res: Response) {
    const userData = req.body;
    const result = await this.authService.register(userData);
    return res.status(201).json(result);
  }

  async logout(req: Request, res: Response) {
    await this.authService.logout(req.user.id);
    return res.status(204).send();
  }
}

export { AuthController };
```

### 4.2 服务示例 (llm.service.ts)
```typescript
import { ModelProvider } from '../../config/enums';
import { OpenAIProvider } from './providers/openai-provider';
import { AzureProvider } from './providers/azure-provider';
import { GoogleProvider } from './providers/google-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { BaseProvider } from './providers/base-provider';

class LLMService {
  private providers: Map<ModelProvider, BaseProvider>;

  constructor() {
    this.providers = new Map();
    this.registerProviders();
  }

  private registerProviders() {
    this.providers.set(ModelProvider.OpenAI, new OpenAIProvider());
    this.providers.set(ModelProvider.Azure, new AzureProvider());
    this.providers.set(ModelProvider.Google, new GoogleProvider());
    this.providers.set(ModelProvider.Anthropic, new AnthropicProvider());
    // 注册其他提供商...
  }

  async chatCompletion(messages: any[], config: any, provider: ModelProvider) {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not supported`);
    }
    return providerInstance.chatCompletion(messages, config);
  }

  async streamCompletion(messages: any[], config: any, provider: ModelProvider) {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not supported`);
    }
    return providerInstance.streamCompletion(messages, config);
  }

  async getModels(provider: ModelProvider) {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not supported`);
    }
    return providerInstance.getModels();
  }
}

export { LLMService };
```

### 4.3 模型示例 (user.model.ts)
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: ['admin', 'user', 'guest'], default: 'user' })
  role: string;

  @Column({ default: 1 })
  accessLevel: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;
}

export { User };
```

## 5. 扩展性考虑

### 5.1 插件系统
设计可插拔的模块系统，允许动态加载功能模块：
```
plugins/
├── plugin-manager.ts
├── base-plugin.ts
├── custom-auth/
└── custom-llm/
```

### 5.2 事件系统
实现事件驱动架构，提高系统模块间的解耦度：
```
core/event/
├── event-emitter.ts
├── event-handlers/
└── event-types.ts
```

### 5.3 国际化支持
预留国际化扩展点：
```
i18n/
├── locales/
└── i18n.service.ts
```

## 6. 性能优化策略

### 6.1 缓存层
添加Redis缓存层，提高频繁访问数据的响应速度：
```
core/cache/
├── cache.service.ts
├── redis.config.ts
└── cache-strategies/
```

### 6.2 异步处理
设计异步任务处理系统，处理耗时操作：
```
core/queue/
├── queue.service.ts
├── bull.config.ts
└── job-processors/
```
