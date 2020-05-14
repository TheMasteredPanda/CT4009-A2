<?php
$payload = json_decode($_COOKIE['ct4009Auth']);
$url = 'http://localhost:5555/investigations?userId=' . $payload->id;

if (isset($_GET['reportAuthor'])) {
    $url = $url . '&reportAuthor=' . $_GET['reportAuthor'];
}

if (isset($_GET['open'])) {
    $url = $url . '&open=' . $_GET['open'];
}

$curl = curl_init($url);
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

print $result;
