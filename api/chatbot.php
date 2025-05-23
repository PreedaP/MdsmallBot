<?php
header('Content-Type: application/json');
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);
$message = trim($data['message']);

// ในระบบจริงควรมีระบบ NLP หรือการค้นหาจากฐานข้อมูลที่นี่
$responses = [
    'นัดหมาย' => 'คุณสามารถนัดหมายแพทย์ได้ที่หมายเลข 02-XXX-XXXX หรือผ่าน Line Official @clinic-health',
    'เปิดกี่โมง' => 'คลินิกของเราเปิดให้บริการทุกวัน เวลา 08:00-20:00 น.',
    'ราคา' => 'แพ็กเกจตรวจสุขภาพพื้นฐานเริ่มต้นที่ 1,500 บาท กรุณาติดต่อเจ้าหน้าที่สำหรับรายละเอียดเพิ่มเติม',
    'default' => 'ขออภัยด้วย ฉันไม่เข้าใจคำถามของคุณ กรุณาติดต่อเจ้าหน้าที่ที่หมายเลข 02-XXX-XXXX'
];

$lowerMessage = mb_strtolower($message, 'UTF-8');

if (strpos($lowerMessage, 'นัด') !== false || strpos($lowerMessage, 'จอง') !== false) {
    $response = $responses['นัดหมาย'];
} elseif (strpos($lowerMessage, 'เปิด') !== false || strpos($lowerMessage, 'เวลา') !== false) {
    $response = $responses['เปิดกี่โมง'];
} elseif (strpos($lowerMessage, 'ราคา') !== false || strpos($lowerMessage, 'ค่าใช้จ่าย') !== false) {
    $response = $responses['ราคา'];
} else {
    $response = $responses['default'];
}

// บันทึกการสนทนาลงฐานข้อมูล (ในระบบจริง)
echo json_encode(['response' => $response]);
?>