// Pruebas de la interfaz: lista HTML (#task-container) y formulario.
const { loadApp } = require("./helpers");

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
