<?php
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/user/delete?userId=' . $payload->id);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
    print_r($result);
    return;
}

curl_close($curl);
header('Location: http://localhost:3000/index.php?login=true');
