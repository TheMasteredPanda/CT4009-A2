<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
include "../../../functions/bike_functions.php";

if (!isset($_GET['bikeId'])) return;
$bike = getBike($_GET['bikeId']);
$colours_selection_array = array("red", "orange", "yellow", "green", "blue", "purple", "brown", "megenta", "tan", "cyan", "olive", "maroon", "navy", "aquamarine", "turquoise", "silver", "lime", "teal", "indigo", "violet", "pink", "black", "white", "gray");
$bike_brakes = array('N/A', 'spoon', 'duck', 'rim', 'disc', 'drum', 'coaster', 'drag', 'band', 'mechanical', 'hydraulic', 'v-brake', 'cantilever');
$bike_suspension = array('front', 'rear', 'seatpost', 'saddle', 'stem', 'hub', 'none');
$bike_genders = array('mens', 'womens', 'boys', 'girls', 'unisex');
$bike_age_group = array('toddler', 'children', 'adult');
$bike_types = array('road', 'mountain', 'hybrid_or_commuter', 'cyclocross', 'folding', 'electric', 'touring', 'womens');
$bike_colours = explode(', ', $bike->colours);
?>

<div class="bike_edit_container">
    <form action="http://localhost:3000/actions/update_bike.php" method="POST" class="bike_edit_form">
        <div class="row s10 pull-s1 container">
            <div class="carousel-wrapper">
                <div class="input-field ">
                    <div class="carousel carousel-slider center edit_images_carousel_slider">
                        <div class="carousel-item" id="uploadImagesCarouselItem">
                            <div class="file-field input-field">
                                <div class="btn-small">Upload Images</div>
                                <input id="uploadImageCarouselItemInput" type="file">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="input-field">
                <input class="validate" name="edit_part_number" type="text" value=<?php echo $bike->part_number; ?> required>
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
                <input class="validate" type="number" name="edit_wheel_size" value=<?php echo $bike->wheel_size ?> required>
                <label for="edit_wheel_size">Wheel Size</label>
            </div>
            <div class="input-field">
                <input class="validate" type="number" name="edit_gear_count" value=<?php echo $bike->gear_count ?> required>
                <label for="edit_gear_count">Gear Count</label>
            </div>
            <div class="input-field">
                <select name="edit_brake_type">
                    <?php for ($i = 0; $i < count($bike_brakes); $i++) :
                        $entry = $bike_brakes[$i];
                    ?>
                        <?php if ($entry === $bike->type) : ?>
                            <option value=<?php echo $entry; ?> selected><?php echo ucfirst($entry) ?></option>
                        <?php else : ?>
                            <option value=<?php echo $entry; ?>><?php echo ucfirst($entry) ?></option>
                        <?php endif; ?>
                    <?php endfor ?>
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
                            <option value=<?php echo $entry; ?>><?php echo $entry; ?></option>
                        <?php endif; ?>
                    <?php endfor ?>
                </select>
            </div>
            <div class="input-field">
                <select name="edit_bike_suspension">
                    <?php for ($i = 0; $i < count($bike_suspension); $i++) :
                        $entry = $bike_suspension[$i];
                    ?>
                        <?php if ($bike->suspension === $entry) : ?>
                            <option value=<?php echo $entry ?> selected><?php echo ucfirst($entry) ?></option>
                        <?php endif; ?>
                        <option value=<?php echo $entry ?>> <?php echo ucfirst($entry) ?></option>
                    <?php endfor; ?>
                </select>
                <label for="edit_bike_suspension">Bike Suspension</label>
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
                <select class="validate" name="edit_bike_gender" required>
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
                            <option value=<?php echo $entry; ?>> selected><?php echo ucfirst($entry); ?></option>
                        <?php else : ?>
                            <option value=<?php echo $entry; ?>><?php echo ucfirst($entry); ?></option>
                        <?php endif; ?>
                    <?php endfor; ?>
                </select>
                <label for="edit_bike_age_group">Bike Age Group</label>

            </div>
            <div class="input-field">
                <div class="edit_bike_button_wrapper">
                    <input id="editBikeSaveButton" type="submit" value="Save" class="btn">
                </div>
            </div>
        </div>
    </form>
</div>
<script type="text/javascript" src="http://localhost:3000/scripts/bikes.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "../../../components/footer.php";
?>