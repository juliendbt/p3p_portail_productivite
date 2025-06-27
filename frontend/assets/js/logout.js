document.addEventListener("DOMContentLoaded", () => {
  function logout() {
    if (confirm("Voulez-vous vous déconnecter ?")) {
      localStorage.removeItem("utilisateur");
      window.location.href = "index.html";
    }
  }

  fetch("components/navbar.html?nocache=" + new Date().getTime())
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar-container").innerHTML = html;

      const user = JSON.parse(localStorage.getItem("utilisateur"));
      const userInfo = document.getElementById("navbar-user-info");

      if (user && userInfo) {
        userInfo.innerHTML = `
          Connecté en tant que <strong>${user.nom}</strong>
          |
          <a href="#" id="logoutBtn" class="text-warning text-decoration-none ms-2">Déconnexion</a>
        `;

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", logout);
        }

        checkUnreadMessages(user.id);
        setInterval(() => checkUnreadMessages(user.id), 3000); // toutes les 3 secondes
      }
    });
});

function checkUnreadMessages(userId) {
  fetch(`/p3p_portail_productivite/backend/index.php?action=getUnreadMessages&user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
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
