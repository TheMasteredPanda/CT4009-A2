<?php
$reportId = $_GET['reportId'];
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/investigations/create?userId=' . $payload->id . '&reportId=' . $reportId);
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
header('Location: /investigations.php');
