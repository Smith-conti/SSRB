Crea una demo web del sistema SSRB (Sistema de Seguimiento y Reparación de Baches) de un departamento de obras públicas. Es solo una demo: NO debe usar base de datos ni backend. Todos los datos se guardan en localStorage del navegador. Debe poder desplegarse en Vercel como sitio estático.

## Stack
- Vite + React + TypeScript + Tailwind CSS.
- React Router con HashRouter (para que funcione en Vercel sin configuración extra), o BrowserRouter con un vercel.json que reescriba todas las rutas a /index.html.
- Sin librerías de backend. Se permiten librerías ligeras (por ejemplo lucide-react para íconos y recharts para gráficos).
- Interfaz completamente en español.

## Roles (sin login real)
Un selector de rol en la barra superior, sin contraseña. El rol elegido se guarda en localStorage y cambia el menú y los permisos. Los cuatro roles son:
1. Ciudadano
2. Personal de obras públicas
3. Equipo de reparación
4. Supervisor

## Funcionalidades (requisitos funcionales)
- RF-01: Registrar un bache con calle, dirección, tamaño (1 a 10) y posición en la vía (medio, cuneta, etc.). Pueden hacerlo el ciudadano y el personal.
- RF-02: Asignar automáticamente un ID único a cada bache (por ejemplo BCH-0001).
- RF-03: Determinar el distrito a partir de la dirección. Usa un catálogo local de calles con su distrito y un selector de calle con autocompletado.
- RF-04: Calcular la prioridad según el tamaño: 1 a 3 baja, 4 a 7 media, 8 a 10 alta. Un bache de tamaño 9 debe quedar con prioridad alta.
- RF-05: El personal crea una orden de trabajo asociada a un bache, con equipo de reparación, número de personas y equipamiento asignado.
- RF-06: El equipo de reparación registra horas dedicadas, cantidad de material de relleno y el estado del bache.
- RF-07: Calcular el costo de la reparación = horas × personas × tarifa por hora + costo del material + costo del equipamiento. Las tarifas son configurables en una pantalla de ajustes (solo Supervisor), con valores por defecto.
- RF-08: Registrar en el archivo de daños: nombre, dirección y teléfono del ciudadano, tipo de daño y monto. Lo pueden hacer el ciudadano y el personal.
- RF-09: Consultar baches y órdenes con filtros por calle, distrito, estado y prioridad. Pueden hacerlo el personal y el supervisor.

## Estados del bache
No reparado (estado inicial al registrar) → Trabajo en proceso (al crear la orden) → Reparado, o Reparación temporal. Desde Reparación temporal se vuelve a Trabajo en proceso con una nueva orden. Desde Trabajo en proceso se puede volver a No reparado si no se pudo reparar. Valida estas transiciones y no permitas otras. Un bache puede tener varias órdenes y varios reclamos de daños.

## Requisitos no funcionales
- RNF-01: Las operaciones deben responder de forma inmediata (menos de 3 segundos).
- RNF-02: Los datos personales del ciudadano (nombre, dirección, teléfono) solo se muestran al Personal y al Supervisor. El Ciudadano solo ve sus propios reportes. Si un rol no autorizado entra a una ruta restringida, muestra un mensaje de acceso denegado.
- RNF-03: Diseño responsive, que funcione bien en celular y en escritorio.
- RNF-04: Un ciudadano debe poder reportar un bache sin capacitación: formulario corto, etiquetas claras y mensajes de validación.

## Pantallas
1. Inicio: resumen según el rol.
2. Reportar bache (formulario).
3. Lista de baches con filtros y detalle de cada bache, que incluya su historial de órdenes y reclamos.
4. Órdenes de trabajo: crear y editar (personal y equipo según permisos).
5. Archivo de daños: formulario y lista.
6. Panel del Supervisor: tarjetas con el total de baches por estado, por prioridad y por distrito, el costo total de reparaciones y un gráfico simple.
7. Ajustes (solo Supervisor): tarifas y botón para restablecer la demo.

## Datos y localStorage
- Guarda las colecciones en claves separadas: ssrb:baches, ssrb:ordenes, ssrb:danos, ssrb:ciudadanos, ssrb:equipos, ssrb:ajustes y ssrb:rol.
- Envuelve toda lectura y escritura en try/catch y maneja el caso de que localStorage esté vacío o no disponible.
- Crea una capa de acceso a datos (un módulo o hook) para que el resto de la app no toque localStorage directamente.
- Al primer arranque carga datos de ejemplo: unos 12 baches de distintos tamaños y estados, 3 equipos de reparación, algunas órdenes y 3 reclamos de daños, con calles y distritos de una ciudad ficticia.
- Botón "Restablecer demo" que borra todo y vuelve a cargar los datos de ejemplo.
- Botón "Exportar datos" que descarga un JSON.

## Calidad
- Valida los formularios (tamaño entre 1 y 10, campos obligatorios, teléfono con formato válido).
- Muestra un aviso visible en la app que diga: "Demo: los datos se guardan solo en este navegador".
- Código ordenado: carpetas components, pages, lib (reglas de negocio: prioridad, costo, transiciones de estado) y data (datos de ejemplo).
- Escribe pruebas unitarias para las funciones de prioridad, costo y transiciones de estado.

## Despliegue
- El proyecto debe compilar con "npm run build" y generar la carpeta dist.
- Incluye vercel.json solo si hace falta, un README con los pasos para desplegar en Vercel (importar el repositorio de GitHub, framework Vite, comando de build y carpeta de salida dist) y cómo ejecutarlo en local.

## Criterios de aceptación
- Un bache de tamaño 9 queda con prioridad alta.
- El costo mostrado coincide con el cálculo manual de la fórmula.
- Un usuario con rol Ciudadano no puede ver el teléfono de otros ciudadanos.
- Al recargar la página los datos siguen ahí.
- Las transiciones de estado no permitidas quedan bloqueadas.