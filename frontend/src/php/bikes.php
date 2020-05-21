<?php
include "./components/header.php";
include "./components/navbar.php";
include "./functions/bike_functions.php";
include "./functions/report_functions.php";

if ($rank === 'civilian') {
    $bikes = getUsersBikes();
} else {
    $bikes = getAllBikes();
}

if (isset($_GET['modal'])) :
    $modal = $_GET['modal'];
?>
    <?php if ($modal === 'registerBike') : ?>
        <div class="modal" id="registerBike">
            <div class="modal-content">
                <form action="http://localhost:3000/actions/register_bike.php" method="post" class="register_a_bike_form">
                    <div class="row m6 pull-m3 l4 pull-l2">
                        <div class="input-field">
                            <input type="text" id="partNumber" name="part_number" required>
                            <label for="part_number">Part Number (Optional</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_brand" id="brand" class="validate" required>
                            <label for="bike_brand">Bike Brand</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_modal" id="modal">
                            <label for="bike_modal">Bike Modal (Optional)</label>
                        </div>
                        <div class="input-field">
                            <select name="bikeType" id="bikeType">
                                <option value="mountain">Mountain Bike</option>
                                <option value="hybrid_or_commuter">Hybrid/Commuter Bike</option>
                                <option value="cyclocross">Cyclocross Bike</option>
                                <option value="folding">Folding Bike</option>
                                <option value="electric">Electric Bike</option>
                                <option value="touring">Touring Bike</option>
                                <option value="womens">Womens Bike</option>
                            </select>
                            <label for="bikeType">Bike Type</label>
                        </div>
                    </div>
                    <div class="input-field">
                        <input type="number" name="wheel_size" id="wheelSize" min=0 class="validate" required>
                        <label for="wheel_size">Wheel Size</label>
                    </div>
                    <div class="input-field">
                        <select name="colours[]" id="bikeColours" multiple>
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
                        <label for="colours[]">Bike Colours</label>
                    </div>
                    <div class="input-field">
                        <input type="number" name="gear_count" id="gearCount" min=0 class="validate" required>
                        <label for="gear_count">Bike Gear Count</label>
                    </div>
                    <div class="input-field">
                        <select name="brake_type" id="brakeType">
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
                        <label for="brake_type">Brake Type (Optional)</label>
                    </div>
                    <div class="input-field">
                        <select name="suspension" id="bikeSuspension">
                            <option value="front">Front Suspension</option>
                            <option value="rear">Rear Suspension</option>
                            <option value="seatpost">Seatpost Suspension</option>
                            <option value="saddle">Saddle Suspension</option>
                            <option value="stem">Stem Suspension</option>
                            <option value="hub">Hub Suspension</option>
                            <option value="none">No Suspension</option>
                        </select>
                        <label for="suspension">Bike Suspension</label>
                    </div>
                    <div class="input-field">
                        <select name="bike_gender" id="bikeGender" required>
                            <option value="womens">Womens</option>
                            <option value="mens">Mens</option>
                            <option value="boys">Boys</option>
                            <option value="girls">Girls</option>
                            <option value="unisex">Unisex</option>
                        </select>
                        <label for="bike_gender">Bike Gender</label>
                    </div>
                    <div class="input-field">
                        <select name="age_group" id="ageGroup"" required>
                            <option value=" toddler">Toddler</option>
                            <option value="children">Children</option>
                            <option value="adult">Adult</option>
                        </select>
                        <label for="age_group">Age Group</label>
                    </div>
                    <div class="file-field input-field">
                        <div class="btn-small indigo">
                            <span>Images</span>
                            <input type="file" name="images[]" id="bikeImages" multiple>
                        </div>
                        <div class="file-path-wrapper">
                            <input type="text" class="file-path validate" placeholder="Upload one or more images.">
                        </div>
                    </div>
                    <div class="submit_button_wrapper">
                        <input type="submit" class="btn indigo" value="Register">
                        <a href="http://localhost:3000/bikes.php" class="btn indigo">Close</a>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>
    <?php if ($modal === 'viewBike' && isset($_GET['bikeId'])) :
        $bike = getBike($_GET['bikeId']);
    ?>
        <div class="modal" id="viewBike">
            <div class="modal-content">
                <div class="bike_info_container">
                    <div class="input-field">
                        <div id="bikeInfoImageCarousel" class="carousel carousel-slider center">
                            <?php for ($i = 0; $i < count($bike->images); $i++) : ?>
                                <a href="" class="carousel-item">
                                    <img src=<?php echo 'http://localhost:5555/' . $bike->images[$i]->uri; ?>>
                                </a>
                            <?php endfor; ?>
                        </div>
                    </div>
                    <h5 class="center-align">Bike Information</h5>
                    <div class="input_wrappers">
                        <div class="input-field">
                            <input type="text" name="part_number" value=<?php echo $bike->part_number; ?> readonly>
                            <label for="part_number">Part Number</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_brand" value=<?php echo $bike->brand ?> readonly>
                            <label for="bike_brand">Brand</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_modal" value=<?php echo $bike->modal; ?> readonly>
                            <label for="bike_modal">Modal</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_type" value=<?php echo $bike->type; ?> readonly>
                            <label for="bike_type">Type</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_wheel_size" value=<?php echo $bike->wheel_size; ?> readonly>
                            <label for="bike_wheel_size">Wheel Size</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_colours" value=<?php echo '"' . $bike->colours . '"'; ?> readonly>
                            <label for="bike_colours">Bike Colours</label>
                        </div>
                        <div class="input-field">
                            <input type="text" name="bike_age_group" value=<?php echo $bike->age_group; ?> readonly>
                            <label for="age_group"></label>
                        </div>
                        <div class="button_wrapper">
                            <a href="http://localhost:3000/bikes.php" class="btn indigo">Back</a>
                            <a href=<?php echo "http://localhost:3000/actions/delete_bike.php?bikeId=" . $bike->id; ?> class="btn indigo">Delete</a>
                            <?php if ($rank === 'civilian') : ?>
                                <a href=<?php echo "http://localhost:3000/bikes.php?modal=editBike&bikeId=" . $bike->id; ?> class="btn indigo">Edit</a>
                                <?php if (!hasOpenReport($bike->id)) : ?>
                                    <a href=<?php echo 'http://localhost:3000/bikes.php?modal=reportStolen&bikeId=' . $bike->id; ?> class="btn indigo">Report Stolen</a>
                                <?php else : ?>
                                    <a href=<?php echo 'http://localhost:3000/reports.php?modal=viewReport&reportId=' . getReportByBike($bike->id)->id; ?> class="btn indigo">View Report</a>
                                <?php endif; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
    <?php if ($modal === 'editBike' && isset($_GET['bikeId'])) :
        $bike = getBike($_GET['bikeId']);
        $colours_selection_array = array("red", "orange", "yellow", "green", "blue", "purple", "brown", "megenta", "tan", "cyan", "olive", "maroon", "navy", "aquamarine", "turquoise", "silver", "lime", "teal", "indigo", "violet", "pink", "black", "white", "gray");
        $bike_brakes = array('N/A', 'spoon', 'duck', 'rim', 'disc', 'drum', 'coaster', 'drag', 'band', 'mechanical', 'hydraulic', 'v-brake', 'cantilever');
        $bike_suspension = array('front', 'rear', 'seatpost', 'saddle', 'stem', 'hub', 'none');
        $bike_genders = array('mens', 'womens', 'boys', 'girls', 'unisex');
        $bike_age_group = array('toddler', 'children', 'adult');
        $bike_types = array('road', 'mountain', 'hybrid_or_commuter', 'cyclocross', 'folding', 'electric', 'touring', 'womens');
        $bike_colours = explode(', ', $bike->colours);
    ?>
        <div class="modal" id="editBike">
            <div class="modal-content">
                <div class="bike_edit_container">
                    <form action=<?php echo "http://localhost:3000/actions/update_bike.php?bikeId=" . $bike->id; ?> method="POST" enctype="multipart/form-data" class="bike_edit_form">
                        <div class="carousel-wrapper">
                            <div class="input-field">
                                <div class="carousel carousel-slider center edit_images_carousel_slider">
                                    <div class="carousel-item" id="uploadImagesCarouselItem">
                                        <div class="file-field input-field">
                                            <div class="btn-small">Upload Images</div>
                                            <input type="file" id="uploadImageCarouselItemInput">
                                        </div>
                                    </div>
                                </div>
                                <div class="input-field">
                                    <input type="text" name="edit_part_number" type="text" value=<?php echo $bike->part_number; ?> required>
                                    <label for="edit_part_number">Part Number</label>
                                </div>
                                <div class="input-field">
                                    <input type="text" name="edit_brand" value=<?php echo $bike->brand; ?>>
                                    <label for="edit_brand">Brand</label>
                                </div>
                                <div class="input-field">
                                    <input type="text" name="edit_modal" value=<?php echo $bike->modal; ?>>
                                    <label for="edit_modal">Modal</label>
                                </div>
                                <div class="input-field">
                                    <input type="number" class="validate" name="edit_wheel_size" value=<?php echo $bike->wheel_size; ?> required>
                                    <label for="edit_wheel_size">Wheel Size</label>
                                </div>
                                <div class="input-field">
                                    <input type="number" class="validate" name="edit_gear_count" value=<?php echo $bike->gear_count; ?> required>
                                    <label for="edit_gear_count">Gear Count</label>
                                </div>
                                <div class="input-field">
                                    <select name="edit_brake_type">
                                        <?php for ($i = 0; $i < count($bike_brakes); $i++) :
                                            $entry = $bike_brakes[$i];
                                        ?>
                                            <?php if ($entry === $bike->type) : ?>
                                                <option value=<?php echo $entry; ?> selected><?php echo ucfirst($entry); ?></option>
                                            <?php else : ?>
                                                <option value=<?php echo $entry; ?>><?php echo ucfirst($entry); ?></option>
                                            <?php endif; ?>
                                        <?php endfor; ?>
                                    </select>
                                    <label for="edit_brake_type">Brake Type</label>
                                </div>
                                <div class="input-field">
                                    <select name="edit_bike_type">
                                        <?php for ($i = 0; $i < count($bike_types); $i++) :
                                            $entry = $bike_types[$i];
                                        ?>
                                            <?php if ($entry === $bike->type) : ?>
                                                <option value=<?php echo $entry; ?> selected><?php echo $entry; ?></option>
                                            <?php else : ?>
                                                <option value=<?php echo $entry; ?><?php echo $entry; ?>></option>
                                            <?php endif; ?>
                                        <?php endfor; ?>
                                    </select>
                                    <label for="edit_bike_type">Bike Type</label>
                                </div>
                                <div class="input-field">
                                    <select name="edit_bike_suspension">
                                        <?php for ($i = 0; $i < count($bike_suspension); $i++) :
                                            $entry = $bike_suspension[$i];
                                        ?>
                                            <?php if ($bike->suspension === $entry) : ?>
                                                <option value=<?php echo $entry; ?> selected><?php echo ucfirst($entry); ?></option>
                                            <?php else : ?>
                                                <option value=<?php echo $entry; ?>><?php echo ucfirst($entry); ?></option>
                                            <?php endif; ?>
                                        <?php endfor; ?>
                                        <label for="edit_bike_suspension">Bike Suspension</label>
                                    </select>
                                </div>
                                <div class="input-field">
                                    <select name="edit_bike_colours[]" id="testSelect" multiple>
                                        <?php for ($i = 0; $i < count($colours_selection_array); $i++) :
                                            $colour = $colours_selection_array[$i];
                                        ?>
                                            <?php if (in_array($colour, $bike_colours)) : ?>
                                                <option value=<?php echo $colour; ?> selected><?php echo $colour; ?></option>
                                            <?php else : ?>
                                                <option value=<?php echo $colour; ?>><?php echo $colour; ?></option>
                                            <?php endif; ?>
                                        <?php endfor; ?>
                                    </select>
                                    <label for="edit_bike_colours[]">Bike Colours</label>
                                </div>
                                <div class="input-field">
                                    <select name="edit_bike_gender" class="validate" required>
                                        <?php for ($i = 0; $i < count($bike_genders); $i++) :
                                            $entry = $bike_genders[$i];
                                        ?>
                                            <?php if ($entry === $bike->gender) : ?>
                                                <option value=<?php echo $entry; ?> selected><?php echo ucfirst($entry); ?></option>
                                            <?php else : ?>
                                                <option value=<?php echo $entry; ?>><?php echo ucfirst($entry); ?></option>
                                            <?php endif; ?>
                                        <?php endfor; ?>
                                    </select>
                                    <label for="edit_bike_gender">Bike Gender</label>
                                </div>
                                <div class="input-field">
                                    <select name="edit_bike_age_group" required>
                                        <?php for ($i = 0; $i < count($bike_age_group); $i++) :
                                            $entry = $bike_age_group[$i];
                                        ?>
                                            <?php if ($entry === $bike->age_group) : ?>
                                                <option value=<?php echo $entry; ?> selected><?php echo ucfirst($entry); ?></option>
                                            <?php else : ?>
                                                <option value=<?php echo $entry; ?>><?php echo ucfirst($entry); ?></option>
                                            <?php endif; ?>
                                        <?php endfor; ?>
                                    </select>
                                    <label for="edit_bike_age_group">Bike Age Group</label>
                                </div>
                                <div class="edit_button_wrapper">
                                    <input type="submit" value="Save" class="btn indigo">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    <?php endif; ?>
    <?php if ($modal == 'reportStolen' && isset($_GET['bikeId'])) : ?>
        <div class="modal" id="reportStolen">
            <div class="modal-content">
                <h4 class="center-align">Report Bike Stolen</h4>
                <form action=<?php echo "http://localhost:3000/actions/create_report.php?bikeId=" . $_GET['bikeId']; ?> class="report_stolen_bike_form row " method="post">
                    <div class="input-field col m12">
                        <textarea name="report_description" id="reportDescription" rows="19" class="materialize-textarea"></textarea>
                        <label for="report_description">Description</label>
                    </div>
                    <div class="input-field map-field col m12">
                        <h5 class="center-align">Where did the theft take place?</h5>
                        <input type="text" id="pac-input" class="controls" placeholder="Search Box">
                        <div id="map"></div>
                    </div>
                    <div class="button_wrapper col m12">
                        <input type="submit" value="Report" name="report_stolen_submit_button" class="btn indigo">
                    </div>
                </form>
            </div>
        </div>
        <script async defer src="https://maps.googleapis.com/maps/api/js?libraries=places,geocoder&v=3&key=AIzaSyA43tm6-MqO6IkzYA9he5Zlmu5drqlHtFo&callback=initMap">
        </script>

    <?php endif; ?>
<?php endif; ?>

<div class="bikes_container">
    <?php if (count($bikes) === 0) : ?>
        <div class="no_bikes_registered_wrapper">
            <h3>No Bikes Registered</h3>
        </div>
    <?php else : ?>
        <ul class="container">
            <?php for ($i = 0; $i < count($bikes); $i++) :
                $bike = getBike($bikes[$i]);
            ?>
                <li>
                    <div class="card">
                        <div class="card-title"><?php echo 'Registered Bike ' . $bike->id; ?></div>
                        <div class="card-img">
                            <img src=<?php echo 'http://localhost:5555/' . $bike->images[0]->uri; ?>>
                        </div>
                        <div class="buttons">
                            <?php if ($detect->isMobile() && !$detect->isTablet()) : ?>
                                <a href=<?php echo 'http://localhost:3000/mobile/bike_info.php?bikeId=' . $bike->id; ?> class="btn-small">More</a>
                            <?php else : ?>
                                <a href=<?php echo 'http://localhost:3000/bikes.php?modal=viewBike&bikeId=' . $bike->id; ?> class="btn-small">More</a>
                            <?php endif; ?>
                        </div>
                    </div>
                </li>
            <?php endfor; ?>
        </ul>
    <?php endif; ?>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/bikes.bundle.js"></script>
<?php
include "./components/footer.php";
?>