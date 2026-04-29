// js/firebase-config.js

// 1. Importamos las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Tus credenciales de KRYSWEB (extraídas de tu app.js)
const firebaseConfig = {
  apiKey: "AIzaSyBXkLM4Ft031RAzSVlXA8EvqdLSdwR6jyQ",
  authDomain: "reporte-gerencial-33fdd.firebaseapp.com",
  projectId: "reporte-gerencial-33fdd",
  storageBucket: "reporte-gerencial-33fdd.firebasestorage.app",
  messagingSenderId: "422784485778",
  appId: "1:422784485778:web:2aaab19de9d7cd476a594b",
  measurementId: "G-XVG8Z55V0M"
};

// 3. Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// 4. Exportamos las instancias para que otros archivos JS las usen
export const auth = getAuth(app);
export const db = getFirestore(app);