<?php
include "../components/header.php";
include "../components/navbar.php";
?>

<div class="report_stolen_container">
    <form action=<?php echo "http://localhost:3000/actions/create_report.php?bikeId=" . $_GET['bikeId'] ?> method="POST" class="report_stolen_bike_form row">
        <div class="input-field s12 col">
            <textarea name="report_description" id="reportDescription" rows=19 col=5 class="materialize-textarea"></textarea>
            <label for="reportDescription">Description</label>
        </div>
        <div class="input-field map-field s12 col">
            <h5 class="center-align">Where did the theft take place?</h5>
            <input type="text" id="pac-input" class="controls" placeholder="Search Box">
            <div id="map"></div>
        </div>
        <div class="button_wrapper s12 col">
            <input type="submit" value="Submit Report" name="report_stolen_submit_button" class="btn-small">
        </div>
    </form>
</div>

<script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places,geocoder&v=3&key=AIzaSyA43tm6-MqO6IkzYA9he5Zlmu5drqlHtFo&callback=initMap"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/reports.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "../components/footer.php"
?>