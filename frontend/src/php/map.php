<?php
include "./components/header.php";
include "./components/police_auth_header.php";
?>

<div class="vulnerability_map_container row">
    <h3 class="center-align">Vulnerability Map</h3>
    <div id="map" class="col m10 push-m1">

    </div>
</div>
<script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places,geocoder&v=3&key=AIzaSyA43tm6-MqO6IkzYA9he5Zlmu5drqlHtFo&callback=initMap">
</script>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/map.bundle.js"></script>
<?php
include "./components/footer.php";
?>