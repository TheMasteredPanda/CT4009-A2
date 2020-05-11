<?php
include "../components/header.php";
$investigationId = $_GET['investigationId'];
$investigatorId = $_GET['investigatorId'];
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/investigations/investigators/remove?userId=' . $payload->id . '&investigationId=' . $investigationId . '&investigatorId=' . $investigatorId);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
    print $result;
    return;
}

curl_close($curl);
if ($detect->isMobile()) {
    header('Location: /pages/police/mobile/view_investigation?investigationId=' . $investigationId);
} else {
    header('Location: /pages/police/investigations.php?model=viewInvestigation&investigationId=' . $investigationId);
}

