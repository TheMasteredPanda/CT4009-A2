<?php
function getUsername($userId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/user/name?userId=' . $payload->id . '&accountId=' . $userId);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl);
        echo '\n';
        print $result;
    }

    return json_decode($result)->username;
}

function getBadgeFor($userId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/user/rank?userId=' . $payload->id . '&accountId=' . $userId);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print_r(curl_error($curl));
        print_r($result);
        return;
    }

    curl_close($curl);


    if ($result === 'civilian') {
        return '<span class="white-text green badge">Civilian</span>';
    } elseif ($result === 'police_officer') {
        return '<span class="white-text indigo badge">Officer</span>';
    } else {
        return '<span class="white-text red badge">Admin</span>';
    }
}
