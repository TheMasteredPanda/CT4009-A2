<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
?>

<div class="report_stolen_container">
    <form action=<?php echo "http://localhost:3000/actions/create_report.php?bikeId=" . $_GET['bikeId'] ?> method="POST" class="report_stolen_bike_form container">
        <div class="input-field">
            <textarea name="report_description" id="reportDescription" rows=19 col=5 class="materialize-textarea"></textarea>
            <label for="reportDescription">Description</label>
        </div>
        <div class="button_wrapper">
            <input type="submit" value="Submit Report" name="report_stolen_submit_button" class="btn-small">
        </div>
    </form>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/reports.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "../../../components/footer.php"
?>