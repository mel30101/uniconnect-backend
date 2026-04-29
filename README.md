# UniConnect Backend - Microservicios

Este repositorio contiene la arquitectura de microservicios de UniConnect orquestada con Docker.

## Requisitos Previos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
* Archivos `.env` configurados en cada carpeta de servicio (Auth, User, Social, Chat, Academic, Notification).

## Cómo Correr el Proyecto

Para levantar todos los microservicios por primera vez o si hubo cambios en el código/configuración:

```bash
docker compose up --build
```

Si solo quieres iniciar los servicios (sin reconstruir las imágenes):

```bash
docker compose up
```

Para detener y limpiar los contenedores y redes creadas:

```bash
docker compose down
```

## Cada servicio es accesible de forma independiente para pruebas:

#   Servicio                Puerto  Health Check
    Auth Service            3001    http://localhost:3001/health
    User Service            3002    http://localhost:3002/health
    Social Service          3003    http://localhost:3003/health
    Chat Service            3004    http://localhost:3004/health
    Academic Service        3005    http://localhost:3005/health
    Notification Service    3006    http://localhost:3006/health


## Comandos Útiles

Ver logs en tiempo real: docker compose logs -f

Reiniciar un solo servicio (ej. Social): docker compose restart social-service

Limpiar imágenes huérfanas: docker image prune -f