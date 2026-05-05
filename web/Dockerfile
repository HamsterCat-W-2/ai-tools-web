FROM docker.1ms.run/node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --registry=https://registry.npmmirror.com

# Install SWC native binding for next-intl on Alpine ARM64
RUN npm install @swc/core-linux-arm64-musl --save-optional --registry=https://registry.npmmirror.com || true

COPY . .

RUN npm run build

FROM docker.1ms.run/node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000

CMD ["npm", "start"]
