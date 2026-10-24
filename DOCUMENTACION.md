# Planificador de Tareas — Documentación del Sprint 2

Proyecto con HTML, Bootstrap 5.3 y JavaScript. Permite agregar tareas mediante un formulario validado, verlas como tarjetas y eliminarlas.

## Estructura

```
Planificador_de_Tareas/
├── index.html      # Formulario y contenedor de tareas (Bootstrap)
├── css/style.css   # Estilos propios (hover de tarjetas, errores)
└── js/app.js       # Clases Task y TaskManager, validación y eventos
```

## Paso a paso de lo implementado

### Paso 1 — Formulario con Bootstrap
- Se carga Bootstrap 5.3.8 por CDN (CSS y JS).
- El formulario usa la grilla (`row g-3`, `col-md-6`, `col-12`) y cada campo tiene su `<label>`.
- Campos: **Nombre**, **Asignado a**, **Descripción**, **Fecha de entrega** y **Estado**.
- **Estado** es un `<select>` con las opciones `POR HACER`, `EN PROCESO`, `REVISIÓN` y `HECHO`. Son los valores que define la guía del Sprint 2 (la rúbrica del Sprint 1 los llama PENDIENTE y EN PROGRESO; se siguió la guía del Sprint 2).

### Paso 2 — Tarjeta de tarea y lista de tareas
- `TaskManager.createTaskCard(task)` genera una tarjeta Bootstrap (`card`) con nombre, descripción, asignado a, fecha de entrega y estado.
- El estado se muestra como `badge` con color según su valor: POR HACER gris, EN PROCESO azul, REVISIÓN amarillo y HECHO verde. El mapa `STATUS_COLORS` define los colores.
- Las tarjetas se ubican en `#task-container` (`row g-3`, con `col-md-4` por tarjeta), así que quedan en cuadrícula responsive.
- Al cargar la página se agregan **5 tareas de ejemplo** (`sampleTasks`), cada una con un estado distinto o repetido.
- Los textos se insertan con `textContent`, no con `innerHTML`, para evitar inyección de HTML.

### Paso 3 — Validación del formulario
- El `<form>` tiene `novalidate`, así que la validación la hace `validateTaskForm()` en `app.js` y no el navegador.
- Reglas:
  | Campo | Regla |
  |---|---|
  | Nombre | Más de 8 caracteres (se aplica `trim()`) |
  | Descripción | Más de 15 caracteres |
  | Asignado a | Más de 8 caracteres (regla de la guía del Sprint 2; "Amanda Chindoy" sí pasa) |
  | Fecha de entrega | Obligatoria |
  | Estado | Debe elegirse una opción |
- Si hay errores, `showErrors()` los lista en un `alert alert-danger`, un mensaje por campo inválido. Si todo es válido, `clearErrors()` oculta el recuadro.
- El JavaScript está en un archivo separado (`js/app.js`) y se incluye con `<script src="js/app.js" defer>`.

### Paso 4 — Agregar y eliminar tareas
- Al enviar el formulario se hace `preventDefault()`, se valida, se crea un `Task`, se guarda con `taskManager.addTask()` (que asigna un ID único) y se agrega su tarjeta al DOM. Luego se limpia el formulario.
- Cada tarjeta tiene un botón **Eliminar**. Llama a `deleteTask(id)` para quitar la tarea del arreglo y elimina la tarjeta del DOM.

### Paso 5 — Diseño visual
- Paleta pastel: fondo crema, rosa y lila, con texto en tinta oscura (`#2f2a3c`) para que se lea bien. Los colores están como variables CSS al inicio de `css/style.css`.
- Tipografías de Google Fonts: **Fredoka** para el título y **Quicksand** para el resto.
- Encabezado: un cuadro con degradado rosa a lila, del mismo ancho que el contenido, con el título y el subtítulo centrados.
- Formulario: tarjeta blanca con una franja rosa a la izquierda, como el margen de un cuaderno. Los campos tienen bordes redondeados.
- Tarjetas: franja de color arriba según el estado (POR HACER lila, EN PROCESO rosa, REVISIÓN amarillo, HECHO verde). El JS guarda el estado en `data-status` y el CSS pinta la franja.
- Etiquetas de estado en colores pastel, definidas con las clases `status-*`.
- La fecha se muestra como dd/mm/aaaa con `formatDate()`. El dato guardado sigue siendo el original (`aaaa-mm-dd`).
- Todos los estilos usan clases, no IDs, y hay una regla para pantallas pequeñas.
- El `!important` del hover es necesario porque Bootstrap define sus sombras con `!important`.

### Paso 6 — Cumplimiento de la guía del Sprint 2
- `validateTaskForm()` devuelve `true` o `false`, y el listener del `submit` no llama a `addTask()` si devuelve `false`.
- La tarea tiene los campos `id`, `nombre`, `descripcion`, `asignadoA`, `fechaDeEntrega` y `estado`, y solo guarda texto y números, por lo que se puede convertir con `JSON.stringify`.
- `TaskManager` tiene `getAllTasks`, `getTasksWithStatus`, `addTask`, `deleteTask`, `updateTask` y `assignTask`. Un contador (`currentId`) genera IDs únicos que se incrementan, y las tareas viven en un array en memoria.
- Buenas prácticas: etiquetas semánticas, `label for`, atributo `name` en cada campo, `placeholder`, `required`, botón `type="submit"`, formulario con id, CSS externo con clases y estructura `css/` y `js/`.

## Decisiones de diseño (resolución de problemas)

| Decisión | Alternativas | Elección y motivo |
|---|---|---|
| Dónde validar | Atributos HTML5 (`required`, `minlength`) vs. JavaScript | JavaScript: permite mensajes propios, uno por campo, y la rúbrica pide validar en JS. |
| Cómo mostrar errores | `alert()` vs. mensajes bajo cada campo vs. un recuadro único | Recuadro único con `alert-danger`: es simple y se ve todo junto sin interrumpir al usuario. |
| Cómo construir tarjetas | Plantillas con `innerHTML` vs. `createElement` | `createElement` con `textContent`: más seguro y mantenible. |
| Organización del código | Funciones sueltas vs. clases | Clases `Task` y `TaskManager`: concentran los datos y las operaciones (agregar, eliminar, filtrar). |

## Cómo probarlo
1. Abrir `index.html` en el navegador.
2. Verificar que aparecen 5 tareas de ejemplo.
3. Enviar el formulario vacío: deben aparecer los 5 mensajes de error.
4. Completar bien los datos y presionar **Añadir tarea**: la tarjeta nueva aparece.
5. Presionar **Eliminar** en una tarjeta: desaparece.

## Cobertura de la rúbrica

| Criterio | Cumplimiento |
|---|---|
| Wireframes con Bootstrap | Todos los campos con su label, y `select` de estado con las 4 opciones. |
| Tarjeta y lista de tareas | La tarjeta muestra los 5 datos, la cuadrícula las organiza y hay 5 ejemplos. |
| Validación del formulario | Se validan los 5 campos, con mensajes claros y JS en archivo separado. |
| Resolución de problemas | Ver la tabla de decisiones de diseño. |

## Pendiente para otros sprints
- Persistencia (por ejemplo `localStorage`) para que las tareas no se pierdan al recargar.
- Editar el estado y la persona asignada desde la tarjeta (`updateTask` y `assignTask` ya existen en `TaskManager`, pero no tienen interfaz).
