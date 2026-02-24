<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once 'db.php'; 

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->transaction_date) && !empty($data->type) && !empty($data->description) && isset($data->amount)) {
    
    try {
        $query = "INSERT INTO transactions (transaction_date, type, description, amount, note, image_url) VALUES (:transaction_date, :type, :description, :amount, :note, :image_url)";
        $stmt = $conn->prepare($query);

        $stmt->bindParam(":transaction_date", $data->transaction_date);
        $stmt->bindParam(":type", $data->type);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":amount", $data->amount);
        
        $note = isset($data->note) ? $data->note : null;
        $image_url = isset($data->image_url) ? $data->image_url : null;
        
        $stmt->bindParam(":note", $note);
        $stmt->bindParam(":image_url", $image_url);

        if($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "บันทึกข้อมูลสำเร็จ"));
        } else {
            echo json_encode(array("status" => "error", "message" => "ไม่สามารถบันทึกข้อมูลได้"));
        }
    } catch (Exception $e) {
        // ดักจับ Error ส่งกลับไปหา React
        echo json_encode(array("status" => "error", "message" => "Database Error: " . $e->getMessage()));
    }

} else {
    echo json_encode(array("status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"));
}
?>