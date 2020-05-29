<?php
$payload = json_decode($_COOKIE['ct4009Auth']);
$accountId = $_GET['accountId'];
$curl = curl_init('http://localhost:5555/admin/accounts/delete?userId=' . $payload->id . '&accountId=' . $accountId);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print_r($result);
    print_r(curl_error($curl));
    return;
}

curl_close($curl);
