# API Documentation

Esta documentación describe todos los endpoints disponibles en el backend, incluyendo sus query parameters y request bodies aceptados.

## Base URL
Todos los endpoints están bajo el prefijo `/api`

---

## Travels (`/api/travels`)

### GET `/api/travels`
Obtiene todos los viajes con filtros opcionales.

**Query Parameters:**
- `dateFrom` (string, opcional): Fecha de inicio en formato ISO. Por defecto: 30 días antes de hoy a las 00:00:00
- `dateTo` (string, opcional): Fecha de fin en formato ISO. Por defecto: hoy a las 23:59:59
- `userId` (string, opcional): ID del usuario. Si no se proporciona, busca viajes sin userId (guest data)
- `locFrom` (string, opcional): ID de la ubicación de origen
- `locTo` (string, opcional): ID de la ubicación de destino
- `sortingField` (string, opcional): Campo para ordenar y calcular pesos. Por defecto: `'duration'`

**Request Body (para POST `/api/travels/v2`):**
- `crossIds` (array, opcional): Array de IDs de cruces para filtrar

**Response:**
```json
{
  "travels": [...],
  "stats": {...}
}
```

---

### POST `/api/travels/v2`
Mismo comportamiento que GET `/api/travels` pero usando POST.

**Query Parameters:**
- Mismos que GET `/api/travels`

**Request Body:**
- `crossIds` (array, opcional): Array de IDs de cruces para filtrar

---

### GET `/api/travels/graph`
Construye un grafo de conexiones entre códigos postales basado en los viajes.

**Query Parameters:**
- `dateFrom` (string, opcional): Fecha de inicio. Por defecto: 30 días antes
- `dateTo` (string, opcional): Fecha de fin. Por defecto: hoy
- `userId` (string, opcional): ID del usuario

**Response:**
```json
{
  "weights": {
    "zipcode1": {
      "zipcode2": {
        "count": 5,
        "duration": 1200000
      }
    }
  }
}
```

---

### GET `/api/travels/export/csv`
Exporta los viajes a formato CSV.

**Query Parameters:**
- `dateFrom` (string, opcional): Fecha de inicio. Por defecto: 30 días antes
- `dateTo` (string, opcional): Fecha de fin. Por defecto: hoy
- `userId` (string, opcional): ID del usuario

**Response:**
Archivo CSV con headers: `travelId`, `startTime`, `endTime`, `modeOfTransport`, `distanceKm`, `durationMinutes`, `price`, `originName`, `originZipcode`, `destinationName`, `destinationZipcode`

---

### GET `/api/travels/find`
Busca viajes entre dos códigos postales.

**Query Parameters:**
- `originCP` (string, requerido): Código postal de origen
- `destCP` (string, requerido): Código postal de destino
- `dateFrom` (string, opcional): Fecha de inicio. Por defecto: 30 días antes
- `dateTo` (string, opcional): Fecha de fin. Por defecto: hoy
- `userId` (string, opcional): ID del usuario

**Response:**
```json
{
  "count": 10,
  "speed": 45.5,
  "sumKm": 500,
  "sumMin": 660,
  "travels": [...]
}
```

---

### GET `/api/travels/find-last`
Busca el último viaje registrado entre dos ubicaciones específicas.

**Query Parameters:**
- `origin` (string, requerido): ID de la ubicación de origen
- `destination` (string, requerido): ID de la ubicación de destino
- `userId` (string, opcional): ID del usuario

**Response:**
Objeto del viaje más reciente entre las ubicaciones especificadas, ordenado por `startTime` descendente. Retorna `null` si no se encuentra ningún viaje.

```json
{
  "_id": "...",
  "startTime": "2026-01-15T10:00:00.000Z",
  "endTime": "2026-01-15T11:30:00.000Z",
  "origin": "...",
  "destination": "...",
  "distance": 45.5,
  "modeOfTransport": "car",
  ...
}
```

---

### POST `/api/travels/find-any`
Busca viajes hacia cualquier código postal de la lista proporcionada.

