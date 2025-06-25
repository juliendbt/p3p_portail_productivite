const user = JSON.parse(localStorage.getItem("utilisateur"));
const API_GOAL = "http://localhost/p3p_portail_productivite/backend/index.php/goal";

document.getElementById("nomUtilisateur").innerText = "Objectifs de " + user.nom;

async function chargerObjectifs() {
    const res = await fetch(API_GOAL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", id_utilisateur: user.id })
    });
    const objectifs = await res.json();
    const tbody = document.querySelector("#tableObjectifs tbody");
    tbody.innerHTML = "";
    objectifs.forEach(obj => {
        tbody.innerHTML += `
        <tr>
            <td>${obj.titre}</td>
            <td>${obj.type}</td>
            <td>${obj.date_debut}</td>
            <td>${obj.date_fin}</td>
            <td><button class="btn btn-sm btn-danger" onclick="supprimerObjectif(${obj.id})">Supprimer</button></td>
        </tr>`;
    });
}

document.getElementById("formObjectif").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
        action: "create",
        id_utilisateur: user.id,
        titre: document.getElementById("titre").value,
        type: document.getElementById("type").value,
        description: document.getElementById("description").value,
        date_debut: document.getElementById("date_debut").value,
        date_fin: document.getElementById("date_fin").value
    };
    await fetch(API_GOAL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    document.getElementById("formObjectif").reset();
    chargerObjectifs();
});

async function supprimerObjectif(id) {
    await fetch(API_GOAL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
    });
    chargerObjectifs();
}

chargerObjectifs();
