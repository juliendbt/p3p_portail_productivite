<?php
class Database {
    private $host = "localhost";
    private $db_name = "p3p";
    private $username = "root";
    private $password = ""; // à adapter
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8mb4");
        } catch (PDOException $exception) {
            echo "Erreur connexion : " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