**Query Parameters:**
- `userId` (string, opcional): ID del usuario

**Request Body:**
- `zipcodes` (array, requerido): Array de códigos postales (strings)

**Query Parameters adicionales:**
- `dateFrom` (string, opcional): Fecha de inicio. Por defecto: 100 días antes
- `dateTo` (string, opcional): Fecha de fin. Por defecto: hoy

**Response:**
```json
{
  "count": 5,
  "travels": [...]
}
```

---

### POST `/api/travels/stats`
Calcula estadísticas para un conjunto específico de viajes con pesos pre-calculados.

**Request Body:**
- `travels` (array, requerido): Array de objetos con `id` y `weight` de cada viaje
  ```json
  {
    "travels": [
      { "id": "travel_id_1", "weight": 0.85 },
      { "id": "travel_id_2", "weight": 0.92 }
    ]
  }
  ```

**Response:**
Objeto con estadísticas calculadas basadas en los viajes proporcionados y sus pesos:
```json
{
  "totalDistance": 150.5,
  "totalDuration": 180,
  "averageSpeed": 50.17,
  "totalPrice": 45.00,
  ...
}
```

**Nota:** Si se proporciona un array vacío, retorna estadísticas vacías. Este endpoint es útil para calcular estadísticas en el frontend sin tener que recalcular los pesos.

---

### POST `/api/travels`
Crea un nuevo viaje.

**Request Body:**
- `startTime` (string, requerido): Fecha/hora de inicio en formato ISO
- `endTime` (string, requerido): Fecha/hora de fin en formato ISO
- `origin` (string, requerido): ID de la ubicación de origen
- `destination` (string, requerido): ID de la ubicación de destino
- `modeOfTransport` (string, requerido): Modo de transporte
- `distance` (number, requerido): Distancia en kilómetros
- `price` (number, opcional): Precio del viaje
- `userId` (number, opcional): ID del usuario

**Validaciones:**
- La duración del viaje no puede exceder 24 horas

**Response:**
Objeto del viaje creado (201)

---

### PUT `/api/travels/:id`
Actualiza un viaje existente.

**URL Parameters:**
- `id` (string, requerido): ID del viaje a actualizar

**Request Body:**
- `startTime` (string, opcional): Fecha/hora de inicio
- `endTime` (string, opcional): Fecha/hora de fin
- `origin` (string, opcional): ID de la ubicación de origen
- `destination` (string, opcional): ID de la ubicación de destino
- `modeOfTransport` (string, opcional): Modo de transporte
- `distance` (number, opcional): Distancia en kilómetros
- `crosses` (array, opcional): Array de IDs de cruces
- `userId` (number, opcional): ID del usuario

**Validaciones:**
- Si se proporcionan `startTime` y `endTime`, la duración no puede exceder 24 horas
- Si se proporciona `origin`, se actualizará automáticamente la visita asociada

**Response:**
Objeto del viaje actualizado con datos enriquecidos

---

### DELETE `/api/travels/:id`
Elimina un viaje.

**URL Parameters:**
- `id` (string, requerido): ID del viaje a eliminar

**Response:**
Objeto del viaje eliminado (200)

---

## Locations (`/api/locations`)

### GET `/api/locations`
Obtiene todas las ubicaciones.

**Response:**
Array de ubicaciones ordenadas por código postal y nombre

---

### POST `/api/locations`
Crea una nueva ubicación.

**Request Body:**
- `name` (string, requerido): Nombre de la ubicación
- `latitude` (number, requerido): Latitud
- `longitude` (number, requerido): Longitud
- `zipcode` (string, requerido): Código postal
- `notes` (string, opcional): Notas adicionales

**Response:**
Objeto de la ubicación creada (201)

---

### PUT `/api/locations/:id`
Actualiza una ubicación existente.

**URL Parameters:**
- `id` (string, requerido): ID de la ubicación a actualizar

**Request Body:**
- `name` (string, opcional): Nombre de la ubicación
- `latitude` (number, opcional): Latitud
- `longitude` (number, opcional): Longitud
- `zipcode` (string, opcional): Código postal
- `notes` (string, opcional): Notas adicionales

