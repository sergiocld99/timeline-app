# Troubleshooting: Bugs encontrados al agregar el modo weekday a los bar stats de Visits

Registro de los bugs detectados durante el desarrollo del click-to-filter por location y el coloreado por día de la semana en `VisitStats.tsx` (ver `docs/use-cases/visits/`). Se documentan acá porque son gotchas no obvios (uno de Recharts, uno de theming, uno de un refactor propio) que pueden repetirse si se vuelve a tocar este componente.

---

### 1. Recharts descarta los `<Bar>` si están envueltos en un Fragment

**Síntoma:** al agregar el branching `{groupHourlyByWeekday ? <barras-weekday> : <>{barras-location}</>}` dentro de `<BarChart>`, el modo normal (sin filtro de location) quedó con el gráfico de horas completamente vacío — sin barras ni leyenda.

**Causa:** Recharts inspecciona los `children` de `<BarChart>` para encontrar los `<Bar>` y armar la data. Cuando el bloque de barras de "location mode" se pasaba envuelto en un `<>...</>` (Fragment) como único hijo condicional, Recharts no lo recorría de la misma forma que un array plano de elementos, y no detectaba ningún `<Bar>` adentro.

**Fix:** devolver un array de elementos JSX con `key` explícita en cada uno, en vez de un Fragment.
```tsx
// ❌ rompe el chart
: <>{topLocations.at(0) && <Bar ... />}</>

// ✅ funciona
: [topLocations.at(0) && <Bar key="red" ... />, ...]
```
**Encontrado por:** verificación propia con Playwright antes del primer commit (no llegó a producción).

---

### 2. El tooltip mostraba "red" en vez del nombre de la location filtrada

**Síntoma:** al hacer hover sobre una barra del gráfico de día de la semana (el de la derecha) estando en modo weekday, el tooltip mostraba literalmente "red" como nombre de la serie en vez del nombre de la location.

**Causa:** en modo weekday, `dailyChartConfig` pasaba a ser `weekdayChartConfig` (con keys `Sun`..`Sat`), pero ese segundo chart seguía teniendo un único `<Bar dataKey="red">` (la serie de la location filtrada, coloreada con `<Cell>` por día). `ChartTooltipContent` busca el label por `dataKey` dentro del `config` recibido; como `weekdayChartConfig` no tenía key `red`, caía al fallback y mostraba el `dataKey` crudo.

**Fix:** mezclar `red: chartConfig.red` (que sí tiene el label correcto, el nombre de la location) dentro de `dailyChartConfig` cuando `groupHourlyByWeekday` está activo.
```ts
const dailyChartConfig = groupHourlyByWeekday
  ? { ...weekdayChartConfig, red: chartConfig.red }
  : chartConfig
```
**Encontrado por:** usuario, vía screenshot.

---

### 3. `--chart-7` era casi idéntico a `--chart-4` en dark mode

**Síntoma:** en dark mode, las barras/leyenda de Mié y Sáb se veían del mismo tono violeta.

**Causa:** el bloque `.dark` de `globals.css` redefine `--chart-4` con un hue distinto al de light (~304°, violeta, contra ~84° tan/gold en light). El valor inicial de `--chart-7` (hue 300°, elegido para no chocar con la paleta de *light*) solo estaba definido en `:root`, así que en dark heredaba ese mismo valor por cascada — quedando por casualidad pegado al nuevo `--chart-4` violeta de dark.

**Fix:** agregar un override explícito de `--chart-7` dentro de `.dark` con un hue distinto (200°, cian), validado con el script `validate_palette.js` del skill `/dataviz` corriendo *por separado* para light y dark (cada modo redefine varios chart-N, así que no alcanza con validar una sola vez).

**Encontrado por:** usuario, vía screenshot.

---

### 4. Aparecían referencias "green"/"blue" con valor 0 cuando había menos de 5 locations

**Síntoma:** al filtrar a un subconjunto con menos de 5 locations distintas (ej. filtrando por hora), la leyenda mostraba swatches de color extra sin texto, y el tooltip listaba entradas `green: 0` / `blue: 0`.

**Causa:** `calculateBestLocations` (vía `extractKeys(..., fillEmpty=true)` en `src/utils/kv/index.ts`) rellena `topKeys` hasta longitud 5 con `''` cuando hay menos de 5 locations. El código original recorría cada slot con `topLocations.at(index) &&` (guard de truthiness que descarta `''`). Un refactor posterior en esta misma sesión (buscando simplificar el código, ver `275c2b4`) lo reemplazó por `topLocations.map(...)`, que itera sobre el array completo *incluyendo* los slots vacíos de padding — generando `<Bar>` fantasma para ellos.

**Fix:** `topLocations.filter(Boolean).map(...)` antes de armar las barras, restituyendo el guard que el `.map()` había perdido.

**Encontrado por:** usuario, vía screenshot. A diferencia de los anteriores, este fue una regresión real introducida por un refactor de esta misma sesión (no estaba en la implementación original).
