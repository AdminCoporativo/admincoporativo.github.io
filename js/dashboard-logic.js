document.addEventListener("DOMContentLoaded", () => {
    // Mostrar fecha actual
    const dateEl = document.getElementById("currentDate");
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString('es-ES', options);

    // Aquí conectarás luego con Firebase para mostrar módulos según permisos
    console.log("Dashboard UI cargado correctamente.");
});

import { auth, db } from "./firebase-config.js"; // Asegúrate de exportarlos desde tu config
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Escuchamos los datos del usuario en tiempo real
        onSnapshot(doc(db, "usuarios", user.uid), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();

            // 1. Verificamos si el usuario está aprobado
            if (data.activo === false) {
                alert("Tu cuenta aún no ha sido activada por un administrador.");
                signOut(auth).then(() => window.location.href = "index.html");
                return;
            }

            // 2. Actualizamos la interfaz con sus datos
            document.getElementById("navUserName").innerText = data.nombre || "Usuario";
            document.getElementById("navUserRole").innerText = data.rol || "Cliente";

            // 3. Control de visibilidad de Módulos (Sidebar y Cards)
            const mods = data.modulos || {};
            
            // Módulo Reportes
            toggleModulo("menu-reportes", "card-reportes", mods.reportes);
            
            // Módulo Inventario
            toggleModulo("menu-inventario", "card-inventario", mods.inventario);
            
            // Módulo Admin (Solo si es admin o superadmin)
            const esAdmin = (data.rol === "admin" || data.rol === "superadmin");
            toggleModulo("menu-admin", null, esAdmin);
        });
    } else {
        // Si no hay sesión, al login
        window.location.href = "index.html";
    }
});

// Función auxiliar para mostrar/ocultar
function toggleModulo(menuId, cardId, tienePermiso) {
    const menuEl = document.getElementById(menuId);
    const cardEl = document.getElementById(cardId);

    if (tienePermiso) {
        if (menuEl) menuEl.classList.remove("hidden");
        if (cardEl) cardEl.style.display = "block";
    } else {
        if (menuEl) menuEl.classList.add("hidden");
        if (cardEl) cardEl.style.display = "none";
    }
}

// Botón Cerrar Sesión
document.getElementById("btnLogout")?.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "index.html");
});

// Función para abrir menu en móvil
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobile-toggle');

    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        // Cerrar al hacer clic fuera del sidebar
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
});