**Response:**
Objeto de la ubicación actualizada

---

### DELETE `/api/locations/:id`
Elimina una ubicación.

**URL Parameters:**
- `id` (string, requerido): ID de la ubicación a eliminar

**Response:**
```json
{
  "message": "Location deleted successfully"
}
```

---

## Visits (`/api/visits`)

### GET `/api/visits`
Obtiene todas las visitas con filtros de fecha.

**Query Parameters:**
- `dateFrom` (string, opcional): Fecha de inicio. Por defecto: 30 días antes
- `dateTo` (string, opcional): Fecha de fin. Por defecto: hoy
- `userId` (string, opcional): ID del usuario

**Response:**
Array de visitas con pesos calculados, ordenadas por `arrivalTime` descendente

---

### GET `/api/visits/calculate/:date`
Calcula las visitas para una fecha específica basándose en los viajes.

**URL Parameters:**
- `date` (string, requerido): Fecha en formato ISO (YYYY-MM-DD)

**Query Parameters:**
- `userId` (string, opcional): ID del usuario
- `persist` (string, opcional): Si es `'true'`, persiste las visitas calculadas en la base de datos

**Response:**
Si `persist=true`:
```json
{
  "visits": [...],
  "persisted": true,
  "count": 10
}
```

Si `persist` no es `'true'`:
```json
{
  "visits": [...],
  "count": 10
}
```

**Nota:** Si no se encuentran visitas, retorna 204 con mensaje

---

### POST `/api/visits`
Crea una nueva visita.

**Request Body:**
- `date` (string, requerido): Fecha de la visita en formato ISO
- `arrivalTime` (string, requerido): Hora de llegada en formato ISO
- `departureTime` (string, requerido): Hora de salida en formato ISO
- `location` (string, requerido): ID de la ubicación
- `userId` (number, opcional): ID del usuario

**Nota:** `durationMinutes` se calcula automáticamente

**Response:**
Objeto de la visita creada (201)

---

### PUT `/api/visits/:id`
Actualiza una visita existente.

**URL Parameters:**
- `id` (string, requerido): ID de la visita a actualizar

**Request Body:**
- `date` (string, opcional): Fecha de la visita
- `arrivalTime` (string, opcional): Hora de llegada
- `departureTime` (string, opcional): Hora de salida
- `location` (string, opcional): ID de la ubicación
- `userId` (number, opcional): ID del usuario

**Nota:** `durationMinutes` se recalcula automáticamente

**Response:**
Objeto de la visita actualizada (200)

---

### DELETE `/api/visits/:id`
Elimina una visita.

**URL Parameters:**
- `id` (string, requerido): ID de la visita a eliminar

**Response:**
Objeto de la visita eliminada (200)

---

## Stats (`/api/stats`)

### GET `/api/stats/visits`
Obtiene las ubicaciones más visitadas ordenadas por tiempo total.

**Query Parameters:**
- `dateFrom` (string, opcional): Fecha de inicio. Por defecto: 30 días antes
- `limit` (number, opcional): Número máximo de resultados. Por defecto: 10
- `userId` (string, opcional): ID del usuario

**Response:**
```json
[
  {
    "location": {...},
    "totalMinutes": 1440,
    "count": 5
  }
]
```

---

### GET `/api/stats/travels/by-mode`
Obtiene estadísticas de viajes agrupadas por modo de transporte.

**Query Parameters:**
- `dateFrom` (string, opcional): Fecha de inicio. Por defecto: 30 días antes
- `dateTo` (string, opcional): Fecha de fin. Por defecto: hoy
- `userId` (string, opcional): ID del usuario

**Response:**
```json
[
  {
    "modeOfTransport": "car",
    "totalMinutes": 1200,
    "totalKm": 500,
    "count": 10
  }
]
```

---

## Crosses (`/api/crosses`)

### GET `/api/crosses`
Obtiene todos los cruces.

**Response:**
Array de cruces ordenados por nombre

---

### POST `/api/crosses`
Crea un nuevo cruce.

