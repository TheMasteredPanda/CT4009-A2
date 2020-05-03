<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
include "../../../components/police_auth_header.php";

?>

<div class="create_officer_account_container">
    <form action="http://localhost:3000/actions/create_officer_account.php" method="POST" class="create_officer_account_form container">
        <div class="input-field">
            <input type="text" name="username" class="validate " required>
            <label for="username">Username</label>
        </div>
        <div class="input-field">
            <input type="password" name="password" class="validate" required>
            <label for="password">Password</label>
        </div>
        <div class="input-field">
            <input type="password" name="retypePassword" class="validate" required>
            <label for="retypePassword">Retype the password.</label>
            <span class="helper-text" data-error="Value must be identical to the password"></span>
        </div>
        <div class="input-field">
            <input type="email" name="email" class="validate" required>
            <label for="email">Email address</label>
            <span class="helper-text" data-error="Value must be structured as an email address."></span>
        </div>
        <div class="button_wrapper">
            <input type="submit" value="Create Account" class="btn-small indigo">
            <a href="http://localhost:3000/pages/police/admin_panel.php?section=accounts" class="btn-small indigo">Cancel</a>
        </div>
    </form>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/admin.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>

<?php
include "../../../components/footer.php";
?>