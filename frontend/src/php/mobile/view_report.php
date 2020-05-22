<?php
include "../components/header.php";
include "../components/navbar.php";
include "../functions/report_functions.php";
include "../functions/investigation_functions.php";

$report = getReport($_GET['reportId']);
$userId = json_decode($_COOKIE['ct4009Auth'])->id;
$isInvestigator = "";

if ($report->investigating) {
    $isInvestigator = isInvestigator(getInvestigationByReportId($report->id), $userId);
}

$type = 'civilian';
if (isset($_POST['type'])) {
    $type = $_POST['type'];
}


$comments = getReportComments($_GET['reportId'], $type);
$status = "Open";

if (!$report->open) {
    $status = 'Closed';
}
?>

<div class="view_report_container">
    <div class="view_report_form row">
        <div class="input-field col s12">
            <input type="text" name="report_status" value=<?php echo ucfirst($status) ?> readonly>
            <label for="report_status">Report Status</label>
        </div>
        <div class="input-field s12 col">
            <textarea id="viewReportDescription" rows=15 cols=5 class="materialize-textarea" readonly><?php echo $report->content; ?></textarea>
            <label for="viewReportDescription">Description</label>
        </div>
        <div class="input-field map-field col s12">
            <h5 class="center-align">Location of Theft</h5>
            <div id="map">
            </div>
        </div>
        <?php if ($rank === 'civilian') : ?>
            <div class="input-field s12 col comments_container civilian_comments_container">
            <?php else : ?>
                <div class="input-field s12 col comments_container police_comments_container">
                <?php endif; ?>
                <h5 class="center-align">Comments</h5>

                <?php if ($rank !== 'civilian') : ?>
                    <div class="comments_container_header center-align">
                        <button class="btn-small indigo" name="comment_public_section_button">Public</button>
                        <button class="btn-small indigo" name="comment_private_section_button">Police</button>
                    </div>
                <?php endif; ?>
                <ul class="comments">
                    <?php if (count($comments) > 0) : ?>
                        <?php for ($i = 0; $i < count($comments); $i++) :
                            $comment = $comments[$i];
                            $author_name = getUsername($comment->author);
                        ?>
                            <?php if ($comment->author === $userId) : ?>
                                <li class="comment client_comment">
                                <?php else : ?>
                                <li class="comment not_client_comment">
                                <?php endif; ?>
                                <div class="comment_content_wrapper">
                                    <div class="comment_header">
                                        <div class="author"><?php echo $author_name; ?></div>
                                    </div>
                                    <div class="comment_content">
                                        <p>
                                            <?php echo $comment->comment; ?>
                                        </p>
                                    </div>
                                    <div class="comment_footer">
                                        <div class="date"><?php echo date('H:i, D j, M Y', strtotime($comment->createdAt)); ?></div>
                                    </div>
                                </div>
                                </li>

                            <?php endfor; ?>
                        <?php endif; ?>
                </ul>
                <div class="new_comment_container">
                    <form action=<?php echo "http://localhost:3000/actions/create_report_comment.php?reportId=" . $report->id . '&type=' . $type; ?> method="POST">
                        <div class="input-field">
                            <textarea name="new_comment_textarea" id="newCommentTextarea" class="materialize-textarea" cols="30" rows=3></textarea>
                            <label for="newCommentTextarea">New Comment</label>
                        </div>
                        <div class="button_wrapper">
                            <input class="btn-small" type="submit" value="Send" name="new_comment_send_button">
                        </div>
                    </form>
                </div>
                </div>
                <div class="button_wrapper col s12">
                    <?php if ($report->open) : ?>
                        <a href=<?php echo "http://localhost:3000/actions/close_report.php?reportId=" . $_GET['reportId'] ?> class="btn-small">Close</a>
                    <?php endif; ?>
                    <?php if ($detect->isMobile()) : ?>
                        <a href=<?php echo 'http://localhost:3000/mobile/bike_info.php?bikeId=' . $report->bike_id; ?> class="btn-small">View Reported Bike</a>
                    <?php else : ?>
                        <a href=<?php echo 'http://localhost:3000/bikes.php?bikeId=' . $report->bike_id . '&model=bikeInfo'; ?> class="btn-small">View Reported Bike</a>
                    <?php endif; ?>
                    <?php if ($report->investigating) :
                        $investigation = getInvestigationByReportId($report->id);
                    ?>
                        <?php if ($detect->isMobile()) : ?>
                            <a href=<?php echo 'http://localhost:3000/mobile/view_investigation.php?investigationId=' . $investigation->id; ?> class="btn-small">View Investigation</a>
                        <?php else : ?>
                            <a href=<?php echo 'http://localhost:3000/investigations.php?model=viewInvestigation&investigationId=' . $investigation->id; ?> class="btn-small">View Investigation</a>
                        <?php endif; ?>
                    <?php else : ?>
                        <?php if ($rank === 'police_admin' || $isInvestigator) : ?>
                            <a href=<?php echo 'http://localhost:3000/actions/create_investigation.php?reportId=' . $report->id; ?> class="btn-small">Launch Investigation</a>
                        <?php endif; ?>
                    <?php endif; ?>
                </div>
            </div>
    </div>
    <script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places,geocoder&v=3&key=AIzaSyA43tm6-MqO6IkzYA9he5Zlmu5drqlHtFo&callback=initMap"></script>
    <script type="text/javascript" src="http://localhost:3000/scripts/reports.bundle.js"></script>
    <script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
    <?php
    include "../components/footer.php";
    ?>