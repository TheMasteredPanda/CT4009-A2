<?php
include "../components/header.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
$updateId = $_GET['updateId'];
$investigationId = $_GET['investigationId'];
$curl = curl_init('http://localhost:5555/investigations/updates/hide?userId=' . $payload->id . '&updateId=' . $updateId . '&investigationId=' . $investigationId);
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
    header('Location: /mobile/view_investigation.php?investigationId=' . $investigationId);
} else {
    header('Location: /investigations.php?model=viewInvestigation&investigationId=' . $investigationId);
}
