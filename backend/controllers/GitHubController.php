<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// === CONFIGURATION ===
$token = "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"; // ← Mets ton vrai token ici
$username = "juliendbt";
$repo = "p3p_portail_productivite";

$url = "https://api.github.com/repos/$username/$repo/commits";

// Appel à l'API GitHub avec token
$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: token $token",
        "User-Agent: p3p-app" // obligatoire pour GitHub API
    ]
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpCode === 200) {
    echo $response;
} else {
    http_response_code($httpCode);
    echo json_encode([
        "error" => "Échec de récupération des commits GitHub.",
        "status" => $httpCode
    ]);
}
