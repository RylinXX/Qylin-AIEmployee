# 麒麟智雇 Qylin-AIEmployee · 智能招聘与面试分析引擎
**Qylin-AIEmployee** · 智能数字员工、简历批量解析与人才知识资产管理中台。

面向团队智能招聘与业务知识沉淀场景，提供 AI 简历结构化解析、智能评分筛选、职位多维匹配、邮件自动收取以及企业知识库检索复核全流程闭环能力。

[线上访问入口](https://ai.etgq.com/) · [安全说明](SECURITY.md) · [开发协作](CONTRIBUTING.md)

## 主要能力

| 模块 | 能力 |
| --- | --- |
| 知识资产 | 文件与正文入库、抽取、标签、检索、详情与来源管理 |
| 人才样本 | 简历上传、邮箱导入、解析、评分筛选、职位筛选与分页 |
| 系统配置 | 模型与业务设置、账号管理、导入配置 |
| 历史业务模块 | 方案生成、客户项目等代码保留，启用范围以当前路由为准 |

AI 解析、评分和生成内容是辅助结果，应由人员复核，不能作为未经复核的招聘或客户交付结论。

## 技术结构

- 前端：React、TypeScript、Vite、Ant Design。
- 后端：FastAPI、SQLAlchemy、Alembic。
- 数据：PostgreSQL；测试按项目配置使用隔离数据库。
- 文档处理、模型调用和邮箱导入依赖相应服务及凭据。

```text
frontend/       页面、路由、状态与前端测试
backend/        接口、服务、数据模型、迁移和测试
docs/           业务与开发说明
scripts/        开发及部署辅助工具
docker-compose.server.yml  服务器部署配置
```

## 开发与验证

需要 Python 3.11+、Node.js 20+，数据库及可选音频工具按实际功能配置。先阅读环境变量示例，为开发环境配置独立数据库、随机会话密钥和管理员凭据，不得复用线上账号或数据。

```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# 配置独立开发数据库后执行迁移
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

另一个终端：

```sh
cd frontend
npm ci
npm run dev
```

前端检查：`npm run test:layout`、`npm run build`。后端测试见 `backend/tests/`；不要对生产数据库运行测试或迁移实验。

## 部署与数据保护

线上域名为 `ai.etgq.com`。当前由容器化前后端提供服务；代码目录、数据库和上传卷必须分别管理。禁止把服务器的环境变量文件、简历、邮箱内容、上传材料、日志或数据库提交到 Git。

更新前备份数据库和上传卷，核对迁移，再发布代码。当前仓库主线与线上业务代码核对一致，服务器残留的旧路由测试与备份文件不覆盖较新的主线。IP 地址上的旧面试服务是历史部署，不能反向覆盖本工作台。

本次仓库整理不修改线上配置、数据或访问权限。许可及来源记录见 `LICENSE`。
