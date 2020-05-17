<?php
include "../components/header.php";

$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/user/change/password?userId=' . $payload->id);
$body = json_encode(array('newPassword' => $_POST['new_password']));
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token, 'Content-Type: application/json', 'Content-Length: ' . strlen($body)));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
    print_r($result);
    return;
}

curl_close($curl);
header('Location: http://localhost:3000/index.php?logout=true');
