const userRaw = localStorage.getItem("utilisateur");

if (!userRaw) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "index.html";
} else {
    const user = JSON.parse(userRaw);
    document.getElementById("nomUtilisateur").innerText = "Bonjour " + user.nom;

    // Afficher la colonne utilisateur dans le tableau si admin
    if (user.role === "admin") {
        const thUtilisateur = document.getElementById('thGoalUtilisateur');
        if (thUtilisateur) thUtilisateur.style.display = '';
    }

    // Afficher le sélecteur d’utilisateur si admin
    if (user.role === "admin") {
        document.getElementById('goalUserSelectContainer').style.display = '';
        fetch('http://localhost/p3p_portail_productivite/backend/index.php/goal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'users' })
        })
        .then(res => res.json())
        .then(users => {
            const select = document.getElementById('goalSelectUtilisateur');
            select.innerHTML = users.map(u => `<option value="${u.id}">${u.nom} (${u.email})</option>`).join('');
        });
    }

    const API_URL = "http://localhost/p3p_portail_productivite/backend/index.php/goal";

    async function chargerObjectifs() {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "read",
                id_utilisateur: user.id,
                role: user.role
            })
        });
        const data = await res.json();
        const tbody = document.querySelector("#tableGoals tbody");
        tbody.innerHTML = "";

        data.forEach(g => {
            tbody.innerHTML += `
            <tr>
                <td>${g.titre}</td>
                <td>${g.date_debut ?? ''}</td>
                <td>${g.date_fin ?? ''}</td>
                <td>${g.type}</td>
                <td>${g.statut}</td>
                ${user.role === "admin" ? `<td>${g.nom_utilisateur}</td>` : ""}
                <td>
                    <button class="btn btn-sm btn-danger" onclick="supprimerObjectif(${g.id})">Supprimer</button>
                </td>
            </tr>`;
        });
    }

    document.getElementById("formGoal").addEventListener("submit", async (e) => {
        e.preventDefault();
        const body = {
            action: "create",
            titre: document.getElementById("goalTitre").value,
            description: document.getElementById("goalDescription").value,
            type: document.getElementById("goalType").value,
            date_debut: document.getElementById("goalDateDebut").value,
            date_fin: document.getElementById("goalDateFin").value,
            statut: document.getElementById("goalStatut").value,
            id_utilisateur: user.role === "admin" ? document.getElementById("goalSelectUtilisateur").value : user.id,
            role: user.role
        };
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        document.getElementById("formGoal").reset();
        document.getElementById("goalTitre").focus();
        chargerObjectifs();
        document.getElementById("tableGoals").scrollIntoView({ behavior: "smooth" });
    });

    window.supprimerObjectif = async function(id) {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id, role: user.role, id_utilisateur: user.id })
        });
        chargerObjectifs();
    };

    document.getElementById("rechercheGoal").addEventListener("input", function () {
    const terme = this.value.toLowerCase();
    const lignes = document.querySelectorAll("#tableGoals tbody tr");
    lignes.forEach(tr => {
        const texte = tr.textContent.toLowerCase();
        tr.style.display = texte.includes(terme) ? "" : "none";
    });
    });

    // Initialisation
    chargerObjectifs();
}
