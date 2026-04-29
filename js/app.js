/* ================= 1. IMPORTACIONES ================= */

import { auth, db } from "./firebase-config.js"; 
import { 
  onAuthStateChanged, 
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  doc, 
  setDoc, 
  onSnapshot,
  updateDoc,
  collection,
  getDocs,
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ================= 2. VARIABLES GLOBALES ================= */
let datos = [];
let usuarioUID = null;
let unsubscribe = null;
let ignorarSnapshot = false;
let rolUsuario = "usuario";
let permisosUsuario = {};
let ordenBloqueado = false; 
let todoSeleccionado = false;
let timeoutGuardar;

/* ================= 3. CONTROL DE SESIÓN (AUTH) ================= */
onAuthStateChanged(auth, async (user) => {
    const userDisplay = document.getElementById("userName");
    
    if (!user) {
        window.location.href = "login.html";
    } else {
        usuarioUID = user.uid;
        try {
            const docSnap = await getDoc(doc(db, "usuarios", user.uid));
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Validar acceso al módulo
                if (!data.activo || (data.modulos && !data.modulos.reportes)) {
                    alert("No tienes permiso para acceder a este módulo.");
                    window.location.href = "dashboard.html";
                    return;
                }
                
                iniciarListenerUsuario(); 
            }
        } catch (error) {
            console.error("Error en validación inicial:", error);
            if (userDisplay) userDisplay.innerText = "Error al cargar perfil";
        }
    }
});

/* ================= 4. INIT UI ================= */
document.addEventListener("DOMContentLoaded", () => {
    // Configurar Fecha inicial
    const inputFecha = document.getElementById("reporteFecha");
    if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];

    // Registro de eventos de botones (Solo si existen en el HTML)
    const botones = {
        "btnAgregar": agregarFila,
        "btnTitulo": agregarTitulo,
        "btnDuplicar": duplicarSeleccionados,
        "btnEliminar": eliminarSeleccionados,
        "btnPDF": exportarPDF,
        "btnSeleccionarTodo": toggleSeleccionarTodo,
        "btnBloquear": toggleBloqueo,
        "btnLogout": cerrarSesion
    };

    for (const [id, funcion] of Object.entries(botones)) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener("click", funcion);
    }

    configurarDragAndDrop();
});

/* ================= 5. ESCUCHA DE DATOS ================= */
function iniciarListenerUsuario() {
    if (!usuarioUID) return;
    const ref = doc(db, "usuarios", usuarioUID);
    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(ref, (snap) => {
        if (!snap.exists() || ignorarSnapshot) return;
        
        const data = snap.data();
        datos = data.tareas || [];
        rolUsuario = data.rol || "usuario";
        permisosUsuario = data.permisos || {};

        const userEl = document.getElementById("userName");
        if (userEl) userEl.innerText = `${data.nombre || "Usuario"} (${rolUsuario})`;

        aplicarPermisos(); 
        renderTabla(); 
    });
}

/* ================= LÓGICA DE BLOQUEO ================= */
function toggleBloqueo() {
    const btn = document.getElementById("btnBloquear");
    const tabla = document.getElementById("tabla");
    if (!btn || !tabla) return;

    ordenBloqueado = !ordenBloqueado;

    if (ordenBloqueado) {
        btn.innerHTML = "🔒 Desbloquear Tareas";
        btn.classList.add("btn-active");
        tabla.classList.add("bloqueado");
    } else {
        btn.innerHTML = "🔓 Bloquear Tareas";
        btn.classList.remove("btn-active");
        tabla.classList.remove("bloqueado");
    }

    document.querySelectorAll("#tabla tbody tr").forEach(fila => {
        fila.setAttribute("draggable", !ordenBloqueado);
    });
}

/* ================= AGREGAR / DUPLICAR FILAS ================= */
function agregarTitulo() {
    crearFila({ esTitulo: true, tarea: "" });
    guardarConDelay();
}

function agregarFila() {
    crearFila({ esTitulo: false });
    guardarConDelay();
}

function duplicarSeleccionados() {
    const filas = document.querySelectorAll("#tabla tbody tr");
    filas.forEach(fila => {
        const checkbox = fila.querySelector("input[type=checkbox]");
        if (checkbox && checkbox.checked) {
            const esTitulo = fila.classList.contains("fila-titulo");
            let dataNueva = {};

            if (esTitulo) {
                dataNueva = {
                    esTitulo: true,
                    tarea: fila.querySelector(".input-titulo").value
                };
            } else {
                dataNueva = {
                    esTitulo: false,
                    tarea: fila.querySelector(".txt-tarea").value,
                    tareaHeight: fila.querySelector(".txt-tarea").style.height,
                    porcentaje: fila.querySelector(".input-porcentaje").value,
                    dias: fila.querySelector(".dias").innerText,
                    inicio: fila.querySelector(".fecha-inicio").value,
                    fin: fila.querySelector(".fecha-fin").value,
                    obs: fila.querySelector(".txt-obs").value,
                    obsHeight: fila.querySelector(".txt-obs").style.height
                };
            }
            
            const nuevaFila = crearFila(dataNueva, false);
            fila.parentNode.insertBefore(nuevaFila, fila.nextSibling);
            checkbox.checked = false;
        }
    });
    actualizarItems();
    guardarConDelay();
}

