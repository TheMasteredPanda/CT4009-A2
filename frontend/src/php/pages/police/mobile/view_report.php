<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
include "../../../functions/report_functions.php";
include "../../../functions/user_functions.php";
include "../../../functions/investigation_functions.php";

$report = getReport($_GET['reportId'])->report;

$type = 'police';
if (isset($_POST['type'])) {
    $type = $_POST['type'];
}

$comments = getReportComments($_GET['reportId'], $type)->comments;
$status = "Open";

if (!$report->open) {
    $status = 'Closed';
}
?>

<div class="view_report_container">
    <div class="input-field container">
        <input type="text" name="report_status" value=<?php echo ucfirst($status) ?> readonly>
        <label for="report_status">Report Status</label>
    </div>
    <div class="input-field container">
        <textarea id="viewReportDescription" rows=15 cols=5 class="materialize-textarea" readonly><?php echo $report->content; ?></textarea>
        <label for="viewReportDescription">Description</label>
    </div>
    <div class="comments_container">
        <h5 class="center-align">Comments</h5>

        <div class="comments_container_header center-align">
            <button class="btn-small indigo" name="comment_public_section_button">Public</button>
            <button class="btn-small indigo" name="comment_private_section_button">Police</button>
        </div>
        <ul class="comments">
            <?php if (count($comments) > 0) : ?>
                <?php for ($i = 0; $i < count($comments); $i++) :
                    $comment = $comments[$i];
                    $author_name = getUsername($comment->author);
                ?>
                    <li class="comment">
                        <div class="author">
                            <h6><?php echo $author_name; ?></h6>
                        </div>
                        <p class="comment_content"><?php echo $comment->comment; ?></p>
                        <div class="comment_footer">
                            <div><?php echo $comment->createdAt; ?></div>
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
    <div class="button_wrapper">
        <?php if ($report->open) : ?>
            <a href=<?php echo "http://localhost:3000/actions/close_report.php?reportId=" . $_GET['reportId'] ?> class="btn-small">Close</a>
        <?php endif; ?>
        <?php if ($detect->isMobile()) : ?>
            <a href=<?php echo 'http://localhost:3000/pages/civilian/mobile/bike_info.php?bikeId=' . $report->bike_id; ?> class="btn-small">View Reported Bike</a>
        <?php else : ?>
            <a href=<?php echo 'http://localhost:3000/pages/civilian/bikes.php?bikeId=' . $report->bike_id . '&model=bikeInfo'; ?> class="btn-small">View Reported Bike</a>
        <?php endif; ?>
        <?php if ($report->investigating) :
            $investigation = getInvestigationByReportId($report->id); ?>
            <?php if ($detect->isMobile()) : ?>
                <a href=<?php echo 'http://localhost:3000/pages/civilian/mobile/view_investigation.php?investigationId=' . $investigation->id; ?>>View Investigation</a>
            <?php else : ?>
                <a href=<?php echo 'http://localhost:3000/pages/civilian/investigations.php?model=viewInvestigation&investigationId=' . $investigation->id; ?>>View Investigation</a>
            <?php endif; ?>
        <?php else : ?>
            <a href=<?php echo 'http://localhost:3000/actions/create_investigation.php?reportId=' . $report->id; ?> class="btn-small">Launch Investigation</a>
        <?php endif; ?>
    </div>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/reports.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "../../../components/footer.php";
?>