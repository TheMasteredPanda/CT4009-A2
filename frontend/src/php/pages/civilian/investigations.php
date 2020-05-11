<?php
include "../../components/header.php";
include "../../components/navbar.php";
include "../../functions/investigation_functions.php";

$investigations = getAllUserInvestigations()->ids;
?>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>

<div class="investigations_container">
    <?php if (count($investigations) === 0) : ?>
        <div class="no_investigations_container">
            <h4>No Investigations</h4>
        </div>
    <?php else : ?>
        <div class="investigations_list_container container">
            <div class="investigations_list_search">
                <div class="switch center-align">
                    <label>
                        Open
                        <input type="checkbox">
                        <span class="lever"></span>
                        Closed
                    </label>
                </div>
            </div>
            <div class="investigations">
                <?php for ($i = 0; $i < count($investigations); $i++) :
                    $investigation = getInvestigation($investigations[$i])->investigation; ?>
                    <div class="card">
                        <div class="card-content">
                            <span class="card-title">
                                <?php echo 'Investigation on Report ' . $investigation->report_id ?>
                            </span>
                        </div>
                        <div class="card-action">
                            <a href="#" class="btn">View Report</a>
                            <?php if ($detect->isMobile()) : ?>
                                <a href=<?php echo "http://localhost:3000/pages/civilian/mobile/view_investigation.php?investigationId=" . $investigation->id; ?> class="btn-small">View Investigation</a>
                            <?php else : ?>
                                <a href=<?php echo 'http://localhost:3000/pages/civilian/investigations.php?model=viewInvestigation&investigationId=' . $investigation->id; ?> class="btn-small">View Investigation</a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endfor; ?>
            </div>
        </div>
    <?php endif; ?>
</div>
<?php
include "../../components/footer.php";
?>