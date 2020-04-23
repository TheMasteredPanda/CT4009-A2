<?php
if (!isset($_POST['submit_register_form'])) {
    return;
}

$username = htmlspecialchars($_POST['username']);
$password = htmlspecialchars($_POST['password']);
$email = htmlspecialchars($_POST['email']);

if (empty($username)) {
    header('Location: /login.php?register=failure&username=empty');
    return;
}

if (empty($password)) {
    header('Location: /login.php?register=failure&password=empty');
    return;
}

if (empty($email)) {
    header('Location: /login.php?register=failure&email=empty');
    return;
}

$curl = curl_init('http://localhost:5555/user/register');
$body = json_encode(array('username' => $username, 'password' => $password, 'email' => $email));
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body)));
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLINFO_HEADER_OUT, true);
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($status == '200') {
        setcookie('ct4009Auth', $result);
        header('Location: /index.php');
} elseif ($status === '400') {
        header('Location: /login.php?register=badrequest');
} elseif ($status === '406') {
        header('Location /login.php?register=failure&username=unacceptable');
} 
