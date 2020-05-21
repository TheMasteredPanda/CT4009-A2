<?php
include "./components/header.php";
include "./components/navbar.php";
include "./functions/investigation_functions.php";

if (!isset($_POST['search_result'])) {
    if ($rank === 'civilian') {
        $investigations = getAllUserInvestigations();
    } else {
        $investigations = getAllInvestigations();
    }
} else {
$investigations = json_decode($_POST['search_result'])->ids;
}

print_r($result);

$userId = json_decode($_COOKIE['ct4009Auth'])->id;

if (isset($_GET['modal'])) :
    $modal = $_GET['modal'];
?>
    <?php if ($modal === 'viewInvestigation' && isset($_GET['investigationId'])) :
        $investigation = getInvestigation($_GET['investigationId']);
        $isInvestigator = isInvestigator($investigation, $userId);
        $investigationStatus = 'Open';
        if (!$investigation->open) {
            $investigationStatus = 'Closed';
        } ?>
        <div class="modal" id="viewInvestigation">
            <div class="modal-content">
                <div class="modal_view_investigation_container">
                    <div class="updates_container">
                        <div class="updates_container_header">
                            <h4>Updates</h4>
                        </div>
                        <ul class="updates row">
                            <?php if (count($investigation->updates) === 0) : ?>
                                <li class="center-align no_updates_container">
                                    <h4>No Updates</h4>
                                </li>
                            <?php else : ?>
                                <?php for ($i = 0; $i  < count($investigation->updates); $i++) :
                                    $update = $investigation->updates[$i];
                                ?>
                                    <li class="update col m12">
                                        <h5 class="author m6"><?php echo getUsername($update->author); ?></h5>
                                        <p class="content"><?php echo $update->content; ?></p>
                                        <?php if (count($update->images) > 0) : ?>
                                            <h5 class="center-align">Evidence</h5>
                                            <ul class="images col m12">
                                                <?php for ($i = 0; $i < count($update->images); $i++) : ?>
                                                    <li class="image">
                                                        <img src=<?php echo 'http://localhost:5555/' . $update->images[$i]->uri; ?> class="materialboxed" width="150">
                                                    </li>
                                                <?php endfor; ?>
                                            </ul>
                                        <?php endif; ?>
                                        <h6 class="update_date right-align"><?php echo $update->createdAt; ?></h6>
                                    </li>
                                <?php endfor; ?>
                            <?php endif; ?>
                        </ul>
                        <?php if ($rank !== 'civilian' && ($isInvestigator || $rank === 'police_admin') && $investigation->open) : ?>
                            <div class="button_wrapper">
                                <a href=<?php echo 'http://localhost:3000/investigations.php?investigationId=' . $investigation->id . '&modal=addUpdate'; ?> class="btn">Add Update</a>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div class="comments_container row">
                        <div class="comments_container_header col m12">
                            <h4>Comments</h4>
                        </div>
                        <ul class="comments col m12">
                            <?php if (count($investigation->comments) === 0) : ?>
                                <li class="center-align no_comments_container">
                                    <h4>No Comments</h4>
                                </li>
                            <?php else : ?>
                                <?php for ($i = 0; $i < count($investigation->comments); $i++) :
                                    $comment = $investigation->comments[$i];
                                    $username = getUsername($comment->author);
                                ?>
                                    <li class="comment col m12">
                                        <h5 class="author"><?php echo $username; ?></h5>
                                        <p class="content"><?php echo $comment->comment; ?></p>
                                        <h6 class="comment_date right-align"><?php echo $comment->createdAt; ?></h6>
                                    </li>
                                <?php endfor; ?>
                            <?php endif; ?>
                        </ul>
                        <?php if ($investigation->open) : ?>
                            <form action="http://localhost:3000/actions/create_investigation_comment.php" class="create_comment_form col m12">
                                <div class="input-field">
                                    <input type="text" name="comment">
                                    <label for="comment">Comment</label>
                                </div>
                                <div class="button_wrapper">
                                    <input type="submit" value="Send" class="btn">
                                </div>
                            </form>
                        <?php endif; ?>
                    </div>
                    <div class="investigation_metadata_container row">
                        <div class="metadata_container_title col m12">
                            <h4>Metadata</h4>
                        </div>
                        <div class="metadata col m12">
                            <input type="text" name="start_date" value=<?php echo $investigation->createdAt; ?> readonly>
                            <label for="start_date">Start Date</label>
                            <input type="text" name="open" value=<?php echo $investigationStatus; ?> readonly>
                            <label for="open">Investigation Status</label>
                        </div>
                        <div class="metadata_container_title col m12">
                            <h4>Investigators</h4>
                        </div>
                        <div class="investigators_list col m12">
                            <ul class="investigators">
                                <?php for ($i = 0; $i < count($investigation->investigators); $i++) :
                                    $username = getUsername($investigation->investigators[$i]->investigator_id);
                                ?>
                                    <li class="investigator row">
                                        <div class="username_wrapper col m8">
                                            <h5><?php echo ucfirst($username); ?></h5>
                                        </div>
                                        <?php if (count($investigation->investigators) > 1 && $rank === 'police_admin' && $investigation->open) : ?>
                                            <div class="button_wrapper col m4">
                                                <a name="remove_investigator_button" data-investigator=<?php echo $investigation->investigators[$i]->id; ?> href='#' class="btn-small indigo">Remove</a>
                                            </div>
                                        <?php endif; ?>
                                    </li>
                                <?php endfor; ?>
                            </ul>
                            <?php if ($rank === 'police_admin' && $investigation->open) : ?>
                                <form action="#" class="add_investigator_form">
                                    <div class="input-field">
                                        <input type="text" name="add_investigator_name" class="validate">
                                        <label for="add_investigator_name">Police Officer Name</label>
                                    </div>
                                    <div class="button_wrapper">
                                        <input type="submit" value="Add" class="btn-small" name="add_investigator_button">
                                    </div>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="button_wrapper">
                        <?php if ($detect->isMobile()) : ?>
                            <a href=<?php echo 'http://localhost:3000/mobile/view_report.php?reportId=' . $investigation->report_id; ?> class="btn">View Report</a>
                        <?php else : ?>
                            <a href=<?php echo 'http://localhost:3000/reports.php?model=viewReport&reportId=' . $investigation->report_id; ?> class="btn">View Report</a>
                        <?php endif; ?>
                        <?php if (($rank === 'police_admin' || $isInvestigator) && $investigation->open) : ?>
                            <a href=<?php echo 'http://localhost:3000/actions/close_investigation.php?investigationId=' . $investigation->id; ?> class="btn">Close</a>
                        <?php endif; ?>
                        <a href='http://localhost:3000/investigations.php' class="btn">Back</a>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
    <?php if ($modal === 'addUpdate' && isset($_GET['investigationId'])) : ?>
        <div class="modal" id="addUpdate">
            <div class="modal-content">
                <form action=<?php echo 'http://localhost:3000/actions/create_investigation_update.php?investigationId=' . $_GET['investigationId']; ?> method="post" class="add_investigation_update_form row" enctype="multipart/form-data">
                    <div class="input-field col m12">
                        <textarea name="update_description" class="materialize-textarea validate" rows="5" required></textarea>
                        <label for="update_description">Description</label>
                    </div>
                    <div class="input-field file-field col m12">
                        <div class="btn indigo">
                            <span>Evidence</span>
                            <input name="evidence[]" type="file" multiple>
                        </div>
                        <div class="file-path-wrapper">
                            <input type="text" class="file-path" type="text" placeholder="Upload evidence.">
                        </div>
                    </div>
                    <div class="button_wrapper col m12">
                        <input type="submit" name="create_investigation_update_button" class="btn indigo" value="Add Update">
                        <a href=<?php echo 'http://localhost:3000/investigations.php?modal=viewInvestigation&investigationId=' . $_GET['investigationId']; ?> class="btn indigo">Back</a>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>
