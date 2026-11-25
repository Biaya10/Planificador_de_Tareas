// Pruebas de la interfaz: lista HTML (#task-container) y formulario.
const { loadApp } = require("./helpers");

// Devuelve la tarjeta (col) cuyo título es el indicado.
function findCard(title) {
  return [...document.querySelectorAll("#task-container [data-task-id]")].find(
    (col) => col.querySelector(".card-title").textContent === title,
  );
}

// Rellena el formulario con datos válidos y lo envía.
function submitForm(name) {
  document.getElementById("task-name").value = name;
  document.getElementById("task-description").value = "Descripción de prueba bastante larga";
  document.getElementById("task-assignee").value = "Amanda Chindoy";
  document.getElementById("task-due-date").value = "2026-12-01";
  document.getElementById("task-status").value = "POR HACER";

  document
    .getElementById("task-form")
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function cardTitles() {
  return [...document.querySelectorAll("#task-container .card-title")].map(
    (title) => title.textContent,
  );
}

beforeEach(() => {
  loadApp();
});

describe("UI: agregar una tarea", () => {
  test("al agregar una tarea, aparece en la lista HTML", () => {
    const before = document.querySelectorAll("#task-container [data-task-id]").length;

    submitForm("Tarea nueva de prueba");

    const after = document.querySelectorAll("#task-container [data-task-id]").length;
    expect(after).toBe(before + 1);
    expect(cardTitles()).toContain("Tarea nueva de prueba");
  });

  test("con datos inválidos no se agrega ninguna tarjeta", () => {
    const before = document.querySelectorAll("#task-container [data-task-id]").length;

    submitForm("corto"); // el nombre debe tener más de 8 caracteres

    const after = document.querySelectorAll("#task-container [data-task-id]").length;
    expect(after).toBe(before);
  });
});

describe("UI: eliminar una tarea", () => {
  test("al eliminar una tarea, desaparece de la lista HTML", () => {
    submitForm("Tarea para eliminar");
    expect(cardTitles()).toContain("Tarea para eliminar");

    const card = [...document.querySelectorAll("#task-container [data-task-id]")].find(
      (col) => col.querySelector(".card-title").textContent === "Tarea para eliminar",
    );
    card.querySelector(".btn-delete").click();

    expect(cardTitles()).not.toContain("Tarea para eliminar");
  });
});

describe("UI: persistencia y edición", () => {
  test("la tarea agregada queda guardada en localStorage", () => {
    submitForm("Tarea guardada en storage");

    const saved = JSON.parse(localStorage.getItem("tasks"));
    expect(saved.map((task) => task.nombre)).toContain("Tarea guardada en storage");
  });

  test("al hacer clic en 'Completar', la tarea pasa a HECHO", () => {
    submitForm("Tarea por completar");
    const card = [...document.querySelectorAll("#task-container [data-task-id]")].find(
      (col) => col.querySelector(".card-title").textContent === "Tarea por completar",
    );

    card.querySelector(".done-button").click();

    const updated = [...document.querySelectorAll("#task-container [data-task-id]")].find(
      (col) => col.querySelector(".card-title").textContent === "Tarea por completar",
    );
    expect(updated.querySelector(".badge").textContent).toBe("HECHO");
    expect(updated.querySelector(".done-button")).toBeNull();
  });
});

describe("UI: resumen y mensaje de lista vacía", () => {
  const counter = (id) => document.getElementById(id).textContent;

  test("el resumen cuenta las tareas por estado", () => {
    // los 5 ejemplos: 1 HECHO, 1 EN PROCESO, 1 REVISIÓN y 2 POR HACER
    expect(counter("count-total")).toBe("5");
    expect(counter("count-hecho")).toBe("1");
    expect(counter("count-en-proceso")).toBe("1");
    expect(counter("count-revision")).toBe("1");
    expect(counter("count-por-hacer")).toBe("2");
  });

  test("el resumen se actualiza al agregar y al eliminar", () => {
    submitForm("Tarea para el resumen");
    expect(counter("count-total")).toBe("6");
    expect(counter("count-por-hacer")).toBe("3");

    const card = [...document.querySelectorAll("#task-container [data-task-id]")].find(
      (col) => col.querySelector(".card-title").textContent === "Tarea para el resumen",
    );
    card.querySelector(".btn-delete").click();

    expect(counter("count-total")).toBe("5");
    expect(counter("count-por-hacer")).toBe("2");
  });

  test("el mensaje de lista vacía aparece solo cuando no hay tareas", () => {
    const emptyState = document.getElementById("empty-state");
    expect(emptyState.classList.contains("d-none")).toBe(true);

    document.querySelectorAll("#task-container .btn-delete").forEach((button) => button.click());

    expect(emptyState.classList.contains("d-none")).toBe(false);
  });

  test("hacer clic en el ícono del botón 'Completar' también completa la tarea", () => {
    submitForm("Tarea con clic en ícono");
    const card = [...document.querySelectorAll("#task-container [data-task-id]")].find(
      (col) => col.querySelector(".card-title").textContent === "Tarea con clic en ícono",
    );

    card.querySelector(".done-button i").click();

    expect(counter("count-hecho")).toBe("2");
  });
});

describe("UI: editar una tarea con el formulario", () => {
  const submitButton = () => document.getElementById("task-submit");

  test("al hacer clic en una tarjeta, sus datos pasan al formulario y el botón dice Actualizar", () => {
    findCard("Diseñar wireframes").querySelector(".card-title").click();

    expect(document.getElementById("task-name").value).toBe("Diseñar wireframes");
    expect(document.getElementById("task-assignee").value).toBe("Amanda Chindoy");
    expect(document.getElementById("task-status").value).toBe("HECHO");
    expect(submitButton().textContent).toBe("Actualizar");
  });

  test("al actualizar, cambian la tarjeta y el objeto del TaskManager, el botón vuelve a Guardar y el formulario se vacía", () => {
    const { taskManager } = require("../js/app.js");

    findCard("Diseñar wireframes").querySelector(".card-title").click();
    document.getElementById("task-name").value = "Wireframes ya editados";
    document.getElementById("task-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    // la tarjeta
    expect(cardTitles()).toContain("Wireframes ya editados");
    expect(cardTitles()).not.toContain("Diseñar wireframes");
    // el objeto dentro de TaskManager
    expect(taskManager.getTaskById(1).nombre).toBe("Wireframes ya editados");
    // no se creó una tarea nueva
    expect(taskManager.getAllTasks()).toHaveLength(5);
    // el formulario
    expect(submitButton().textContent).toBe("Guardar");
    expect(document.getElementById("task-name").value).toBe("");
    expect(document.getElementById("task-description").value).toBe("");
  });
});

describe("UI + localStorage: los datos persisten al recargar", () => {
  test("una tarea agregada sigue ahí después de recargar la página", () => {
    submitForm("Tarea que sobrevive");

    loadApp({ keepStorage: true }); // simula cerrar y volver a abrir la página

    expect(cardTitles()).toContain("Tarea que sobrevive");
    expect(document.getElementById("count-total").textContent).toBe("6");
  });

  test("los ejemplos no se duplican al recargar", () => {
    loadApp({ keepStorage: true });
    loadApp({ keepStorage: true });

    expect(document.querySelectorAll("#task-container [data-task-id]")).toHaveLength(5);
  });

  test("después de recargar, el id de la tarea nueva continúa la numeración", () => {
    submitForm("Primera tarea nueva"); // id 6
    loadApp({ keepStorage: true });
    const { taskManager } = require("../js/app.js");

    submitForm("Segunda tarea nueva");

    const ids = taskManager.getAllTasks().map((task) => task.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("completar, eliminar y editar quedan guardados después de recargar", () => {
    findCard("Escribir el README").querySelector(".done-button").click(); // POR HACER -> HECHO
    findCard("Preparar la demo").querySelector(".btn-delete").click(); // eliminar
    findCard("Validar el formulario").querySelector(".card-title").click(); // editar
    document.getElementById("task-name").value = "Formulario validado";
    document.getElementById("task-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    loadApp({ keepStorage: true });

    expect(cardTitles()).not.toContain("Preparar la demo");
    expect(cardTitles()).toContain("Formulario validado");
    expect(findCard("Escribir el README").querySelector(".badge").textContent).toBe("HECHO");
    expect(document.getElementById("count-total").textContent).toBe("4");
  });

  test("lo guardado en localStorage coincide con los datos del TaskManager", () => {
    const { taskManager } = require("../js/app.js");

    submitForm("Tarea para comparar");
    findCard("Escribir el README").querySelector(".done-button").click();
    findCard("Preparar la demo").querySelector(".btn-delete").click();

    expect(JSON.parse(localStorage.getItem("tasks"))).toEqual(taskManager.getAllTasks());
    expect(localStorage.getItem("currentId")).toBe(String(taskManager.currentId));
  });
});
