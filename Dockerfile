FROM node:16-alpine
WORKDIR /app/backend
COPY ./frontend/ ../frontend/
# COPY ./lib/ ../lib/

RUN cd ../frontend && \
  npm ci --production && \
  cd ../backend

COPY ./backend/ .

RUN npm ci --production  && \
  npm run library && \
  npm run build:ui && \
  rm -rf /app/frontend/node_modules/*

EXPOSE 3001

CMD npm start