<?php
include "./components/header.php";
include "./components/navbar.php";
include "./components/police_auth_header.php";
include "./functions/admin_functions.php";

if ($rank !== 'police_admin') {
    header('Location: /index.php');
}

$section = "";

if (isset($_GET['section'])) {
    global $section;
    $section = $_GET['section'];
} else {
}


if (isset($_GET['modal'])) :
    $modal = $_GET['modal'];
?>
    <?php if ($modal === 'createOfficer') : ?>
        <div class="modal" id="createOfficer">
            <div class="modal-content">
                <form action="http://localhost:3000/actions/create_officer_account.php" method="POST" class="create_officer_account_form">
                    <div class="input-field">
                        <input type="text" name="username" class="validate" required>
                        <label for="username">Username</label>
                    </div>
                    <div class="input-field">
                        <input type="password" name="password" class="validate" required>
                        <label for="password">Password</label>
                    </div>
                    <div class="input-field">
                        <input type="password" name="retypePassword" class="validate" required>
                        <label for="password">Retype Password</label>
                        <span class="helper-text" data-error="Value must be identical to the password"></span>
                    </div>
                    <div class="input-field">
                        <input type="email" name="email" class="validate" required>
                        <label for="email">Email Address</label>
                        <span class="helper-text" data-error="Value must be structured as an email address."></span>
                    </div>
                    <div class="button_wrapper">
                        <input type="submit" value="Create Account" class="btn indigo">
                        <a href="http://localhost:3000/admin_panel.php?section=accounts" class="btn indigo">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>
<?php endif; ?>

<div class="admin_panel_container">
    <?php if ($section === 'accounts') : ?>
        <div class="admin_panel_accounts_section">
            <div class="accounts_header row ">
                <form action="#" name="search_select_form" class=" col m8 push-m3 l8 push-l2 s8 push-s3">
                    <div class="input-field">
                        <select name="search_options" multiple>
                            <option value="rank">Search by Rank</option>
                            <option value="id">Search by Id</option>
                            <option value="username">Search by Name</option>
                        </select>
                        <label for="search_options">Search Options</label>
                    </div>
                </form>
                <form action="" class="search_accounts_form col m8 push-m3 l8 push-l2 s8 push-s3">

                </form>
                <div class="button_wrapper col m12 l12 s12">
                    <?php if ($detect->isMobile() && !$detect->isTable()) : ?>
                        <a href="http://localhost:3000/mobile/create_officer_account.php" class="btn-small">Create Officer Account</a>
                    <?php else : ?>
                        <a href="http://localhost:3000/admin_panel.php?modal=createOfficer&section=accounts" class="btn indigo">Create Officer Account</a>
                    <?php endif; ?>
                </div>
            </div>
            <div class="account_entries row">
>
            </div>
        </div>
    <?php endif; ?>
</div>

<script type="text/javascript" src="/scripts/admin.bundle.js"></script>
<script type="text/javascript" src="/scripts/home.bundle.js"></script>
<?php
include "./components/footer.php";
?>