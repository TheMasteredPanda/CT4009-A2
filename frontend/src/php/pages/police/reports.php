<?php
include "../../components/header.php";
include "../../components/police_auth_header.php";
include "../../components/navbar.php";
include "../../functions/report_functions.php";
include "../../functions/user_functions.php";

if (isset($_POST['select_search_type'])) {
    $search_types = $_POST['select_search_type'];
} else {
    $search_types = [];
}

$types = array('author' => 'By Author', 'start_date' => "By Start Date", 'end_date' => "By End Date", 'open' => "By Report Status", 'investigating' => "By Investigation Status");

$reports;

if (isset($_POST['ids'])) {
    if ($_POST['ids'] === 'empty') {
        $reports = [];
    } else {
        $reports = $_POST['ids'];
    }
} else {
    $reports = getAllReports()->ids;
}

?>

<div class="reports_container ">
    <div class="reports_header container">
        <div class="input-field">
            <select name="police_select_search_type[]" multiple>
                <?php foreach ($types as $key => $value) : ?>
                    <?php if (in_array($key, $search_types)) : ?>
                        <option value=<?php echo $key; ?> selected><?php echo $value ?></option>
                    <?php else : ?>
                        <option value=<?php echo $key; ?>><?php echo $value; ?></option>
                    <?php endif; ?>
                <?php endforeach; ?>
            </select>
            <label for="police_select_search_type[]">Search Type</label>
        </div>
        <?php if (isset($_POST['search_reports']) && count($search_types) > 0) : ?>
            <form action="#" method="post" class="police_search_reports_form">
                <?php if (in_array('start_date', $search_types)) : ?>
                    <div class="input-field container datepicker_input">
                        <input type="text" class="datepicker" name="search_by_start_date">
                        <label for="search_by_date">Search By Start Date</label>
                    </div>
                <?php endif; ?>
                <?php if (in_array('end_date', $search_types)) : ?>
                    <div class="input-field container datepicker_input">
                        <input type="text" class="datepicker" name="search_by_end_date">
                        <label for="search_by_end_date">Search By End Date</label>
                    </div>
                <?php endif; ?>
                <?php if (in_array('open', $search_types)) : ?>
                    <div class="row">
                        <section>
                            <div class="col s12 center-align">
                                <div class="switch">
                                    <label>
                                        Closed
                                        <input type="checkbox" name="search_by_open">
                                        <span class="lever"></span>
                                        Open
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                <?php endif; ?>
                <?php if (in_array('investigating', $search_types)) : ?>
                    <div class="row">
                        <section>
                            <div class="col s12 center-align">
                                <div class="switch">
                                    <label>
                                        Investigating
                                        <input type="checkbox">
                                        <span class="lever"></span>
                                        Not Investigating
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>

                <?php endif; ?>
                <?php if (in_array('author', $search_types)) : ?>
                    <div class="input-field container">
                        <input type="text" name="search_by_author">
                        <label for="search_by_author">Author</label>
                    </div>
                <?php endif; ?>
                <div class="search_reports_form_button_wrapper">
                    <input type="submit" value="Search" name="search_reports_button" class="btn-small">
                </div>
            </form>
        <?php endif; ?>
    </div>
    <?php if (count($reports) === 0) : ?>
        <div class="no_reports_container">
            <h4>No Reports</h4>
        </div>
    <?php else : ?>
        <?php for ($i = 0; $i < count($reports); $i++) :
            $report = getReport($reports[$i])->report;
        ?>
            <div class="reports container">
                <div class="card">

                    <div class="card-content">
                        <span class="card-title"><?php echo 'Report on Bike ' . $report->bike_id . ' by ' . getUsername($report->author); ?></span>
                        <p><?php echo $report->content; ?></p>
                    </div>
                    <div class="card-action">
                        <?php if ($detect->isMobile()) : ?>
                            <a href=<?php echo "http://localhost:3000/pages/police/mobile/view_report.php?reportId=" . $reports[$i]; ?> class="btn-small indigo">View</a>
                        <?php else : ?>
                            <a href='#' class="btn-small indigo">View</a>
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
include "../../components/footer.php";
?>