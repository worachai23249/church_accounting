<?php
// ไฟล์ db.php สำหรับเชื่อมต่อ MySQL ด้วย PDO
$host = "sql305.infinityfree.com";
$dbname = "if0_41253899_church_db";
$username = "if0_41253899";
$password = "GQVlj2611PQTo";

try {
    $conn = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password,
        [
            PDO::ATTR_PERSISTENT => true,          // ใช้ connection เดิมซ้ำ (เร็วขึ้น)
            PDO::ATTR_ERRMODE    => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT    => 5,             // หมดเวลา 5 วินาที
        ]
    );
} catch(PDOException $e) {
    http_response_code(503);
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
?>