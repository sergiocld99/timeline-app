# UC-01 (Visits): Filtrar por click en las bar stats

## Actor
Usuario autenticado viendo la página de Visits.

## Objetivo
Acotar rápidamente la tabla y los gráficos a un subconjunto de visits (una location puntual, o un día de la semana / hora) sin tener que tocar el selector de rango de fechas.

## Precondición
Hay visits cargados para el rango de fechas actual.

## Flujo principal
1. El usuario ve el bar stats de Visits: un gráfico apilado por hora (eje X = hora del día) y otro apilado por día de la semana (eje X = Dom..Sáb), ambos coloreados por las top-5 locations con más peso (+ un bucket "Others" para el resto).
2. El usuario hace click en un segmento de color de cualquiera de los dos gráficos (ya sea el de horas o el de días).
3. La tabla de abajo y ambos gráficos se refiltran client-side a los visits cuya location coincide con la clickeada (o con las locations agrupadas en "Others", si clickeó ese segmento).
4. Aparece un botón "Remove Filter: {location(s)}" junto al título de la tabla.
5. El usuario también puede filtrar por hora o por día haciendo click directamente en las etiquetas del eje X (sin importar el color).

## Resultado
Vista acotada a la location o al día/hora elegido. El filtro es reemplazable (un click nuevo reemplaza al anterior, no se combinan) y se puede limpiar con "Remove Filter".

Si el filtro resultante deja **una sola** location, se dispara además el caso de uso [UC-02](./02-weekday-colored-hourly-chart.md).

## Notas
- La agrupación es por **nombre de location** (`visit.location.name`).
- El filtro es puramente client-side sobre los datos ya traídos para el rango de fechas — no dispara un nuevo request al backend.
- Componentes: `VisitStats.tsx`, orquestado por `VisitsPageClient.tsx`. Tipo de filtro: `FilteringData` en `src/types/stats.d.ts`.
