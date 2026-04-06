<?php
require 'auth_config.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid request. Please provide email and password."]);
    exit;
}

if ($data['email'] === $ADMIN_EMAIL && $data['password'] === $ADMIN_PASSWORD) {
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
    session_regenerate_id(true); // ป้องกัน Fixation

    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_email'] = $data['email'];

    echo json_encode(["status" => "success", "message" => "Logged in successfully"]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "อีเมลหรือรหัสผ่านไม่ถูกต้อง"]);
}
?>
