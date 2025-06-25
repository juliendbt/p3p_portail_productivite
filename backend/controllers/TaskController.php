<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Task.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$db = (new Database())->getConnection();
$task = new Task($db);

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';

switch ($action) {
    case 'create':
        $task->id_utilisateur = $data->id_utilisateur;
        $task->titre = $data->titre;
        $task->description = $data->description ?? '';
        $task->priorite = $data->priorite ?? 'moyenne';
        $task->date_echeance = $data->date_echeance ?? null;
        $task->statut = $data->statut ?? 'à faire';

        echo json_encode(["success" => $task->creer()]);
        break;

    case 'read':
        $stmt = $task->lireParUtilisateur($data->id_utilisateur);
        $taches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($taches);
        break;

    case 'update':
        $task->id = $data->id;
        $task->titre = $data->titre;
        $task->description = $data->description ?? '';
        $task->priorite = $data->priorite ?? 'moyenne';
        $task->date_echeance = $data->date_echeance ?? null;
        $task->statut = $data->statut ?? 'à faire';

        echo json_encode(["success" => $task->mettreAJour()]);
        break;

    case 'delete':
        echo json_encode(["success" => $task->supprimer($data->id)]);
        break;

    default:
        echo json_encode(["message" => "Action tâche inconnue."]);
}
?>