/* CREAR FILA */

function crearFila(data = {}, appendFinal = true) {
    const tbody = document.querySelector("#tabla tbody");
    const fila = document.createElement("tr");

    // 1. Configuración de Arrastre (Drag & Drop)
    fila.setAttribute("draggable", !ordenBloqueado);
    
    fila.addEventListener("dragstart", () => {
        if (!ordenBloqueado) fila.classList.add("dragging");
    });

    fila.addEventListener("dragend", () => {
        fila.classList.remove("dragging");
        actualizarItems();
        guardarConDelay();
    });

    // 2. Estructura de la Fila (Título o Tarea)
    if (data.esTitulo) {
        fila.classList.add("fila-titulo");
        fila.innerHTML = `
            <td class="item"></td>
            <td><input type="checkbox"></td>
            <td colspan="7">
                <input type="text" class="input-titulo" placeholder="SECCIÓN..." value="${data.tarea || ""}">
            </td>`;
        fila.querySelector(".input-titulo").addEventListener("input", guardarConDelay);
    } else {
        fila.innerHTML = `
            <td class="item"></td>
            <td><input type="checkbox"></td>
            <td><textarea class="txt-tarea">${data.tarea || ""}</textarea></td>
            <td><input type="number" class="input-porcentaje" value="${data.porcentaje || 0}" min="0" max="100"></td>
            <td><div class="progress"><div class="progress-bar"></div></div></td>
            <td class="dias">${data.dias || 0}</td>
            <td><input type="date" class="fecha-inicio" value="${data.inicio || ""}"></td>
            <td><input type="date" class="fecha-fin" value="${data.fin || ""}"></td>
            <td><textarea class="txt-obs">${data.obs || ""}</textarea></td>`;

        const txtTarea = fila.querySelector(".txt-tarea");
        const txtObs = fila.querySelector(".txt-obs");
        const inputPorc = fila.querySelector(".input-porcentaje");

        // --- MANTENER LA ALTURA DEL TEXTAREA ---

        setTimeout(() => {
            autoResize(txtTarea);
            autoResize(txtObs);
        }, 0);

        [txtTarea, txtObs].forEach(t => {
            t.addEventListener("input", () => { 
                autoResize(t); 
                guardarConDelay(); 
            });
        });

        actualizarBarra(inputPorc);
        inputPorc.addEventListener("input", () => {
            limitarPorcentaje(inputPorc);
            actualizarBarra(inputPorc);
            guardarConDelay();
        });

        fila.querySelectorAll("input[type=date]").forEach(inp => {
            inp.addEventListener("change", () => { 
                calcularDias(fila); 
                guardarConDelay(); 
            });
        });
    }

    if (appendFinal) {
        tbody.appendChild(fila);
    }
    
    actualizarItems(); 
    return fila;
}

