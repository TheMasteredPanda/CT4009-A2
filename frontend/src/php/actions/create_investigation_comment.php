<?php
include "../components/header.php";
$investigationId = $_GET['investigationId'];
$comment = $_POST['comment'];
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/investigations/comments/create?userId=' . $payload->id . '&investigationId=' . $investigationId);
$body = json_encode(array('comment' => $comment));
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Length: ' . strlen($body), 'Content-Type: application/json', 'Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
    print $result;
    return;
}

curl_close($curl);

if ($rank === 'civilian') {
    if ($detect->isMobile()) {
        header('Location: /pages/civilian/mobile/view_investigation.php?investigationId=' . $investigationId);
    } else {
        header('Location: /pages/civilian/view_investigatin.php?investigationId=' . $investigationId);
    }
} else {
    if ($detect->isMobile()) {
        header('Location: /pages/police/mobile/view_investigation.php?investigationId=' . $investigationId);
    } else {
        header('Location: /pages/police/investigations.php?model=viewInvestigation?investigationId=' . $investigationId);
    }
}
