//TaskManager
class Task {
    constructor(nombre, descripcion, asignadoA, fechaDeEntrega, estado){
        this.id = null;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.asignadoA = asignadoA;
        this.fechaDeEntrega = fechaDeEntrega;
        this.estado = estado;
    }
}

class TaskManager{
    constructor(){
        this.tasks = [];  //array donde viven las tareas
        this.currentId = 0;   //contador para generar IDS unicos
    }


    getAllTasks() {      //devuele todas las tareas
        return this.tasks;
        }

    //devuelve solo tareas con estado indicado
    getTasksWithStatus(status){
        return this.tasks.filter((task) => task.estado === status);
        }

    //Asigna un ID nuevo y guarda
    addTask(task){
        this.currentId++;
        task.id = this.currentId;
        this.tasks.push(task);
        return task;
        }

    //quitar del array la tarea con ID
    deleteTask(taskId){
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
        }

    //Cambia el estado de una tarea
    updateTask(taskId, status){
        const task = this.tasks.find((t) => t.id === taskId);
        if(task){
            task.estado = status;
            }
        }

    //Cambia la persona asignada
    assignTask(taskId, assignee){
        const task = this.tasks.find((t) => t.id === taskId);
        if(task){
            task.asignadoA = assignee;
            }
        }

    //Crear la tarjeta: recibe una tarea y devuel el elemento HTML
        
    createTaskCard(task) {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.id = `task-${task.id}`;          // lo usaremos para eliminarla en la Tarea 4

        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm";

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
        assignee.textContent = `Asignado a: ${task.asignadoA}`;

        const dueDate = document.createElement("p");
        dueDate.className = "mb-1";
        dueDate.textContent = `Fecha de entrega: ${task.fechaDeEntrega}`;

        const status = document.createElement("span");
        status.className = "badge bg-secondary";
        status.textContent = task.estado;

        //boton delete tarea
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm mt-3 d-block";
        deleteButton.textContent = "Eliminar";

        //connexoón con deletetask
        deleteButton.addEventListener("click", () => {
            this.deleteTask(task.id);   // 1. la quita del array
            col.remove();               // 2. quita la tarjeta del DOM
        });

        body.append(title, description, assignee, dueDate, status, deleteButton);
        card.append(body);
        col.append(card);
        return col;                          // devuelve la tarjeta creada
    }

}

const taskManager = new TaskManager();




//Muestra la lista en el div HTML

function showErrors(errors){
    const errorBox = document.getElementById("form-errors");
    errorBox.innerHTML = errors.map((e) => `<div>${e}</div>`).join("");
    errorBox.classList.remove("d-none");
}

function clearErrors(){
    const errorBox = document.getElementById("form-errors");
    errorBox.innerHTML = "";
    errorBox.classList.add("d-none");
}

//Devuelve true si todo es válido, false si hay error

function validateTaskForm(){
    const name = document.getElementById("task-name").value.trim();  //trim quita espacios
    const description = document.getElementById("task-description").value.trim();
    const assignee = document.getElementById("task-assignee").value.trim();
    const dueDate = document.getElementById("task-due-date").value;
    const status = document.getElementById("task-status").value;

    const errors = [];

    if (name.length <= 8){
        errors.push("El nombre no puede estar vacío y debe tener más de 8 caracteres.");
        }
    
    if(description.length <= 15){
            errors.push("La descripción no puede estar vacía y debe tener más de 15 carácteres.");
        }

    if (assignee.length <= 8){
        errors.push("El campo 'Asignado a' no puede estar vacío y debe tener más de 8 caracteres.");
        }

    if(dueDate === ""){
        errors.push("La fecha de entrega es obligatoria.");
        }

    if(status === ""){
        errors.push("Debes seleccionar un estado.");
         }

    if(errors.length > 0){
        showErrors(errors);
        return false;
    }

    clearErrors();
    return true;
}

//conectar form

const taskForm = document.getElementById("task-form");

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();          // evita que la página se recargue

    if (!validateTaskForm()) {
        return;                      // si falla, no se agrega la tarea
    }

    // Leer los valores de los campos
    const name = document.getElementById("task-name").value.trim();
    const description = document.getElementById("task-description").value.trim();
    const assignee = document.getElementById("task-assignee").value.trim();
    const dueDate = document.getElementById("task-due-date").value;
    const status = document.getElementById("task-status").value;

    // Crear la tarea y guardarla en el array (aquí se le asigna el ID)
    const task = new Task(name, description, assignee, dueDate, status);
    taskManager.addTask(task);

    // Crear la tarjeta y agregarla al contenedor de la página
    const card = taskManager.createTaskCard(task);
    document.getElementById("task-container").append(card);

    taskForm.reset();                // limpia el formulario
});
