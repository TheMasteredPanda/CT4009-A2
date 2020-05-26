<?php
include "./components/header.php";
include "./components/navbar.php";
include "./functions/report_functions.php";
include "./functions/investigation_functions.php";

$userId = json_decode($_COOKIE['ct4009Auth'])->id;

if (isset($_POST['select_search_type'])) {
    $search_types = $_POST['select_search_type'];
} else {
    $search_types = [];
}

$types = array('start_date' => "By Illustrated Date", 'before_date' => 'Before Date', 'open' => "By Report Status", 'investigating' => "By Investigation Status");

if ($rank !== 'civilian') {
    $types['author'] = 'By Report Author';
}

if (!isset($_POST['ids'])) {
    if ($rank == 'civilian') {
        $reports = getAllUserReports();
    } else {
        $reports = getAllReports();
    }
} else {
    $reports = $_POST['ids'];
}


if (isset($_GET['modal'])) :
    $modal = $_GET['modal'];

    if ($modal === 'viewReport') :
        $report = getReport($_GET['reportId']);
        $investigationStatus = 'Open';

        $commentType = 'civilian';

        if (isset($_GET['type'])) {
            $commentType = $_GET['type'];
        }


        $comments = getReportComments($report->id, $commentType);
        if (!$report->open) {
            $investigationStatus = 'Closed';
        }

?>
        <div class="modal" id="viewReport">
            <div class="modal-content">
                <div class="view_report_container">
                    <div class="view_report_form row">
                        <div class="input-field col m12 l12">
                            <input type="text" name="report_status" value="<?php echo $investigationStatus; ?>" readonly>
                            <label for="report_status">Report Status</label>
                        </div>
                        <div class="input-field col m12 l12">
                            <textarea name="view_report_description" rows="15" class="materialize-textarea" readonly><?php echo $report->content; ?></textarea>
                            <label for="view_report_description">Description</label>
                        </div>
                        <div class="input-field map-field col m12 l12">
                            <h4 class="center-align">Location Of Theft</h4>
                            <div id="map"></div>
                        </div>
                        <?php if ($rank === 'civilian') : ?>
                            <div class="comments_container col m12 l12 civilian_comments_container">
                            <?php else : ?>
                                <div class="comments_container col m12 l12 police_comments_container">
                                <?php endif; ?>
                                <h4 class="center-align">Comments</h4>

                                <?php if ($rank !== 'civilian') : ?>
                                    <div class="comments_container_header center-align">
                                        <button class="btn-small indigo" name="comment_public_section_button">public</button>
                                        <button class="btn-small indigo" name="comment_private_section_button">police</button>
                                    </div>
                                <?php endif; ?>
                                <ul class="comments">
                                    <?php for ($i = 0; $i < count($comments); $i++) :
                                        $comment = $comments[$i];
                                        $username = getUsername($comment->author);
                                    ?>
                                        <?php if ($comment->author === $userId) : ?>
                                            <li class="comment client_comment">
                                            <?php else : ?>
                                            <li class="comment not_client_comment">
                                            <?php endif; ?>
                                            <div class="comment_content_wrapper">
                                                <div class="comment_header">
                                                    <div class="author"><?php echo $username; ?></div>
                                                    <div><?php echo getBadgeFor($comment->author); ?></div>
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
                                </ul>
                                <?php if ($report->open) : ?>
                                    <div class="new_comment_container">
                                        <form name="new_report_comment_form" action="<?php echo 'http://localhost:3000/actions/create_report_comment.php?reportId=' . $report->id . '&type=' . $commentType; ?>" method="post">
                                            <div class="input-field">
                                                <textarea name="new_comment_textarea" id="newCommentTextarea" class="materialize-textarea" cols="30" rows=3></textarea>
                                                <label for="newCommentTextarea">New Comment</label>
                                            </div>
                                            <div class="button_wrapper">
                                                <input class="btn-small" type="submit" value="send" name="new_comment_send_button">
                                            </div>
                                        </form>
                                    </div>
                                <?php endif; ?>
                                </div>

                                <div class="form_button_wrapper button_wrapper col m12 l12">
                                    <?php if ($report->open) : ?>
                                        <a href="<?php echo 'http://localhost:3000/actions/close_report.php?reportId=' . $report->id; ?>" name="close_report_button" class="btn">Close</a>

                                        <?php if (!$report->investigating && $rank !== 'civilian') : ?>
                                            <a href="<?php echo 'http://localhost:3000/actions/create_investigation.php?reportId=' . $report->id; ?>" class="<?php echo getButtonType() ?> indigo">Launch Investigation</a>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                    <a href="#" name="close_view_report_button" class="btn indigo">back</a>
                                    <a href="<?php echo 'http://localhost:3000/bikes.php?modal=viewBike&bikeId=' . $report->bike_id; ?>" name="view_reported_bike_button" class="btn">View Reported Bike</a>
                                    <?php
                                    if ($report->investigating) :
                                        $investigation = getInvestigationByReportId($report->id);
                                    ?>
                                        <a href="<?php echo 'http://localhost:3000/investigations.php?modal=viewInvestigation&investigationId=' . $investigation->id; ?>" class="<?php echo getButtonType() ?> indigo">View Investigation</a>
                                    <?php endif; ?>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        </div>
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA43tm6-MqO6IkzYA9he5Zlmu5drqlHtFo&callback=initMap">
        </script>
    <?php endif; ?>
