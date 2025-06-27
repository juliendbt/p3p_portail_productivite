const user = JSON.parse(localStorage.getItem("utilisateur"));
const MESSAGE_API_URL = "../backend/controllers/MessageController.php";
const USER_API_URL = "../backend/controllers/UserController.php";

let destinataireActif = null;
let contactNom = "";
window.activeGroupId = null;
window.createurGroupeActuel = null;

// === Initialisation complète ===
document.addEventListener("DOMContentLoaded", async () => {
  if (!user) {
    alert("Connectez-vous pour accéder à la messagerie.");
    window.location.href = "index.html";
    return;
  }

  checkUnreadMessages(user.id);

  await chargerNavbar();
  chargerContacts();
  chargerGroupes();
  document.getElementById("sendMessage")?.addEventListener("click", envoyerMessage);
  document.getElementById("btnCreateGroup")?.addEventListener("click", creerGroupe);
  document.getElementById("btnAddMember")?.addEventListener("click", ajouterMembre);

  setInterval(() => {
    if (destinataireActif !== null) {
      chargerConversation(destinataireActif, contactNom);
    } else if (window.activeGroupId) {
      chargerConversationGroupe(window.activeGroupId, contactNom.replace("[Groupe] ", ""));
    }
  }, 3000);
});

// === Navbar injectée dynamiquement ===
async function chargerNavbar() {
  const navbarContainer = document.getElementById("navbar-container");
  const res = await fetch("components/navbar.html");
  const html = await res.text();
  navbarContainer.innerHTML = html;

  const span = document.getElementById("navbar-user-info");
  if (span) {
    span.innerHTML = `Connecté en tant que <strong>${user.nom}</strong> | <a href="#" id="logoutLink">Déconnexion</a>`;
    document.getElementById("logoutLink").addEventListener("click", () => {
      localStorage.removeItem("utilisateur");
      window.location.href = "index.html";
    });
  }
}

// === Charger la liste des contacts ===
let allContacts = []; // nouvelle variable globale

async function chargerContacts() {
  const [userRes, messageRes] = await Promise.all([
    fetch(USER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list" })
    }),
    fetch(MESSAGE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_for_user", user_id: user.id })
    })
  ]);

  allContacts = await userRes.json();
  const messages = await messageRes.json();

  const unreadMap = new Map();
  messages.forEach(m => {
    if (m.is_read == 0 && m.expediteur_id !== user.id) {
      unreadMap.set(m.expediteur_id, true);
    }
  });

  // Affiche tous les contacts initialement
  afficherContacts(allContacts.filter(c => c.id !== user.id), unreadMap);

  // Barre de recherche
  const searchInput = document.getElementById("searchContact");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const filtre = searchInput.value.toLowerCase();
      const filtres = allContacts.filter(c =>
        c.nom.toLowerCase().includes(filtre) && c.id !== user.id
      );
      afficherContacts(filtres, unreadMap);
    });
  }
}

function afficherContacts(contacts, unreadMap) {
  const list = document.getElementById("contactsList");
  list.innerHTML = "";

  // 👉 Trier : ceux avec messages non lus en premier
  contacts.sort((a, b) => {
    const aUnread = unreadMap.has(a.id) ? 1 : 0;
    const bUnread = unreadMap.has(b.id) ? 1 : 0;
    return bUnread - aUnread || a.nom.localeCompare(b.nom);
  });

  contacts.forEach(c => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    li.textContent = c.nom;
    li.addEventListener("click", () => chargerConversation(c.id, c.nom));

    if (unreadMap.has(c.id)) {
      const badge = document.createElement("span");
      badge.className = "badge bg-danger rounded-pill";
      badge.textContent = "●";
      li.appendChild(badge);
    }

    list.appendChild(li);
  });
}

// === Charger une conversation privée ===
async function chargerConversation(id, nom) {
  destinataireActif = id;
  contactNom = nom;
  window.activeGroupId = null;
  document.getElementById("groupMembersContainer").classList.add("d-none");

  document.getElementById("chatWith").classList.remove("d-none");
  document.querySelector("#chatWith span").textContent = nom;
  document.getElementById("chatControls").classList.remove("d-none");

  const res = await fetch(MESSAGE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get_for_user", user_id: user.id })
  });

  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error("Réponse inattendue:", data);
    alert("Erreur lors du chargement des messages.");
    return;
  }

  const messages = data.filter(m =>
    (m.expediteur_id == user.id && m.destinataire_id == id) ||
    (m.expediteur_id == id && m.destinataire_id == user.id)
  );

  const container = document.getElementById("messages");
  container.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `
      <strong>${msg.expediteur_id == user.id ? "Moi" : contactNom}</strong> :
      ${msg.contenu}<br><small>${msg.date_envoi}</small>
    `;
    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
  markAsRead(user.id, null);
  const badge = document.getElementById("notif-badge");
  if (badge) badge.style.display = "none";

  chargerContacts();
}

