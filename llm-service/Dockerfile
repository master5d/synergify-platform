FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./

# npm ci --omit=dev ставит производственные зависимости из package-lock.json,
# включая tsx (объявлен в dependencies, а не devDependencies).
# Отдельный npm install не нужен — это осознанное отклонение от пустого плана.
RUN npm ci --omit=dev

COPY src ./src
COPY tsconfig.json ./

EXPOSE 4310

ENV NODE_ENV=production PORT=4310

CMD ["npx", "tsx", "src/index.ts"]
