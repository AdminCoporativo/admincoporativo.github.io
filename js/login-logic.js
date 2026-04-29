import { auth, db } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const mensaje = document.getElementById("mensaje");

// --- INICIAR SESIÓN ---
document.getElementById("btnLogin")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        window.location.href = "dashboard.html";
    } catch (error) {
        mensaje.innerText = "Error: Usuario o contraseña incorrectos.";
    }
});

// --- REGISTRO ---
document.getElementById("btnRegister")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const nombre = prompt("Por favor, ingresa tu nombre completo:");
    if (!nombre) return;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "usuarios", cred.user.uid), {
            nombre: nombre,
            email: email,
            rol: "usuario",
            activo: false, 
            modulos: { reportes: true, inventario: false, admin: false },
            registroFecha: new Date().getTime()
        });
        alert("Registro exitoso. Espera aprobación.");
    } catch (error) {
        mensaje.innerText = "Error: " + error.message;
    }
});

// --- RESET ---
document.getElementById("btnReset")?.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    if (!email) return alert("Ingresa tu correo.");
    sendPasswordResetEmail(auth, email)
        .then(() => alert("Correo enviado."))
        .catch(err => alert("Error: " + err.message));
});