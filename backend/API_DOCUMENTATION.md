# API Documentation

Esta documentación describe todos los endpoints disponibles en el backend, incluyendo sus query parameters y request bodies aceptados.

## Base URL
Todos los endpoints están bajo el prefijo `/api`

---

## Índice

### [Travels](#travels-apitravels)
- [GET /api/travels](#get-apitravels) - Obtener viajes con filtros
- [POST /api/travels/v2](#post-apitravelsv2) - Obtener viajes (POST)
- [GET /api/travels/graph](#get-apitravelsgraph) - Grafo de conexiones
- [GET /api/travels/export/csv](#get-apitravelsexportcsv) - Exportar CSV
- [GET /api/travels/find](#get-apitravelsfind) - Buscar viajes entre CPs
- [GET /api/travels/find-last](#get-apitravelsfind-last) - Último viaje entre ubicaciones
- [POST /api/travels/find-any](#post-apitravelsfind-any) - Buscar viajes a múltiples CPs
- [POST /api/travels](#post-apitravels) - Crear viaje
- [PUT /api/travels/:id](#put-apitravelsid) - Actualizar viaje
- [DELETE /api/travels/:id](#delete-apitravelsid) - Eliminar viaje

### [Locations](#locations-apilocations)
- [GET /api/locations](#get-apilocations) - Obtener ubicaciones
- [POST /api/locations](#post-apilocations) - Crear ubicación
- [PUT /api/locations/:id](#put-apilocationsid) - Actualizar ubicación
- [DELETE /api/locations/:id](#delete-apilocationsid) - Eliminar ubicación

### [Visits](#visits-apivisits)
- [GET /api/visits](#get-apivisits) - Obtener visitas
- [GET /api/visits/calculate/:date](#get-apivisitscalculatedate) - Calcular visitas
- [POST /api/visits](#post-apivisits) - Crear visita
- [PUT /api/visits/:id](#put-apivisitsid) - Actualizar visita
- [DELETE /api/visits/:id](#delete-apivisitsid) - Eliminar visita

### [Stats](#stats-apistats)
- [GET /api/stats/visits](#get-apistatsvisits) - Ubicaciones más visitadas
- [GET /api/stats/travels/by-mode](#get-apistatstravelsby-mode) - Estadísticas por modo de transporte

### [Crosses](#crosses-apicrosses)
- [GET /api/crosses](#get-apicrosses) - Obtener cruces
- [POST /api/crosses](#post-apicrosses) - Crear cruce
- [PUT /api/crosses/:id](#put-apicrossesid) - Actualizar cruce
- [DELETE /api/crosses/:id](#delete-apicrossesid) - Eliminar cruce

### [Known Centers](#known-centers-apiknown-centers)
- [GET /api/known-centers](#get-apiknown-centers) - Centros cercanos

### [Users](#users-apiusers)
- [GET /api/users](#get-apiusers) - Obtener usuarios
- [GET /api/users/:userId](#get-apiusersuserid) - Obtener usuario por ID
- [GET /api/users/check-guest-data](#get-apiuserscheck-guest-data) - Verificar datos de invitado
- [POST /api/users](#post-apiusers) - Crear usuario
- [POST /api/users/:userId/migrate](#post-apiusersuseridmigrate) - Migrar datos de invitado
- [PUT /api/users/:userId](#put-apiusersuserid) - Actualizar usuario
- [DELETE /api/users/:userId](#delete-apiusersuserid) - Eliminar usuario

---

## Travels (`/api/travels`)

### GET `/api/travels`
Obtiene todos los viajes con filtros opcionales.

**Query Parameters:**
- `dateFrom`, `dateTo` (string, opcional): Rango de fechas ISO. Por defecto: últimos 30 días
- `userId` (string, opcional): ID del usuario (null = guest data)
- `locFrom`, `locTo` (string, opcional): IDs de ubicaciones origen/destino
- `sortingField` (string, opcional): Campo para ordenar. Por defecto: `duration`
- `statsOnly` (boolean, opcional): Si es `true`, la respuesta omitirá la lista completa de viajes (`travels`) y devolverá únicamente el objeto `stats`. Ideal para optimizar el dashboard.

**Response:** `{ travels: [...], stats: {...} }` (Si `statsOnly=true`, el nodo `travels` se omite)

---

### POST `/api/travels/v2`
Mismo que GET `/api/travels` pero usando POST.

**Query Parameters:** Mismos que GET `/api/travels`

**Request Body:** `crossIds` (array, opcional) - IDs de cruces para filtrar

---

### GET `/api/travels/graph`
Construye un grafo de conexiones entre códigos postales.

**Query Parameters:** `dateFrom`, `dateTo`, `userId` (opcional)

**Response:** Objeto con pesos de conexiones entre zipcodes: `{ weights: { zipcode1: { zipcode2: { count, duration } } } }`

---

### GET `/api/travels/export/csv`
Exporta viajes a CSV.

**Query Parameters:** `dateFrom`, `dateTo`, `userId` (opcional)

**Response:** CSV con columnas: travelId, startTime, endTime, modeOfTransport, distanceKm, durationMinutes, price, origin/destination (name, zipcode)

---

### GET `/api/travels/find`
Busca viajes entre dos códigos postales.

**Query Parameters:**
- `originCP`, `destCP` (string, requerido): Códigos postales origen/destino
- `dateFrom`, `dateTo`, `userId` (opcional)

**Response:** `{ count, speed, sumKm, sumMin, travels: [...] }`

---

### GET `/api/travels/find-last`
Busca el último viaje entre dos ubicaciones (útil para autocompletar distancia).

**Query Parameters:**
- `origin`, `destination` (string, requerido): IDs de ubicaciones
- `userId` (opcional)

**Response:** Objeto del viaje más reciente o `null`

---

### POST `/api/travels/find-any`
Busca viajes hacia cualquier código postal de la lista.

**Query Parameters:** `dateFrom` (por defecto: 100 días antes), `dateTo`, `userId` (opcional)

**Request Body:** `zipcodes` (array, requerido)

**Response:** `{ count, travels: [...] }`

---

### POST `/api/travels`
Crea un nuevo viaje.

**Request Body:** `startTime`, `endTime`, `origin`, `destination`, `modeOfTransport`, `distance` (requeridos) | `price`, `userId` (opcional)

**Validaciones:** 
- Duración máxima 24 horas
- No se permiten colisiones: no puede existir otro viaje para el mismo usuario que se superponga con el rango [startTime, endTime].

**Response:** Objeto del viaje creado (201)

---

### PUT `/api/travels/:id`
Actualiza un viaje existente.

**Request Body:** `startTime`, `endTime`, `origin`, `destination`, `modeOfTransport`, `distance`, `crosses`, `userId` (todos opcionales)

**Validaciones:** 
- Duración máxima 24 horas si se actualizan fechas

**Response:** Viaje actualizado con datos enriquecidos

---

### DELETE `/api/travels/:id`
Elimina un viaje.

**Response:** 204 No Content

---

## Locations (`/api/locations`)

### GET `/api/locations`
Obtiene todas las ubicaciones ordenadas por zipcode y nombre.

---

### POST `/api/locations`
Crea una ubicación.

**Request Body:** `name`, `latitude`, `longitude`, `zipcode` (requeridos) | `notes` (opcional)

**Response:** Ubicación creada (201)

---

### PUT `/api/locations/:id`
Actualiza una ubicación.

**Request Body:** `name`, `latitude`, `longitude`, `zipcode`, `notes` (todos opcionales)

---

### DELETE `/api/locations/:id`
Elimina una ubicación.

**Response:** 204 No Content

---

## Visits (`/api/visits`)

### GET `/api/visits`
Obtiene visitas con pesos calculados.

**Query Parameters:** `dateFrom`, `dateTo`, `userId` (opcional)

**Response:** Array ordenado por `arrivalTime` descendente

---

### GET `/api/visits/calculate/:date`
Calcula visitas para una fecha basándose en viajes.

**URL Parameters:** `date` (requerido) - Fecha ISO (YYYY-MM-DD)

**Query Parameters:** `userId`, `persist` (opcional) - Si `persist=true`, guarda en BD

**Response:** `{ visits: [...], count, persisted? }`

---

### POST `/api/visits`
Crea una visita.

**Request Body:** `date`, `arrivalTime`, `departureTime`, `location` (requeridos) | `userId` (opcional)

**Nota:** `durationMinutes` se calcula automáticamente

---

### PUT `/api/visits/:id`
Actualiza una visita.

**Request Body:** `date`, `arrivalTime`, `departureTime`, `location`, `userId` (todos opcionales)

---

### DELETE `/api/visits/:id`
Elimina una visita.

**Response:** 204 No Content

---

## Stats (`/api/stats`)

### GET `/api/stats/visits`
Ubicaciones más visitadas ordenadas por tiempo total.

**Query Parameters:** `dateFrom` (por defecto: 30 días), `limit` (por defecto: 10), `userId` (opcional)

**Response:** `[{ location: {...}, totalMinutes, count }]`

---

### GET `/api/stats/travels/by-mode`
Estadísticas agrupadas por modo de transporte.

**Query Parameters:** `dateFrom`, `dateTo`, `userId` (opcional)

**Response:** `[{ modeOfTransport, totalMinutes, totalKm, count }]`

---

## Crosses (`/api/crosses`)

### GET `/api/crosses`
Obtiene todos los cruces ordenados por nombre.

---

### POST `/api/crosses`
Crea un cruce.

**Request Body:** `name`, `latitude`, `longitude` (requeridos)

---

### PUT `/api/crosses/:id`
Actualiza un cruce.

**Request Body:** `name`, `latitude`, `longitude` (opcionales)

---

### DELETE `/api/crosses/:id`
Elimina un cruce.

**Response:** 204 No Content

---

## Known Centers (`/api/known-centers`)

### GET `/api/known-centers`
Centros conocidos cercanos a una ubicación.

**Query Parameters:**
- `latitude`, `longitude` (number, requerido)
- `radiusKm` (por defecto: 10), `limit` (por defecto: 3)

---

## Users (`/api/users`)

### GET `/api/users`
Obtiene todos los usuarios ordenados por `userId`.

---

### GET `/api/users/:userId`
Obtiene un usuario por ID.

---

### GET `/api/users/check-guest-data`
Verifica si existen datos de invitado.

**Response:** `{ hasGuestData, travelCount, visitCount }`

---

### POST `/api/users`
Crea un usuario.

**Request Body:** `userId` (number, requerido y único), `name` (requerido)

**Errores:** 409 si el userId ya existe

---

### POST `/api/users/:userId/migrate`
Migra datos de invitado al usuario.

**Response:** `{ success, travelsMigrated, visitsMigrated }`

---

### PUT `/api/users/:userId`
Actualiza un usuario.

**Request Body:** `name` (opcional)

---

### DELETE `/api/users/:userId`
Elimina un usuario.

**Response:** 204 No Content

---

## Notas Generales

### Parámetros de Fecha
- Formato ISO para `dateFrom` y `dateTo`
- Por defecto: últimos 30 días (algunos endpoints usan 100 días)

### Filtrado por Usuario
- `userId` opcional en la mayoría de endpoints
- Sin `userId` = datos de invitado (guest data)

### Códigos HTTP
- **200**: OK | **201**: Creado | **204**: Sin contenido
- **400**: Error de validación | **404**: No encontrado
- **409**: Conflicto | **500**: Error del servidor
