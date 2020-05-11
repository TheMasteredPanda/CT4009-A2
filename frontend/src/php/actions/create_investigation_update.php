<?php
include "../components/header.php";
$investigationId = $_POST['investigationId'];
$content = $_POST['content'];
$payload = json_decode($_COOKIE['ct4009Auth']);
$body = json_encode(array('content' => $content));
$curl = curl_init('http:localhost:5555/investigations/updates/create?userId=' . $payload->id . '&investigationId=' . $investigationId);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Length: ' . strlen($body), 'Content-Type: application/json', 'Authorization: Bearer ' . $payload->token));
$result = json_decode(curl_exec($curl));
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($status);
    print $result;
    return;
}

curl_close($curl);

if (isset($_FILES)) {
    $evidence_array = [];

    foreach ($_FILES['evidence']['tmp_name'] as $index => $tmpName) {
        if (!empty($_FILES['evidence']['error'][$index])) {
            continue;
        }

        array_push($evidence_array, new \CURLFile($tmpName, $_FILES['evidence']['type'][$index], $_FILES['evidence']['name'][$index]));
    }

    $evidence_curl = curl_init('http://localhost:5555/investigations/evidence/upload?userId=' . $payload->id . '&updateId=' . $result->id);
    curl_setopt($evidence_curl, CURLOPT_POST, true);
    curl_setopt($evidence_curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($evidence_curl, CURLOPT_SAFE_UPLOAD, true);
    curl_setopt($evidence_curl, CURLOPT_HTTPHEADER, array('Content-Type: multipart/form-data', 'Authorization: Bearer ' . $payload->token));
    curl_setopt($evidence_curl, CURLOPT_POSTFIELDS, $evidence_array);
    curl_setopt($evidence_curl, CURLINFO_HEADER_OUT, true);
    $evidence_result = curl_exec($evidence_curl);
    $evidence_status = curl_getinfo($evidence_curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($status);
        print $result;
        return;
    }

    curl_close($evidence_curl);
}

if ($detect->isMobile()) {
    header('Location: /pages/police/mobile/view_investigation.php?investigationId=' . $investigationId);
} else {
    header('Location: /pages/police/investigations.php?model=viewInvestigation&investigationId=' . $investigationId);
}
