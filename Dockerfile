# --- 1. Estágio de "Build" ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies como 'prisma')
RUN npm install

# Copia o schema do Prisma
COPY prisma ./prisma/

# Gera o Prisma Client (essencial antes do build)
RUN npx prisma generate

# Copia todo o resto do código-fonte
COPY . .

# Roda o script de build do Next.js
RUN npm run build

# Remove as dependências de desenvolvimento
RUN npm prune --production

# --- 2. Estágio Final (Produção) ---
# Começamos de uma imagem limpa do Node.js
FROM node:20-alpine
WORKDIR /app

# Define o ambiente para produção (otimiza o Next.js)
ENV NODE_ENV=production

# Copia apenas os artefatos de produção do estágio de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts

# --- LINHA ADICIONADA ---
# Copia o schema do Prisma para que o 'migrate' funcione
COPY --from=builder /app/prisma ./prisma

# Expõe a porta 3000 (padrão do Next.js)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
