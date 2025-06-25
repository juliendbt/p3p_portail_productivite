<?php
$request_uri = $_SERVER['REQUEST_URI'];

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


// On pourra ajouter d'autres routes ici plus tard (tâches, objectifs, etc.)
echo json_encode(["message" => "Bienvenue sur l'API P3P."]);
?>
