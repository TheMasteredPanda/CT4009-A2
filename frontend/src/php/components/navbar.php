<?php
$currentScript = $_SERVER['SCRIPT_NAME'];
$rank = getRank();
$payload = json_decode($_COOKIE['ct4009Auth']);
$username = getUsername($payload->id);
?>

<nav class="nav-extended">
    <nav class="nav-wrapper">
        <div class="container">
            <a href="#" class="sidenav-trigger" data-target="mainSidenav"><i class="material-icons">menu</i></a>
            <?php if (in_array($currentScript, array('/admin_panel.php', '/mobile/create_officer_account.php')) && $detect->isMobile()) : ?>
                <a href="#" class="sidenav-trigger" data-target="adminPanelSidenav" id="adminSidenavButton"><i class="material-icons">menu</i></i></a>
            <?php endif; ?>

        </div>

        <?php if ($currentScript === '/bikes.php' && $rank === 'civilian') : ?>
            <ul class="right bikes_navbar_button">
                <?php if ($detect->isMobile()) : ?>
                    <li><a href="http://localhost:3000/mobile/register_a_bike.php" class="btn-small">Register a Bike</a></li>
                <?php else : ?>
                    <li><a href="http://localhost:3000/bikes.php?modal=registerBike" class="btn-small">Register a Bike</a></li>
                <?php endif; ?>
            </ul>
        <?php endif; ?>

        <ul class="dropdown-content" id="accountDropdown">
            <li><a href="http://localhost:3000/index.php?logout=true">Logout</a></li>
            <li><a href="http://localhost:3000/settings.php">Settings</a></li>
        </ul>

        <ul class="left hide-on-med-and-down">
            <li><a href="#" class="dropdown-trigger" data-target="accountDropdown"><?php echo getUsername($payload->id); ?></a></li>
            <?php if (in_array($rank, array('police_officer', 'police_admin'))) : ?>
                <?php if ($rank === 'police_admin') : ?>
                    <li><a href="http://localhost:3000/admin_panel.php">Admin Panel</a></li>
                <?php endif; ?>

                <li><a href="http://localhost:3000/investigations.php">Investigations</a></li>
                <li><a href="http://localhost:3000/reports.php">Reports</a></li>
                <li><a href="http://localhost:3000/map.php">Vulnerability Map</a></li>
                <li><a href="http://localhost:3000/bikes.php">Registered Bikes</a></li>
            <?php else : ?>
                <li><a href="http://localhost:3000/bikes.php">Registered Bikes</a></li>
                <li><a href="http://localhost:3000/investigations.php">Investigations</a></li>
                <li><a href="http://localhost:3000/reports.php">Reports</a></li>
            <?php endif; ?>
        </ul>
    </nav>
    <?php if ($currentScript === '/admin_panel.php') : ?>
        <div class="nav-content hide-on-med-and-down">
            <ul class="tabs tabs-transparent">
                <li class="tab"><a href="http://localhost:3000/admin_panel.php?section=accounts">Account</a></li>
            </ul>
        </div>
    <?php endif; ?>
</nav>

<ul class="sidenav" id="adminPanelSidenav">
    <div class="sidenav_buttons">
        <li><a href="http://localhost:3000/admin_panel.php?section=accounts">Accounts</a></li>
    </div>
    <div class="sidenav_footer container">
        <div class="btn indigo" name="close_admin_sidenav_button">Close</div>
    </div>
</ul>
<ul class="sidenav" id="mainSidenav">
    <div class="sidenav_buttons">
        <li>
            <div class="user-view">
                <a href="http://localhost:3000/settings.php" class="sidenav_username">
                    <span class="name"><?php echo $username; ?></span>
                    <?php if ($rank === 'police_officer') : ?>
                        <span class="badge indigo white-text">Police Officer</span>
                    <?php elseif ($rank === 'police_admin') : ?>
                        <span class="badge red white-text">Police Admin</span>
                    <?php else : ?>
                        <span class="badge green white-text">Civilian</span>
                    <?php endif; ?>
                </a>
            </div>
        </li>
        <li>
            <div class="divider"></div>
        </li>
        <li>
            <div class="subheader">Pages</div>
        </li>
        <?php if (in_array($rank, array('police_officer', 'police_admin'))) : ?>
            <?php if ($rank === 'police_admin') : ?>
                <li><a href="http://localhost:3000/admin_panel.php">Admin Panel</a></li>
            <?php endif; ?>

            <li><a href="http://localhost:3000/investigations.php">Investigations</a></li>
            <li><a href="http://localhost:3000/reports.php">Reports</a></li>
            <li><a href="http://localhost:3000/map.php">Vulnerability Map</a></li>
            <li><a href="http://localhost:3000/bikes.php">Registered Bikes</a></li>
        <?php else : ?>
            <li><a href="http://localhost:3000/bikes.php">Registered Bikes</a></li>
            <li><a href="http://localhost:3000/investigations.php">Investigations</a></li>
            <li><a href="http://localhost:3000/reports.php">Reports</a></li>
        <?php endif; ?>
    </div>

    <div class="sidenav_footer container">
        <a href="http://localhost:3000/index.php?logout=true" class="btn-small" name="logout_button">Logout</a>
        <div class="btn-small" name="close_sidenav_button">Close</div>
    </div>
</ul>