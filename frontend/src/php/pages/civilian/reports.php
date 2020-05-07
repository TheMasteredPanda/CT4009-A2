<?php
include "../../components/header.php";
include "../../components/navbar.php";
include "../../functions/report_functions.php";

if (isset($_POST['select_search_type'])) {
    $search_types = $_POST['select_search_type'];
}


$types = array('date' => "By Date", 'open' => "By Report Status", 'investigating' => "By Investigation Status");
$reports = getAllUserReports()->ids;
?>

<div class="reports_container ">
    <div class="reports_header container">
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
        <?php if (isset($_POST['search_reports']) && count($search_types) > 0) : ?>
            <form action="http://localhost:3000/pages/civilian/reports.php" method="post" class="search_reports_form">
                <?php if (in_array('date', $search_types)) : ?>
                    <div class="input-field container datepicker_input">
                        <input type="text" class="datepicker" name="search_by_date">
                        <label for="search_by_date">Search By Date</label>
                    </div>
                <?php endif; ?>

                <?php if (in_array('open', $search_types)) : ?>
                    <div class="input-field container">
                        <select name="search_by_open">
                            <option value="only_closed">View Only Closed</option>
                            <option value="only_open" selected>View Only Open</option>
                            <option value="both">View Closed and Open</option>
                        </select>
                        <label for="search_by_open">Search by Open Status</label>
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
                        <span class="card-title"><?php echo 'Report No.' . $i; ?></span>
                        <p><?php echo $report->content; ?></p>
                    </div>
                    <div class="card-action">
                        <?php if ($detect->isMobile()) : ?>
                            <a href=<?php echo "http://localhost:3000/pages/civilian/mobile/view_report.php?reportId=" . $reports[$i]; ?> class="btn-small indigo">View</a>
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
include "../../components/footer.php"
?>