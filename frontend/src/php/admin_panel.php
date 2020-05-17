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

$accounts = [];

if (isset($_POST['accounts'])) {
    global $accounts;
    $accounts = getAllAccounts($_POST['accounts']);
} else {
    $accounts = getAllAccounts([]);
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
        <div class="admin_panel_accounts_section row ">
            <div class="accounts_header col m10 l10 pull-l1">
                <form action="" class="search_accounts_form">
                    <div class="input-field ">
                        <input type="text" name="admin_accounts_search">
                        <label for="search_by_username">Search</label>
                    </div>
                    <div class="search_accounts_button_wrapper">
                        <input type="submit" value="Search" name="admin_account_search_button" class="indigo btn-small">
                    </div>
                </form>
                <div class="button_wrapper">
                    <?php if ($detect->isMobile() && !$detect->isTable()) : ?>
                        <a href="http://localhost:3000/mobile/create_officer_account.php" class="btn-small">Create Officer Account</a>
                    <?php else : ?>
                        <a href="http://localhost:3000/admin_panel.php?modal=createOfficer&section=accounts" class="btn indigo">Create Officer Account</a>
                    <?php endif; ?>
                </div>
            </div>
            <?php if (count($accounts) > 0) : ?>
                <ul class="col m10 pull-m1 l10 pull-l1">
                    <li class="account_entry entry_titles">
                        <a href="#">

                            <div>
                                <h5>Username</h5>
                            </div>
                            <div>
                                <h5>ID</h5>
                            </div>
                        </a>
                    </li>
                    <?php for ($i = 0; $i < count($accounts); $i++) : ?>
                        <li class=" account_entry" data-search-username=<?php echo $accounts[$i]->username; ?> data-search-email=<?php echo '"' . $accounts[$i]->contacts[0]->contact_value . '"'; ?> data-entry-id=<?php echo $accounts[$i]->id; ?>>
                            <?php
                            $view_account_href = '';

                            if ($detect->isMobile()) {
                                $view_account_href = 'http://localhost:3000/mobile/view_account_details.php?accountId=' . $accounts[$i]->id;
                            } else {
                                $view_account_href = 'http://localhost:3000/admin_panel.php?section=accounts&model=viewAccount&accountId=' . $accounts[$i]->id;
                            }
                            ?>
                            <a href=<?php echo $view_account_href; ?>>
                                <div>
                                    <h6><?php echo ucwords($accounts[$i]->username) ?></h6>
                                </div>
                                <div>
                                    <h6><?php echo ucwords($accounts[$i]->id) ?></h6>
                                </div>
                            </a>
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
include "./components/footer.php";
?>