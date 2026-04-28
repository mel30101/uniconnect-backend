FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app .

RUN npm install --only=production

EXPOSE 3006

CMD ["node", "index.js"]