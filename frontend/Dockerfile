# Stage 1: Build the frontend
FROM node:22 AS builder

WORKDIR /app

COPY . .

RUN npm install && npm run build

# Stage 2: Serve the frontend
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]