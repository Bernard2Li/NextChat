# NextChat Node.js 后端架构设计

## 1. 整体架构概述

### 1.1 架构风格
- **分层架构**：采用经典的分层架构设计，清晰分离关注点
- **微服务潜力**：设计时考虑未来可能的微服务拆分
- **RESTful API**：遵循RESTful设计原则
- **实时通信**：支持WebSocket用于流式响应

### 1.2 核心组件

```
客户端 → API网关 → 控制器层 → 服务层 → 数据访问层 → 数据库
                   ↓            ↓
                认证中间件    外部服务集成(LLM提供商)
```

## 2. 数据库设计

### 2.1 主要实体

#### 用户表 (users)
```
id: UUID (主键)
username: VARCHAR(50) (唯一, 用户名)
email: VARCHAR(255) (唯一, 邮箱)
password_hash: VARCHAR(255) (哈希后的密码)
avatar: VARCHAR(255) (头像URL)
role: ENUM ('admin', 'user', 'guest') (用户角色)
access_level: INTEGER (访问级别)
created_at: TIMESTAMP (创建时间)
updated_at: TIMESTAMP (更新时间)
last_login_at: TIMESTAMP (最后登录时间)
```

#### 会话表 (sessions)
```
id: UUID (主键)
user_id: UUID (外键, 关联users表)
title: VARCHAR(255) (会话标题)
description: TEXT (会话描述)
model_config: JSONB (模型配置，包含provider、model等)
created_at: TIMESTAMP (创建时间)
updated_at: TIMESTAMP (更新时间)
last_used_at: TIMESTAMP (最后使用时间)
tags: TEXT[] (标签数组)
```

#### 消息表 (messages)
```
id: UUID (主键)
session_id: UUID (外键, 关联sessions表)
role: ENUM ('system', 'user', 'assistant', 'tool') (消息角色)
content: TEXT (消息内容)
content_type: ENUM ('text', 'image', 'audio') (内容类型)
metadata: JSONB (消息元数据)
created_at: TIMESTAMP (创建时间)
updated_at: TIMESTAMP (更新时间)
token_count: INTEGER (令牌数量)
tool_call: JSONB (工具调用信息)
tool_response: JSONB (工具响应信息)
```

#### API密钥表 (api_keys)
```
id: UUID (主键)
user_id: UUID (外键, 关联users表)
provider: VARCHAR(50) (提供商名称)
api_key: TEXT (加密存储的API密钥)
api_key_hash: VARCHAR(255) (用于验证的API密钥哈希)
display_name: VARCHAR(255) (显示名称)
is_active: BOOLEAN (是否激活)
created_at: TIMESTAMP (创建时间)
expires_at: TIMESTAMP (过期时间)
last_used_at: TIMESTAMP (最后使用时间)
usage_count: INTEGER (使用次数)
```

#### 访问码表 (access_codes)
```
id: UUID (主键)
code_hash: VARCHAR(255) (哈希后的访问码)
is_active: BOOLEAN (是否激活)
created_at: TIMESTAMP (创建时间)
expires_at: TIMESTAMP (过期时间)
usage_count: INTEGER (使用次数)
max_usage: INTEGER (最大使用次数)
created_by: UUID (外键, 关联users表)
```

#### 使用统计表格 (usage_stats)
```
id: UUID (主键)
user_id: UUID (外键, 关联users表)
model: VARCHAR(100) (模型名称)
prompt_tokens: INTEGER (提示令牌数)
completion_tokens: INTEGER (完成令牌数)
total_tokens: INTEGER (总令牌数)
cost: DECIMAL(10,6) (费用)
created_at: TIMESTAMP (创建时间)
session_id: UUID (外键, 关联sessions表)
```

## 3. 认证系统设计

### 3.1 认证流程
1. **JWT认证**：使用JSON Web Token进行无状态认证
2. **多级认证**：支持用户名密码、API密钥、访问码等多种认证方式
3. **OAuth2集成**：支持第三方登录（可选）

### 3.2 访问控制
- **基于角色的访问控制(RBAC)**
- **基于API密钥的权限控制**
- **细粒度的操作权限**