<?php endif; ?>

<div class="investigations_container">
    <?php if (count($investigations) === 0 && !isset($_POST['search_result'])) : ?>
        <div class="no_investigations_container">
            <h4>No Investigations</h4>
        </div>
    <?php else : ?>
        <div class="investigations_list_container row">
            <div class="investigations_list_search col m10 push-m1 l10 push-l1">
                <form action="http://localhost:3000/actions/search_investigations.php" class="search_investigations_form">
                    <?php if ($rank !== 'civilian') : ?>
                        <div class="input-field col m10 l10 push-m1 push-l1">
                            <input type="text" name="report_author">
                            <label for="report_author">Report Author</label>
                        </div>
                    <?php endif; ?>
                    <div class="switch center-align col m10 l10 push-m1 push-l1">
                        <label>
                            Open
                            <input type="checkbox" name="search_by_open">
                            <span class="lever"></span>
                            Closed
                        </label>
                    </div>
                    <div class="button_wrapper col m12 l12">
                        <input type="submit" value="Search" name="investigations_search_button" class="btn-small">
                    </div>
                </form>
            </div>
            <div class="investigations col m12 l12 s12">
                <?php for ($i = 0; $i < count($investigations); $i++) :
                    $investigation = getInvestigation($investigations[$i]);
                ?>
                    <div class="card">
                        <div class="card-content">
                            <span class="card-title">
                                <?php if ($investigation->open) : ?>
                                    <?php echo 'Investigation on Report ' . $investigation->report_id; ?>
                                <?php else : ?>
                                    <?php echo 'Investigation on Report ' . $investigation->report_id . ' (Closed)'; ?>
                                <?php endif; ?>
                            </span>
                        </div>
                        <div class="card-action">
                            <?php if ($detect->isMobile()) : ?>
                                <a href=<?php echo 'http://localhost:3000/mobile/view_investigation.php?investigationId=' . $investigation->id; ?> class="btn-small">View Investigation</a>
                            <?php else : ?>
                                <a href=<?php echo 'http://localhost:3000/investigations.php?modal=viewInvestigation&investigationId=' . $investigation->id; ?> class="btn-small">View Investigation</a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endfor; ?>
            </div>
        </div>
    <?php endif; ?>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/investigations.bundle.js"></script>
<?php
include "./components/footer.php"
?>