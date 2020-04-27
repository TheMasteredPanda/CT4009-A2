<?php
function getUsersBikes()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/bike/bikes?userId=' . $payload->id);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    curl_setopt($curl, CURLINFO_HEADER_OUT, true);
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    return json_encode(array('result' => json_decode($result), 'status' => $status));
}
