<?php
$rank = getRank();

if ($rank === 'civilian') {
    header('Location: /index.php');
}