/* ================= DRAG & DROP CORE ================= */
function configurarDragAndDrop() {
    const tbody = document.querySelector("#tabla tbody");
    if (!tbody) return;

    tbody.addEventListener("dragover", (e) => {
        if (ordenBloqueado) return;
        e.preventDefault();
        
        const dragging = document.querySelector(".dragging");
        if (!dragging) return;

        const afterElement = getDragAfterElement(tbody, e.clientY);
        if (afterElement == null) {
            tbody.appendChild(dragging);
        } else {
            tbody.insertBefore(dragging, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const elementos = [...container.querySelectorAll("tr:not(.dragging)")];
    return elementos.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* ================= FUNCIONES DE ACCIÓN ================= */
function eliminarSeleccionados() {
    const filas = document.querySelectorAll("#tabla tbody tr");
    filas.forEach(fila => {
        if (fila.querySelector("input[type=checkbox]").checked) {
            fila.remove();
        }
    });
    actualizarItems();
    guardarConDelay();
    todoSeleccionado = false;
    const btn = document.getElementById("btnSeleccionarTodo");
    if(btn) btn.innerHTML = "☑ Seleccionar todo";
}

function toggleSeleccionarTodo() {
    const checkboxes = document.querySelectorAll("#tabla tbody input[type=checkbox]");
    const btn = document.getElementById("btnSeleccionarTodo");
    todoSeleccionado = !todoSeleccionado;
    checkboxes.forEach(chk => chk.checked = todoSeleccionado);
    if(btn) btn.innerHTML = todoSeleccionado ? "❌ Desmarcar todo" : "☑ Seleccionar todo";
}

/* ================= PERSISTENCIA ================= */
async function guardarTodo() {
    if (!usuarioUID) return;
    ignorarSnapshot = true; 

    const filas = document.querySelectorAll("#tabla tbody tr");
    const nuevosDatos = [];

    filas.forEach(f => {
        const esTitulo = f.classList.contains("fila-titulo");
        if (esTitulo) {
            nuevosDatos.push({ esTitulo: true, tarea: f.querySelector(".input-titulo").value });
        } else {
            nuevosDatos.push({
                esTitulo: false,
                tarea: f.querySelector(".txt-tarea").value,
                porcentaje: f.querySelector(".input-porcentaje").value,
                dias: f.querySelector(".dias").innerText,
                inicio: f.querySelector(".fecha-inicio").value,
                fin: f.querySelector(".fecha-fin").value,
                obs: f.querySelector(".txt-obs").value
            });
        }
    });

    await updateDoc(doc(db, "usuarios", usuarioUID), { tareas: nuevosDatos });
    setTimeout(() => { ignorarSnapshot = false; }, 300);
}

function guardarConDelay() {
    clearTimeout(timeoutGuardar);
    timeoutGuardar = setTimeout(guardarTodo, 500);
}

/* ================= UTILIDADES UI ================= */
function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto'; 
    el.style.height = el.scrollHeight + 'px';
}

function limitarPorcentaje(input) {
    let v = parseInt(input.value) || 0;
    if (v > 100) v = 100;
    if (v < 0) v = 0;
    input.value = v;
}

function obtenerColorProgreso(valor) {
    if (valor < 40) return "#e74c3c";
    if (valor < 70) return "#f1c40f";
    return "#2ecc71";
}

function actualizarBarra(input) {
    const valor = parseInt(input.value) || 0;
    const barra = input.closest("tr").querySelector(".progress-bar");
    if (barra) {
        barra.style.width = valor + "%";
        barra.style.backgroundColor = valor < 40 ? "#e74c3c" : valor < 70 ? "#f1c40f" : "#2ecc71";
    }
}

function cerrarSesion() {
    if (unsubscribe) unsubscribe();
    signOut(auth).then(() => { window.location.href = "login.html"; });
}

function calcularDias(fila) {
    const i = fila.querySelector(".fecha-inicio").value;
    const f = fila.querySelector(".fecha-fin").value;
    if (i && f) {
        const fechaInicio = new Date(i);
        const fechaFin = new Date(f);
        const diff = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
        fila.querySelector(".dias").innerText = diff >= 0 ? diff : 0;
    }
}

function actualizarItems() {
    let contadorTareas = 1;
    document.querySelectorAll("#tabla tbody tr").forEach((fila) => {
        const celdaItem = fila.querySelector(".item");
        if (fila.classList.contains("fila-titulo")) {
            celdaItem.innerText = "";
        } else {
            celdaItem.innerText = contadorTareas++;
        }
    });
}

/* ================= EXPORTACIÓN PDF ================= */
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    
    const persona = document.getElementById("reportePersona")?.value || "N/A";
    const fechaReporte = document.getElementById("reporteFecha")?.value || "";

    doc.setFontSize(16);
    doc.text("REPORTE GERENCIAL", 14, 15);
    doc.setFontSize(10);
    doc.text(`Responsable: ${persona}`, 14, 22);
    doc.text(`Fecha: ${fechaReporte}`, 14, 27);

    const filas = document.querySelectorAll("#tabla tbody tr");
    let body = [];

    filas.forEach((f) => {
        if (f.classList.contains("fila-titulo")) {
            body.push([
                { content: f.querySelector(".input-titulo").value.toUpperCase(), colSpan: 7, styles: { fillColor: [230, 230, 230], fontStyle: 'bold', halign: 'left' } }
            ]);
        } else {
            body.push([
                f.querySelector(".item").innerText,
                f.querySelector(".txt-tarea").value,
                parseInt(f.querySelector(".input-porcentaje").value) || 0,
                f.querySelector(".dias").innerText,
                f.querySelector(".fecha-inicio").value,
                f.querySelector(".fecha-fin").value,
                f.querySelector(".txt-obs").value
            ]);
        }
    });

    doc.autoTable({
        head: [["Item", "Tarea", "Progreso", "Días", "Inicio", "Fin", "Observaciones"]],
        body: body,
        startY: 35,
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        styles: { fontSize: 8, halign: "center", valign: "middle", overflow: 'linebreak' },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { halign: "left", cellWidth: 'auto' }, // Ajuste automático al ancho
            2: { cellWidth: 35 },
            3: { cellWidth: 15 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 },
            6: { halign: "left", cellWidth: 85 }
        },
        didDrawCell: function (data) {
            if (data.column.index === 2 && data.section === "body" && typeof data.cell.raw === 'number') {
                let porcentaje = data.cell.raw;
                let x = data.cell.x + 2;
                let y = data.cell.y + (data.cell.height / 2) - 2;
                let width = data.cell.width - 4;
                let height = 4;

                doc.setFillColor(220, 220, 220);
                doc.roundedRect(x, y, width, height, 1, 1, "F");

                if (porcentaje < 40) doc.setFillColor(231, 76, 60);
                else if (porcentaje < 70) doc.setFillColor(241, 196, 15);
                else doc.setFillColor(46, 204, 113);

                doc.roundedRect(x, y, (width * porcentaje) / 100, height, 1, 1, "F");
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(7);
                doc.text(porcentaje + "%", x + width / 2, y + height / 2 + 1, { align: "center" });
            }
        }
    });

    doc.save(`Reporte_Gerencial_${persona}.pdf`);
}


/* CONTROL DE SESION */


/* CERRAR SESION */
document.getElementById("btnLogout")?.addEventListener("click", () => {

    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    document.querySelector("#tabla tbody").innerHTML = "";
    datos = [];

    signOut(auth);
});

/* LOGICA DE RECUPERACIÓN DE CLAVE */

document.getElementById("btnReset")?.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        mostrarMensaje("Ingresa tu correo");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        mostrarMensaje("Revisa tu correo 📧", "ok");
    } catch {
        mostrarMensaje("Error al enviar correo");
    }
});

