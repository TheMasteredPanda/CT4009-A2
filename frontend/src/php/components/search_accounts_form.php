<?php

if (!empty($_POST['options'])) {
    $options = $_POST['options'];
} else {
    $options = array();
}
if (!empty($options)) : ?>
    <?php if (in_array('rank', $options)) : ?>
        <div class="input-field">
            <select name="search_by_rank">
                <option value="civilian" selected>Civilian</option>
                <option value="police_officer">Officer</option>
                <option value="police_admin">Admin</option>
            </select>
            <label for="search_by_rank">By Rank</label>
        </div>
    <?php endif; ?>
    <?php if (in_array('id', $options)) : ?>
        <div class="input-field">
            <input type="text" name="search_by_id">
            <label for="search_by_id">By ID</label>
        </div>
    <?php endif; ?>
    <?php if (in_array('username', $options)) : ?>
        <div class="input-field">
            <input type="text" name="search_by_username">
            <label for="search_by_username">By Username</label>
        </div>
    <?php endif; ?>
<?php endif; ?>
<?php if ($_POST['button']) : ?>
    <div class="search_accounts_button_wrapper">
        <input type="submit" value="Search" name="admin_account_search_button" class="indigo btn-small">
    </div>
<?php endif; ?>