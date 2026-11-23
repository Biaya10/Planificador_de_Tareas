// Color del badge según el estado
const STATUS_COLORS = {
  "POR HACER": "status-por-hacer",
  "EN PROCESO": "status-en-proceso",
  REVISIÓN: "status-revision",
  HECHO: "status-hecho",
};

// Convierte "2026-11-02" en "02/11/2026" solo para mostrarlo
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// Task: representa una tarea con sus datos (el id lo asigna TaskManager)
class Task {
  constructor(nombre, descripcion, asignadoA, fechaDeEntrega, estado) {
    this.id = null;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.asignadoA = asignadoA;
    this.fechaDeEntrega = fechaDeEntrega;
    this.estado = estado;
  }
}

// TaskManager: guarda la lista de tareas, las modifica,
// las dibuja en pantalla (render) y las persiste en localStorage (save/load)
class TaskManager {
  constructor() {
    this.tasks = []; // array donde viven las tareas
    this.currentId = 0; // contador para generar ids únicos
  }

  // Devuelve todas las tareas
  getAllTasks() {
    return this.tasks;
  }

  //devuelve solo tareas con estado indicado
  getTasksWithStatus(status) {
    return this.tasks.filter((task) => task.estado === status);
  }

  // Le asigna un id nuevo a la tarea y la agrega al array
  addTask(task) {
    this.currentId++;
    task.id = this.currentId;
    this.tasks.push(task);
    return task;
  }

  //quitar del array la tarea con ID
  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }

  // Cambia solo el estado de una tarea (lo usa el botón "Completar")
  updateTask(taskId, status) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.estado = status;
    }
  }

  // Edita todos los campos de una tarea (lo usa el formulario en modo "Actualizar").
  // "data" es un objeto con: nombre, descripcion, asignadoA, fechaDeEntrega y estado
  editTask(taskId, data) {
    const task = this.getTaskById(taskId);
    if (task) {
      task.nombre = data.nombre;
      task.descripcion = data.descripcion;
      task.asignadoA = data.asignadoA;
      task.fechaDeEntrega = data.fechaDeEntrega;
      task.estado = data.estado;
    }
  }

  //Cambia la persona asignada
  assignTask(taskId, assignee) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.asignadoA = assignee;
    }
  }

  // Busca una tarea por su id y la devuelve (o undefined si no existe)
  getTaskById(taskId) {
    return this.tasks.find((task) => task.id === taskId);
  }

  //Crear la tarjeta: recibe una tarea y devuel el elemento HTML

  createTaskCard(task) {
    const col = document.createElement("div");
    col.className = "col-md-4";
    col.id = `task-${task.id}`;
    col.dataset.taskId = task.id; // guarda el id en el HTML (data-task-id) para saber de qué tarea es la tarjeta

    const card = document.createElement("div");
    card.className = "task-card card h-100";
    card.dataset.status = task.estado; // el CSS colorea la franja según el estado

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.className = "card-title h5";
    title.textContent = task.nombre;

    const description = document.createElement("p");
    description.className = "card-text";
    description.textContent = task.descripcion;

    const assignee = document.createElement("p");
    assignee.className = "mb-1";
    assignee.textContent = `👤 Asignado a: ${task.asignadoA}`;

    const dueDate = document.createElement("p");
    dueDate.className = "mb-1";
    dueDate.textContent = `📅 Entrega: ${formatDate(task.fechaDeEntrega)}`;

    const status = document.createElement("span");
    status.className = `task-badge badge ${STATUS_COLORS[task.estado] || "status-por-hacer"}`;
    status.textContent = task.estado;

    // Botón "Completar": la clase done-button sirve para detectarlo al hacer clic
    const doneButton = document.createElement("button");
    doneButton.type = "button";
    doneButton.className = "btn btn-success btn-sm mt-3 d-block done-button";
    doneButton.textContent = "Completar";

    // Botón "Eliminar"
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-delete btn-sm mt-3 d-block";
    deleteButton.textContent = "Eliminar";

    // Al hacer clic en "Eliminar"
    deleteButton.addEventListener("click", () => {
      this.deleteTask(task.id); // 1. la quita del array
      col.remove(); // 2. quita la tarjeta del DOM
      this.save(); // 3. guarda el cambio en localStorage
    });

    body.append(title, description, assignee, dueDate, status);
    // "Completar" solo aparece si la tarea todavía no está en HECHO
    if (task.estado !== "HECHO") {
      body.append(doneButton);
    }
    body.append(deleteButton);

    card.append(body);
    col.append(card);
    return col; // devuelve la tarjeta creada
  }

  // Redibuja toda la lista: limpia el contenedor y crea una tarjeta por cada tarea
  render() {
    const container = document.getElementById("task-container");
    container.innerHTML = "";
    this.tasks.forEach((task) => {
      container.append(this.createTaskCard(task));
    });
  }

  // Guarda las tareas y el contador de ids en localStorage.
  // localStorage solo guarda texto, por eso el arreglo se convierte con JSON.stringify
  save() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
    // se guarda el contador para que los ids nuevos no se repitan después de recargar
    localStorage.setItem("currentId", String(this.currentId));
  }

  // Recupera las tareas y el contador desde localStorage.
  // Se revisa que no sea null porque JSON.parse(null) daría error si no hay nada guardado
  load() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks !== null) {
      this.tasks = JSON.parse(savedTasks); // texto -> arreglo de tareas
    }

    const savedId = localStorage.getItem("currentId");
    if (savedId !== null) {
      this.currentId = Number(savedId); // texto -> número
    }
  }
}

