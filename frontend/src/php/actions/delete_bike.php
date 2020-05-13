<?php
include "../components/header.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/bike/unregister?userId=' . $payload->id . '&bikeId=' . $_GET['bikeId']);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
}

$rank = getRank();

header('Location: /bikes.php');

include "../components/footer.php";
