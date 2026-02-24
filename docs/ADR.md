# Architecture Decision Records (ADR)

Este archivo registra las decisiones arquitectónicas importantes del proyecto para mantener un historial técnico claro.

## ADR 001: Consolidación de Estadísticas y Configuración de Mapa

**Fecha:** 2026-02-24
**Estatus:** Aceptado

### Contexto
El componente `TravelMap` en el frontend requería lógica compleja para calcular el centro de gravedad, la ubicación más frecuente y el nivel de zoom óptimo (viewpoint). Esta lógica dependía de los mismos datos utilizados por el componente de estadísticas (totales de KM, tiempo, etc.).

### Decisión
Se decidió migrar el cálculo de la geometría del mapa al microservicio de estadísticas (`statistics-service`) y consolidar la respuesta en un único endpoint: `POST /api/v2/stats/travels/from-ids`.

### Justificación
1. **Eficiencia de Red:** Al combinar los datos, el frontend realiza un solo round-trip (petición de red). Gracias a React Query, múltiples componentes pueden consumir estos datos sin disparar llamadas adicionales.
2. **Rendimiento de DB:** Se evita consultar MongoDB dos veces por el mismo set de documentos (una vez para totales y otra para geometría).
3. **Consistencia Atómica:** Garantiza que el centro del mapa y el resumen de kilómetros estén siempre sincronizados, eliminando posibles incoherencias por ráfagas de datos asíncronos.
4. **Thin Client:** Simplifica el frontend, eliminando dependencias de cálculo geoespacial pesado y reduciendo el bundle size.

---
