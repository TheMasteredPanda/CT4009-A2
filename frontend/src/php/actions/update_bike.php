<?php
include "../components/header.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
if (!isset($_GET['bikeId'])) {
    echo 'Bike id is not set';
    return;
}

$body_content = array(
    'partNumber' => htmlspecialchars($_POST['edit_part_number']),
    'brand' => htmlspecialchars($_POST['edit_brand']),
    'modal' => htmlspecialchars($_POST['edit_modal']),
    'wheelSize' => htmlspecialchars($_POST['wheelSize']),
    'gearCount' => htmlspecialchars($_POST['edit_gear_count']),
    'brakeType' => htmlspecialchars($_POST['edit_brake_type']),
    'suspension' => htmlspecialchars($_POST['edit_bike_suspension']),
    'colours' => htmlspecialchars($_POST['edit_bike_colours']),
    'gender' => htmlspecialchars($_POST['edit_bike_gender']),
    'ageGroup' => htmlspecialchars($_POST['edit_bike_age_group']),
    'type' => htmlspecialchars($_POST['edit_bike_type'])
);

$body = json_encode($body_content);
$update_curl = curl_init('http://localhost:5555/bike/update?userId=' . $payload->id . '&bikeId=' . $_GET['bikeId']);
curl_setopt($update_curl, CURLOPT_POST, true);
curl_setopt($update_curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($update_curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body), 'Authorization: Bearer ' . $payload->token));
curl_setopt($update_curl, CURLOPT_POSTFIELDS, $body);
$update_result = curl_exec($update_curl);
$update_status = curl_getinfo($update_curl, CURLINFO_HTTP_CODE);

if ($update_stats !== 200) {
    print curl_error($update_curl);
    return;
}

if (isset($_POST['delete_images'])) {
    $body = json_encode($_POST['delete_images']);
    $delete_curl = curl_init('http://localhost:5555/bike/images/delete?userId=' . $payload->id);
    curl_setopt($delete_curl, CURLOPT_POST, true);
    curl_setopt($delete_curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($delete_curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body), 'Authorization: Bearer ' . $payload->token));
    curl_setopt($delete_curl, CURLOPT_POSTFIELDS, $body);
    $delete_result = curl_exec($delete_curl);
    $delete_status = curl_getinfo($delete_curl);

    if ($delete_status === 200) {
        print curl_error($delete_status);
        return;
    }
}

if (isset($_FILES)) {
    $images = array();

    foreach ($_FILES['hidden_tmp_file_info']['tmp_name'] as $index => $tmpName) {
        if (!empty(['hidden_tmp_file_info']['error'][$index])) {
            continue;
        }

        array_push($images, new \CURLFile($tmpName, $_FILES['hidden_tmp_file_info']['type'][$index], $_FILES['hidden_tmp_file_info']['name'][$index]));
    }

    if (count($images) > 0) {
        $upload_curl = curl_init('http://localhost:5555/bike/images/upload?userId=' . $payload->id . '&bikeId=' . $_GET['bikeId']);
        curl_setopt($upload_curl, CURLOPT_POST, true);
        curl_setopt($upload_curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($upload_curl, CURLOPT_SAFE_UPLOAD, true);
        curl_setopt($upload_curl, CURLOPT_HTTPHEADER, array('Content-Type: multipart/form-data', 'Authorization: Bearer ' . $payload->token));
        curl_setopt($upload_curl, CURLOPT_POSTFIELDS, $images);
        $upload_result = curl_exec($upload_curl);
        $upload_status = curl_getinfo($upload_curl, CURLINFO_HTTP_CODE);

        if ($upload_status !== 200) {
            print curl_error($upload_result);
            return;
        }
    }
}

$rank = getRank();

if ($rank === 'civilian') {
    header('Location: /pages/civilian/bikes.php');
} else {
    header('Location: /pages/police/bikes.php');
}


include "../components/footer.php";
