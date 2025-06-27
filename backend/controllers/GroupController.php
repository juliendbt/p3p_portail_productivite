<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Group.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$db = (new Database())->getConnection();
$group = new Group($db);

$data = json_decode(file_get_contents("php://input"));
$action = $data->action ?? '';

switch ($action) {

    // ✅ Créer un nouveau groupe
    case 'create':
        $group->nom = $data->nom ?? '';
        $group->cree_par = $data->cree_par ?? null;

        if ($group->creer()) {
            // Ajouter le créateur comme membre automatiquement
            $group->ajouterMembre($group->cree_par);
            echo json_encode(["success" => true, "id" => $group->id]);
        } else {
            echo json_encode(["success" => false]);
        }
        break;

    // ✅ Ajouter un membre à un groupe
    case 'add_member':
        $group->id = $data->id_groupe ?? null;
        $success = $group->ajouterMembre($data->id_utilisateur ?? null);
        echo json_encode(["success" => $success]);
        break;

    // ✅ Récupérer les groupes d’un utilisateur
    case 'get_groups_for_user':
        $result = $group->getGroupesPourUtilisateur($data->id_utilisateur ?? 0);
        echo json_encode($result);
        break;

    // ✅ Récupérer les membres d’un groupe
    case 'get_members':
        $group->id = $data->id_groupe ?? null;
        $result = $group->getMembresDuGroupe();
        echo json_encode($result);
        break;

    case 'remove_member':
        $group->id = $data->id_groupe ?? null;
        $success = $group->retirerMembre($data->id_utilisateur ?? null);
        echo json_encode(["success" => $success]);
        break;

    default:
        echo json_encode(["error" => "Action groupe inconnue."]);
        break;
}
?>
