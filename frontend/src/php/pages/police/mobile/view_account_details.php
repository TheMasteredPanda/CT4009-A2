<?php
include "../../../components/header.php";
include "../../../components/police_auth_header.php";
include "../../../components/navbar.php";
include "../../../functions/admin_functions.php";

?>

<div class="admin_view_account_details_container">
    <div class="container">
        <div class="input-field">
            <input type="text" name="account_username" readonly>
            <label for="account_username">Username</label>
        </div>
        <div class="input-field">
            <input type="text" name="account_email" readonly>
            <label for="account_email">Email</label>
        </div>
        <div class="input-field">
            <input type="number" name="account_registered_bikes" readonly>
            <label for="account_registered_bikes">Registered Bikes (Total)</label>
        </div>
        <div class="input-field">
            <input type="number" name="account_reports" readonly>
            <label for="account_reports">Reports Made (Total)</label>
        </div>
        <div class="button_wrapper">
            <a href="http://localhost:3000/actions/delete_account.php" class="btn-small">Delete</a>
            <a href="http://localhost:3000/pages/police/admin_panel.php?section=accounts">Back</a>
        </div>
    </div>
</div>
<?php
include "../../../components/footer.php";
?>