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

    curl_close($curl);
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
        echo 'error';
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
    $curl = curl_init('http://localhost:5555/reports?userId=' . $payload->id . '&bikeId=' . $bikeId . '&open=1');
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = json_decode(curl_exec($curl))->ids;
    curl_close($curl);
    return !empty($result);
}

function getOpenReportByBike($bikeId, $userId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl_reports = curl_init('http://localhost:5555/reports?userId=' . $payload->id . '&author=' . $userId . '&open=1');
    curl_setopt($curl_reports, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl_reports, CURLOPT_POST, true);
    curl_setopt($curl_reports, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $reports = json_decode(curl_exec($curl_reports));
    $status = curl_getinfo($curl_reports, CURLINFO_HTTP_CODE);

    if ($status !== 200) {
        print_r(curl_error($curl_reports));
        print_r($reports);
        return;
    }


    for ($i = 0; $i < count($reports->ids); $i++) {
        $reportId = $reports->ids[$i];
        $report = getReport($reportId);
        if ($report->open && $report->bike_id === $bikeId) return $report;
    }

    return '';
}
