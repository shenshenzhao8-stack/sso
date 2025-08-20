#!/bin/bash

CONTAINER_NAME="secure-cms-1"
IMAGE_NAME="secure-cms"

echo "cd workspace"
cd /data/source/secure-hub/SecureHub-CMS

echo "fetch code"
git pull --rebase

echo "Stopping container: $CONTAINER_NAME..."
docker stop $CONTAINER_NAME

echo "Removing container: $CONTAINER_NAME..."
docker rm $CONTAINER_NAME

echo "Removing image: $IMAGE_NAME..."
docker rmi $IMAGE_NAME

echo "Building image: $IMAGE_NAME..."
docker build -f ./admin.Dockerfile -t $IMAGE_NAME .

echo "Starting container: $CONTAINER_NAME..."
docker run -d --name $CONTAINER_NAME -p 3100:3100 $IMAGE_NAME

echo "Container $CONTAINER_NAME started successfully."

