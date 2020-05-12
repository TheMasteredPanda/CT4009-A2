<?php
include "./components/header.php";
include "./components/navbar.php";
include "./functions/bike_functions.php";

if ($rank === 'civilian') {
    $bikes = getUsersBikes();
} else {
    $bikes = getAllBikes();
}
?>

<div class="bikes_container">
    <?php if (count($bikes) === 0) : ?>
        <div class="no_bikes_registered_wrapper">
            <h3>No Bikes Registered</h3>
        </div>
    <?php else : ?>
        <ul class="container">
            <?php for ($i = 0; $i < count($bikes); $i++) :
                $bike = getBike($bikes[$i]); ?>
                <li>
                    <div class="card">
                        <div class="card-title"><?php echo 'Registered Bike ' . $bike->id; ?></div>
                        <div class="card-img">
                            <img src=<?php echo 'http://localhost:5555/' . $bike->images[0]->uri; ?>>
                        </div>
                        <div class="buttons">
                            <?php if ($detect->isMobile()) : ?>
                                <a href=<?php echo 'http://localhost:3000/mobile/bike_info.php?bikeId=' . $bike->id; ?> class="btn-small">More</a>
                            <?php else : ?>
                                <a href=<?php echo 'http://localhost:3000/bikes.php?model=viewBike&bikeId=' . $bike->id; ?>>More</a>
                            <?php endif; ?>
                        </div>
                    </div>
                </li>
            <?php endfor; ?>
        </ul>
    <?php endif; ?>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "./components/footer.php";
?>