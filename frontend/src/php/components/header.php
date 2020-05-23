<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/functions/user_functions.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/functions/util_functions.php';

$detect = new Mobile_Detect();
/**
 * Checks if a string starts with a string.
 */
function startsWith($haystack, $needle)
{ //Props to MrHus: https://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

$currentScript = $_SERVER['SCRIPT_NAME'];

function hasAuthCookie()
{
    return isset($_COOKIE['ct4009Auth']);
}

/**
 * Checks if the authentication payload stored in the 'ct4009Auth' cookie is valid by hitting
 * the relevant endpoint.
 */
function verifyAuth()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init();
    $array = array('jwt' => $payload->token);
    $body = json_encode($array);
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:5555/user/verify?userId=' . $payload->id);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLINFO_HEADER_OUT, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body)));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print $result;
    }

    return $result == 'true';
}

function logout()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:5555/user/logout?userId=' . $payload->id);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print $result;
    } else {
        setcookie('ct4009Auth', '', time() - 3600);
        if (!startsWith($_SERVER['SCRIPT_NAME'], '/login.php')) header('Location: /login.php');
    }
}

function getRank()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/user/rank?userId=' . $payload->id);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl);
        return;
    }

    curl_close($curl);
    return $result;
}

function setRank($rank)
{
    if (!in_array($rank, array('civilian', 'police_officer', 'police_admin'))) {
        print "Rank must be 'civilian', 'police_officer', 'police_admin'";
    }

    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:555/user/rank/set?userId=' . $payload->id);
    $body = json_decode(array('rank' => $rank));
    curl_setopt($curl, CURLOPT_PORT, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token, 'Content-Length: ' . strlen($body), 'Content-Type: application/json'));
    curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
    curl_setopt($curl, CURLINFO_HEADER_OUT, true);
    $result = curl_exec($curl);
    $status = curl_exec($curl, CURLINFO_HTTP_CODE, true);
    curl_close($curl);

    if ($status !== 200) {
        print $result;
    }
}

if (!hasAuthCookie()) {
    if (!startsWith($currentScript, '/login.php')) {
        header('Location: /login.php');
    }
} else {
    $verified = verifyAuth();

    if (!$verified) {
        setcookie('ct4009Auth', "", time() - 3600); //Deletes the cookie.
        if (!startsWith($currentScript, '/login.php')) header('Location: /login.php');
    }
}


?>

<!DOCTYPE html>

<html lang="en">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.5.0.min.js" integrity="sha256-xNzN2a4ltkB44Mc/Jz3pT4iU1cmeR0FkXs4pru/JxaQ=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
    <link rel="stylesheet" href="http://localhost:3000/styles/master.bundle.css">
    <script src="http://localhost:3000/scripts/master.bundle.js"></script>
</head>


<body class="grey lighten-3">