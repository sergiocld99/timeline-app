# UC-01: Filtrar por click en las bar stats (Travels y Visits)

## Actor
Usuario autenticado viendo la página de Travels o Visits.

## Objetivo
Acotar rápidamente la tabla y los gráficos a un subconjunto de datos (una zona/location puntual, o un día de la semana) sin tener que tocar el selector de rango de fechas.

## Precondición
Hay travels/visits cargados para el rango de fechas actual.

## Flujo principal
1. El usuario ve el bar stats: un gráfico apilado por hora (eje X = hora del día) y otro apilado por día de la semana (eje X = Dom..Sáb), ambos coloreados por las top-5 zonas/locations con más peso (+ un bucket "Others" para el resto).
2. El usuario hace click en un segmento de color de cualquiera de los dos gráficos (ya sea el de horas o el de días).
3. La tabla de abajo y ambos gráficos se refiltran client-side a los travels/visits que pertenecen a esa zona/location (o a las agrupadas en "Others", si clickeó ese segmento).
4. Aparece un botón "Remove Filter: {nombre}" junto al título de la tabla.
5. El usuario también puede filtrar por hora o por día haciendo click directamente en las etiquetas del eje X (sin importar el color).

## Resultado
Vista acotada a la zona/location o al día/hora elegido. El filtro es reemplazable (un click nuevo reemplaza al anterior, no se combinan) y se puede limpiar con "Remove Filter".

## Notas
- En Travels la agrupación es por **zipcode** de origen/destino; en Visits es por **nombre de location**.
- El filtro es puramente client-side sobre los datos ya traídos para el rango de fechas — no dispara un nuevo request al backend.
- Componentes: `TravelBarStats.tsx` / `VisitStats.tsx`, orquestados por `TravelsPageClient.tsx` / `VisitsPageClient.tsx`. Tipo de filtro: `FilteringData` en `src/types/stats.d.ts`.
