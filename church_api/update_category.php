<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

require_once 'auth_check.php';
include_once 'db.php'; 

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id) && !empty($data->name) && !empty($data->type) && !empty($data->color)) {
    try {
        $query = "UPDATE categories SET name = :name, type = :type, color = :color WHERE id = :id";
        $stmt = $conn->prepare($query);

        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":type", $data->type);
        $stmt->bindParam(":color", $data->color);

        if($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "อัปเดตหมวดหมู่สำเร็จ"));
        } else {
            echo json_encode(array("status" => "error", "message" => "ไม่สามารถอัปเดตหมวดหมู่ได้"));
        }
    } catch (Exception $e) {
        echo json_encode(array("status" => "error", "message" => "Database Error: " . $e->getMessage()));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"));
}
?>
