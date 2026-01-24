# Statistics Service (Quarkus)

Microservicio de estadísticas para Timeline App, implementado en Java con Quarkus.

## 🚀 Stack Tecnológico

- **Java**: 21 (LTS)
- **Framework**: Quarkus 3.30.6
- **Build**: Maven
- **Base de datos**: MongoDB (solo lectura)
- **Puerto**: 8081

## 📋 Requisitos

- Java 21+
- Maven 3.9+
- MongoDB corriendo en `localhost:27017` (o usar el docker-compose del proyecto principal)

## 🏃 Ejecutar en Modo Desarrollo

```bash
./mvnw quarkus:dev
```

El servicio estará disponible en:
- **API**: http://localhost:8081
- **Swagger UI**: http://localhost:8081/swagger-ui
- **Health Check**: http://localhost:8081/health

## 🔧 Endpoints Disponibles

### Health Check
```bash
GET http://localhost:8081/health
```

### Ping
```bash
GET http://localhost:8081/api/v2/stats/ping
```

## 🏗️ Estructura del Proyecto

```
src/main/java/com/timeline/stats/
├── domain/          # Entidades (Travel)
├── repository/      # Repositorios Panache
├── service/         # Lógica de negocio
├── resource/        # REST endpoints
└── dto/             # Data Transfer Objects
```

## 🔨 Comandos Útiles

### Compilar
```bash
./mvnw clean package
```

### Ejecutar tests
```bash
./mvnw test
```

### Ejecutar en modo dev (hot reload)
```bash
./mvnw quarkus:dev
```

### Build nativo (GraalVM)
```bash
./mvnw package -Pnative
```

## 📝 Notas Importantes

### Solo Lectura
Este microservicio **SOLO LEE** de MongoDB. Todas las escrituras se realizan desde el backend de Node.js.

### Compatibilidad
Los modelos de Java están diseñados para ser compatibles con los esquemas de Mongoose del backend Node.js.

### CORS
CORS está habilitado para:
- http://localhost:3002 (Frontend Next.js)
- http://localhost:3000 (Backend Node.js)

## 🐛 Troubleshooting

### Error de conexión a MongoDB
Asegúrate de que MongoDB esté corriendo:
```bash
# Si usas docker-compose del proyecto principal
cd ..
docker compose up mongo -d
```

### Puerto 8081 en uso
Cambia el puerto en `src/main/resources/application.properties`:
```properties
quarkus.http.port=8082
```

## 📚 Recursos

- [Quarkus Documentation](https://quarkus.io/guides/)
- [MongoDB with Panache](https://quarkus.io/guides/mongodb-panache)
- [RESTEasy Reactive](https://quarkus.io/guides/rest)
