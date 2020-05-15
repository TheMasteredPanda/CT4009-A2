<?php
include "../functions/report_functions.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/reports?userId=' . $payload->id);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($result);
    print_r($result);
    return;
}

$object = json_decode(($result));
$ids = $object->ids;
$reports = [];

for ($i = 0; $i < count($ids); $i++) {
    $report = getReport($ids[$i]);
    array_push($reports, $report);
}

echo json_encode($reports);
