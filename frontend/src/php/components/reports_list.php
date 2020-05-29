<?php

use Detection\MobileDetect;

include "../functions/user_functions.php";
include "../functions/report_functions.php";
require_once $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';
$detect = new MobileDetect();

if (!isset($_POST['ids'])) {
    if ($rank == 'civilian') {
        $reports = getAllUserReports();
    } else {
        $reports = getAllReports();
    }
} else {
    $reports = $_POST['ids'];
}

?>
<?php if ($reports === 'empty' || count($reports) === 0) : ?>
    <div class="no_reports_container">
        <h3>No Reports</h3>
    </div>
<?php else : ?>
    <?php for ($i = 0; $i < count($reports); $i++) :
        $report = getReport($reports[$i]);
    ?>
        <div class="card">
            <div class="card-content">
                <span class="card-title">
                    <?php
                    $reportAuthor = '';
                    if ($rank !== 'civilian') {
                        $reportAuthor = ' by ' . getUsername($report->author);
                    }

                    $reportClosed = '';

                    if (!$report->open) {
                        $reportClosed = ' (Closed)';
                    }

                    echo 'Report ' . $report->id . $reportClosed . $reportAuthor;  ?>
                </span>
                <h5 class="center-align">Description</h5>
                <p><?php echo $report->content; ?></p>
                <h5 class="center-align">Meta Information</h4>
                    <ul class="report_meta_info">
                        <li><strong>Reported On: </strong><?php echo date('H:i, D j, M Y', strtotime($report->createdAt)); ?></li>
                        <li><strong>Investigated: </strong><?php if ($report->investigating) : ?> Yes <?php else : ?> No <?php endif; ?></li>
                    </ul>
            </div>
            <div class="card-action">
                <?php if ($detect->isMobile() && !$detect->isTablet()) : ?>
                    <a href=<?php echo 'http://localhost:3000/mobile/view_report.php?reportId=' . $report->id . '&placeId=' . $report->place_id; ?> class="btn-small">view report</a>
                <?php else : ?>
                    <a href=<?php echo 'http://localhost:3000/reports.php?modal=viewReport&reportId=' . $report->id . '&placeId=' . $report->place_id; ?> class="btn-small">view report</a>
                <?php endif; ?>
            </div>
        </div>
    <?php endfor; ?>
<?php endif; ?>