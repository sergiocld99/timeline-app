# Troubleshooting: Recálculo forzado de Stats (Java Backend)

### El problema principal
Al cargar `/travels`, la tabla recibe correctamente los `stats` enriquecidos desde el backend de Node (que incluyen los `records` como `maxDistance`, `maxSpeed`, etc.). Sin embargo, inmediatamente por detrás se dispara un request HTTP hacia `http://localhost:8081/api/v2/stats/travels/from-ids` (Servicio Java). Cuando esa promesa resuelve, React Query reemplaza los stats iniciales por esta respuesta de Java (que NO tiene records), rompiendo así los hitos (badges 🏆).

### El Culpable Oculto y Solución Definitiva
- Descubrimos que `TravelMap.tsx` necesitaba llamar a Java al puerto 8081 para calcular el **Auto-zoom / Centrado** (`mapConfig`). La request a `/api/v2/stats/travels/from-ids` traía este `mapConfig`, pero NO incluía la data pre-enriquecida de Node (`records`, etc), sobre-escribiendo la caché global y borrando las medallas.
- **Acción (Clean Code):** Seguir la filosofía de Seapration of Concerns.
  1. Creamos un endpoint puro en Java: `POST /api/v2/stats/travels/map-config` que retorna única y exclusivamente el `mapConfigDTO`.
  2. Creamos un nuevo hook frontend independiente `useMapConfig`.
  3. `TravelMap.tsx` ahora consume localmente `useMapConfig` sin interferir con la caché principal de `useTravelStats`.
  
Y por fin, ¡Node domina sus estadígrafías tranquilamente, los Récords brillan y Java se encarga de posicionar el Mapa sin colisionar cachés!
