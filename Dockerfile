# Etapa de construcción
FROM node:18-alpine AS builder

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Instalar dependencias de la aplicación
# Copiar package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar dependencias
# Si usas npm:
RUN npm install
# Si usas yarn:
# RUN yarn install --frozen-lockfile

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción
FROM node:18-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copiar solo los artefactos necesarios de la etapa de construcción
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Exponer el puerto en el que corre la aplicación (por defecto NestJS usa el 3000)
EXPOSE 3000

# Comando para correr la aplicación
# Este comando asume que tienes un script "start:prod" en tu package.json
# que ejecuta algo como "node dist/main"
CMD ["node", "dist/main"]