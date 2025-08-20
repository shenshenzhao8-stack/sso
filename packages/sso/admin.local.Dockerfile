# 使用 Nginx 作为生产环境的 Web 服务器
FROM nginx:stable-alpine

# 将构建的前端项目从上一阶段复制到 Nginx 的默认静态资源目录
COPY dist /usr/share/nginx/html

# 复制自定义的 Nginx 配置文件（可选）
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露 Nginx 的默认端口
EXPOSE 3501

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
