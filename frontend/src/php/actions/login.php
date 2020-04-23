<?php
//PHP to log into an account. 
if (!isset($_POST['login_submit_form'])) {
    return;
}

$username = htmlspecialchars($_POST['username']);
$password = htmlspecialchars($_POST['password']);

if (empty($username)) {
    header('Location: /login.php?login=failure&username=empty');
    return;
}

if (empty($password)) {
    header('Location: /login.php?login=failure&password=empty');
    return;
}

$curl = curl_init('http://localhost:5555/user/login');
$body = json_encode(array('username' => $username, 'password' => $password));
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Length: ' . strlen($body), 'Content-Type: application/json'));
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLINFO_HEADER_OUT, true);
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($status === 200) {
    setcookie('ct4009Auth', $result);
    header('Location: /index.php');
} elseif ($status === 400) {
    header('Location: /login.php?login=badrequest');
} else if ($status === 401) {
    header('Location: /login.php?login=unauthorized');
} else if ($status === 404) {
    header('Location: /login.php?login=notfound');
}
