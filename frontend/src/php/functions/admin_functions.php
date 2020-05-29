<?php

function getAllAccounts($ids)
{

    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/admin/accounts?userId=' . $payload->id);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, true);
    if (count($ids) > 0) {
        $body = json_encode(array('accounts' => $ids));
        curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($body), 'Authorization: Bearer ' . $payload->token));
    } else {
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    }
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl) . '\n' . $result;
        return;
    }

    curl_close($curl);
    return json_decode($result)->accounts;
}

function getAccountDetails($id)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/admin/accounts/account?userId=' . $payload->id . '&accountId=' . $id);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl) . '\n' . $result;
        return;
    }

    curl_close($curl);
    return json_decode($result);
}

function getRegisteredBikesCount($accountId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/bike/bikes?userId=' . $payload->id . '&accountId=' . $accountId);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print_r(curl_error($curl));
        print_r($result);
        return;
    }

    curl_error($curl);
    return count(json_decode($result));
}

function getReportsCount($accountId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/reports?userId=' . $payload->id . '&author=' . $accountId);
    curl_setopt($curl, CURLOPT_POST, true);
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
    return count(json_decode($result)->ids);
}
