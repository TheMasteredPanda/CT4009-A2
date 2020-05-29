<?php

use Detection\MobileDetect;

include "../functions/admin_functions.php";
include "../functions/user_functions.php";
require_once $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';
$accounts = [];
$detect = new MobileDetect();

if (isset($_POST['accounts'])) {
    global $accounts;
    $accounts = getAllAccounts($_POST['accounts']);
} else {
    $accounts = getAllAccounts([]);
}
?>

<?php if (count($accounts) > 0) : ?>
    <li class="account_entry entry_titles">
        <a href="#">

            <div>
                <h5>Username</h5>
            </div>
            <div>
                <h5>ID</h5>
            </div>
            <div>
                <h5>Rank</h5>
            </div>
            <div>
                <h5>Registered Bikes</h5>
            </div>
            <div>
                <h5>Reports</h5>
            </div>
            <div>
                <h5>Options</h5>
            </div>
        </a>
    </li>
    <?php for ($i = 0; $i < count($accounts); $i++) :
        $email = '';

        if (!empty($accounts[$i]->contacts)) {
            $email = $accounts[$i]->contacts[0]->contact_value;
        }

    ?>
        <li class=" account_entry" data-search-username=<?php echo $accounts[$i]->username; ?> data-search-email=<?php echo '"' . $email . '"'; ?> data-entry-id=<?php echo $accounts[$i]->id; ?>>
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
                    <h6><?php echo ucwords($accounts[$i]->username); ?></h6>
                </div>
                <div>
                    <h6><?php echo ucwords($accounts[$i]->id); ?></h6>
                </div>
                <div class="account_entry_rank">
                    <h6><?php echo getBadgeFor($accounts[$i]->id); ?></h6>
                </div>
                <div>
                    <h6><?php echo getRegisteredBikesCount($accounts[$i]->id) ?></h6>
                </div>
                <div>
                    <h6>
                        <?php echo getReportsCount($accounts[$i]->id); ?>
                    </h6>
                </div>
                <div class="account_entry_buttons">
                    <?php
                    $rank = getRankFor($accounts[$i]->id);

                    if ($rank === 'civilian') :
                    ?>
                        <button name="promote_user_button" data-account-id="<?php echo $accounts[$i]->id; ?>" class="btn indigo">Promote</button>
                    <?php else : ?>
                        <button name="demote_user_button" class="btn indigo" data-account-id="<?php echo $accounts[$i]->id; ?>">&nbsp;&nbsp;Demote&nbsp;</button>
                    <?php endif; ?>
                    <button name="delete_user_button" data-account-id="<?php echo $accounts[$i]->id; ?>" class="indigo btn">Delete</button>
                    <button name="change_user_password_button" data-account-id="<?php echo $accounts[$i]->id; ?>" class="indigo btn">
                        Change Password
                    </button>
                </div>
            </a>
        </li>
    <?php endfor; ?>
    </ul>
<?php else : ?>
    <div class=" row no_accounts_container">
        <h5>No Accounts Found</h5>
    </div>
<?php endif; ?>