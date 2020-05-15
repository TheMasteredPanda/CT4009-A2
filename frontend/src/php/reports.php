<?php
include "./components/header.php";
include "./components/navbar.php";
include "./functions/report_functions.php";
include "./functions/investigation_functions.php";
include "./functions/user_functions.php";

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
?>
    <?php if ($modal === 'viewReport' && isset($_GET['reportId'])) :
        $report = getReport($_GET['reportId']);
        $type = 'civilian';

        if (isset($_POST['type'])) {
            $type = $_POST['type'];
        }

        $comments = getReportComments($_GET['reportId'], $type);
        if ($report->investigating) {
            $isInvestigator = isInvestigator(getInvestigationByReportId($_GET['reportId']), $userId);
        } else {
            $isInvestigator = '';
        }

        $status = 'Open';

        if (!$report->open) {
            $status = 'Closed';
        }
    ?>
        <div class="modal" id="viewReport">
            <div class="modal-content">
                <div class="view_report_container">
                    <div class="input-field">
                        <input type="text" name="report_status" value=<?php echo ucfirst($status); ?> readonly>
                        <label for="report_status">Report Status</label>
                    </div>
                    <div class="input-field">
                        <textarea name="view_report_description" rows="15" class="materialize-textarea" readonly><?php echo $report->content; ?></textarea>
                        <label for="view_report_description">Description</label>
                    </div>
                    <div class="input-field map-field">
                        <h4 class="center-align">Location of Theft</h4>
                        <div id="map"></div>
                    </div>
                    <div class="comments_container">
                        <h4 class="center-align">Comments</h4>

                        <div class="comments_container_header center-align">
                            <?php if ($rank !== 'civilian') : ?>
                                <button class="btn-small indigo" name="comment_public_section_button">Public</button>
                                <button class="btn-small indigo" name="comment_private_section_button">Police</button>
                            <?php endif; ?>
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
                            <?php if ($report->open) : ?>
                                <form action=<?php echo "http://localhost:3000/actions/create_report_comment.php?reportId=" . $report->id . '&type=' . $type; ?> method="POST">
                                    <div class="input-field">
                                        <textarea name="new_comment_textarea" id="newCommentTextarea" class="materialize-textarea" cols="30" rows=3></textarea>
                                        <label for="newCommentTextarea">New Comment</label>
                                    </div>
                                    <div class="button_wrapper">
                                        <input class="btn-small" type="submit" value="Send" name="new_comment_send_button">
                                    </div>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="button_wrapper">
                        <?php if ($report->open) : ?>
                            <a href=<?php echo "http://localhost:3000/actions/close_report.php?reportId=" . $_GET['reportId'] ?> class="btn">Close</a>
                        <?php endif; ?>
                        <a href="http://localhost:3000/reports.php" class="btn indigo">Back</a>
                        <a href=<?php echo 'http://localhost:3000/bikes.php?bikeId=' . $report->bike_id . '&modal=bikeInfo'; ?> class="btn">View Reported Bike</a>
                        <?php if ($report->investigating) :
                            $investigation = getInvestigationByReportId($report->id);
                        ?>
                            <a href=<?php echo 'http://localhost:3000/investigations.php?modal=viewInvestigation&investigationId=' . $investigation->id; ?> class="btn">View Investigation</a>
                        <?php else : ?>
                            <?php if (($rank === 'police_admin' || $isInvestigator) && $report->open) : ?>
                                <a href=<?php echo 'http://localhost:3000/actions/create_investigation.php?reportId=' . $report->id; ?> class="btn">Launch Investigation</a>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        <script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places,geocoder&v=3&key=AIzaSyA43tm6-MqO6IkzYA9he5Zlmu5drqlHtFo&callback=initMap">
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
                <div class="input-field">
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
                <form action="#" class="search_reports_form">
                    <?php if ($rank === 'civilian') : ?>
                        <input type="text" name="civ_author" value=<?php echo $userId; ?> hidden>
                    <?php endif; ?>
                    <?php if (in_array('start_date', $search_types)) : ?>
                        <div class="input-field container datepicker_input">
                            <input type="text" class="datepicker" name="search_by_start_date">
                            <label for="search_by_start_date">Search By Illustrated Date</label>
                        </div>
                    <?php endif; ?>
                    <?php if (in_array('before_date', $search_types)) : ?>
                        <div class="input-field container datepicker_input">
                            <input type="text" class="datepicker" name="search_by_before_date">
                            <label for="search_by_before_date">Search By Before Date</label>
                        </div>
                    <?php endif; ?>
                    <?php if (in_array('open', $search_types)) : ?>
                        <div class="center-align container">
                            <div class="switch">
                                <label>
                                    Open
                                    <input type="checkbox" name="search_by_open">
                                    <span class="lever"></span>
                                    Closed
                                </label>
                            </div>
                        </div>
                    <?php endif; ?>
                    <?php if (in_array('investigating', $search_types)) : ?>
                        <div class="center-align container">
                            <div class="switch">
                                <label>
                                    Investigating
                                    <input type="checkbox">
                                    <span class="lever"></span>
                                    Not Invesigating
                                </label>
                            </div>
                        </div>
                    <?php endif; ?>
                    <?php if ($rank !== 'civilian') : ?>
                        <div class="input-field">
                            <input type="text" name="search_by_author">
                            <label for="search_by_author">Search By Author</label>
                        </div>
                    <?php endif; ?>
                    <div class="button_wrapper">
                        <input type="submit" value="Search" name="search_reports_button" class="btn-small ">
                    </div>
                </form>
            <?php endif; ?>
        </div>
        <?php for ($i = 0; $i < count($reports); $i++) :
            $report = getReport($reports[$i]);
        ?>
            <div class="reports container">
                <div class="card">
                    <div class="card-content">
                        <?php if ($report->open) : ?>

                            <span class="card-title"><?php echo 'Report ' . $report->id; ?></span>
                        <?php else : ?>
                            <span class="card-title">
                                <?php echo 'Report ' . $report->id . ' (Closed)';  ?>
                            </span>
                        <?php endif; ?>
                        <p><?php echo $report->content; ?></p>
                    </div>
                    <div class="card-action">
                        <?php if ($detect->isMobile() && !$detect->isTablet()) : ?>
                            <a href=<?php echo 'http://localhost:3000/mobile/view_report.php?reportId=' . $report->id . '&placeId=' . $report->place_id; ?> class="btn-small">View Report</a>
                        <?php else : ?>
                            <a href=<?php echo 'http://localhost:3000/reports.php?modal=viewReport&reportId=' . $report->id . '&placeId=' . $report->place_id; ?> class="btn-small">View Report</a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        <?php endfor; ?>
    <?php endif; ?>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/reports.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "./components/footer.php";
?>