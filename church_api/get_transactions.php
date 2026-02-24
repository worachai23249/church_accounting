<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require 'db.php';

try {
$sql = "SELECT * FROM transactions ORDER BY transaction_date DESC, id DESC";
$stmt = $conn->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($results);
} catch(PDOException $e) {
echo json_encode(["error" => $e->getMessage()]);
}
?>