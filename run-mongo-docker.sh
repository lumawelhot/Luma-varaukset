#!/bin/bash
echo "Starting MongoDB in background..."
docker network create mongo
docker run --name mongo --network mongo -p 27017:27017 -d mongo:focal
docker run --name mongo-express --network mongo -p 8081:8081 -d mongo-express
echo "MongoDB should now be up and listening on mongodb://localhost:27017/"
echo "The admin UI is available at http://localhost:8081/"
node backend/setup-mongo-docker.js
