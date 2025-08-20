# Frontend-FusionHub

## 特性

* **最新技术栈**：使用 Vue3 + vite5 + vueRouter + pina 等前端前沿技术开发
* **TypeScript**: 应用程序级 JavaScript 的语言
* **主题**: 可配置的主题
* **自定义数据** 内置 Mock 数据方案
* **权限** 内置完善的动态路由权限生成方案
* **组件** 二次封装了多个常用的组件

## 前序准备

* [node](http://nodejs.org/) 和[git](https://git-scm.com/) - 项目开发环境
* [Vite](https://vitejs.dev/) - 熟悉 vite 特性
* [Vue3](https://v3.vuejs.org/) - 熟悉 Vue 基础语法
* [TypeScript](https://www.typescriptlang.org/) - 熟悉`TypeScript` 基本语法
* [Es6+](http://es6.ruanyifeng.com/) - 熟悉 es6 基本语法
* [Vue-Router-Next](https://next.router.vuejs.org/) - 熟悉 vue-router 基本使用
* [Element-Plus](https://element-plus.org/) - element-plus 基本使用
* [Mock.js](https://github.com/nuysoft/Mock) - mockjs 基本语法
* [UnoCSS](https://unocss.dev/) - 熟悉 UnoCSS 即时按需原子 CSS 引擎

## 安装和使用

* 获取代码

```bash
git clone https://e.coding.net/cecilleo/YiDa-Internal-Systems/Frontend-FusionHub.git
```

* 安装依赖

```bash
cd Frontend-FusionHub

npm run install:all
```

* 运行

```bash
npm run dev
```

* 打包
  * 这里会打包所有子项目

```bash
# 开发环境
npm run build dev

# 测试环境
npm run build test

# 生产环境
npm run build pro
```

* 提交代码

```bash
git add .

npx cz
```

* 版本更新

```bash
npm run release
```

* 项目依赖更新

```bash
npm run npm-check
```

### 子项目说明：

1. **人力资源子系统（"packages/human-resources"）**该子系统负责管理与人力资源相关的所有功能。例如员工信息管理、招聘、薪资管理、考勤等。
2. **主工程（"packages/main"）**这是核心的主工程，可能包含应用的核心功能和基础设施，其他子系统可能依赖于这个主工程，或者它是作为应用的主要入口。
3. **用户中心子系统（"packages/personal-center"）**
   该子系统主要负责管理用户相关的功能

### 启动单个子项目：

在 Lerna 中，你可以通过注释掉其他不需要启动的子项目，只启动你想开发的子系统。比如，如果你只想启动 **人力资源子系统**，可以注释掉其他子项目（主系统必须启动）：

```
"workspaces": [
  "packages/main", // 主工程
  "packages/human-resources", // 人力资源子系统
  "packages/cms", // 信息安全培训子系统
  // "packages/personal-center" // 用户中心子系统
]
```

### 使用 `lerna run dev` 启动：

- `lerna run dev` 会根据 `workspaces` 配置启动所有列出的子项目。如果你只想启动一个特定的子项目，可以注释掉不需要启动的子项目，如上所示。
- 如果你希望同时启动多个子项目，只需要保证它们没有被注释掉，就可以一同启动。
- **注释其他子项目**：在 `workspaces` 配置中只保留一个想要启动的子项目，其他的可以通过注释掉来实现。
- **`lerna run dev`**：会根据 `workspaces` 中的配置，启动所有没有被注释掉的子项目。

**Pull Request:**

1. Fork 代码
2. 创建自己的分支:`git checkout -b feat/xxxx`
3. 提交你的修改:`git commit -am 'feat(function): add xxxxx'`
4. 推送您的分支:`git push origin feat/xxxx`
5. 提交`pull request`

## Git 提交规范

- `feat`: ✨ 新增功能 | A new feature'
- `fix`: 🐛 修复缺陷 | A bug fix'
- `docs`: 📝 文档更新 | Documentation only changes'
- `style`: 💄 代码格式 | Changes that do not affect the meaning of the code'
- `refactor`: ♻️ 代码重构 | A code change that neither fixes a bug nor adds a feature'
- `perf`: ⚡️ 性能提升 | A code change that improves performance'
- `test`: ✅ 测试相关 | Adding missing tests or correcting existing tests'
- `build`: 📦️ 构建相关 | Changes that affect the build system or external dependencies'
- `ci`: 🎡 持续集成 | Changes to our CI configuration files and scripts'
- `chore`: 🔨 其他修改 | Other changes that do not modify src or test files'
- `revert`: ⏪️ 回退代码 | Revert to a commit'
