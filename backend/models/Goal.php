<?php
class Goal {
    private $conn;
    private $table_name = "objectifs";

    public $id;
    public $id_utilisateur;
    public $type;
    public $titre;
    public $description;
    public $date_debut;
    public $date_fin;
    public $avancement;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function creer() {
        $query = "INSERT INTO " . $this->table_name . " 
        SET id_utilisateur=:id_utilisateur, type=:type, titre=:titre, description=:description, 
            date_debut=:date_debut, date_fin=:date_fin";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":titre", $this->titre);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date_debut", $this->date_debut);
        $stmt->bindParam(":date_fin", $this->date_fin);

        return $stmt->execute();
    }

    public function lireParUtilisateur($id_utilisateur) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id_utilisateur = :id_utilisateur ORDER BY date_debut DESC";
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
}
?>
