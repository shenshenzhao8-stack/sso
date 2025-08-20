# 使用官方的 Node.js 镜像作为基础镜像
# FROM m.daocloud.io/docker.io/library/node:21-alpine AS build
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:21-alpine3.19 AS build

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 或 yarn.lock 复制到容器中
COPY package*.json ./

# 安装项目依赖
RUN npm install --registry=https://mirrors.tencent.com/npm/
# RUN npm install

# 复制项目的所有文件到工作目录
COPY . .

# 构建前端项目（假设使用 npm 的构建命令是 build，具体可以根据项目调整）
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build test

# 使用 Nginx 作为生产环境的 Web 服务器
FROM nginx:stable-alpine

# 将构建的前端项目从上一阶段复制到 Nginx 的默认静态资源目录
COPY --from=build /app/dist-test /usr/share/nginx/html

# 复制自定义的 Nginx 配置文件（可选）
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露 Nginx 的默认端口
EXPOSE 3100

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
