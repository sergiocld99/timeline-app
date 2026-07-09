# Casos de Uso

Documentación funcional (perspectiva del usuario) de los flujos que soporta la app. A diferencia de `docs/sdd/` (diseño técnico antes de implementar), esta carpeta describe **qué puede hacer el usuario y cómo**, una vez que la funcionalidad ya existe — sirve como referencia rápida para QA, onboarding y para no perder el "por qué" de una interacción no obvia.

## 🚀 Proceso Sugerido
1. Al cerrar un desarrollo con interacciones de usuario no triviales, agregá o actualizá el caso de uso correspondiente dentro de la carpeta del área (`travels/`, `visits/`, etc.).
2. Nombrá el archivo `NN-nombre-corto.md` (numeración correlativa dentro de esa carpeta, ej: `01-...`, `02-...`).
3. Mantenelo corto: actor, objetivo, flujo, resultado. No dupliques el detalle técnico que ya vive en `docs/sdd/` o en el código.
4. Si el mismo flujo aplica a varias áreas (ej. un patrón de UI reusado en Travels y Visits), preferí **duplicar** el caso de uso en cada carpeta (adaptado a esa área) antes que compartir un solo archivo entre carpetas — cada carpeta debe poder leerse de forma autocontenida.

## 📁 Estructura
- `[área]/[NN]-[nombre-de-caso-de-uso].md`: un caso de uso por archivo, agrupado por área de la app (ej. `travels/`, `visits/`).
