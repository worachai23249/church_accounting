<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require 'db.php';

try {
    // สร้างตารางอัตโนมัติถ้ายังไม่มี
    $createTableQuery = "CREATE TABLE IF NOT EXISTS categories (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('INCOME', 'EXPENSE') NOT NULL,
        color VARCHAR(50) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;";
    $conn->exec($createTableQuery);

    // ไม่ทำการเช็คเพิ่มข้อมูลเริ่มต้นอัตโนมัติแล้ว เพื่อให้สามารถลบทุกหมวดหมู่ได้

    $sql = "SELECT id, name, type, color FROM categories ORDER BY type ASC, id ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
