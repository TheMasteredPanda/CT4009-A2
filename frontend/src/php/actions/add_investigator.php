<?php
include "../components/header.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
$investigatorId = $_GET['investigatorId'];
$investigationId = $_GET['investigationId'];
$curl = curl_init('http://localhost:5555/investigations/investigators/add?userId=' . $payload->id . '&investigatorId=' . $investigatorId . '&investigationId=' . $investigationId);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    if ($status === 406) {
        if ($detect->isMobile()) {
            header('Location: /pages/police/mobile/add_investigator.php?investigationId=' . $investigationId . '&investigatorId=' . $investigatorId . '&error=already_investigator');
        } else {
            header('Location: /pages/police/investigations.php?model=viewInvestigation&investigtionId=' . $investigationId . '&investigatorId=' . $investigatorId . '&error=already_investigator');
        }
        return;
    }

    print curl_error($curl);
    print $result;
}

if ($detect->isMobile()) {
    header('Location: /pages/police/mobile/view_investigation.php?investigationId=' . $investigationId);
} else {
    header('Location: /pages/police/investigations.php?model=viewInvestigation&investigationId=' . $investigationId);
}
