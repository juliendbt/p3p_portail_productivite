<?php
require_once __DIR__ . '/../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$db = (new Database())->getConnection();

// Corriger l'action même si exécuté via include depuis index.php
$action = '';
$data = new stdClass();

if (isset($_REQUEST['action'])) {
    $action = $_REQUEST['action'];
    $data = (object) $_REQUEST;
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $action = $input['action'] ?? '';
    $data = (object) $input;
}

error_log("✅ MessageController appelé avec action = $action");

switch ($action) {
    case 'send':
        $stmt = $db->prepare("INSERT INTO messages (
            expediteur_id, destinataire_id, id_groupe, contenu, mentionne_id, is_read
        ) VALUES (?, ?, ?, ?, ?, 0)");
        $stmt->execute([
            $data->expediteur_id,
            $data->destinataire_id ?? null,
            $data->id_groupe ?? null,
            $data->contenu,
            $data->mentionne_id ?? null
        ]);
        echo json_encode(["success" => true]);
        break;

    case 'get_for_user':
        if (!isset($data->user_id)) {
            echo json_encode(['error' => 'ID utilisateur manquant']);
            break;
        }
        $stmt = $db->prepare("SELECT m.*, u.nom AS expediteur_nom FROM messages m
                              JOIN utilisateurs u ON m.expediteur_id = u.id
                              WHERE destinataire_id = ? OR expediteur_id = ?
                              ORDER BY m.date_envoi ASC");
        $stmt->execute([$data->user_id, $data->user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'get_mentions':
        $stmt = $db->prepare("SELECT m.*, u.nom AS expediteur_nom FROM messages m
                              JOIN utilisateurs u ON m.expediteur_id = u.id
                              WHERE mentionne_id = ?
                              ORDER BY m.date_envoi DESC");
        $stmt->execute([$data->user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'get_all':
        $stmt = $db->query("SELECT m.*, e.nom AS expediteur_nom, d.nom AS destinataire_nom FROM messages m
                            LEFT JOIN utilisateurs e ON m.expediteur_id = e.id
                            LEFT JOIN utilisateurs d ON m.destinataire_id = d.id
                            ORDER BY m.date_envoi DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'get_contacts':
        $stmt = $db->prepare("SELECT u.id, u.nom, u.email
                              FROM utilisateurs u
                              WHERE u.id != :user_id
                              AND (
                                  u.id IN (SELECT DISTINCT destinataire_id FROM messages WHERE expediteur_id = :user_id)
                                  OR u.id IN (SELECT DISTINCT expediteur_id FROM messages WHERE destinataire_id = :user_id)
                              )");
        $stmt->execute(['user_id' => $data->user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'get_for_group':
        $stmt = $db->prepare("SELECT m.*, u.nom AS expediteur_nom FROM messages m
                              JOIN utilisateurs u ON m.expediteur_id = u.id
                              WHERE id_groupe = ?
                              ORDER BY m.date_envoi ASC");
        $stmt->execute([$data->id_groupe]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'getUnreadMessages':
        if (isset($data->user_id)) {
            $stmt = $db->prepare("
                SELECT (
                    SELECT COUNT(*) FROM messages 
                    WHERE destinataire_id = :userId AND is_read = 0
                ) +
                (
                    SELECT COUNT(*) FROM messages 
                    WHERE id_groupe IN (
                        SELECT id_groupe FROM membres_groupes WHERE id_utilisateur = :userId
                    )
                    AND is_read = 0
                    AND expediteur_id != :userId
                ) AS unread_count
            ");
            $stmt->bindParam(':userId', $data->user_id);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['unread' => $result['unread_count']]);
        } else {
            echo json_encode(['error' => 'user_id manquant']);
        }
        break;

    case 'markAsRead':
    if (isset($data->user_id)) {
        if (isset($data->group_id)) {
            // CORRECTION ICI ✅ : on ne filtre plus sur destinataire_id
            $stmt = $db->prepare("
                UPDATE messages 
                SET is_read = 1 
                WHERE id_groupe = :groupId 
                AND is_read = 0 
                AND expediteur_id != :userId
            ");
            $stmt->bindParam(':groupId', $data->group_id);
            $stmt->bindParam(':userId', $data->user_id);
        } else {
            // Messages privés
            $stmt = $db->prepare("
                UPDATE messages 
                SET is_read = 1 
                WHERE destinataire_id = :userId 
                AND (id_groupe IS NULL OR id_groupe = 0)
            ");
            $stmt->bindParam(':userId', $data->user_id);
        }
        $stmt->execute();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'user_id manquant']);
    }
    break;

    case 'get_unread_groups_for_user':
        $user_id = $data->user_id ?? null;

        if (!$user_id) {
            echo json_encode([]);
            break;
        }

        $stmt = $db->prepare("
            SELECT DISTINCT id_groupe FROM messages 
            WHERE id_groupe IS NOT NULL AND is_read = 0 AND expediteur_id != :user_id
            AND id_groupe IN (
                SELECT id_groupe FROM membres_groupes WHERE id_utilisateur = :user_id
            )
        ");
        $stmt->execute(['user_id' => $user_id]);
        $result = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(array_map('intval', $result)); // 🟢 CONVERSION pour fix JS includes()
        break;

    default:
        echo json_encode(["message" => "Action non spécifiée."]);
        break;
}
?>
