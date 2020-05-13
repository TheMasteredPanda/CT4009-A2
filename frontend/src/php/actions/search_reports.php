<?php
$payload = json_decode($_COOKIE['ct4009Auth']);
$url = 'http://localhost:5555/reports?userId=' . $payload->id;


if (isset($_POST['author'])) {
    $url = $url . '&author=' . $_POST['author'];
}

if (isset($_POST['open'])) {
    $url = $url . '&open=' . $_POST['open'];
}

if (isset($_POST['startDate'])) {
    $url = $url . '&startDate=' . $_POST['startDate'];
}

if (isset($_POST['beforeDate'])) {
    $url = $url . '&endDate=' . $_POST['endDate'];
}

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
    print $result;
    return;
}

curl_close($curl);
print $result;
