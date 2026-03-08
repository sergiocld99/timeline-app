# 1. Etapa de build
FROM node:22 AS builder

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.ts ./
RUN npm install --frozen-lockfile

# Firebase build-time environment variables
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

# Copiar todo el código
COPY . .

# Construir la app
RUN npm run build

# 2. Etapa de producción
FROM node:22 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Copiar solo lo necesario desde la etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Exponer puerto
EXPOSE 3002

# Comando de arranque
CMD ["npm", "start"]
