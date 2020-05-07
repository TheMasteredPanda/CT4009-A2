<?php
include "../components/header.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/reports/create?userId=' . $payload->id . '&bikeId=' . $_GET['bikeId']);
$body = json_encode(array('content' => $_POST['report_description']));
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body), 'Authorization: Bearer ' . $payload->token));
$result = json_decode(curl_exec($curl));
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
    echo '\n';
    print $result;
    return;
}

if ($detect->isMobile()) {
    header('Location: /pages/civilian/mobile/view_report.php?reportId=' . $result->id);
} else {
    header('Location: /pages/civilian/reports.php?reportId=' . $result->id . '&model=viewReport');
}

include "../components/footer.php";
