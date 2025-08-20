#!/bin/bash

CONTAINER_NAME="secure-cms-1"
IMAGE_NAME="secure-cms"

git restore .
echo "restore local change..."

git fetch -p
echo "fetch new change..."

git rebase origin/test
echo "rebase new change..."

npm install --registry=https://registry.npmmirror.com/
npm run build test

echo "Removing image: $IMAGE_NAME..."
docker rmi $IMAGE_NAME

echo "Building image: $IMAGE_NAME..."
docker build -f ./admin.local.Dockerfile -t $IMAGE_NAME .

echo "Stopping container: $CONTAINER_NAME..."
docker stop $CONTAINER_NAME

echo "Removing container: $CONTAINER_NAME..."
docker rm $CONTAINER_NAME

echo "Starting container: $CONTAINER_NAME..."
docker run -d --name $CONTAINER_NAME -p 3100:3100 $IMAGE_NAME

echo "Container $CONTAINER_NAME started successfully."

