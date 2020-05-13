<?php
function getAllUserInvestigations()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/investigations?userId=' . $payload->id . '&reportAuthor=' . $payload->id);
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

function getInvestigation($investigationId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/investigations/investigation?userId=' . $payload->id . '&investigationId=' . $investigationId);
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
    return json_decode($result)->investigation;
}

function getAllInvestigations()
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/investigations?userId=' . $payload->id);
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

function getInvestigationByReportId($reportId)
{
    $payload = json_decode($_COOKIE['ct4009Auth']);
    $curl = curl_init('http://localhost:5555/investigations/investigation?userId=' . $payload->id . '&reportId=' . $reportId);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token));
    $result = curl_exec($curl);
    $status = curl_getinfo($result);

    if ($status !== 200) {
        print curl_error($curl);
        print $result;
        return;
    }

    curl_close($curl);
    return json_decode($result);
}

function isInvestigator($investigation, $userId)
{
    for ($i = 0; $i < count($investigation->investigators); $i++) {
        $investigatorId = $investigation->investigators[$i]->investigator_id;

        if ($userId === $investigatorId) {
            return true;
        }
    }

    return false;
}