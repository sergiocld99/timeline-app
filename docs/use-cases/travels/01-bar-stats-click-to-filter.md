# UC-01 (Travels): Filtrar por click en las bar stats

## Actor
Usuario autenticado viendo la página de Travels.

## Objetivo
Acotar rápidamente la tabla y los gráficos a un subconjunto de travels (una zona puntual, o un día de la semana / hora) sin tener que tocar el selector de rango de fechas.

## Precondición
Hay travels cargados para el rango de fechas actual.

## Flujo principal
1. El usuario ve el bar stats de Travels: un gráfico apilado por hora (eje X = hora del día) y otro apilado por día de la semana (eje X = Dom..Sáb), ambos coloreados por los top-5 zipcodes con más peso (+ un bucket "Others" para el resto).
2. El usuario hace click en un segmento de color de cualquiera de los dos gráficos (ya sea el de horas o el de días).
3. La tabla de abajo y ambos gráficos se refiltran client-side a los travels cuyo origen o destino pertenece a ese zipcode (o a los zipcodes agrupados en "Others", si clickeó ese segmento).
4. Aparece un botón "Remove Filter: {zipcode(s)}" junto al título de la tabla.
5. El usuario también puede filtrar por hora o por día haciendo click directamente en las etiquetas del eje X (sin importar el color), o por cruce (`cross`) desde otro selector de la página.

## Resultado
Vista acotada al zipcode o al día/hora elegido. El filtro es reemplazable (un click nuevo reemplaza al anterior, no se combinan) y se puede limpiar con "Remove Filter".

## Notas
- La agrupación es por **zipcode** de origen/destino (o del `farthestPoint` calculado respecto del "home" detectado).
- El filtro es puramente client-side sobre los datos ya traídos para el rango de fechas — no dispara un nuevo request al backend.
- Componentes: `TravelBarStats.tsx`, orquestado por `TravelsPageClient.tsx`. Tipo de filtro: `FilteringData` en `src/types/stats.d.ts`.
