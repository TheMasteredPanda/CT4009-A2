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
?>
<div class="modal" id="viewReport">
    <div class="modal-content">
        <div class="view_report_container">
            <div class="view_report_form row">
                <div class="input-field col m12 l12">
                    <input type="text" name="report_status" readonly>
                    <label for="report_status">Report Status</label>
                </div>
                <div class="input-field col m12 l12">
                    <textarea name="view_report_description" rows="15" class="materialize-textarea" readonly></textarea>
                    <label for="view_report_description">Description</label>
                </div>
                <div class="input-field map-field col m12 l12">
                    <h4 class="center-align">Location of Theft</h4>
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
                                <button class="btn-small indigo" name="comment_public_section_button">Public</button>
                                <button class="btn-small indigo" name="comment_private_section_button">Police</button>
                            </div>
                        <?php endif; ?>
                        <ul class="comments">
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

                        <div class="form_button_wrapper button_wrapper col m12 l12">
                            <a href="#" name="close_report_button" class="btn">Close</a>
                            <a href="#" name="close_view_report_button" class="btn indigo">Back</a>
                            <a href="#" class="btn">View Reported Bike</a>
                        </div>
                    </div>
            </div>
        </div>
    </div>
    <script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places,geocoder&v=3&key=AIzaSyA43tm6-MqO6IkzYA9he5Zlmu5drqlHtFo&callback=initMap">
    </script>

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
                    <form action="#" class="search_reports_form row">
                        <?php if ($rank === 'civilian') : ?>
                            <input type="text" name="civ_author" value=<?php echo $userId; ?> hidden>
                        <?php endif; ?>
                        <?php if (in_array('start_date', $search_types)) : ?>
                            <div class="input-field col m10 push-m1 datepicker_input">
                                <input type="text" class="datepicker" name="search_by_start_date">
                                <label for="search_by_start_date">Search By Illustrated Date</label>
                            </div>
                        <?php endif; ?>
                        <?php if (in_array('before_date', $search_types)) : ?>
                            <div class="input-field col m10 push-m1 datepicker_input">
                                <input type="text" class="datepicker" name="search_by_before_date">
                                <label for="search_by_before_date">Search By Before Date</label>
                            </div>
                        <?php endif; ?>
                        <?php if (in_array('open', $search_types)) : ?>
                            <div class="center-align col m12 switch_wrapper">
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
                            <div class="center-align col m12 switch_wrapper">
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
                            <div class="input-field col m10 push-m1">
                                <input type="text" name="search_by_author">
                                <label for="search_by_author">Search By Author</label>
                            </div>
                        <?php endif; ?>
                        <div class="button_wrapper col m12">
                            <input type="submit" value="Search" name="search_reports_button" class="btn-small ">
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
                <?php endfor; ?>
            </div>
        <?php endif; ?>
    </div>

    <script type="text/javascript" src="http://localhost:3000/scripts/reports.bundle.js"></script>
    <script type="text/javascript">
        let hashes = window.location.href
            .slice(window.location.href.indexOf("?") + 1)
            .split("&");
        let query = {}
        let splitHashes = hashes.map(hash => hash.split('='));

        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i];
            let splitHash = hash.split("=");
            query[splitHash[0]] = splitHash[1];
        }


        $(document).ready(() => {
            function populateViewReportModal() {
                let reportId = query.reportId;

                if (!reportId) return;
                $.get(
                    `http://localhost:3000/actions/get_report.php?reportId=${reportId}`
                ).done((res) => {
                    let report = JSON.parse(res);

                    $('textarea[name="view_report_description"]').val(report.content).focus();
                    $('input[name="report_status"]').val(report.open === "" ? 'Closed' : 'Open').focus();
                    <?php $comments = getReportComments($_GET['reportId'], 'civilian');
                    for ($i = 0; $i < count($comments); $i++) :
                        $comment = $comments[$i];
                        $author_name = getUsername($comment->author);
                    ?>
                        $('.comments').append(`
                    <?php if ($comment->author === $userId) : ?>
                        <li class="comment client_comment">
                    <?php else : ?>
                        <li class="comment not_client_comment">
                    <?php endif; ?>
                        <div class="comment_content_wrapper">
                            <div class="comment_header">
                                <div class="author"><?php echo $author_name; ?></div>
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
                    `);

                    <?php endfor; ?>

                    $('.form_button_wrapper').append(`
                    <?php if ($report->investigating) :
                        $investigation = getInvestigationByReportId($report->id);
                    ?>
                         <a href="http://localhost:3000/investigations.php?modal=viewInvestigation&investigationId=<?php echo $investigation->id; ?>" class="<?php echo getButtonType() ?> indigo">View Investigation</a>
                    <?php else : ?>
                        <a href="http://localhost:3000/actions/create_investigation.php?reportId=<?php echo $report->id; ?>" class="<?php echo getButtonType() ?> indigo"></a>
                    <?php endif; ?>
                `);
                });

            };

            let modal = query.modal;
            if (!modal) return;
            if (modal == 'viewReport') {
                populateViewReportModal();
                $('#viewReport').modal({
                    dismissible: false
                });
                $('#viewReport').modal('open');
            }

            $('a[name="close_view_report_close_button"]').ready(() => {
                $('a[name="close_view_report_button"]').click((e) => {
                    e.preventDefault();
                    window.history.pushState({
                        href: 'http://localhost:3000/reports.php'
                    }, '', 'http://localhost:3000/reports.php');
                    $('#viewReport').modal('close');
                })
            })
        });
    </script>
    <script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
    <?php
    include "./components/footer.php";
    ?>