<?php
$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/admin/accounts/search?userId=' . $payload->id);
$values = $_POST['searchValues'];
$body_content = array();

if (isset($values['rank'])) {
    $body_content['rank'] = htmlspecialchars($values['rank']);
}

if (isset($values['id'])) {
    $body_content['id'] = htmlspecialchars($values['id']);
}

if (isset($values['username'])) {
    $body_content['username'] = htmlspecialchars($values['username']);
}

$body = json_encode($body_content);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token, 'Content-Length: ' . strlen($body), 'Content-Type: application/json'));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print_r(curl_error($curl));
    print_r($result);
    return;
}

curl_close($curl);
print_r($result);
