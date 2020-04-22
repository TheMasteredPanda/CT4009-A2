<?php

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
    $payload = json_encode(($_COOKIE['ct4009Auth']));
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, 'http://localhost:4000/user/verify/user/verify?' . $payload->id);
    curl_setopt($curl, CURLOPT_POSTFIELDS, '{jwt: "' . $payload->token . '" }');
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    return $result;
}

if (!hasAuthCookie() && !startsWith($currentScript, '/login.php')) {
    setcookie('ct4009Auth', time() - 3600); //Deletes the cookie.
    header('Location: /login.php');
    return;
}

if (verifyAuth()) {
    header('Location: index.php');
} else {
    setcookie('ct4009Auth', time() - 3600); //Deletes the cookie.
    if (!startsWith($currentScript, '/login.php')) header('Location: /login.php');
}
?>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./styles/master.bundle.css">

</head>

<body class="grey lighten-3">