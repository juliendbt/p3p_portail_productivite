<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Goal.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$db = (new Database())->getConnection();
$goal = new Goal($db);

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';
$id_utilisateur = $data->id_utilisateur ?? null;
$role = $data->role ?? 'user';

switch ($action) {
    case 'create':
        $goal->id_utilisateur = ($role === 'admin' && isset($data->id_utilisateur)) ? $data->id_utilisateur : $id_utilisateur;
        $goal->titre = $data->titre;
        $goal->description = $data->description ?? '';
        $goal->type = $data->type ?? 'général';
        $goal->date_debut = $data->date_debut ?? null;
        $goal->date_fin = $data->date_fin ?? null;
        $goal->statut = $data->statut ?? 'à faire';

        echo json_encode(["success" => $goal->creer()]);
        break;

    case 'read':
        if ($role === 'admin') {
            $stmt = $db->prepare("SELECT g.*, u.nom as nom_utilisateur FROM objectifs g JOIN utilisateurs u ON g.id_utilisateur = u.id ORDER BY g.date_fin ASC");
            $stmt->execute();
        } else {
            $stmt = $db->prepare("SELECT g.*, u.nom as nom_utilisateur FROM objectifs g JOIN utilisateurs u ON g.id_utilisateur = u.id WHERE g.id_utilisateur = ? ORDER BY g.date_fin ASC");
            $stmt->execute([$id_utilisateur]);
        }
        $goals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($goals);
        break;

    case 'update':
        $goal->id = $data->id;
        $goal->titre = $data->titre;
        $goal->description = $data->description ?? '';
        $goal->type = $data->type ?? 'général';
        $goal->date_debut = $data->date_debut ?? null;
        $goal->date_fin = $data->date_fin ?? null;
        $goal->statut = $data->statut ?? 'à faire';

        echo json_encode(["success" => $goal->mettreAJour()]);
        break;

    case 'delete':
        echo json_encode(["success" => $goal->supprimer($data->id)]);
        break;

    case 'users':
        $stmt = $db->prepare("SELECT id, nom, email FROM utilisateurs");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;

    default:
        echo json_encode(["message" => "Action objectif inconnue."]);
}
?>
