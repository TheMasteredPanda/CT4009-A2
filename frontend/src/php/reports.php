<?php
include "./components/header.php";
include "./components/navbar.php";

if (isset($_POST['select_search_type'])) {
    $search_types = $_POST['select_search_type'];
}


$types = array('start_date' => "By Illustrated Date", 'before_date' => 'Before Date', 'open' => "By Report Status", 'investigating' => "By Investigation Status");

if ($rank !== 'civilian') {
    $types['author'] = 'By Report Author';
}

?>

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
                <form action="#">
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
                                    Closed
                                    <input type="checkbox" name="search_by_open">
                                    <span class="lever"></span>
                                    Open
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
                        <span class="card-title"><?php echo 'Report ' . $report->id; ?></span>
                        <p><?php echo $report->content; ?></p>
                    </div>
                    <div class="card-action">
                        <?php if ($detect->isMobile()) : ?>
                            <a href=<?php echo 'http://localhost:3000/mobile/view_report.php?reportId=' . $report->id; ?> class="btn-small">View Report</a>
                        <?php else : ?>
                            <a href=<?php echo 'http://localhost:3000/reports.php?model=viewReport&reportId=' . $report->id; ?> class="btn-small">View Report</a>
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