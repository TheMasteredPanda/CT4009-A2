<?php
include "../../components/header.php";
include "../../components/navbar.php";
include "../../components/police_auth_header.php";
include "../../functions/admin_functions.php";

if ($rank !== 'police_admin') {
    header('Location: /index.php');
}

$section = "";

if (isset($_GET['section'])) {
    global $section;
    $section = $_GET['section'];
} else {
}

$accounts = getAllAccounts();
?>

<div class="admin_panel_container">
    <?php if ($section === 'accounts') : ?>
        <div class="admin_panel_accounts_section">
            <div class="accounts_header">
                <div class="container">
                    <div class="input-field">
                        <input type="text" name="search_by_username">
                        <label for="search_by_username">Search</label>
                    </div>
                    <div class="button_wrapper">
                        <?php if ($detect->isMobile()) : ?>
                            <a href="http://localhost:3000/pages/police/mobile/create_officer_account.php" class="btn-small">Create Officer Account</a>
                        <?php else : ?>
                            <a href="#" class="btn-small"></a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <?php if (count($accounts) > 0) : ?>
                <ul>
                    <li class="account_entry entry_titles">
                        <h5>Username</h5>
                        <h5>ID</h5>
                    </li>
                    <?php for ($i = 0; $i < count($accounts); $i++) : ?>
                        <li class=" account_entry">
                            <div>
                                <h6><?php echo $accounts[$i]->username ?></h6>
                            </div>
                            <div>
                                <h6><?php echo $accounts[$i]->id ?></h6>
                            </div>
                        </li>
                    <?php endfor; ?>
                </ul>
            <?php else : ?>
                <div class="no_accounts_container">
                    <h5>No Accounts Found</h5>
                </div>
            <?php endif; ?>

        </div>
    <?php endif; ?>
</div>

<script type="text/javascript" src="/scripts/admin.bundle.js"></script>
<script type="text/javascript" src="/scripts/home.bundle.js"></script>
<?php
include "../../components/footer.php";
?>