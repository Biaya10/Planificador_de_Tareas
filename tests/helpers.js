// Utilidades compartidas por las pruebas.
const fs = require("fs");
const path = require("path");

// Carga la aplicación en un "navegador" limpio (jsdom):
// 1. Pone el HTML real de index.html en el document.
// 2. Vacía localStorage.
// 3. Importa js/app.js desde cero, para que cada prueba empiece sin estado.
function loadApp() {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const body = new DOMParser().parseFromString(html, "text/html").body;
  document.body.innerHTML = body.innerHTML;

  localStorage.clear();
  jest.resetModules();
  return require("../js/app.js");
}

// Crea una tarea válida (cumple las reglas de validación del formulario).
function makeTask(Task, overrides = {}) {
  const data = {
    nombre: "Estudiar para el parcial",
    descripcion: "Repasar todos los temas del sprint tres",
    asignadoA: "Amanda Chindoy",
    fechaDeEntrega: "2026-12-01",
    estado: "POR HACER",
    ...overrides,
  };
  return new Task(
    data.nombre,
    data.descripcion,
    data.asignadoA,
    data.fechaDeEntrega,
    data.estado,
  );
}

module.exports = { loadApp, makeTask };
