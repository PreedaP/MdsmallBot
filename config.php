<?php
// ควรเก็บใน environment variable
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'clinic_chatbot';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES utf8");
    $conn->exec("SET time_zone = '+7:00'"); // ตั้งเวลาไทย
} catch(PDOException $e) {
    error_log("Connection failed: " . $e->getMessage());
    die("ขออภัย มีปัญหาการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่ในภายหลัง");
}
?>