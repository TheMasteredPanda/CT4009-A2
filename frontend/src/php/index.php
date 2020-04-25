<?php include('./components/header.php');
if (isset($_POST['logout'])) {
    logout();
}

$rank = getRank();

?>

<div class="home_container">
    <nav class="nav-wrapper">
        <div class="container">

            <a href="#" class="sidenav-trigger" data-target="mainSidenav"><i class="material-icons">menu</i></a>
        </div>
        <ul class="left hide-on-med-and-down">
            <li><a href="#">Account</a></li>
            <li>
                <div class="divider"></div>
            </li>
            <li>
                <div class="subheader">Sections</div>
            </li>
            <?php if (in_array($rank, array('police_officer', 'police_admin'))) : ?>
                <?php if ($rank === 'police_admin') : ?>
                    <li><a href="#">Admin Panel</a></li>
                <?php endif; ?>

                <li><a href="#">Investigations</a></li>
                <li><a href="#">Reports</a></li>
                <li><a href="#">E-Commerce Matching</a></li>
                <li><a href="#">Vulnerability Map</a></li>
                <li><a href="#">Registered Bikes</a></li>
            <?php else : ?>
                <li><a href="#">Registered Bikes</a></li>
                <li><a href="#">Investigations</a></li>
                <li><a href="#">Reports</a></li>
            <?php endif; ?>
        </ul>
    </nav>

    <ul class="sidenav" id="mainSidenav">
        <div class="sidenav_buttons">
            <li><a href="#">Account</a></li>
            <li>
                <div class="divider"></div>
            </li>
            <li>
                <div class="subheader">Sections</div>
            </li>
            <?php if (in_array($rank, array('police_officer', 'police_admin'))) : ?>
                <?php if ($rank === 'police_admin') : ?>
                    <li><a href="#">Admin Panel</a></li>
                <?php endif; ?>

                <li><a href="#">Investigations</a></li>
                <li><a href="#">Reports</a></li>
                <li><a href="#">E-Commerce Matching</a></li>
                <li><a href="#">Vulnerability Map</a></li>
                <li><a href="#">Registered Bikes</a></li>
            <?php else : ?>
                <li><a href="#">Registered Bikes</a></li>
                <li><a href="#">Investigations</a></li>
                <li><a href="#">Reports</a></li>
            <?php endif; ?>
        </div>

        <div class="sidenav_footer container">
            <div class="btn" name="logout_button">Logout</div>
            <div class="btn" name="close_sidenav_button">Close</div>
        </div>
    </ul>

    <div name="content" class="row s12">
    </div>
</div>

<?php include('./components/mainScript.php'); ?>
<script type="text/javascript" src="./scripts/home.bundle.js"></script>
<?php include('./components/footer.php'); ?>