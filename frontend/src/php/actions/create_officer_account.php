<?php
include "../components/header.php";
include "../components/police_auth_header.php";

$payload = json_decode($_COOKIE['ct4009Auth']);
$curl = curl_init('http://localhost:5555/admin/accounts/create?userId=' . $payload->id);
$body = json_encode(array('username' => $_POST['username'], 'password' => $_POST['password'], 'email' => $_POST['email']));

curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body), 'Authorization: Bearer ' . $payload->token));
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$result = json_decode(curl_exec($curl));
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

$data = json_decode($result->data);
if ($status !== 200) {
    if ($status === 400) {
        if ($detect->isMobile()) {
            header('Location: /mobile/create_officer_account.php?section=accounts&' . $data->parameters[0] . '=badrequest');
        } else {
            header('Location: /admin_panel.php?section=accounts&modal=createOfficer&' . $data->parameters[0] . '=badrequest');
        }
        return;
    }

    if ($status === 406) {
        if ($detect->isMobile()) {
            header('Location: /mobile/create_officer_account.php?section=accounts&' . $data->parameters[0] . '=unacceptable');
        } else {
            header('Location: /admin_panel.php?section=accounts&modal=createOfficer&' . $data->parameters[0] . '=unacceptable');
        }
        return;
    }

    print curl_error($curl);
    echo ' ';
    print_r($result);
    return;
}

header('Location: /admin_panel.php?section=accounts');

include "../components/footer.php";
