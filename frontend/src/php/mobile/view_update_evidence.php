<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
include "../../../functions/investigation_functions.php";
$investigation = getInvestigation($_GET['investigationId'])->investigation;
$update = array_values(array_filter($investigation->updates, function ($update) {
    return $update->id == $_GET['updateId'];
}))[0];
?>

<div class="view_update_evidence_container">
    <div class="view_update_evidence_container_header">
        <h4 class="center-align">Evidence</h4>
    </div>
    <div class="carousel_wrapper">
        <div class="carousel carousel-slider">
            <?php for ($i = 0; $i < count($update->images); $i++) : ?>
                <a href="#" class="carousel-item">
                    <img src=<?php echo 'http://localhost:5555/' . $update->images[$i]->uri; ?> alt="">
                </a>
            <?php endfor; ?>
        </div>
    </div>
    <div class="button_wrapper">
        <?php if ($detect->isMobile()) : ?>
            <a href=<?php echo 'http://localhost:3000/mobile/view_investigation.php?investigationId=' . $_GET['investigationId']; ?>>Back</a>
        <?php else : ?>
            <a href=<?php echo 'http://localhost:3000/investigations.php?model=viewInvestigation&investigationId=' . $_GET['investigationId']; ?>>Back</a>
        <?php endif; ?>
    </div>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/investigations.bundle.js"></script>
<?php
include "../../../components/footer.php";
?>