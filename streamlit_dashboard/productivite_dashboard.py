import streamlit as st
import pandas as pd
import mysql.connector

st.set_page_config(page_title="Dashboard P3P", layout="wide")
st.title("📊 Tableau de bord P3P")

# Connexion MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",  # adapte si besoin
    database="p3p"
)

cursor = conn.cursor(dictionary=True)

# Tâches par statut
cursor.execute("SELECT statut, COUNT(*) AS total FROM taches GROUP BY statut")
data_taches = pd.DataFrame(cursor.fetchall())

# Objectifs par type
cursor.execute("SELECT type, COUNT(*) AS total FROM objectifs GROUP BY type")
data_objectifs = pd.DataFrame(cursor.fetchall())

# Graphique des tâches
st.subheader("Répartition des tâches")
st.bar_chart(data_taches.set_index("statut"))

# Graphique des objectifs
st.subheader("Répartition des objectifs")
st.bar_chart(data_objectifs.set_index("type"))

# Liste des tâches récentes
cursor.execute("SELECT titre, statut, date_creation FROM taches ORDER BY date_creation DESC LIMIT 10")
recent_tasks = pd.DataFrame(cursor.fetchall())
st.subheader("🗂️ Dernières tâches ajoutées")
st.dataframe(recent_tasks)

cursor.close()
conn.close()
