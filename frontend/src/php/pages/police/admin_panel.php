<?php
include "../../components/header.php";
include "../../components/navbar.php";
include "../../components/police_auth_header.php";

if ($rank !== 'police_admin') {
    header('Locatin: /index.php');
}

?>

<div class="admin_panel_contianer">

</div>

<?php
include "../../components/footer.php";
?>