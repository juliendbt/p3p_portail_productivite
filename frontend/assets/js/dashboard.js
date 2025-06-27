const userRaw = localStorage.getItem("utilisateur");

if (!userRaw) {
    alert("Vous devez être connecté pour accéder au tableau de bord.");
    window.location.href = "index.html";
} else {
    const user = JSON.parse(userRaw);
    document.getElementById("nomUtilisateur").innerText = "Bonjour " + user.nom;

    // Afficher la colonne "Utilisateur" dans le tableau si admin
    if (user.role === "admin") {
        const thUtilisateur = document.getElementById('thUtilisateur');
        if (thUtilisateur) thUtilisateur.style.display = '';
    }

    // --- Ajout sélecteur utilisateur pour admin ---
    if (user.role === "admin") {
        document.getElementById('userSelectContainer').style.display = '';
        fetch('http://localhost/p3p_portail_productivite/backend/index.php/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'users' })
        })
        .then(res => res.json())
        .then(users => {
            const select = document.getElementById('selectUtilisateur');
            select.innerHTML = users.map(u => `<option value="${u.id}">${u.nom} (${u.email})</option>`).join('');
        });
    }

    const API_URL = "http://localhost/p3p_portail_productivite/backend/index.php/task";

    async function chargerTaches() {
        const filtre = document.getElementById("filtreStatut")?.value || "toutes";
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
        const tbody = document.querySelector("#tableTaches tbody");
        tbody.innerHTML = "";
        const dataFiltree = filtre === "toutes" ? data : data.filter(t => t.statut === filtre);

        dataFiltree.forEach(t => {
            tbody.innerHTML += `
            <tr>
                <td>${t.titre}</td>
                <td>${t.priorite}</td>
                <td>${t.statut}</td>
                <td>${t.date_echeance ?? ''}</td>
                ${user.role === "admin" ? `<td>${t.nom_utilisateur}</td>` : ""}
                <td>
                    <button class="btn btn-sm btn-danger" onclick="supprimerTache(${t.id})">Supprimer</button>
                </td>
            </tr>`;
        });

        // Progression
        const total = data.length;
        const done = data.filter(t => t.statut === "terminé").length;
        const pourcentage = total === 0 ? 0 : Math.round((done / total) * 100);
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            progressBar.style.width = pourcentage + "%";
            progressBar.textContent = `${pourcentage}%`;
        }

        // Performance quotidienne
        const today = new Date().toISOString().split("T")[0];
        const todayCreated = data.filter(t => t.date_creation?.startsWith(today)).length;
        const todayDone = data.filter(t => t.date_creation?.startsWith(today) && t.statut === "terminé").length;
        const perf = document.getElementById("dailyPerformance");
        if (perf) {
            perf.textContent = `Aujourd'hui : ${todayCreated} tâche(s) créée(s), ${todayDone} terminée(s).`;
        }

        // Ma prochaine tâche
        const prochaine = data.find(t => t.statut !== "terminé");
        const next = document.getElementById("nextTask");
        if (next) {
            if (prochaine) {
                next.innerHTML = `<strong>🎯 Prochaine tâche :</strong> ${prochaine.titre} <span class="badge bg-warning text-dark ms-2">${prochaine.priorite}</span>`;
            } else {
                next.innerHTML = `<strong>✅ Toutes vos tâches sont terminées !</strong>`;
            }
        }
    }

    document.getElementById("filtreStatut")?.addEventListener("change", chargerTaches);

    document.getElementById("formTache").addEventListener("submit", async (e) => {
        e.preventDefault();
        const body = {
            action: "create",
            titre: document.getElementById("titre").value,
            description: document.getElementById("description").value,
            priorite: document.getElementById("priorite").value,
            date_echeance: document.getElementById("date_echeance").value,
            statut: document.getElementById("statut").value,
            id_utilisateur: user.role === "admin" ? document.getElementById("selectUtilisateur").value : user.id,
            role: user.role
        };
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        document.getElementById("formTache").reset();
        document.getElementById("titre").focus();
        chargerTaches();
        document.getElementById("tableTaches").scrollIntoView({ behavior: "smooth" });
    });

    window.supprimerTache = async function(id) {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id, role: user.role, id_utilisateur: user.id })
        });
        chargerTaches();
    };



    async function afficherStats() {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const ville = "Paris";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ville)}&appid=${apiKey}&units=metric&lang=fr`;

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
        const res = await fetch("http://localhost/p3p_portail_productivite/backend/controllers/GitHubController.php");
        const commits = await res.json();

        const list = document.getElementById("githubCommits");
        list.innerHTML = "";

        if (!Array.isArray(commits)) {
            console.warn("Commits non récupérables : ", commits);
            list.innerHTML = `<li class="list-group-item text-danger">
                Impossible d'afficher les commits (voir backend GitHubController).
            </li>`;
            return;
        }

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
}