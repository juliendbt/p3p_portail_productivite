# 📊 Portail Personnel de Suivi de Performance (P3P)

P3P est une application web complète de suivi de productivité permettant aux utilisateurs de :
- gérer leurs tâches
- suivre leurs objectifs
- visualiser leur performance
- recevoir des notifications
- intégrer des données externes (GitHub, météo, Google Calendar)

---

## 🧱 Structure du projet

p3p_portail_productivite/
├── backend/
│ ├── config/ (connexion BDD)
│ ├── models/ (User, Task, Goal)
│ ├── controllers/ (API PHP)
├── frontend/
│ ├── index.html (connexion)
│ ├── dashboard.html (tâches)
│ ├── goals.html (objectifs)
│ ├── calendar.html (Google)
├── streamlit_dashboard/
│ └── productivite_dashboard.py
├── database/
│ ├── schema.sql
│ ├── seed_data.sql
├── manifest.json / sw.js


---

## 🚀 Fonctionnalités principales

- ✅ Authentification utilisateurs
- ✅ Gestion de tâches (CRUD)
- ✅ Objectifs hebdomadaires/mensuels
- ✅ Statistiques (Chart.js + Streamlit)
- ✅ API météo (OpenWeather)
- ✅ API GitHub (commits récents)
- ✅ API Google Calendar (événements)
- ✅ Thème dark/light + PWA installable
- ✅ Notifications JS pour tâches urgentes

---

## 🔧 Installation

1. Cloner le projet dans `htdocs/` (XAMPP)  
2. Créer une base `p3p` et importer `database/schema.sql`  
3. (Optionnel) Importer `database/seed_data.sql` pour tester  
4. Lancer `http://localhost/p3p_portail_productivite/frontend/index.html`  
5. (Optionnel) Lancer `streamlit run productivite_dashboard.py` dans `/streamlit_dashboard/`

---

## 🧪 Technologies utilisées

- **Frontend** : HTML, CSS, Bootstrap, JavaScript, Chart.js
- **Backend** : PHP (API REST)
- **Base de données** : MySQL
- **Scripts Python** : Streamlit (visualisation)
- **APIs** : OpenWeather, GitHub, Google Calendar (OAuth2)
