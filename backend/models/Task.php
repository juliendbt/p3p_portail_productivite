<?php
class Task {
    private $conn;
    private $table_name = "taches";

    public $id;
    public $id_utilisateur;
    public $titre;
    public $description;
    public $priorite;
    public $date_echeance;
    public $statut;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function creer() {
        $query = "INSERT INTO " . $this->table_name . " 
        SET id_utilisateur=:id_utilisateur, titre=:titre, description=:description, 
            priorite=:priorite, date_echeance=:date_echeance, statut=:statut";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);
        $stmt->bindParam(":titre", $this->titre);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":priorite", $this->priorite);
        $stmt->bindParam(":date_echeance", $this->date_echeance);
        $stmt->bindParam(":statut", $this->statut);

        return $stmt->execute();
    }

    public function lireParUtilisateur($id_utilisateur) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id_utilisateur = :id_utilisateur ORDER BY date_creation DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_utilisateur", $id_utilisateur);
        $stmt->execute();
        return $stmt;
    }

    public function supprimer($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    public function mettreAJour() {
        $query = "UPDATE " . $this->table_name . " 
                SET titre=:titre, description=:description, priorite=:priorite, 
                    date_echeance=:date_echeance, statut=:statut 
                WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":titre", $this->titre);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":priorite", $this->priorite);
        $stmt->bindParam(":date_echeance", $this->date_echeance);
        $stmt->bindParam(":statut", $this->statut);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }
}
?>
