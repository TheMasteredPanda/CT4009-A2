<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
?>

<div class="mobile_register_a_bike_container">
    <form class="container s12 register_a_bike_form" action="http://localhost:3000/actions/register_bike.php" method="post">
        <div class="row s10 pull-1">
            <div class="input-field">
                <input type="text" id="partNumber" name="part_number" required>
                <label for="partNumber">Part Number (Optional)</label>
            </div>
            <div class="input-field">
                <input type="text" id="brand" name="bike_brand" class="validate" required>
                <label for="bikeBrand">Bike Brand</label>
            </div>
            <div class="input-field">
                <input type="text" id="modal" name="bike_modal">
                <label for="bikeModel">Bike Model (Optional)</label>
            </div>
            <div class="input-field">
                <select id="bikeType" name="bikeType" class="browser-default">
                    <option value="road" disabled selected>Bike Type</option>
                    <option value="road">Road Bike</option>
                    <option value="mountain">Mountain Bike</option>
                    <option value="hybrid_or_commuter">Hybrid/Commuter Bike</option>
                    <option value="cyclocross">Cyclocross Bike</option>
                    <option value="folding">Folding Bike</option>
                    <option value="electric">Electric Bike</option>
                    <option value="touring">Touring Bike</option>
                    <option value="womens">Womens Bike</option>
                </select>
            </div>
            <div class="input-field">
                <input type="number" id="wheelSize" name="wheel_size" min=0 class="validate" required>
                <label for="wheelSize">Wheel Size</label>
            </div>
            <div class="input-field">
                <select name="colours[]" id="bikeColours" multiple>
                    <option disabled selected>Colours (Optional)</option>
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="brown">Brown</option>
                    <option value="magenta">Magenta</option>
                    <option value="tan">Tan</option>
                    <option value="cyan">Cyan</option>
                    <option value="olive">Olive</option>
                    <option value="maroon">Maroon</option>
                    <option value="navy">navy</option>
                    <option value="aquamarine">Aquamarine</option>
                    <option value="turquoise">Turquoise</option>
                    <option value="silver">silver</option>
                    <option value="lime">Lime</option>
                    <option value="teal">Teal</option>
                    <option value="indigo">Indigo</option>
                    <option value="violet">Violet</option>
                    <option value="pink">Pink</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="gray">Gray</option>
                </select>
            </div>
            <div class="input-field">
                <input type="number" name="gearCount" id="gearCount" min=0 class="validate" required>
                <label for="gearCount">Bike Gear Count</label>
            </div>
            <div class="input-field">
                <select name="brake_type" id="brakeType" class="browser-default">
                    <option value="N/A" disabled selected>Bike Brake Types (Optional)</option>
                    <option value="spoon">Spoon Brakes</option>
                    <option value="duck">Duck Brakes</option>
                    <option value="rim">Rim Brakes</option>
                    <option value="disc">Disc Brakes</option>
                    <option value="drum">Drum Brakes</option>
                    <option value="coaster">Coaster Brakes</option>
                    <option value="drag">Drag Brakes</option>
                    <option value="band">Band Brakes</option>
                    <option value="mechanical">Mechanical Brakes</option>
                    <option value="hydraulic">Hydraulic Brakes</option>
                    <option value="v-brake">V Brakes</option>
                    <option value="cantilever">Cantilever Brakes</option>
                </select>
            </div>
            <div class="input-field">
                <select name="suspension" id="bikeSuspension" class="browser-default">
                    <option value="N/A" disabled selected>Bike Suspension (Optional)</option>
                    <option value="front">Front Suspension</option>
                    <option value="rear">Rear Suspension</option>
                    <option value="seatpost">Seatpost Suspension</option>
                    <option value="saddle">Saddle Suspension</option>
                    <option value="stem">Stem Suspension</option>
                    <option value="hub">Hub Suspension</option>
                    <option value="none">No Suspension</option>
                </select>
            </div>
            <div class="input-field">
                <select name="bikeGender" id="bikeGender" class="browser-default" required>
                    <option value="unisex" disabled selected>Bike Gender</option>
                    <option value="womens">Womens</option>
                    <option value="mens">Mens</option>
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="unisex">Unisex</option>
                </select>
            </div>
            <div class="input-field">
                <select name="ageGroup" id="ageGroup" class="browser-default" required>
                    <option value="adult" disabled selected>Bike Age Group</option>
                    <option value="toddler">Toddler</option>
                    <option value="children">Children</option>
                    <option value="adult">Adult</option>
                </select>
            </div>
            <div class="file-field input-field">
                <div class="btn-small">
                    <span>Image</span>
                    <input type="file" name="images[]" id="bikeImages" multiple>
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text" placeholder="Upload one or more files">
                </div>
            </div>
            <span class="submit_button_wrapper">
                <input type="submit" class="btn" value="Register">
            </span>
        </div>

    </form>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/bikes.bundle.js"></script>
<link rel="stylesheet" href="http://localhost:3000/styles/mobile.bundle.css">

<?php
include "../../../components/footer.php";
?>