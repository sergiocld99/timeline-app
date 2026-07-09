# UC-02 (Visits): Ver patrón horario por día de la semana de una location

## Actor
Usuario autenticado viendo la página de Visits, luego de aplicar el caso de uso [UC-01](./01-bar-stats-click-to-filter.md) sobre una única location.

## Objetivo
Identificar de un vistazo en qué horas y qué días de la semana se visita habitualmente un lugar puntual (ej. "los viernes a la tarde").

## Precondición
El usuario filtró Visits a **una sola** location (clickeando una barra que representa una única location, no el bucket "Others" con varias).

## Flujo principal
1. Al quedar una sola location filtrada, el gráfico de horas deja de colorear por location (ya no tiene sentido, sería un solo color) y pasa a apilar cada barra por **día de la semana**.
2. El gráfico de días de la semana (el segundo, a la derecha) adopta la misma paleta día→color para que ambos gráficos sean consistentes entre sí.
3. La leyenda solo muestra los días que efectivamente tienen visitas registradas (no los 7 fijos).
4. El usuario hace hover sobre una barra y ve en el tooltip el nombre de la location filtrada junto al valor, no una etiqueta técnica.
5. Al quitar el filtro ("Remove Filter") o filtrar por 2+ locations, ambos gráficos vuelven al modo normal (coloreado por location).

## Resultado
El usuario puede correlacionar visualmente hora del día × día de la semana para una location específica, algo que no era posible cuando el color representaba la location (siempre un único color una vez filtrado).

## Notas
- Aproximación aceptada: si una visita cruza la medianoche, todas sus `hourParts` se atribuyen al día de `arrivalTime` (mismo criterio que ya usaba el gráfico de días para agrupar).
- Paleta: se agregó un 7º color categórico (`--chart-7`) porque la paleta existente tenía 6 slots; requirió valores distintos en light y dark (el dark original reasigna hues, así que el 7º color no podía heredar el mismo valor en ambos modos sin colisionar con otro slot).
- No hay filtro compuesto: clickear un día en modo "weekday" no combina con el filtro de location existente (limitación conocida de `onFilter`, que siempre filtra desde el dataset completo, no sobre el ya filtrado).
- Componentes: `VisitStats.tsx` (`buildHourlyByWeekdayChartData`, `buildWeekdayChartConfig`, `buildActiveDaysBars`), estado `locationFilterValue`/`groupHourlyByWeekday` en `VisitsPageClient.tsx`.
- Exclusivo de Visits: Travels no tiene un caso de uso equivalente (no aplica, `TravelBarStats` no cambia de modo al filtrar a un solo zipcode).
