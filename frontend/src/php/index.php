<?php include('./components/header.php');
if (isset($_GET['logout'])) {
    logout();
}

$rank = getRank();

?>

<div class="home_container">
    <?php include "./components/navbar.php"; ?>

    <div name="content" class="row s12">
    </div>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php include('./components/footer.php'); ?>