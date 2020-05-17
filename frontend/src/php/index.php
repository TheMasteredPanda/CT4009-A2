<?php include('./components/header.php');
include "./components/navbar.php";
if (isset($_GET['logout'])) {
    logout();
}

$rank = getRank();

header('Location: /bikes.php');
?>

<div class="home_container">
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php include('./components/footer.php'); ?>