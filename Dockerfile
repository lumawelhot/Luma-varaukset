FROM node:16-alpine
WORKDIR /app/backend
COPY ./frontend/ ../frontend/

RUN cd ../frontend && \
  npm ci --production && \
  cd ../backend

COPY ./backend/ .
COPY ./config/ ../config/

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

RUN npm ci --production  && \
  npm run build:ui && \
  rm -rf /app/frontend

EXPOSE 3001

CMD npm start
