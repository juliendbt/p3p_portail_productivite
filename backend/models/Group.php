<?php
class Group {
    private $conn;
    private $table_groupes = "groupes";
    private $table_membres = "membres_groupes";

    public $id;
    public $nom;
    public $cree_par;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function creer() {
        $query = "INSERT INTO " . $this->table_groupes . " (nom, cree_par) VALUES (:nom, :cree_par)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":cree_par", $this->cree_par);
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function ajouterMembre($id_utilisateur) {
        $query = "INSERT INTO " . $this->table_membres . " (id_groupe, id_utilisateur) VALUES (:id_groupe, :id_utilisateur)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_groupe", $this->id);
        $stmt->bindParam(":id_utilisateur", $id_utilisateur);
        return $stmt->execute();
    }

    public function getGroupesPourUtilisateur($id_utilisateur) {
        $query = "SELECT g.id, g.nom FROM " . $this->table_groupes . " g
                  JOIN " . $this->table_membres . " m ON g.id = m.id_groupe
                  WHERE m.id_utilisateur = :id_utilisateur";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_utilisateur", $id_utilisateur);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMembresDuGroupe() {
        $query = "SELECT u.id, u.nom, u.email FROM utilisateurs u
                  JOIN " . $this->table_membres . " m ON u.id = m.id_utilisateur
                  WHERE m.id_groupe = :id_groupe";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_groupe", $this->id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function retirerMembre($id_utilisateur) {
        $query = "DELETE FROM " . $this->table_membres . " 
                WHERE id_groupe = :id_groupe AND id_utilisateur = :id_utilisateur";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_groupe", $this->id);
        $stmt->bindParam(":id_utilisateur", $id_utilisateur);
        return $stmt->execute();
    }
}
?>
