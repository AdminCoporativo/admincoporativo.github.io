import { db } from "./firebase-config.js";
import { collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usersListContainer = document.getElementById("usersList");

// 1. Escuchar a todos los usuarios en tiempo real
onSnapshot(collection(db, "usuarios"), (snapshot) => {
    if (!usersListContainer) return; // Seguridad por si el elemento no existe
    usersListContainer.innerHTML = ""; 

    snapshot.forEach((userDoc) => {
        const u = userDoc.data();
        const uid = userDoc.id;

        const card = document.createElement("div");
        card.className = "user-card";
        
        card.innerHTML = `
            <div>
                <strong>${u.nombre || "Sin nombre"}</strong><br>
                <small>${u.email}</small>
            </div>
            <div>
                <span class="status-badge ${u.activo ? 'status-active' : 'status-pending'}">
                    ${u.activo ? 'Activo' : 'Pendiente'}
                </span>
            </div>
            <div class="module-checks">
                <label><input type="checkbox" data-mod="reportes" ${u.modulos?.reportes ? 'checked' : ''}> Reportes</label>
                <label><input type="checkbox" data-mod="inventario" ${u.modulos?.inventario ? 'checked' : ''}> Inventario</label>
                <label><input type="checkbox" data-mod="activo" ${u.activo ? 'checked' : ''}> <b>Habilitar</b></label>
            </div>
            <div style="text-align: right;">
                <button class="btn-save-admin" data-uid="${uid}">Guardar</button>
            </div>
        `;

        card.querySelector(".btn-save-admin").addEventListener("click", async (e) => {
            const btn = e.target;
            const nuevosModulos = {
                reportes: card.querySelector("[data-mod='reportes']").checked,
                inventario: card.querySelector("[data-mod='inventario']").checked,
                admin: u.modulos?.admin || false 
            };
            const nuevoEstadoActivo = card.querySelector("[data-mod='activo']").checked;

            try {
                btn.innerText = "⌛...";
                await updateDoc(doc(db, "usuarios", uid), {
                    modulos: nuevosModulos,
                    activo: nuevoEstadoActivo
                });
                btn.innerText = "Guardar";
                alert("Usuario actualizado ✅");
            } catch (err) {
                console.error(err);
                alert("Error al actualizar");
            }
        });
        usersListContainer.appendChild(card);
    });
});