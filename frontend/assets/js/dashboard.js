const user = JSON.parse(localStorage.getItem("utilisateur"));
const API_URL = "http://localhost/p3p_portail_productivite/backend/index.php/task";
document.getElementById("nomUtilisateur").innerText = "Bonjour " + user.nom;

async function chargerTaches() {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ action: "read", id_utilisateur: user.id })
    });
    const data = await res.json();
    const tbody = document.querySelector("#tableTaches tbody");
    tbody.innerHTML = "";
    data.forEach(t => {
        tbody.innerHTML += `
        <tr>
            <td>${t.titre}</td>
            <td>${t.priorite}</td>
            <td>${t.statut}</td>
            <td>${t.date_echeance ?? ''}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="supprimerTache(${t.id})">Supprimer</button>
            </td>
        </tr>`;
    });
}

document.getElementById("formTache").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
        action: "create",
        id_utilisateur: user.id,
        titre: document.getElementById("titre").value,
        description: document.getElementById("description").value,
        priorite: document.getElementById("priorite").value,
        date_echeance: document.getElementById("date_echeance").value,
        statut: document.getElementById("statut").value
    };
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    document.getElementById("formTache").reset();
    chargerTaches();
});

async function supprimerTache(id) {
    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
    });
    chargerTaches();

    
}

async function afficherStats() {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ action: "read", id_utilisateur: user.id })
    });
    const data = await res.json();

    let a_faire = 0, en_cours = 0, termine = 0;

    data.forEach(t => {
        if (t.statut === "à faire") a_faire++;
        else if (t.statut === "en cours") en_cours++;
        else if (t.statut === "terminé") termine++;
    });

    const ctx = document.getElementById('chartStat').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['À faire', 'En cours', 'Terminé'],
            datasets: [{
                label: 'Tâches',
                data: [a_faire, en_cours, termine],
                backgroundColor: ['#dc3545', '#ffc107', '#28a745']
            }]
        }
    });
}

async function afficherMeteo() {
    const apiKey = "a5fa30ba0ccf40e7523a4cd1eeff18ba"; // Remplace par ta clé OpenWeather
    const ville = "Paris"; // Tu peux utiliser la géoloc plus tard
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ville}&appid=${apiKey}&units=metric&lang=fr`;

    const res = await fetch(url);
    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const icone = data.weather[0].icon;

    document.getElementById("weather").innerHTML = `
        ${ville} : ${temp}°C - ${desc}
        <img src="https://openweathermap.org/img/wn/${icone}@2x.png">
    `;
}

async function afficherCommits() {
    const token = "TON_TOKEN_GITHUB";
    const username = "juliendbt";
    const repo = "p3p_portail_productivite";

    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/commits`, {
        headers: {
            "Authorization": `token ${token}`
        }
    });

    const commits = await res.json();

    if (!Array.isArray(commits)) {
        console.warn("Commits non récupérables : ", commits);
        document.getElementById("githubCommits").innerHTML = `<li class="list-group-item text-danger">
            Impossible d'afficher les commits (dépôt vide ?)
        </li>`;
        return;
    }

    const list = document.getElementById("githubCommits");
    list.innerHTML = "";

    commits.slice(0, 5).forEach(commit => {
        const date = new Date(commit.commit.author.date).toLocaleDateString("fr-FR");
        list.innerHTML += `<li class="list-group-item">
            <strong>${date}</strong> — ${commit.commit.message}
        </li>`;
    });
}


function notificationTachesUrgentes() {
    const now = new Date();
    const taches = document.querySelectorAll("#tableTaches tbody tr");
    let alertShown = false;

    taches.forEach(tr => {
        const dateCell = tr.cells[3].textContent;
        if (dateCell) {
            const dueDate = new Date(dateCell);
            const diff = (dueDate - now) / (1000 * 60 * 60 * 24);
            if (diff >= 0 && diff < 2 && !alertShown) {
                alert("📌 Vous avez une tâche qui expire bientôt !");
                alertShown = true;
            }
        }
    });
}

function toggleTheme() {
    const dark = document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-white");
    localStorage.setItem("theme", dark ? "dark" : "light");
}

function applyTheme() {
    if (localStorage.getItem("theme") === "dark") toggleTheme();
}

applyTheme();





chargerTaches();
afficherStats();
afficherMeteo();
afficherCommits();
setTimeout(notificationTachesUrgentes, 1000);
