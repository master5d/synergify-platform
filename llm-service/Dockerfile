FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY tsconfig.json ./

EXPOSE 4310

ENV NODE_ENV=production PORT=4310

CMD ["npx", "tsx", "src/index.ts"]
