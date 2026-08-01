# Optimización: Parámetro `statsOnly`

## Contexto
El Dashboard de la aplicación (`frontend-v2`) requiere visualizar estadísticas globales del usuario (distancia total, registros, rutas frecuentes, etc.) para rangos de tiempo extensos (ej. últimos 10 meses).

## Problema
Anteriormente, la solicitud `GET /travels` devolvía siempre el array completo de viajes (`travels`) junto con el nodo de estadísticas (`stats`). 
- En rangos de tiempo largos, el array `travels` podía contener cientos o miles de objetos.
- El Dashboard ignoraba este array, utilizando únicamente el objeto `stats`.
- Esto causaba un desperdicio significativo de ancho de banda y memoria (payloads de varios MBs innecesarios).

## Solución
Se introdujo un query parameter booleano `statsOnly` en el endpoint de viajes.

### Cambios en Backend
El controlador `getAllTravels` ahora verifica este parámetro:
- Si `statsOnly=true`: Se calculan las estadísticas pero se omite el campo `travels` en la respuesta JSON.
- Por defecto (`false` o ausente): Se mantiene el comportamiento original devolviendo ambos campos.

### Cambios en Frontend
- `TravelService.getAll` aceptaba `statsOnly` en sus parámetros, y el Dashboard lo usaba al cargar sus datos.

> **Estado actual (desde #100):** el Dashboard ya no consume este endpoint — lee de `GET /api/v2/stats/dashboard` en `statistics-service` (ver [SDD 05](../sdd/05-stats-dashboard-endpoint.md)). El parámetro fue removido del cliente por quedar sin uso, pero **sigue soportado y documentado en el backend** (`API_DOCUMENTATION.md`) porque es API pública con consumidores externos (app Android).

## Beneficios
- **Reducción de Latencia**: Menor tiempo de transferencia de red.
- **Eficiencia de Memoria**: El frontend no carga ni parsea arrays gigantes que no va a mostrar.
- **Escalabilidad**: Mejora el soporte para usuarios con años de historial de viajes.
