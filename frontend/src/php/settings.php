<?php
include "./components/header.php";
include "./components/navbar.php";
$payload = json_decode($_COOKIE['ct4009Auth']);
$id = $payload->id;

if (isset($_GET['modal'])) :
    $modal = $_GET['modal'];
?>
    <?php if ($modal === 'deleteAccount') : ?>
        <div class="modal" id="deleteAccount">
            <div class="modal-content">
                <h3 class="center-align">Are you sure you want to delete your account?</h3>
                <form action=<?php echo "http://localhost:3000/actions/delete_self_account.php?userId=" . $id; ?> class="delete_account_form" method="POST">
                    <input type="submit" name="delete_account_button" value="Delete Account" class="btn">
                    <a href="http://localhost:3000/settings.php" class="btn">Back</a>
                </form>
            </div>
        </div>
    <?php endif; ?>
    <?php if ($modal === 'changePassword') : ?>
        <div class="modal" id="changePassword">
            <div class="modal-content">
                <h3 class="center-align">Change Password</h3>
                <form action="http://localhost:3000/actions/change_account_password.php" class="change_password_form" method="POST">
                    <div class="input-field">
                        <input type="password" name="current_password" class="validate" required>
                        <label for="current_password">Current Password</label>
                    </div>
                    <div class="input-field">
                        <input type="password" name="new_password" class="validate" required>
                        <label for="new_password">New Password</label>
                    </div>
                    <div class="input-field">
                        <input type="password" name="retype_new_password" class="validate" required>
                        <label for="retype_new_password">Retype New Password</label>
                        <span class="helper-text" data-error="Value must be identical to the one above."></span>
                    </div>
                    <div class="button_wrapper">
                        <input type="submit" name="new_password_button" value="Change Password" class="btn">
                        <a href="http://localhost:3000/settings.php" class="btn">Back</a>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>
<?php endif; ?>

<div class="account_settings_container">
    <div class="row account_settings">
        <h3>Account Settings</h3>
        <div class="m4 l4 push-m4 push-l4">
            <a href="http://localhost:3000/settings.php?modal=deleteAccount" class="btn">Delete Account</a>
            <a href="http://localhost:3000/settings.php?modal=changePassword" class="btn">Change Password</a>
        </div>
    </div>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/settings.bundle.js"></script>
<?php
include "./components/footer.php";
?>