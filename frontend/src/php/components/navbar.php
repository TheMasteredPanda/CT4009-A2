<?php
$currentScript = $_SERVER['SCRIPT_NAME'];
$rank = getRank();
?>

<nav class="nav-wrapper">
    <div class="container">
        <a href="#" class="sidenav-trigger" data-target="mainSidenav"><i class="material-icons">menu</i></a>
        <?php if (in_array($currentScript, array('/pages/police/admin_panel.php', '/pages/police/mobile/create_officer_account.php')) && $detect->isMobile()) : ?>
            <a href="#" class="sidenav-trigger" data-target="adminPanelSidenav" id="adminSidenavButton"><i class="material-icons">menu</i></i></a>
        <?php endif; ?>

    </div>

    <?php if ($currentScript === '/pages/civilian/bikes.php') : ?>
        <ul class="right hide-on-med-and-up">
            <?php if ($detect->isMobile()) : ?>
                <li><a href="http://localhost:3000/pages/civilian/mobile/register_a_bike.php" class="btn-small">Register a Bike</a></li>
            <?php else : ?>
                <li><a href="#" class="btn-small">Register a Bike</a></li>
            <?php endif; ?>
        </ul>
    <?php endif; ?>

    <ul class="left hide-on-med-and-down">
        <li><a href="#">Account</a></li>
        <li>
            <div class="divider"></div>
        </li>
        <li>
            <div class="subheader">Pages</div>
        </li>
        <?php if (in_array($rank, array('police_officer', 'police_admin'))) : ?>
            <?php if ($rank === 'police_admin') : ?>
                <li><a href="http://localhost:3000/pages/police/admin_panel.php">Admin Panel</a></li>
            <?php endif; ?>

            <li><a href="http://localhost:3000/pages/police/investigations.php">>Investigations</a></li>
            <li><a href="http://localhost:3000/pages/police/reports.php">Reports</a></li>
            <li><a href="http://localhost:3000/pages/police/ecommerce.php">E-Commerce Matching</a></li>
            <li><a href="http://localhost:3000/pages/police/map.php">Vulnerability Map</a></li>
            <li><a href="http://localhost:3000/pages/police/bikes.php">Registered Bikes</a></li>
        <?php else : ?>
            <li><a href="http://localhost:3000/pages/civilian/bikes.php">Registered Bikes</a></li>
            <li><a href="http://localhost:3000/pages/civilian/investigations.php">Investigations</a></li>
            <li><a href="http://localhost:3000/pages/civilian/reports.php">Reports</a></li>
        <?php endif; ?>
    </ul>
</nav>

<ul class="sidenav" id="adminPanelSidenav">
    <div class="sidenav_buttons">
        <li><a href="http://localhost:3000/pages/police/admin_panel.php?section=accounts">Accounts</a></li>
    </div>
    <div class="sidenav_footer container">
        <div class="btn indigo" name="close_admin_sidenav_button">Close</div>
    </div>
</ul>
<ul class="sidenav" id="mainSidenav">
    <div class="sidenav_buttons">
        <li><a href="#">Account</a></li>
        <li>
            <div class="divider"></div>
        </li>
        <li>
            <div class="subheader">Pages</div>
        </li>
        <?php if (in_array($rank, array('police_officer', 'police_admin'))) : ?>
            <?php if ($rank === 'police_admin') : ?>
                <li><a href="http://localhost:3000/pages/police/admin_panel.php">Admin Panel</a></li>
            <?php endif; ?>

            <li><a href="http://localhost:3000/pages/police/investigations.php">Investigations</a></li>
            <li><a href="http://localhost:3000/pages/police/reports.php">Reports</a></li>
            <li><a href="http://localhost:3000/pages/police/ecommerce.php">E-Commerce Matching</a></li>
            <li><a href="http://localhost:3000/pages/police/map.php">Vulnerability Map</a></li>
            <li><a href="http://localhost:3000/pages/police/bikes.php">Registered Bikes</a></li>
        <?php else : ?>
            <li><a href="http://localhost:3000/pages/civilian/bikes.php">Registered Bikes</a></li>
            <li><a href="http://localhost:3000/pages/civilian/investigations.php">Investigations</a></li>
            <li><a href="http://localhost:3000/pages/civilian/reports.php">Reports</a></li>
        <?php endif; ?>
    </div>

    <div class="sidenav_footer container">
        <a href="http://localhost:3000/index.php?logout=true" class="btn" name="logout_button">Logout</a>
        <div class="btn" name="close_sidenav_button">Close</div>
    </div>
</ul>