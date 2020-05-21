<?php
include "../components/header.php";

$payload = json_decode($_COOKIE['ct4009Auth']);
if (!isset($_GET['bikeId'])) {
    echo 'Bike id is not set';
    return;
}

$body_content = array(
    'part_number' => htmlspecialchars($_POST['edit_part_number']),
    'brand' => htmlspecialchars($_POST['edit_brand']),
    'modal' => htmlspecialchars($_POST['edit_modal']),
    'wheel_size' => htmlspecialchars($_POST['edit_wheel_size']),
    'gear_count' => htmlspecialchars($_POST['edit_gear_count']),
    'suspension' => htmlspecialchars($_POST['edit_bike_suspension']),
    'colours' => $_POST['edit_bike_colours'],
    'gender' => htmlspecialchars($_POST['edit_bike_gender']),
    'age_group' => htmlspecialchars($_POST['edit_bike_age_group']),
    'type' => htmlspecialchars($_POST['edit_bike_type'])
);

if ($_POST['edit_brake_type'] === 'N/A') {
    $body_content['brake_type'] = 'v-brake';
} else {
    $body_content['brake_type'] = htmlspecialchars($_POST['edit_brake_type']);
}

$body = json_encode($body_content);
$update_curl = curl_init('http://localhost:5555/bike/update?userId=' . $payload->id . '&bikeId=' . $_GET['bikeId']);
curl_setopt($update_curl, CURLOPT_POST, true);
curl_setopt($update_curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($update_curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body), 'Authorization: Bearer ' . $payload->token));
curl_setopt($update_curl, CURLOPT_POSTFIELDS, $body);
$update_result = curl_exec($update_curl);
$update_status = curl_getinfo($update_curl, CURLINFO_HTTP_CODE);

if ($update_status !== 200) {
    print curl_error($update_curl);
    return;
}

curl_close($update_curl);

if (isset($_POST['delete_images'])) {
    $body = json_encode(array('imageIds' => $_POST['delete_images']));
    $delete_curl = curl_init('http://localhost:5555/bike/images/delete?userId=' . $payload->id);
    curl_setopt($delete_curl, CURLOPT_POST, true);
    curl_setopt($delete_curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($delete_curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body), 'Authorization: Bearer ' . $payload->token));
    curl_setopt($delete_curl, CURLOPT_POSTFIELDS, $body);
    $delete_result = curl_exec($delete_curl);
    $delete_status = curl_getinfo($delete_curl, CURLINFO_HTTP_CODE);

    if ($delete_status !== 200) {
        print curl_error($delete_status);
        return;
    }

    curl_close($delete_curl);
}

if (isset($_FILES)) {
    $images = array();

    foreach ($_FILES['hidden_tmp_file_input']['tmp_name'] as $index => $tmpName) {
        if (!empty(['hidden_tmp_file_input']['error'][$index])) {
            continue;
        }

        if (empty($tmpName)) continue;
        array_push($images, new \CURLFile($tmpName, $_FILES['hidden_tmp_file_input']['type'][$index], $_FILES['hidden_tmp_file_input']['name'][$index]));
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

        curl_close($upload_curl);
    }
}

$rank = getRank();
header('Location: /bikes.php');

include "../components/footer.php";
