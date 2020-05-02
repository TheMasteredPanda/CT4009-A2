<?php
include "../functions/bike_functions.php";

if (!isset($_GET['bikeId'])) return;
print_r(json_encode(getBike($_GET['bikeId'])));
