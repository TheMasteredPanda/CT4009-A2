<?php
include "../components/header.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
print_r($_GET);
$curl = curl_init('http://localhost:5555/reports/comments/create?userId=' . $payload->id . '&type=' . $_GET['type'] . '&reportId=' . $_GET['reportId']);
$body = json_encode(array('comment' => $_POST['new_comment_textarea']));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $payload->token, 'Content-Type: application/json', 'Content-Length: ' . strlen($body)));
$result = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($status !== 200) {
    print curl_error($curl);
    echo '\n';
    print $result;
    return;
}

$rank = getRank();

if ($detect->isMobile()) {
    header('Location: /mobile/view_report.php?reportId=' . $_GET['reportId']);
} else {
    header('Location: /reports.php?model=viewReport&reportId=' . $_GET['reportId']);
}

include "../components/footer.php";