// === Envoyer un message (privé ou groupe) ===
async function envoyerMessage() {
  const contenu = document.getElementById("messageInput").value;
  if (!contenu.trim()) return;

  const data = {
    action: "send",
    expediteur_id: user.id,
    contenu: contenu,
    mentionne_id: null
  };

  if (destinataireActif) {
    data.destinataire_id = destinataireActif;
  } else if (window.activeGroupId) {
    data.id_groupe = window.activeGroupId;
  }

  await fetch(MESSAGE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  document.getElementById("messageInput").value = "";

  if (destinataireActif) {
    chargerConversation(destinataireActif, contactNom);
  } else {
    chargerConversationGroupe(window.activeGroupId, contactNom.replace("[Groupe] ", ""));
  }
}


// === Charger les groupes de l’utilisateur ===
async function chargerGroupes() {
  const [groupRes, unreadGroupRes] = await Promise.all([
    fetch("../backend/controllers/GroupController.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_groups_for_user",
        id_utilisateur: user.id
      })
    }),
    fetch(MESSAGE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_unread_groups_for_user",
        user_id: user.id
      })
    })
  ]);
  

  const groupes = await groupRes.json();
  const unreadGroupIds = await unreadGroupRes.json(); // tableau d'IDs

  const list = document.getElementById("groupList");
  list.innerHTML = "";

  groupes.forEach(groupe => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    li.textContent = groupe.nom;
    li.addEventListener("click", () => chargerConversationGroupe(groupe.id, groupe.nom));

    if (unreadGroupIds.includes(Number(groupe.id))) {
      const badge = document.createElement("span");
      badge.className = "badge bg-danger rounded-pill";
      badge.textContent = "●";
      li.appendChild(badge);
    }

    list.appendChild(li);
  });
  
}

// === Créer un nouveau groupe ===
async function creerGroupe() {
  const name = document.getElementById("newGroupName").value.trim();
  if (!name) return;

  await fetch("../backend/controllers/GroupController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      nom: name,
      cree_par: user.id
    })
  });

  document.getElementById("newGroupName").value = "";
  chargerGroupes();
}

// === Charger les messages d’un groupe ===
async function chargerConversationGroupe(idGroupe, nomGroupe) {
  destinataireActif = null;
  window.activeGroupId = idGroupe;
  contactNom = "[Groupe] " + nomGroupe;

  document.getElementById("chatWith").classList.remove("d-none");
  document.querySelector("#chatWith span").textContent = contactNom;
  document.getElementById("chatControls").classList.remove("d-none");

  const res = await fetch(MESSAGE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "get_for_group",
      id_groupe: idGroupe
    })
  });

  const messages = await res.json();
  const container = document.getElementById("messages");
  container.innerHTML = "";

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `
      <strong>${msg.expediteur_nom}</strong> : ${msg.contenu}
      <br><small>${msg.date_envoi}</small>
    `;
    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
  markAsRead(user.id, idGroupe);
  const badge = document.getElementById("notif-badge");
  if (badge) badge.style.display = "none";
  chargerGroupes();
  afficherMembresGroupe(idGroupe);
}

async function afficherMembresGroupe(idGroupe) {
  const res = await fetch("../backend/controllers/GroupController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get_members", id_groupe: idGroupe })
  });
  const membres = await res.json();

  const ul = document.getElementById("groupMembersList");
  ul.innerHTML = "";

  membres.forEach(m => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      ${m.nom} (${m.email})
      ${m.id != user.id && membres[0].id == user.id ? 
        `<button class="btn btn-sm btn-danger" onclick="retirerMembre(${idGroupe}, ${m.id})">❌</button>` : ''}
    `;
    ul.appendChild(li);
  });

  const usersRes = await fetch(USER_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list" })
  });
  const allUsers = await usersRes.json();
  const nonMembres = allUsers.filter(u => !membres.find(m => m.id == u.id));

  const select = document.getElementById("addMemberSelect");
  select.innerHTML = "";
  nonMembres.forEach(u => {
    const option = document.createElement("option");
    option.value = u.id;
    option.textContent = `${u.nom} (${u.email})`;
    select.appendChild(option);
  });

  document.getElementById("groupMembersContainer").classList.remove("d-none");
  window.createurGroupeActuel = membres[0]?.id; // Le créateur = premier membre (par défaut)
}

async function ajouterMembre() {
  const idUtilisateur = document.getElementById("addMemberSelect").value;
  if (!idUtilisateur || !window.activeGroupId) return;

  await fetch("../backend/controllers/GroupController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "add_member",
      id_groupe: window.activeGroupId,
      id_utilisateur: idUtilisateur
    })
  });

  afficherMembresGroupe(window.activeGroupId);
}

async function retirerMembre(idGroupe, idUtilisateur) {
  if (!confirm("Retirer cet utilisateur du groupe ?")) return;

  await fetch("../backend/controllers/GroupController.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "remove_member",
      id_groupe: idGroupe,
      id_utilisateur: idUtilisateur
    })
  });

  afficherMembresGroupe(idGroupe);
}


function checkUnreadMessages(userId) {
  fetch(`/p3p_portail_productivite/backend/index.php?action=getUnreadMessages&user_id=${userId}`)

    .then(res => res.json())
    .then(data => {
      console.log("🔔 checkUnreadMessages réponse :", data); // ← log
      const badge = document.getElementById("notif-badge");
      if (!badge) return;
      if (data.unread > 0) {
        badge.innerText = data.unread;
        badge.style.display = "inline";
      } else {
        badge.style.display = "none";
      }
    })
    .catch(err => console.error("Erreur notifications :", err));
}

function markAsRead(userId, groupId = null) {
  const data = {
    action: "markAsRead",        // ← IMPORTANT : c’est ça qui active le bon case PHP
    user_id: userId,
    group_id: groupId
  };

  fetch("/p3p_portail_productivite/backend/controllers/MessageController.php", {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(json => console.log("markAsRead réponse :", json))
  .catch(err => console.error("Erreur markAsRead :", err));
}
