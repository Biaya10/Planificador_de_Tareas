// Pruebas unitarias de la clase TaskManager.
const { loadApp, makeTask } = require("./helpers");

let Task;
let TaskManager;
let manager;

beforeEach(() => {
  ({ Task, TaskManager } = loadApp());
  manager = new TaskManager(); // un manager vacío, sin tareas de ejemplo
});

describe("TaskManager.addTask (agregar)", () => {
  test("agrega la tarea al arreglo y le asigna un id", () => {
    const task = manager.addTask(makeTask(Task));

    expect(manager.getAllTasks()).toHaveLength(1);
    expect(task.id).toBe(1);
  });

  test("los ids son únicos y consecutivos", () => {
    const first = manager.addTask(makeTask(Task));
    const second = manager.addTask(makeTask(Task, { nombre: "Otra tarea distinta" }));

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
  });

  test("guarda la tarea en localStorage", () => {
    manager.addTask(makeTask(Task));
    manager.save();

    const saved = JSON.parse(localStorage.getItem("tasks"));
    expect(saved).toHaveLength(1);
    expect(localStorage.getItem("currentId")).toBe("1");
  });
});

describe("TaskManager.deleteTask (eliminar)", () => {
  test("quita del arreglo la tarea con ese id", () => {
    const task = manager.addTask(makeTask(Task));
    manager.deleteTask(task.id);

    expect(manager.getAllTasks()).toHaveLength(0);
  });

  test("solo elimina la tarea indicada", () => {
    const first = manager.addTask(makeTask(Task));
    const second = manager.addTask(makeTask(Task, { nombre: "Otra tarea distinta" }));

    manager.deleteTask(first.id);

    expect(manager.getAllTasks()).toEqual([second]);
  });

  test("si el id no existe, no cambia nada", () => {
    manager.addTask(makeTask(Task));
    manager.deleteTask(999);

    expect(manager.getAllTasks()).toHaveLength(1);
  });
});

describe("TaskManager.updateTask (actualizar)", () => {
  test("cambia el estado de la tarea", () => {
    const task = manager.addTask(makeTask(Task));
    manager.updateTask(task.id, "HECHO");

    expect(manager.getTaskById(task.id).estado).toBe("HECHO");
  });

  test("no modifica otras tareas", () => {
    const first = manager.addTask(makeTask(Task));
    const second = manager.addTask(makeTask(Task, { nombre: "Otra tarea distinta" }));

    manager.updateTask(first.id, "HECHO");

    expect(second.estado).toBe("POR HACER");
  });

  test("si el id no existe, no falla", () => {
    expect(() => manager.updateTask(999, "HECHO")).not.toThrow();
  });
});

describe("TaskManager.assignTask (asignar a)", () => {
  test("cambia la persona asignada", () => {
    const task = manager.addTask(makeTask(Task));
    manager.assignTask(task.id, "Carlos Pérez");

    expect(manager.getTaskById(task.id).asignadoA).toBe("Carlos Pérez");
  });

  test("si el id no existe, no falla", () => {
    expect(() => manager.assignTask(999, "Carlos Pérez")).not.toThrow();
  });
});

describe("TaskManager.editTask (editar)", () => {
  test("modifica todos los campos de la tarea", () => {
    const task = manager.addTask(makeTask(Task));

    manager.editTask(task.id, {
      nombre: "Nombre nuevo largo",
      descripcion: "Descripción nueva bastante larga",
      asignadoA: "Laura Gómez",
      fechaDeEntrega: "2026-12-15",
      estado: "EN PROCESO",
    });

    expect(manager.getTaskById(task.id)).toMatchObject({
      nombre: "Nombre nuevo largo",
      asignadoA: "Laura Gómez",
      fechaDeEntrega: "2026-12-15",
      estado: "EN PROCESO",
    });
  });
});

describe("TaskManager.save y load (localStorage)", () => {
  test("load recupera las tareas y el contador de ids", () => {
    manager.addTask(makeTask(Task));
    manager.addTask(makeTask(Task, { nombre: "Otra tarea distinta" }));
    manager.save();

    const newManager = new TaskManager();
    newManager.load();

    expect(newManager.getAllTasks()).toHaveLength(2);
    expect(newManager.currentId).toBe(2);
  });

  test("después de load, los ids nuevos continúan la numeración", () => {
    manager.addTask(makeTask(Task));
    manager.save();

    const newManager = new TaskManager();
    newManager.load();
    const task = newManager.addTask(makeTask(Task, { nombre: "Otra tarea distinta" }));

    expect(task.id).toBe(2);
  });

  test("si no hay nada guardado, load no falla", () => {
    localStorage.clear(); // al cargar la app se guardan los ejemplos, así que se vacía
    const newManager = new TaskManager();
    expect(() => newManager.load()).not.toThrow();
    expect(newManager.getAllTasks()).toHaveLength(0);
  });
});
