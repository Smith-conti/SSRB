# SSRB · Demo del Sistema de Seguimiento y Reparación de Baches

Demo web del **SSRB** para un departamento de obras públicas de la ciudad de
**Cusco (Perú)**. Funciona **sin backend ni base de datos**: todos los datos se guardan
en el `localStorage` del navegador y el sitio se puede desplegar como contenido
estático en Vercel.

Las calles y distritos corresponden a Cusco; los reportes, personas y montos son
datos ficticios de demostración.

> **Demo:** los datos se guardan solo en este navegador.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS 4** (plugin `@tailwindcss/vite`)
- **React Router** con `HashRouter` (no requiere reescrituras en Vercel)
- **lucide-react** para íconos y **recharts** para los gráficos del panel
- **Vitest** para las pruebas unitarias

## Inicio rápido

Requisitos: Node.js 20.19+ o 22.12+ (probado con Node 24).

```bash
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Valida TypeScript y genera la build estática en `dist/` |
| `npm run preview` | Sirve localmente la build de `dist/` |
| `npm test` | Ejecuta las pruebas unitarias con Vitest |
| `npm run test:watch` | Pruebas en modo interactivo |

## Despliegue en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. En Vercel, elige **Add New → Project** e importa el repositorio.
3. Configura:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Deploy.

No hace falta `vercel.json`: al usar `HashRouter`, las rutas viven después del `#` y
Vercel solo sirve `index.html` y los assets estáticos.

## Roles y permisos

El rol se elige en la barra superior, sin contraseña, y se guarda en
`localStorage`. El selector es de confianza: es una demo, no un sistema de
autenticación.

| Funcionalidad | Ciudadano | Personal | Equipo | Supervisor |
| --- | :---: | :---: | :---: | :---: |
| Reportar bache | ✅ | ✅ | — | — |
| Ver baches | Solo los propios | Todos | Todos | Todos |
| Crear orden de trabajo | — | ✅ | — | — |
| Registrar avance / cerrar orden | — | ✅ | ✅ | — |
| Archivo de daños | Solo los propios + crear | Todos + crear | — | Todos (solo lectura) |
| Panel de indicadores | — | — | — | ✅ |
| Ajustes, exportar y restablecer | — | — | — | ✅ |

Los datos personales (nombre, dirección y teléfono) se muestran al **Personal** y al
**Supervisor**. El **Ciudadano** ve únicamente sus propios reportes y reclamos. El
**Equipo de reparación** ve la ubicación del bache, pero no los datos de contacto ni
el archivo de daños.

### Identidad del ciudadano en la demo

No hay login. El ciudadano activo es **Lucía Fernández (`CIU-0001`)** y su ID se
guarda en `ssrb:ciudadanoActual` (clave adicional a las indicadas en la
especificación). Los reportes creados con el rol Ciudadano se asocian a ese perfil.
Los datos de ejemplo incluyen reportes de otros ciudadanos para demostrar el
filtrado y la protección de datos.

## Pantallas y rutas

| Ruta (`#/…`) | Pantalla | Roles |
| --- | --- | --- |
| `/` | Inicio con resumen según el rol | Todos |
| `/reportar` | Formulario de reporte de bache | Ciudadano, Personal |
| `/baches` | Lista y filtros de baches | Todos (el ciudadano ve solo los suyos) |
| `/baches/:id` | Detalle con historial de órdenes y reclamos | Todos (con control de acceso) |
| `/ordenes` | Órdenes de trabajo: crear, editar y cerrar | Personal, Equipo, Supervisor |
| `/danos` | Archivo de daños: formulario y lista | Ciudadano, Personal, Supervisor |
| `/panel` | Panel del supervisor con gráficos | Supervisor |
| `/ajustes` | Tarifas, exportación y restablecimiento | Supervisor |

Si un rol entra a una ruta restringida (incluso cambiando la URL), se muestra
**Acceso denegado**.

## Cobertura de requisitos

