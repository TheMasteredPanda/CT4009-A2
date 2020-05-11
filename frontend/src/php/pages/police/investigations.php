<?php
include "../../components/header.php";
include "../../components/navbar.php";
include "../../components/police_auth_header.php";
include "../../functions/investigation_functions.php";

$investigations = getAllInvestigations()->ids;
?>

<div class="police_investigations_container">
    <?php if (count($investigations) === 0) : ?>
        <div class="no_investigations_container">
            <h4>No Investigations</h4>
        </div>
    <?php else : ?>
        <div class="investigations_list_container">
            <div class="investigations_list_search">
                <form action="#" method="POST">
                    <div class="input-field">
                        <input type="text" name="report_author">
                        <label for="report_author">Report Author</label>
                    </div>
                    <div class="switch">
                        <label>
                            Open
                            <input type="checkbox">
                            <span class="lever"></span>
                            Closed
                        </label>
                    </div>
                </form>
            </div>
            <div class="investigations">
                <?php for ($i = 0; $i < count($investigations); $i++) :
                    $investigation = getInvestigation(($investigations[$i])) ?>
                    <div class="card">
                        <div class="card-content">
                            <span class="card-title">
                                <?php echo 'Investigation on Report ' . $investigation->report_id; ?>
                            </span>
                        </div>
                        <div class="card-action">
                            <a href="#" class="btn">View Report</a>
                            <a href="#" class="btn">View Investigation</a>
                        </div>
                    </div>
                <?php endfor; ?>
            </div>
        </div>
    <?php endif; ?>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<?php
include "../../components/footer.php";
?>