import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    const paginaActual = window.location.pathname;

    // 1. Si NO hay usuario iniciado
    if (!user) {
        // Solo redirigir a login si NO estamos ya en login.html
        if (!paginaActual.includes("login.html")) {
            window.location.href = "login.html";
        }
        return;
    }

    // 2. Si SI hay usuario, verificamos su estado en Firestore
    try {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Si el usuario está DESACTIVADO
            if (userData.activo === false) {
                if (!paginaActual.includes("login.html")) {
                    alert("Tu cuenta aún no ha sido activada por un administrador.");
                    window.location.href = "login.html";
                }
            } 
            // Si el usuario está ACTIVO y está intentando entrar al login, mándalo al dashboard
            else if (paginaActual.includes("login.html")) {
                window.location.href = "dashboard.html";
            }

        } else {
            // Si no existe el documento, mandarlo a login para que se registre o reintente
            if (!paginaActual.includes("login.html")) {
                window.location.href = "login.html";
            }
        }
    } catch (error) {
        console.error("Error en la verificación de seguridad:", error);
    }
});