// Instancia que usa toda la página
const taskManager = new TaskManager();

// Tareas de ejemplo que se muestran al cargar la página
const sampleTasks = [
  new Task(
    "Diseñar wireframes",
    "Dibujar los wireframes del formulario y de la lista de tareas.",
    "Amanda Chindoy",
    "2026-11-02",
    "HECHO",
  ),
  new Task(
    "Maquetar con Bootstrap",
    "Implementar el formulario y las tarjetas usando clases de Bootstrap.",
    "Amanda Chindoy",
    "2026-11-05",
    "EN PROCESO",
  ),
  new Task(
    "Validar el formulario",
    "Validar todos los campos con JavaScript y mostrar mensajes de error.",
    "Carlos Pérez",
    "2026-11-08",
    "REVISIÓN",
  ),
  new Task(
    "Escribir el README",
    "Documentar cómo ejecutar y usar el planificador de tareas.",
    "Laura Gómez",
    "2026-11-10",
    "POR HACER",
  ),
  new Task(
    "Preparar la demo",
    "Ensayar la presentación del proyecto para la reflexión del sprint.",
    "Juan Torres",
    "2026-11-12",
    "POR HACER",
  ),
];

// Al abrir la página, el orden importa:
// 1. cargar lo guardado, 2. crear los ejemplos solo si no hay nada, 3. dibujar la lista
taskManager.load();

if (taskManager.getAllTasks().length === 0) {
  sampleTasks.forEach((task) => {
    taskManager.addTask(task);
  });
  taskManager.save();
}
taskManager.render();

// Muestra los mensajes de error del formulario en el div de errores
function showErrors(errors) {
  const errorBox = document.getElementById("form-errors");
  errorBox.innerHTML = errors.map((e) => `<div>${e}</div>`).join("");
  errorBox.classList.remove("d-none");
}

// Oculta y vacía el div de errores
function clearErrors() {
  const errorBox = document.getElementById("form-errors");
  errorBox.innerHTML = "";
  errorBox.classList.add("d-none");
}

// Valida los campos del formulario.
// Devuelve true si todo es válido, false si hay algún error (y lo muestra)
function validateTaskForm() {
  const name = document.getElementById("task-name").value.trim(); //trim quita espacios
  const description = document.getElementById("task-description").value.trim();
  const assignee = document.getElementById("task-assignee").value.trim();
  const dueDate = document.getElementById("task-due-date").value;
  const status = document.getElementById("task-status").value;

  const errors = [];

  if (name.length <= 8) {
    errors.push(
      "El nombre no puede estar vacío y debe tener más de 8 caracteres.",
    );
  }

  if (description.length <= 15) {
    errors.push(
      "La descripción no puede estar vacía y debe tener más de 15 caracteres.",
    );
  }

  if (assignee.length <= 8) {
    errors.push(
      "El campo 'Asignado a' no puede estar vacío y debe tener más de 8 caracteres.",
    );
  }

  if (dueDate === "") {
    errors.push("La fecha de entrega es obligatoria.");
  }

  if (status === "") {
    errors.push("Debes seleccionar un estado.");
  }

  if (errors.length > 0) {
    showErrors(errors);
    return false;
  }

  clearErrors();
  return true;
}