**Request Body:**
- `name` (string, requerido): Nombre del cruce
- `latitude` (number, requerido): Latitud
- `longitude` (number, requerido): Longitud

**Response:**
Objeto del cruce creado (201)

---

### PUT `/api/crosses/:id`
Actualiza un cruce existente.

**URL Parameters:**
- `id` (string, requerido): ID del cruce a actualizar

**Request Body:**
- `name` (string, opcional): Nombre del cruce
- `latitude` (number, opcional): Latitud
- `longitude` (number, opcional): Longitud

**Response:**
Objeto del cruce actualizado

---

### DELETE `/api/crosses/:id`
Elimina un cruce.

**URL Parameters:**
- `id` (string, requerido): ID del cruce a eliminar

**Response:**
```json
{
  "message": "Removed successfully"
}
```

---

## Known Centers (`/api/known-centers`)

### GET `/api/known-centers`
Obtiene centros conocidos cercanos a una ubicación.

**Query Parameters:**
- `latitude` (number, requerido): Latitud del punto de referencia
- `longitude` (number, requerido): Longitud del punto de referencia
- `radiusKm` (number, opcional): Radio de búsqueda en kilómetros. Por defecto: 10
- `limit` (number, opcional): Número máximo de resultados. Por defecto: 3

**Response:**
Array de ubicaciones cercanas

---

## Users (`/api/users`)

### GET `/api/users`
Obtiene todos los usuarios.

**Response:**
Array de usuarios ordenados por `userId`

---

### GET `/api/users/:userId`
Obtiene un usuario por su ID.

**URL Parameters:**
- `userId` (string, requerido): ID del usuario

**Response:**
Objeto del usuario

---

### GET `/api/users/check-guest-data`
Verifica si existen datos de invitado (viajes o visitas sin userId).

**Response:**
```json
{
  "hasGuestData": true,
  "travelCount": 10,
  "visitCount": 5
}
```

---

### POST `/api/users`
Crea un nuevo usuario.

**Request Body:**
- `userId` (number, requerido): ID del usuario (debe ser único)
- `name` (string, requerido): Nombre del usuario

**Response:**
Objeto del usuario creado (201)

**Errores:**
- 409: Si el `userId` ya existe

---

### POST `/api/users/:userId/migrate`
Migra todos los datos de invitado (viajes y visitas sin userId) al usuario especificado.

**URL Parameters:**
- `userId` (string, requerido): ID del usuario al que migrar los datos

**Response:**
```json
{
  "success": true,
  "travelsMigrated": 10,
  "visitsMigrated": 5
}
```

---

### PUT `/api/users/:userId`
Actualiza un usuario existente.

**URL Parameters:**
- `userId` (string, requerido): ID del usuario a actualizar

**Request Body:**
- `name` (string, opcional): Nuevo nombre del usuario

**Response:**
Objeto del usuario actualizado

---

### DELETE `/api/users/:userId`
Elimina un usuario.

**URL Parameters:**
- `userId` (string, requerido): ID del usuario a eliminar

**Response:**
Objeto del usuario eliminado (200)

---

## Notas Generales

### Parámetros de Fecha
- Los parámetros `dateFrom` y `dateTo` aceptan strings en formato ISO
- Si `dateFrom` no se proporciona, por defecto es 30 días antes de hoy (algunos endpoints usan 100 días)
- Si `dateTo` no se proporciona, por defecto es hoy a las 23:59:59

### Filtrado por Usuario
- El parámetro `userId` es opcional en la mayoría de endpoints
- Si no se proporciona `userId`, los endpoints buscan documentos donde `userId` no existe o es `null` (datos de invitado)
- Si se proporciona `userId`, filtra solo los documentos de ese usuario

### Códigos de Estado HTTP
- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `204`: Sin contenido (usado cuando no se encuentran visitas)
- `400`: Error en la solicitud (validación, datos faltantes, etc.)
- `404`: Recurso no encontrado
- `409`: Conflicto (ej: usuario duplicado)
- `500`: Error interno del servidor

