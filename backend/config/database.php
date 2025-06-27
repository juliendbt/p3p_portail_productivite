<?php
class Database {
    private $host = "sql304.infinityfree.com";
    private $db_name = "if0_39336979_p3p";
    private $username = "if0_39336979";
    private $password = "18042002Ss"; // à adapter
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
