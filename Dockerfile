# Dockerfile (na raiz do projeto 'readowl-front')

# --- Estágio 1: Build ---
# Usamos a imagem completa do Node para instalar dependências e compilar o projeto
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o resto do código
COPY . .

# Copia o Prisma schema e gera o client (essencial para o build)
COPY prisma ./prisma
RUN npx prisma generate

# Constrói a aplicação Next.js para produção
# A variável NODE_ENV=production é setada automaticamente pelo 'next build'
RUN npm run build

# --- Estágio 2: Produção ---
# Usamos uma imagem "standalone" otimizada do Next.js
FROM node:18-alpine

WORKDIR /app

# Seta o ambiente para produção
ENV NODE_ENV=production

# Copia os arquivos de build otimizados do estágio 'builder'
# Isso inclui as pastas .next/standalone e .next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expõe a porta que o Next.js usa por padrão
EXPOSE 3000

# Comando para iniciar o servidor Next.js otimizado
CMD ["node", "server.js"]