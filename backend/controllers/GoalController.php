<?php
require_once __DIR__ . '../config/database.php';
require_once __DIR__ . '../models/Goal.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$db = (new Database())->getConnection();
$goal = new Goal($db);

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';

switch ($action) {
    case 'create':
        $goal->id_utilisateur = $data->id_utilisateur;
        $goal->type = $data->type;
        $goal->titre = $data->titre;
        $goal->description = $data->description ?? '';
        $goal->date_debut = $data->date_debut ?? null;
        $goal->date_fin = $data->date_fin ?? null;

        echo json_encode(["success" => $goal->creer()]);
        break;

    case 'read':
        $stmt = $goal->lireParUtilisateur($data->id_utilisateur);
        $objectifs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($objectifs);
        break;

    case 'delete':
        echo json_encode(["success" => $goal->supprimer($data->id)]);
        break;

    default:
        echo json_encode(["message" => "Action objectif inconnue."]);
}
?>
