# SSRB · Demo del Sistema de Seguimiento y Reparación de Baches

Demo web del **SSRB** para un departamento de obras públicas de la ciudad ficticia de
**Villa Nueva**. Funciona **sin backend ni base de datos**: todos los datos se guardan
en el `localStorage` del navegador y el sitio se puede desplegar como contenido
estático en Vercel.

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
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve la build local
npm test          # pruebas unitarias
```

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

`src/data/calles.ts` contiene 16 calles de Villa Nueva distribuidas en 5 distritos
(Centro, Norte, Sur, Este y Oeste). El formulario ofrece autocompletado con
`datalist`, sugiere calles y muestra el distrito detectado. Si la calle no está en
el catálogo, no se puede registrar el bache.

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

### Costo de reparación (RF-07)

```text
costo = horas × personas × tarifaHora
      + m³ de material × costoMaterialM3
      + costoEquipamiento (si la orden tiene al menos un equipo asignado)
```

- `tarifaHora`, `costoMaterialM3` y `costoEquipamiento` son configurables en
  **Ajustes** (solo Supervisor).
- Valores por defecto: **$ 25** por hora/persona, **$ 60** por m³ y **$ 120** de
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
- **Exportar datos** descarga un JSON con todas las colecciones y las tarifas.
- **Restablecer demo** borra las colecciones de datos y vuelve a cargar los ejemplos
  (mantiene el rol activo).

## Estructura del proyecto

```text
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
```

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

Además se verificó el flujo completo en navegador (crear bache, crear orden,
registrar avance, cerrar como reparado, persistencia tras recargar, privacidad de
datos y acceso denegado).

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
8. **Formato es-AR** para fechas y montos (`$ 1.234,50`), coherente con el idioma de
   la interfaz.

## Limitaciones conocidas

- No hay autenticación real: el selector de rol es parte de la demo.
- Los datos no se sincronizan entre pestañas ni dispositivos.
- El ciudadano activo es fijo; no se pueden simular varias sesiones de ciudadano a
  la vez.
- No hay backend, carga de archivos ni notificaciones.
