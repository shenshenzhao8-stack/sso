 

 
# Frontend-FusionHub (personal-center 人力资源子系统)
 

## 特性

*   **最新技术栈**：使用 Vue3 + vite5 + vueRouter + pina 等前端前沿技术开发
*   **TypeScript**: 应用程序级 JavaScript 的语言
*   **主题**: 可配置的主题
*   **自定义数据** 内置 Mock 数据方案
*   **权限** 内置完善的动态路由权限生成方案
*   **组件** 二次封装了多个常用的组件
*   **示例** 内置丰富的示例

## 前序准备

*   [node](http://nodejs.org/) 和 [git](https://git-scm.com/) - 项目开发环境
*   [Vite](https://vitejs.dev/) - 熟悉 vite 特性
*   [Vue3](https://v3.vuejs.org/) - 熟悉 Vue 基础语法
*   [TypeScript](https://www.typescriptlang.org/) - 熟悉 `TypeScript` 基本语法
*   [Es6+](http://es6.ruanyifeng.com/) - 熟悉 es6 基本语法
*   [Vue-Router-Next](https://next.router.vuejs.org/) - 熟悉 vue-router 基本使用
*   [Element-Plus](https://element-plus.org/) - element-plus 基本使用
*   [Mock.js](https://github.com/nuysoft/Mock) - mockjs 基本语法
*   [UnoCSS](https://unocss.dev/) - 熟悉 UnoCSS 即时按需原子 CSS 引擎

## 安装和使用

*   获取代码

```bash
git clone https://e.coding.net/cecilleo/YiDa-Internal-Systems/Frontend-FusionHub.git
```

*   安装依赖

```bash
cd Frontend-FusionHub

npm run install:all
```

*   运行

```bash
cd packages/human-resources
npm run dev
```

*   打包

```bash
# 开发环境
npm run build dev

# 测试环境
npm run build test

# 生产环境
npm run build pro
```

*   提交代码

```bash
git add .

npx cz
```

*   版本更新

```bash
npm run release
```

*   项目依赖更新

```bash
npm run npm-check
```



**Pull Request:**

1. Fork 代码
2. 创建自己的分支: `git checkout -b feat/xxxx`
3. 提交你的修改: `git commit -am 'feat(function): add xxxxx'`
4. 推送您的分支: `git push origin feat/xxxx`
5. 提交 `pull request`

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

