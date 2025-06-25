<?php
class User {
    private $conn;
    private $table_name = "utilisateurs";

    public $id;
    public $nom;
    public $email;
    public $mot_de_passe;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function inscrire() {
        $query = "INSERT INTO " . $this->table_name . " SET nom=:nom, email=:email, mot_de_passe=:mot_de_passe";

        $stmt = $this->conn->prepare($query);
        $this->mot_de_passe = password_hash($this->mot_de_passe, PASSWORD_DEFAULT);

        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":mot_de_passe", $this->mot_de_passe);

        return $stmt->execute();
    }

    public function connexion() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($this->mot_de_passe, $row['mot_de_passe'])) {
                $this->id = $row['id'];
                $this->nom = $row['nom'];
                return true;
            }
        }
        return false;
    }
}
?>
