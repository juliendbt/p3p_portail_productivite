<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$db = (new Database())->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->action)) {
    echo json_encode(["message" => "Action non spécifiée."]);
    exit;
}

switch ($data->action) {
    case 'register':
        $user->nom = $data->nom ?? '';
        $user->email = $data->email ?? '';
        $user->mot_de_passe = $data->mot_de_passe ?? '';
        $user->role = $data->role ?? 'user';

        if ($user->inscrire()) {
            echo json_encode(["message" => "Inscription réussie."]);
        } else {
            echo json_encode(["message" => "Échec de l'inscription."]);
        }
        break;

    case 'login':
        $user->email = $data->email ?? '';
        $user->mot_de_passe = $data->mot_de_passe ?? '';

        if ($user->connexion()) {
            echo json_encode([
                "message" => "Connexion réussie.",
                "id" => $user->id,
                "nom" => $user->nom,
                "email" => $user->email,
                "role" => $user->role
            ]);
        } else {
            echo json_encode(["message" => "Identifiants incorrects."]);
        }
        break;

    case 'find_by_name':
        $stmt = $db->prepare("SELECT id, nom FROM utilisateurs WHERE LOWER(nom) = LOWER(?) LIMIT 1");
        $stmt->execute([$data->nom]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($result ?: []);
        break;

    case 'list':
        $stmt = $db->query("SELECT id, nom, email FROM utilisateurs");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    default:
        echo json_encode(["message" => "Action inconnue."]);
}
?>
