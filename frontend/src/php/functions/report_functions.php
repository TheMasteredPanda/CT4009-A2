<?php

function getAllUserReports()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/reports?userId=' . $payload->id . '&author=' . $payload->id);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl);
        echo '\n';
        print $result;
        return;
    }

    curl_close($result);
    return json_decode($result)->ids;
}

function getReport($reportId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/reports/report?userId=' . $payload->id . '&reportId=' . $reportId);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl);
        echo '\n';
        print $result;
        return;
    }

    curl_close($curl);
    return json_decode($result)->report;
}


function getReportComments($reportId, $type)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/reports/comments?reportId=' . $reportId . '&type=' . $type . '&userId=' . $payload->id);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl);
        echo '\n';
        print $result;
        return;
    }

    curl_close($curl);
    return json_decode($result)->comments;
}

function getAllReports()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/reports?userId=' . $payload->id);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl);
        print $result;
        return;
    }

    curl_close($curl);
    return json_decode($result)->ids;
}

function getReportByBike($bikeId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/reports/report?userId=' . $payload->id . '&bikeId=' . $bikeId);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print curl_error($curl);
        print_r($result);
        return;
    }

    curl_close($curl);
    return json_decode($result)->report;
}


function hasOpenReport($bikeId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/reports/report?userId=' . $payload->id . '&bikeId=' . $bikeId);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = json_decode(curl_exec($curl))->report;
    curl_close($curl);
    return $result->open;
}
