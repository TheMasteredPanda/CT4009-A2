<?php
include "../../../components/header.php";
include "../../../components/police_auth_header.php";
include "../../../components/navbar.php";
include "../../../functions/admin_functions.php";

$account = getAccountDetails($_GET['accountId'])->account;
?>

<div class="admin_view_account_details_container">
    <div class="container">
        <div class="input-field">
            <input type="text" name="account_username" value=<?php echo $account->username; ?> readonly>
            <label for="account_username">Username</label>
        </div>
        <div class="input-field">
            <input type="text" name="account_email" value=<?php echo ''; ?> readonly>
            <label for="account_email">Email</label>
        </div>
        <div class="input-field">
            <input type="text" name="account_rank" value=<?php echo $account->rank; ?> readonly>
            <label for="account_rank">Rank</label>
        </div>
        <div class="input-field">
            <input type="number" name="account_registered_bikes" value=<?php echo $account->bike_count; ?> readonly>
            <label for="account_registered_bikes">Registered Bikes (Total)</label>
        </div>
        <div class="input-field">
            <input type="number" name="account_reports" value=<?php echo $account->reports_count; ?> readonly>
            <label for="account_reports">Reports Made (Total)</label>
        </div>
        <div class="button_wrapper">
            <a href=<?php echo "http://localhost:3000/actions/delete_account.php?accountId=" . $_GET['accountId'] ?> class="btn-small">Delete</a>
            <a href="http://localhost:3000/pages/police/admin_panel.php?section=accounts">Back</a>
        </div>
    </div>
</div>
<?php
include "../../../components/footer.php";
?>