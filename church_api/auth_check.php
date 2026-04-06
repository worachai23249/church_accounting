<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // ให้ผ่าน Preflight ไปได้เลย ส่วนใหญ่จะมี Header อยู่ในไฟล์เป้าหมายอยู่แล้ว
    return;
}

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized access. Please login first."]);
    exit;
}
?>
