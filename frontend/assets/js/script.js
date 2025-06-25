const API_URL = "http://localhost/p3p_portail_productivite/backend/index.php/user";

async function register() {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "register",
            nom: document.getElementById("nom").value,
            email: document.getElementById("email_register").value,
            mot_de_passe: document.getElementById("password_register").value
        })
    });
    const data = await res.json();
    alert(data.message);
}

async function login() {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "login",
            email: document.getElementById("email").value,
            mot_de_passe: document.getElementById("password").value
        })
    });
    const data = await res.json();
        alert(data.message);
        if (data.id) {
            localStorage.setItem("utilisateur", JSON.stringify({
                id: data.id,
                nom: data.nom,
                email: data.email,
                role: data.role // ⚡️
            }));
            window.location.href = "dashboard.html";
        }

}
