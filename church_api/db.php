<?php
// ไฟล์ db.php สำหรับเชื่อมต่อ MySQL ด้วย PDO
$host = "sql211.infinityfree.com";
$dbname = "if0_40693934_church_db";
$username = "if0_40693934"; // ใส่ username ของฐานข้อมูล (ค่าเริ่มต้น xampp คือ root)
$password = "FABYtPKCRAGLi";     // ใส่รหัสผ่าน (ค่าเริ่มต้น xampp คือ ปล่อยว่าง)

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    // ตั้งค่าให้แจ้งเตือนเมื่อมี Error
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>