| Requisito | Dónde se implementa |
| --- | --- |
| RF-01 Registrar bache | `pages/ReportarBache.tsx`, `AppContext.addBache` |
| RF-02 ID único | `lib/ids.ts` (`BCH-0001`, `ORD-0001`, `DAN-0001`…) |
| RF-03 Distrito por dirección | `data/calles.ts` + autocompletado del formulario |
| RF-04 Prioridad por tamaño | `lib/rules.ts` (`calcularPrioridad`) |
| RF-05 Crear orden de trabajo | `components/OrdenForm.tsx`, `AppContext.crearOrden` |
| RF-06 Registrar avance y estado | `components/AvanceForm.tsx`, `actualizarOrden`, `cerrarOrden` |
| RF-07 Costo de reparación | `lib/rules.ts` (`desglosarCosto`) + tarifas en Ajustes |
| RF-08 Archivo de daños | `pages/Danos.tsx`, `AppContext.addDano` |
| RF-09 Filtros de baches y órdenes | `pages/Baches.tsx`, `pages/Ordenes.tsx` |
| RNF-01 Respuesta inmediata | Estado en memoria + `localStorage`; sin llamadas de red |
| RNF-02 Privacidad y acceso | `lib/permissions.ts`, `RequireRole`, `AccesoDenegado` |
| RNF-03 Diseño responsive | Tailwind con tablas en escritorio y tarjetas en móvil |
| RNF-04 Reporte sin capacitación | Formulario corto, etiquetas claras y validaciones |

## Reglas de negocio

### Prioridad (RF-04)

| Tamaño | Prioridad |
| --- | --- |
| 1–3 | Baja |
| 4–7 | Media |
| 8–10 | Alta |

El tamaño debe ser un entero entre 1 y 10. Un bache de tamaño **9** queda en
prioridad **alta**.

### Distrito y catálogo de calles (RF-03)

`src/data/calles.ts` contiene 16 calles y avenidas de Cusco distribuidas en 5
distritos (Centro Histórico, Wanchaq, Santiago, San Sebastián y San Jerónimo). El
formulario ofrece autocompletado con `datalist`, sugiere calles y muestra el distrito
detectado. Si la calle no está en el catálogo, no se puede registrar el bache.

### Estados del bache

```text
No reparado ──▶ Trabajo en proceso ──▶ Reparado
                       │
                       ├──▶ Reparación temporal ──▶ Trabajo en proceso (nueva orden)
                       └──▶ No reparado
```

- Crear una orden pasa el bache de **No reparado** o **Reparación temporal** a
  **Trabajo en proceso**.
- Cerrar la orden permite **Reparado**, **Reparación temporal** o **No reparado**
  solo desde **Trabajo en proceso**.
- **Reparado** es terminal.
- Un bache puede tener varias órdenes, pero **solo una abierta a la vez**.
- Las transiciones se validan en `src/lib/rules.ts` y en `AppContext`; no se pueden
  forzar desde la interfaz.

### Filtros de consulta (RF-09)

La lista de baches filtra por texto (ID, calle o dirección), distrito, estado y
prioridad. La lista de órdenes filtra por texto, estado de la orden, equipo,
distrito del bache y prioridad del bache. El personal y el supervisor usan estas
vistas para la consulta operativa.

### Costo de reparación (RF-07)

```text
costo = horas × personas × tarifaHora
      + m³ de material × costoMaterialM3
      + costoEquipamiento (si la orden tiene al menos un equipo asignado)
```

- `tarifaHora`, `costoMaterialM3` y `costoEquipamiento` son configurables en
  **Ajustes** (solo Supervisor).
- Valores por defecto: **S/ 25** por hora/persona, **S/ 60** por m³ y **S/ 120** de
  equipamiento por orden.
- El costo de equipamiento es un valor **fijo por orden**, no por hora, para que la
  fórmula sea simple y verificable.
- El costo se calcula en vivo con las tarifas vigentes; si el supervisor las cambia,
  todos los costos se recalculan.
- El total del panel incluye todas las órdenes registradas (abiertas y cerradas),
  con las horas y materiales cargados hasta el momento.

### IDs

Los IDs se generan con el mayor correlativo existente y se rellenan a 4 dígitos:
`BCH-0001`, `ORD-0001`, `DAN-0001`, etc.

### Reclamos de daños

Cada reclamo se asocia a un bache (`bacheId`) y guarda nombre, dirección, teléfono,
tipo de daño y monto. Los reclamos se ven en el detalle del bache. El ciudadano solo
puede reclamar sobre baches de sus propios reportes, coherente con la regla de que
solo ve sus reportes.

## Datos y localStorage

Colecciones en claves separadas:

| Clave | Contenido |
| --- | --- |
| `ssrb:baches` | Baches |
| `ssrb:ordenes` | Órdenes de trabajo |
| `ssrb:danos` | Reclamos de daños |
| `ssrb:ciudadanos` | Perfiles de ciudadanos |
| `ssrb:equipos` | Equipos/cuadrillas de reparación |
| `ssrb:ajustes` | Tarifas |
| `ssrb:rol` | Rol activo |
| `ssrb:ciudadanoActual` | ID del ciudadano activo (clave adicional) |

- Toda lectura/escritura pasa por `src/lib/storage.ts` y está envuelta en
  `try/catch`.