<?php endif; ?>

<div class="reports_container">
    <?php if (count($reports) === 0) : ?>
        <div class="no_reports_container">
            <h3>No Reports</h3>
        </div>
    <?php else : ?>
        <div class="reports_header container">
            <form action="#" class="reports_select_search_type_form">
                <div class="input-field col m12">
                    <select name="select_search_type[]" multiple>
                        <?php foreach ($types as $key => $value) : ?>
                            <?php if (in_array($key, $search_types)) : ?>
                                <option value=<?php echo $key; ?> selected><?php echo $value ?></option>
                            <?php else : ?>
                                <option value=<?php echo $key; ?>><?php echo $value; ?></option>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </select>
                    <label for="select_search_type[]">Search Type</label>
                </div>
            </form>
            <?php if (isset($_POST['search_reports']) && count($search_types) > 0) : ?>
                <?php
                $startDate = '';
                $endDate = '';
                $author = '';
                $isInvestigating = false;
                $isOpen = false;

                if (isset($_POST['search_values'])) {
                    $values = $_POST['search_values'];
                    $startDate = $values['search_by_start_date'];
                    $endDate = $values['search_by_before_date'];
                    $author = $values['author'];
                    $isInvestigating = $values['investigating'];
                    $isOpen = $values['open'];
                }
                ?>
                <form action="#" class="search_reports_form row">
                    <?php if ($rank === 'civilian') : ?>
                        <input type="text" name="civ_author" value=<?php echo $userId; ?> hidden>
                    <?php endif; ?>
                    <?php if (in_array('start_date', $search_types)) : ?>
                        <div class="input-field col m10 push-m1 datepicker_input">
                            <input type="text" class="datepicker" name="search_by_start_date" value="<?php echo $startDate; ?>">
                            <label for="search_by_start_date">Search By Illustrated Date</label>
                        </div>
                    <?php endif; ?>
                    <?php if (in_array('before_date', $search_types)) : ?>
                        <div class="input-field col m10 push-m1 datepicker_input">
                            <input type="text" class="datepicker" name="search_by_before_date" value="<?php echo $endDate; ?>">
                            <label for="search_by_before_date">Search By Before Date</label>
                        </div>
                    <?php endif; ?>
                    <?php if (in_array('open', $search_types)) : ?>
                        <div class="center-align col m12 switch_wrapper">
                            <div class="switch">
                                <label>
                                    Open
                                    <input type="checkbox" name="search_by_open" <?php if ($isOpen) : ?> checked <?php endif; ?>>
                                    <span class="lever"></span>
                                    Closed
                                </label>
                            </div>
                        </div>
                    <?php endif; ?>
                    <?php if (in_array('investigating', $search_types)) : ?>
                        <div class="center-align col m12 switch_wrapper">
                            <div class="switch">
                                <label>
                                    Investigating
                                    <input type="checkbox" name="search_by_investigating" <?php if ($isInvestigating) : ?> checked <?php endif; ?>>
                                    <span class="lever"></span>
                                    Not Invesigating
                                </label>
                            </div>
                        </div>
                    <?php endif; ?>
                    <?php if ($rank !== 'civilian' && in_array('author', $search_types)) : ?>
                        <div class="input-field col m10 push-m1">
                            <input type="text" name="search_by_author" value="<?php echo $author ?>">
                            <label for="search_by_author">Search By Author</label>
                        </div>
                    <?php endif; ?>
                    <div class="button_wrapper col m12">
                        <input type="submit" value="search" name="search_reports_button" class="btn-small ">
                    </div>
                </form>
            <?php endif; ?>
        </div>

        <div class="reports container">
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
                        <p><?php echo $report->content; ?></p>
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
        </div>
    <?php endif; ?>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/reports.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "./components/footer.php";
?>