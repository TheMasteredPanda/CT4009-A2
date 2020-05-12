<?php
include "../../../components/header.php";
include "../../../components/police_auth_header.php";
include "../../../components/navbar.php";
?>

<div class="add_investigation_update_container">
    <form action=<?php echo "http://localhost:3000/actions/create_investigation_update.php?investigationId=" . $_GET['investigationId'] ?> class="add_investigation_update_form container" method="POST" enctype="multipart/form-data">
        <div class="description_wrapper">
            <div class="input-field update_description_field">
                <textarea name="update_description" class="materialize-textarea validate" rows="5"></textarea>
                <label for="update_description">Description</label>

            </div>
        </div>
        <div class="input-field file-field">
            <div class="btn indigo">
                <span>Files</span>
                <input name="evidence[]" type="file" multiple>
            </div>
            <div class="file-path-wrapper">
                <input type="text" class="file-path" type="text" placeholder="Upload evidence.">
            </div>
        </div>
        <div class="button_wrapper">
            <input type="submit" name="create_investigation_update_button" class="btn-small" value="Add Update">
        </div>
    </form>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "../../../components/footer.php";
?>