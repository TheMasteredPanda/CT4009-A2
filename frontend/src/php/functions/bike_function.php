<?php
function getUsersBikes() {
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/bikes?userId=' . $payload->id);
}
?>