### 3.3 安全措施
- **密码哈希**：使用bcrypt等算法进行密码哈希
- **API密钥加密存储**：加密存储所有敏感凭证
- **请求限流**：防止滥用
- **输入验证和清理**：防止SQL注入、XSS等攻击

## 4. API设计

### 4.1 主要端点设计

#### 用户管理
```
POST /api/users - 创建用户
GET /api/users/:id - 获取用户信息
PUT /api/users/:id - 更新用户信息
DELETE /api/users/:id - 删除用户
```

#### 认证
```
POST /api/auth/login - 用户登录
POST /api/auth/logout - 用户登出
POST /api/auth/refresh - 刷新令牌
POST /api/auth/access-code - 验证访问码
```

#### 会话管理
```
GET /api/sessions - 获取会话列表
POST /api/sessions - 创建新会话
GET /api/sessions/:id - 获取会话详情
PUT /api/sessions/:id - 更新会话
DELETE /api/sessions/:id - 删除会话
```

#### 消息管理
```
GET /api/sessions/:sessionId/messages - 获取消息列表
POST /api/sessions/:sessionId/messages - 创建消息
PUT /api/messages/:id - 更新消息
DELETE /api/messages/:id - 删除消息
```

#### LLM集成
```
POST /api/chat/completions - 聊天完成
POST /api/chat/stream - 流式聊天完成
GET /api/models - 获取可用模型列表
GET /api/usage - 获取使用统计
```

#### API密钥管理
```
GET /api/api-keys - 获取API密钥列表
POST /api/api-keys - 创建API密钥
DELETE /api/api-keys/:id - 删除API密钥
PUT /api/api-keys/:id/active - 激活/禁用API密钥
```

#### 系统配置
```
GET /api/config - 获取系统配置
PUT /api/config - 更新系统配置 (管理员)
```

### 4.2 中间件设计
- **认证中间件**：验证用户身份和权限
- **日志中间件**：记录请求和响应
- **错误处理中间件**：统一错误处理
- **限流中间件**：限制API调用频率
- **CORS中间件**：处理跨域请求

## 5. LLM服务集成

### 5.1 提供商抽象层
创建统一的LLM服务接口，支持多种提供商：
- OpenAI
- Azure OpenAI
- Google Gemini
- Anthropic Claude
- 百度文心一言
- 字节跳动Doubao
- 阿里通义千问
- 其他支持的提供商

### 5.2 模型配置管理
- 统一的模型配置接口
- 模型能力和限制管理
- 动态模型路由

### 5.3 请求处理流程
1. 验证用户身份和权限
2. 检查API密钥有效性
3. 路由到合适的提供商服务
4. 处理请求和响应
5. 记录使用统计

## 6. 缓存与性能优化

### 6.1 缓存策略
- Redis缓存频繁访问的数据
- 会话和消息缓存
- API响应缓存

### 6.2 性能优化
- 数据库索引优化
- 查询优化
- 异步处理
- 并行请求

## 7. 日志和监控

### 7.1 日志系统
- 请求/响应日志
- 错误日志
- 操作日志
- 性能日志

### 7.2 监控系统
- API使用量监控
- 错误率监控
- 响应时间监控
- 系统资源监控

## 8. 扩展性考虑

### 8.1 水平扩展
- 无状态设计
- 负载均衡
- 数据库分片考虑

### 8.2 微服务拆分
- 认证服务
- 用户服务
- 会话服务
- LLM集成服务
- 监控服务

### 8.3 插件系统
- 可扩展的插件架构
- 自定义功能集成
- 第三方服务集成

## 9. 部署与运维

### 9.1 部署选项
- Docker容器化
- Kubernetes编排
- 传统服务器部署

### 9.2 CI/CD流程
- 自动化测试
- 自动化构建
- 自动化部署

### 9.3 备份与恢复
- 数据库定期备份
- 配置备份
- 灾难恢复计划

## 10. 安全性考虑

### 10.1 数据安全
- 敏感数据加密
- 传输加密
- 数据访问控制

### 10.2 应用安全
- 漏洞扫描
- 安全审计
- 入侵检测

### 10.3 合规性
- 隐私政策
- 数据处理协议
- 必要的合规认证
