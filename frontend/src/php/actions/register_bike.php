<?php
include "../components/header.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/bike/register?userId=' . $payload->id);

$body_content = array(
    'partNumber' => htmlspecialchars($_POST['partNumber']),
    'brand' => htmlspecialchars($_POST['brand']),
    'modal' => htmlspecialchars($_POST['modal']),
    'wheelSize' => htmlspecialchars($_POST['wheelSize']),
    'gearCount' => htmlspecialchars($_POST['gearCount']),
    'gender' => htmlspecialchars($_POST['gender']),
    'ageGroup' => htmlspecialchars($_POST['ageGroup'])
);

if (isset($_POST['type'])) {
    $body_content['type'] = $_POST['type'];
}

if (isset($_POST['colours'])) {
    $body_content['colours'] = $_POST['colours'];
}

if (isset($_POST['brakeType'])) {
    $body_content['brakeType'] = $_POST['brakeType'];
}

if (isset($_POST['suspension'])) {
    $body_content['suspension'] = $_POST['suspension'];
}


$body = json_encode($body_content);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLINFO_HEADER_OUT, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Length: ' . strlen($body), 'Content-Type: application/json', 'Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

$image_array = [];

$image_curl = curl_init('http://localhost:5555/bike/images/upload?userId=' . $payload->id . '&bikeId=' . json_decode($result)->id);

foreach ($_FILES['image']['tmp_name'] as $index => $tmpName) {
    if (!empty($_FILES['image']['error'][$index])) {
        continue;
    }

    array_push($image_array, new \CURLFile($tmpName, $_FILES['image']['type'][$index], $_FILES['image']['name'][$index]));
}

curl_setopt($image_curl, CURLOPT_POST, true);
curl_setopt($image_curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($image_curl, CURLOPT_SAFE_UPLOAD, true);
curl_setopt($image_curl, CURLOPT_HTTPHEADER, array('Content-Type: multipart/form-data', 'Authorization: Bearer ' . $payload->token));
curl_setopt($image_curl, CURLOPT_POSTFIELDS, $image_array);
curl_setopt($image_curl, CURLINFO_HEADER_OUT, true);
$image_result = curl_exec($image_curl);
$image_status = curl_getinfo($image_curl, CURLINFO_HTTP_CODE);

if ($image_status !== 200) {
    print curl_error($image_curl);
    return;
}

curl_close($image_curl);

$rank = getRank();

if ($status === 200) {
    if ($rank === 'civilian') {
        header('Location: /pages/civilian/bikes.php');
    } else {
        header('Location: /pages/police/bikes.php');
    }
} else {
    print curl_error($curl);
}

curl_close($curl);
