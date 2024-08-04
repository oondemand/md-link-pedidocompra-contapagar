# Use uma imagem base com Node.js
FROM node:20

# Defina o diretório de trabalho
WORKDIR /usr/src/app

# Copie o package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código
COPY . .

# Exponha a porta do micro-serviço (substitua 4006 pela porta correta se necessário)
EXPOSE 4006

# Comando para iniciar o servidor
CMD ["npm", "start"]