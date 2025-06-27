<?php
error_log("📌 index.php - action détectée = " . ($_GET['action'] ?? 'aucune'));

$request_uri = $_SERVER['REQUEST_URI'];

// Redirection directe si une action GET liée à MessageController est présente
if (
    isset($_GET['action']) &&
    in_array($_GET['action'], [
        'getUnreadMessages', 'markAsRead', 'get_for_user',
        'get_for_group', 'get_all', 'send', 'get_mentions', 'get_contacts'
    ])
) {
    // 🔄 Redirection réelle vers le bon contrôleur avec passage de tous les paramètres GET
    header("Location: ./controllers/MessageController.php?" . http_build_query($_GET));
    exit;
}

// Inclusion conditionnelle classique
if (strpos($request_uri, 'user') !== false) {
    include_once './controllers/UserController.php';
    exit;
}

if (strpos($request_uri, 'task') !== false) {
    include_once './controllers/TaskController.php';
    exit;
}

if (strpos($request_uri, 'goal') !== false) {
    include_once './controllers/GoalController.php';
    exit;
}

if (strpos($request_uri, 'github') !== false) {
    include_once __DIR__ . '/controllers/GitHubController.php';
    exit;
}

// Fallback
echo json_encode(["message" => "Bienvenue sur l'API P3P."]);
?>
