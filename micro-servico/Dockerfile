# Use a imagem base oficial do Node.js (versão Alpine)
FROM node:20-alpine

# Crie e defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos package.json e package-lock.json
COPY package*.json ./

# Instale as dependências e remova o cache do npm
RUN npm install && npm cache clean --force

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta que a aplicação Node.js escuta
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "-r", "dotenv/config", "src/index.js"]