// ---- Formulario: guardar una tarea nueva o actualizar una existente ----

const taskForm = document.getElementById("task-form");
const submitButton = document.getElementById("task-submit");

// Recuerda en qué modo está el formulario:
// null = modo "Guardar" (tarea nueva); un número = modo "Actualizar" (id de la tarea editada)
let editingTaskId = null;

// Vuelve al modo "Guardar" y limpia el formulario
function resetFormMode() {
  editingTaskId = null;
  submitButton.textContent = "Guardar";
  taskForm.reset();
}

// Al enviar el formulario
taskForm.addEventListener("submit", (event) => {
  event.preventDefault(); // evita que la página se recargue

  if (!validateTaskForm()) {
    return; // si falla, no se agrega la tarea
  }

  // Leer los valores de los campos
  const name = document.getElementById("task-name").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const assignee = document.getElementById("task-assignee").value.trim();
  const dueDate = document.getElementById("task-due-date").value;
  const status = document.getElementById("task-status").value;

  if (editingTaskId === null) {
    // Modo guardar: tarea nueva
    const task = new Task(name, description, assignee, dueDate, status);
    taskManager.addTask(task);
  } else {
    // Modo actualizar: se modifica la tarea existente
    taskManager.editTask(editingTaskId, {
      nombre: name,
      descripcion: description,
      asignadoA: assignee,
      fechaDeEntrega: dueDate,
      estado: status,
    });
    editingTaskId = null; // vuelve al modo "Guardar"
    submitButton.textContent = "Guardar";
  }

  taskManager.render(); // redibuja la lista
  taskManager.save(); // guarda en localStorage
  taskForm.reset(); // limpia el formulario
});

// ---- Lista de tareas: un solo listener para todos los clics (delegación de eventos) ----
// event.target es el elemento donde se hizo clic; con closest() se sube por el DOM
// hasta la tarjeta que tiene el atributo data-task-id
const taskList = document.querySelector("#task-container");

taskList.addEventListener("click", (event) => {
  // 1. Botón "Completar": cambia el estado de la tarea a HECHO
  if (event.target.classList.contains("done-button")) {
    const taskElement = event.target.closest("[data-task-id]");
    const taskId = Number(taskElement.dataset.taskId); // el dataset es texto, se pasa a número
    taskManager.updateTask(taskId, "HECHO");
    taskManager.render();
    taskManager.save();

    // Si esa tarea estaba cargada en el formulario, se actualiza también su estado ahí
    if (taskId === editingTaskId) {
      document.getElementById("task-status").value = "HECHO";
    }
    return;
  }

  // 2. Otros botones ("Eliminar" tiene su propio listener): no se carga el formulario
  if (event.target.closest("button")) {
    // Si se eliminó la tarea que se estaba editando, se sale del modo "Actualizar"
    const taskElement = event.target.closest("[data-task-id]");
    if (taskElement && Number(taskElement.dataset.taskId) === editingTaskId) {
      resetFormMode();
    }
    return;
  }

  // 3. Clic en la tarjeta: se cargan sus datos en el formulario y se pasa al modo "Actualizar"
  const taskElement = event.target.closest("[data-task-id]");
  if (!taskElement) return; // clic fuera de una tarjeta

  const task = taskManager.getTaskById(Number(taskElement.dataset.taskId));
  document.getElementById("task-name").value = task.nombre;
  document.getElementById("task-description").value = task.descripcion;
  document.getElementById("task-assignee").value = task.asignadoA;
  document.getElementById("task-due-date").value = task.fechaDeEntrega;
  document.getElementById("task-status").value = task.estado;

  editingTaskId = task.id;
  submitButton.textContent = "Actualizar";
});

// Exporta las clases para las pruebas con Jest.
// En el navegador "module" no existe, por eso este bloque no hace nada allí.
if (typeof module !== "undefined") {
  module.exports = { Task, TaskManager, taskManager };
}
