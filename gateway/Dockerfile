# Usamos una versión ligera de Node
FROM node:20-alpine

# Creamos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install --production

# Copiamos el resto del código del gateway
COPY . .

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para arrancar el servicio
CMD ["node", "index.js"]