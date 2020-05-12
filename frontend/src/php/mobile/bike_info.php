<?php
include "../components/header.php";
include "../components/navbar.php";
include "../functions/bike_functions.php";

$bike = getBike($_GET['bikeId']);
?>

<div class="bike_info_container container">
    <div class="input-field">
        <div id="bikeInfoImageCarousel" class="carousel carousel-slider center">
            <?php for ($i = 0; $i < count($bike->images); $i++) : ?>
                <a href="#" class="carousel-item" href="#one!">
                    <img src=<?php echo 'http://localhost:5555/' . $bike->images[$i]->uri ?>>
                </a>
            <?php endfor; ?>
        </div>
    </div>

    <h5 class="center-align">Bike Information</h5>
    <div class="input_wrappers">
        <div class="input-field">
            <input type="text" name="part_number" value=<?php echo $bike->part_number ?> readonly>
            <label for="part_number">Part Number</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_brand" value=<?php echo $bike->brand ?> readonly>
            <label for="bike_brand">Brand</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_modal" value=<?php echo $bike->modal ?> readonly>
            <label for="bike_modal">Modal</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_type" value=<?php echo $bike->type ?> readonly>
            <label for="bike_type">Type</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_wheel_size" value=<?php echo $bike->wheel_size ?> readonly>
            <label for="bike_wheel_size">Wheel Size (in inches)</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_colours" value=<?php echo '"' . $bike->colours . '"'; ?> readonly>
            <label for="bike_colours">Colours</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_gear_count" value=<?php echo $bike->gear_count ?> readonly>
            <label for="bike_gear_count">Gear Count</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_brake_type" value=<?php echo $bike->brake_type ?> readonly>
            <label for="bike_brake_type">Brake Type</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_suspension" value=<?php echo $bike->suspension ?> readonly>
            <label for="bike_suspension">Suspension</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_gender" value=<?php echo $bike->gender ?> readonly>
            <label for="bike_gender">Gender</label>
        </div>
        <div class="input-field">
            <input type="text" name="bike_age_group" value=<?php echo $bike->age_group ?> readonly>
            <label for="bike_age_group">Age Group</label>
        </div>
        <span class="button_wrapper">
            <a href="http://localhost:3000/bikes.php" class="btn indigo">Back</a>
            <a href=<?php echo "http://localhost:3000/actions/delete_bike.php?bikeId=" . $bike->id ?> class="btn indigo">Delete</a>
            <?php if ($rank === 'civilian') : ?>
                <a href=<?php echo "http://localhost:3000/mobile/edit_bike.php?bikeId=" . $bike->id; ?> class="btn indigo">Edit</a>
                <a href=<?php echo "http://localhost:3000/mobile/report_bike.php?bikeId=" . $bike->id; ?> class="btn indigo">Report Stolen</a>
            <?php endif; ?>
        </span>
    </div>


</div>

<script type="text/javascript" src="http://localhost:3000/scripts/bikes.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "../components/footer.php";
?>