<?php
include "../functions/report_functions.php";
echo json_encode(getReport($_GET['reportId']));
