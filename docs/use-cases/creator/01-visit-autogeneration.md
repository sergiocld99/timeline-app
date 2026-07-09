# UC-01 (Creator): Autogeneración de Visits al crear un Travel

## Actor
Usuario autenticado creando travels desde la página Creator.

## Objetivo
Que el sistema infiera automáticamente las "visits" (permanencias en un lugar) a partir de los travels cargados, sin que el usuario tenga que crearlas a mano.

## Precondición
El usuario carga un nuevo travel (origen, destino, horarios) desde el form de Creator.

## Flujo principal
1. Al confirmar el form, el frontend crea el travel (`TravelService.create`) y a continuación pide al backend que recalcule y persista las visits del día (`VisitService.persistIfNeeded`, que llama a `GET /visits/calculate/:date?persist=true`).
2. El backend (`calculateVisitsForDate` en `backend/services/visitService.js`) toma todos los travels del usuario que **empiezan ese día**, ordenados por hora, y para cada par consecutivo de travels evalúa tres condiciones:
   - el destino del travel actual es la misma location que el origen del siguiente (`isSameLocation`),
   - ambos travels caen en el **mismo día calendario** (`isSameDay`, comparando `endTime`/`startTime` con `toDateString()`),
   - el orden temporal es correcto (`endTime < startTime` del siguiente).
3. Si las tres se cumplen, se genera una Visit: `arrivalTime` = fin del travel actual, `departureTime` = inicio del siguiente, en esa location.
4. Si el usuario tildó "mismo día" en el form (`isSameDay` del hook `useTravelCreator`), el horario de fin se ajusta automáticamente para no cruzar la medianoche.

## Resultado
Las visits quedan disponibles en la página Visits sin intervención manual, siempre y cuando el hueco entre dos travels consecutivos esté dentro del mismo día.

## Notas
- **Una Visit nunca cruza la medianoche.** Es una decisión de diseño explícita (`isSameDay` en `calculateVisitsForDate`): si el travel siguiente empieza al día siguiente, no se genera Visit para ese hueco. Esto evita que "dormir en un lugar" (quedarse de un día para el otro) se registre como una visita.
- Consecuencia para el resto de la app: cualquier código que procese `Visit.arrivalTime`/`hourParts` puede asumir con seguridad que toda la visita pertenece a un único día de la semana — no hace falta contemplar el caso de una visita partida entre dos días. Ver [visits/02](../visits/02-weekday-colored-hourly-chart.md), que se apoya en este supuesto.
- Endpoint: `GET /visits/calculate/:date?persist=true` (`backend/routes/visitRoutes.js` → `calculateVisitsController` → `persistIfNeeded`).
- Se dispara tanto al crear un travel para el usuario actual como al crear "para todos los usuarios" (`performCreationForCurrentUser` / `performCreationForAllUsers` en `useTravelCreator.tsx`).