/* AUTETICACION VIA GOOGLE */
const provider = new GoogleAuthProvider();

document.getElementById("btnGoogle")?.addEventListener("click", async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error(error);
        alert("Error con Google: " + error.message);
    }
});

/* DISEÑOS DE MENSAJES */

function mostrarMensaje(texto, tipo = "error") {
    const el = document.getElementById("mensaje");
    el.style.color = tipo === "ok" ? "green" : "red";
    el.innerText = texto;
}

/* APLICAR PERMISOS - Versión Habilitada */
function aplicarPermisos() {
    // Si quieres que TODOS los botones sean visibles siempre en este módulo:
    const ids = ["btnAgregar", "btnTitulo", "btnDuplicar", "btnEliminar", "btnPDF", "btnBloquear"];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "inline-block"; // Cambiado de p[id] a "inline-block"
    });
}

function toggleBtn(id, permitido) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.style.display = permitido ? "inline-block" : "none";
}

/* CARGAR USUARIOS */

document.getElementById("btnAdmin")?.addEventListener("click", () => {

    console.log("CLICK ADMIN");

    if (rolUsuario !== "admin" && rolUsuario !== "superadmin") {
        alert("No tienes permisos");
        return;
    }

    cargarUsuarios();
});

function crearCheck(nombre, u, uid) {
    const val = u.permisos?.[nombre] ? "checked" : "";
    return `
        ${nombre}
        <input type="checkbox" class="permiso" data-perm="${nombre}" data-uid="${uid}" ${val}>
        <br>
    `;
}

/* FUNCIÓN EVENTOS ADMIN */
function eventosAdmin() {

    document.querySelectorAll(".btnGuardarUser").forEach(btn => {

        btn.addEventListener("click", async () => {

            const uid = btn.dataset.uid;

            const activo = document.querySelector(`.chkActivo[data-uid="${uid}"]`).checked;
            const rol = document.querySelector(`.selRol[data-uid="${uid}"]`).value;

            const permisos = {};

            document.querySelectorAll(`.permiso[data-uid="${uid}"]`).forEach(chk => {
                permisos[chk.dataset.perm] = chk.checked;
            });

            await updateDoc(doc(db, "usuarios", uid), {
                activo,
                rol,
                permisos
            });

            alert("Actualizado");
        });
    });
}

function renderTabla() {
    const tbody = document.querySelector("#tabla tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    datos.forEach(d => crearFila(d));
    actualizarItems(); // Asegura la numeración al cargar desde Firebase
}

function crearCheckUI(nombre, u) {
    const val = u.permisos?.[nombre] ? "checked" : "";
    return `
        <label>
            ${nombre}
            <input type="checkbox" class="permiso" data-perm="${nombre}" ${val}>
        </label>
    `;
}

/* BUSCADOR USUARIO */
document.getElementById("buscarUsuario")?.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();

    document.querySelectorAll(".usuario-card").forEach(card => {
        const uid = card.querySelector("h4").innerText.toLowerCase();
        card.style.display = uid.includes(texto) ? "block" : "none";
    });
});


function esSuperAdmin() {
    return rolUsuario === "superadmin";
}