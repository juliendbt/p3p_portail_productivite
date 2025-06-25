    <?php
    class Goal {
        private $conn;
        private $table_name = "objectifs";

        public $id;
        public $id_utilisateur;
        public $titre;
        public $description;
        public $type;
        public $date_debut;
        public $date_fin;
        public $statut;

        public function __construct($db) {
            $this->conn = $db;
        }

        public function creer() {
            $query = "INSERT INTO " . $this->table_name . "
                    SET id_utilisateur=:id_utilisateur, titre=:titre, description=:description, type=:type,
                    date_debut=:date_debut, date_fin=:date_fin, statut=:statut";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id_utilisateur", $this->id_utilisateur);
            $stmt->bindParam(":titre", $this->titre);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":type", $this->type);
            $stmt->bindParam(":date_debut", $this->date_debut);
            $stmt->bindParam(":date_fin", $this->date_fin);
            $stmt->bindParam(":statut", $this->statut);
            return $stmt->execute();
        }

        public function mettreAJour() {
            $query = "UPDATE " . $this->table_name . "
                    SET titre=:titre, description=:description, type=:type,
                        date_debut=:date_debut, date_fin=:date_fin, statut=:statut
                    WHERE id=:id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            $stmt->bindParam(":titre", $this->titre);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":type", $this->type);
            $stmt->bindParam(":date_debut", $this->date_debut);
            $stmt->bindParam(":date_fin", $this->date_fin);
            $stmt->bindParam(":statut", $this->statut);
            return $stmt->execute();
        }

        public function supprimer($id) {
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            return $stmt->execute();
        }
    }
    ?>
