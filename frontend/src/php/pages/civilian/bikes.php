<?php
include "../../components/header.php";
include "../../functions/bike_functions.php";

$bikes = json_decode(getUsersBikes());
?>

<div class="bikes_container">
    <?php include "../../components/navbar.php"; ?>
    <?php if (count($bikes->result) === 0) : ?>
        <div class="no_bikes_registered_wrapper">
            <h3>No Bikes Registered</h3>
        </div>
    <?php else : ?>
        <ul class="container">
            <?php for ($i = 0; $i < count($bikes->result); $i++) :
                $bike = getBike($bikes->result[$i]);
            ?>
                <li class="col s10 pull-s1">
                    <div class="card">
                        <div class="card-title"><?php echo 'Bike No. ' . ($i + 1) ?></div>
                        <div class="card-img">
                            <img src=<?php echo 'http://localhost:5555/' . $bike->images[0]->uri ?> alt="">
                        </div>
                        <div class="buttons">
                            <?php if ($detect->isMobile()) : ?>
                                <a href=<?php echo "http://localhost:3000/pages/civilian/mobile/bike_info.php?bikeId=" . $bike->id ?> class="btn-small">More</a>
                            <?php else : ?>
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
include "../../components/footer.php";
?>