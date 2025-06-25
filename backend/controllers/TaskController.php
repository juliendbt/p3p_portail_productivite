<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Task.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$db = (new Database())->getConnection();
$task = new Task($db);

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';
$id_utilisateur = $data->id_utilisateur ?? null;
$role = $data->role ?? 'user'; // user par défaut si non fourni

switch ($action) {
    case 'create':
        // Si admin, il peut créer pour n'importe quel utilisateur (champ reçu du front)
        // Sinon, il ne peut créer que pour lui-même
        $task->id_utilisateur = ($role === 'admin' && isset($data->id_utilisateur)) ? $data->id_utilisateur : $id_utilisateur;
        $task->titre = $data->titre;
        $task->description = $data->description ?? '';
        $task->priorite = $data->priorite ?? 'moyenne';
        $task->date_echeance = $data->date_echeance ?? null;
        $task->statut = $data->statut ?? 'à faire';

        echo json_encode(["success" => $task->creer()]);
        break;

    case 'read':
        if ($role === 'admin') {
            // Voir toutes les tâches, avec nom d'utilisateur
            $stmt = $db->prepare("SELECT t.*, u.nom as nom_utilisateur FROM taches t JOIN utilisateurs u ON t.id_utilisateur = u.id ORDER BY t.date_echeance ASC");
            $stmt->execute();
        } else {
            // Voir seulement ses propres tâches
            $stmt = $db->prepare("SELECT t.*, u.nom as nom_utilisateur FROM taches t JOIN utilisateurs u ON t.id_utilisateur = u.id WHERE t.id_utilisateur = ? ORDER BY t.date_echeance ASC");
            $stmt->execute([$id_utilisateur]);
        }
        $taches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($taches);
        break;

    case 'update':
        // Pour update/supprimer, vérifie l'appartenance (à faire côté Task.php si tu veux aller plus loin en sécurité)
        $task->id = $data->id;
        $task->titre = $data->titre;
        $task->description = $data->description ?? '';
        $task->priorite = $data->priorite ?? 'moyenne';
        $task->date_echeance = $data->date_echeance ?? null;
        $task->statut = $data->statut ?? 'à faire';

        // Si admin, il peut tout modifier. Sinon, il faut vérifier que la tâche appartient à l'utilisateur connecté.
        // À sécuriser dans Task.php si besoin.
        echo json_encode(["success" => $task->mettreAJour()]);
        break;

    case 'delete':
        // Même remarque que update
        echo json_encode(["success" => $task->supprimer($data->id)]);
        break;

    case 'users':
        // Pour permettre à l'admin de choisir un utilisateur lors de la création de tâche
        $stmt = $db->prepare("SELECT id, nom, email FROM utilisateurs");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    default:
        echo json_encode(["message" => "Action tâche inconnue."]);
}
?>
