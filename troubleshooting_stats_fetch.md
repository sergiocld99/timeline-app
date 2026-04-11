# Troubleshooting: Recálculo forzado de Stats (Java Backend)

### El problema principal
Al cargar `/travels`, la tabla recibe correctamente los `stats` enriquecidos desde el backend de Node (que incluyen los `records` como `maxDistance`, `maxSpeed`, etc.). Sin embargo, inmediatamente por detrás se dispara un request HTTP hacia `http://localhost:8081/api/v2/stats/travels/from-ids` (Servicio Java). Cuando esa promesa resuelve, React Query reemplaza los stats iniciales por esta respuesta de Java (que NO tiene records), rompiendo así los hitos (badges 🏆).

### Approach 1 (Fallido)
- **Hipótesis:** React Query descarta `initialData` y hace fetch de fondo debido a que `staleTime` es 0 por defecto.
- **Acción:** Agregamos `staleTime: Infinity` y `enabled: !isInitialLoad` calculando la igualdad de registros evaluando `travels.length === initialStats.count`.
- **Por qué falló:** Porque el request sigue ocurriendo. Esto delata que durante el ciclo de vida de React, en algún render `travels.length` *no* es exactamente igual a `initialStats.count`, forzando a React Query a crear un QueryKey donde evalúa que *NO* es la carga inicial, pasando a `enabled: true` y forzando la red.

### Approach 2 (Siguientes Pasos - Implementado)
- **Hipótesis:** Comparar arreglos vs conteos en el primer render asíncrono es altamente inestable (ej: `travels` arranca en `[]` en el estado `filteredTravels` de `TravelsPageClient`, luego pasa a N pero `stats.count` puede no estar sincronizado aún, disparando el fetch). 
- **Acción:** Como sabemos *exactamente* si el usuario hizo o no un filtrado empírico usando el prop `appliedFilter` del componente, le enviamos a `useTravelStats` este parametro. Si `appliedFilter` es nulo, significa categóricamente que es el `initialLoad` global. Así desactivamos react-query.

### El Culpable Oculto y Solución Definitiva (Approach 3 y Final)
- Descubrimos que `TravelMap.tsx` necesitaba llamar a Java al puerto 8081 para calcular el **Auto-zoom / Centrado** (`mapConfig`). La request a `/api/v2/stats/travels/from-ids` traía este `mapConfig`, pero NO incluía la data pre-enriquecida de Node (`records`, etc), sobre-escribiendo la caché global y borrando las medallas.
- **Acción (Clean Code):** Seguir la filosofía de Seapration of Concerns.
  1. Creamos un endpoint puro en Java: `POST /api/v2/stats/travels/map-config` que retorna única y exclusivamente el `mapConfigDTO`.
  2. Creamos un nuevo hook frontend independiente `useMapConfig`.
  3. `TravelMap.tsx` ahora consume localmente `useMapConfig` sin interferir con la caché principal de `useTravelStats`.
  
Y por fin, ¡Node domina sus estadígrafías tranquilamente, los Récords brillan y Java se encarga de posicionar el Mapa sin colisionar cachés!