- Si `localStorage` no está disponible, la app funciona en memoria y muestra un
  aviso rojo.
- La capa de acceso a datos es `src/context/AppContext.tsx`; las páginas no tocan
  `localStorage` directamente.
- Al primer arranque se cargan **12 baches**, **3 equipos**, **8 órdenes** y **3
  reclamos** de ejemplo.
- Si los datos guardados son de una versión anterior con otros distritos, la demo
  recarga automáticamente los datos de ejemplo de Cusco.
- **Exportar datos** descarga un JSON con todas las colecciones y las tarifas.
- **Restablecer demo** borra las colecciones de datos y vuelve a cargar los ejemplos
  (mantiene el rol activo).

## Estructura del proyecto

```text
public/
  favicon.svg
src/
  components/     Layout, badges, modales, formularios de orden/avance, guardas
  context/        AppContext: estado, permisos y persistencia
  data/           catálogo de calles y datos de ejemplo
  lib/            reglas (prioridad, costo, transiciones), permisos, selectores,
                  formato, validación, IDs y storage
  pages/          Inicio, ReportarBache, Baches, BacheDetalle, Ordenes, Danos,
                  Panel, Ajustes
  types.ts        modelo de datos
  App.tsx         rutas
  main.tsx        punto de entrada
index.html
package.json
tsconfig.json
vite.config.ts
.gitignore
base.md           especificación original
README.md
```

## Control de versiones

El archivo `.gitignore` excluye lo que no debe subirse al repositorio:

- Dependencias (`node_modules/`) y builds (`dist/`, `dist-ssr/`, `build/`).
- Cobertura y artefactos de pruebas (`coverage/`, `playwright-report/`,
  `test-results/`).
- Variables de entorno (`.env`, `.env.*`, conservando `.env.example`).
- Configuración local de Vercel (`.vercel/`) y cachés (`.vite/`, `.cache/`).
- Logs de npm/yarn/pnpm y archivos del sistema o del editor (`.DS_Store`,
  `Thumbs.db`, `.idea/`, `.vscode/*` salvo extensiones recomendadas).

`package-lock.json` sí se versiona para que las instalaciones sean reproducibles.

## Pruebas

```bash
npm test
```

`src/lib/rules.test.ts` cubre:

- Prioridad en los límites 1–3, 4–7, 8–10 (incluido tamaño 9 → alta) y valores
  inválidos.
- Fórmula de costo completa, sin equipamiento, con decimales y con horas/material
  en cero.
- Todas las transiciones permitidas y las prohibidas; `reparado` como estado
  terminal.

Además se verificó el flujo completo en navegador: crear bache, crear orden,
registrar avance, reasignar equipo/personas/equipamiento, cerrar como reparado,
filtrar órdenes por distrito y prioridad, persistencia tras recargar, privacidad de
datos y acceso denegado. La verificación se ejecutó sin errores de consola.

## Decisiones de implementación

La especificación dejaba algunos puntos abiertos. Se resolvieron así:

1. **Ciudadano activo fijo** (`CIU-0001`) con clave `ssrb:ciudadanoActual`, ya que no
   hay login. Es suficiente para demostrar "solo ve sus propios reportes".
2. **Una sola orden abierta por bache**. Las órdenes anteriores quedan como
   historial.
3. **Costo de equipamiento fijo por orden** cuando hay equipamiento asignado, en
   lugar de un costo por hora por equipo.
4. **Reclamos asociados a un bache** mediante `bacheId`, para que aparezcan en el
   detalle.
5. **Supervisor de solo lectura** en baches, órdenes y daños; su función es
   supervisar, ajustar tarifas y gestionar la demo. El personal crea las órdenes
   (RF-05) y el equipo registra avances (RF-06).
6. **Exportar y restablecer** viven en Ajustes, disponibles solo para el Supervisor.
7. **`HashRouter`** para evitar configuración de rewrites en Vercel.
8. **Formato es-PE** para fechas y montos en soles (`S/ 1,234.50`), coherente con la
   ciudad de Cusco y el idioma de la interfaz.
9. **El personal puede reasignar la orden** (equipo, personas y equipamiento) desde
   el formulario de avance, además de registrar horas y material. El equipo de
   reparación solo registra horas, material, observaciones y el resultado.

## Limitaciones conocidas

- No hay autenticación real: el selector de rol es parte de la demo.
- Los datos no se sincronizan entre pestañas ni dispositivos.
- El ciudadano activo es fijo; no se pueden simular varias sesiones de ciudadano a
  la vez.
- No hay backend, carga de archivos ni notificaciones.
