<?php
include "./components/header.php";
include "./components/navbar.php";
include "./functions/investigation_functions.php";
include "./functions/report_functions.php";

if (!isset($_POST['search_result'])) {
    if ($rank === 'civilian') {
        $investigations = getAllUserInvestigations();
    } else {
        $investigations = getAllInvestigations();
    }
} else {
    $investigations = json_decode($_POST['search_result'])->ids;
}

$searchParams = $_POST['search_params'];

$userId = json_decode($_COOKIE['ct4009Auth'])->id;

if (isset($_GET['modal'])) :
    $modal = $_GET['modal'];
?>
    <?php if ($modal === 'viewInvestigation' && isset($_GET['investigationId'])) :
        $investigation = getInvestigation($_GET['investigationId']);
        $type = 'civilian';

        if (isset($_GET['type'])) {
            $type = $_GET['type'];
        }

        $comments = getInvestigationComments($_GET['investigationId'], $type);
        $investigatorIds = array_map(function ($investigator) {
            return $investigator->investigator_id;
        }, $investigation->investigators);

        $investigationStatus = 'Open';
        if (!$investigation->open) {
            $investigationStatus = 'Closed';
        } ?>
        <div class="modal" id="viewInvestigation">
            <div class="modal-content">
                <div class="view_investigation_container row">
                    <div class="updates_container col m12 l12">
                        <h4 class="center-align">Updates</h4>
                        <ul class="updates">
                            <?php if (count($investigation->updates) === 0) : ?>
                                <li class="center-align no_updates_container">
                                    <h4>No Updates</h4>
                                </li>
                            <?php else : ?>
                                <?php for ($i = 0; $i  < count($investigation->updates); $i++) :
                                    $update = $investigation->updates[$i];
                                ?>
                                    <li class="update">
                                        <div class="update_content_wrapper">
                                            <div class="update_header">
                                                <div><?php echo getUsername($update->author); ?></div>
                                                <div><?php echo getBadgeFor($update->author); ?></div>
                                                <?php if (in_array($update->author, $investigatorIds)) : ?>
                                                    <div><span class="white-text indigo accent-1 badge">Investigator</span></div>
                                                <?php endif; ?>
                                            </div>
                                            <div class="update_content">
                                                <p><?php echo $update->content; ?></p>
                                                <?php if (count($update->images)) : ?>
                                                    <h5 class="center-align">Evidence</h5>
                                                    <ul class="images">
                                                        <?php for ($i = 0; $i < count($update->images); $i++) :
                                                            $image = $update->images[$i];
                                                        ?>
                                                            <li class="image"><img src=<?php echo 'http://localhost:5555/' . $image->uri; ?> class="materialboxed"></li>
                                                        <?php endfor; ?>
                                                    </ul>
                                                <?php endif; ?>
                                            </div>
                                            <div class="update_footer">
                                                <div><?php echo date('H:i, D j, M Y', strtotime($update->createdAt)); ?></div>
                                            </div>
                                        </div>
                                    </li>
                                <?php endfor; ?>
                            <?php endif; ?>
                        </ul>
                        <?php if ($rank !== 'civilian' && ($isInvestigator || $rank === 'police_admin') && $investigation->open) : ?>
                            <div class="button_wrapper">
                                <a href=<?php echo 'http://localhost:3000/investigations.php?investigationId=' . $investigation->id . '&modal=addUpdate'; ?> class=<? '"' . getButtonType() . '"' ?>>Add Update</a>
                            </div>
                        <?php endif; ?>
                    </div>
                    <?php if ($rank === 'civilian') : ?>
                        <div class="comments_container civilian_comments_container col m12 l12">
                        <?php else : ?>
                            <div class="comments_container police_comments_container col m12 l12">
                            <?php endif; ?>
                            <div class="comments_container_header">
                                <h4 class="center-align">Comments</h4>
                            </div>
                            <?php if ($rank !== 'civilian') : ?>
                                <div class="comments_buttons">
                                    <a href=<?php echo 'http://loclhoast:3000/investigations.php?modal=viewInvestigation&investigationId=' . $_GET['investigationId'] . '&type=civilian'; ?> name="civilian_comments_button" class="<?php echo getButtonType() ?> indigo">Civilian</a>
                                    <a href=<?php echo 'http://localhost:3000/investigations.php?modal=viewInvestigation&investigationId=' . $_GET['investigationId'] . '&type=investigators'; ?> name="police_comments_button" class="<?php echo getButtonType() ?> indigo">Investigators</a>
                                </div>
                            <?php endif; ?>
                            <ul class="comments col m12">
                                <?php if (count($comments) === 0) : ?>
                                    <li class="center-align no_comments_container">
                                        <h4>No Comments</h4>
                                    </li>
                                <?php else : ?>
                                    <?php for ($i = 0; $i < count($comments); $i++) :
                                        $comment = $comments[$i];
                                        $username = getUsername($comment->author);
                                    ?>
                                        <?php if ($comment->author === $userId) : ?>
                                            <li class="comment client_comment">
                                            <?php else : ?>
                                            <li class="comment not_client_comment">
                                            <?php endif; ?>
                                            <div class="comment_content_wrapper">
                                                <div class="comment_header">
                                                    <div class="author"><?php echo $username; ?></div>
                                                    <div><?php echo getBadgeFor($comment->author); ?>
                                                    </div>
                                                    <?php if (in_array($comment->author, $investigatorIds)) : ?>
                                                        <div><span class="white-text indigo accent-1 badge">Investigator</span></div>
                                                    <?php endif; ?>
                                                </div>
                                                <div class="comment_content">
                                                    <p>
                                                        <?php echo $comment->content; ?>
                                                    </p>
                                                </div>
                                                <div class="comment_footer">
                                                    <div class="date"><?php echo date('H:i, D j, M Y', strtotime($comment->createdAt)); ?></div>
                                                </div>
                                            </div>
                                            </li>
                                        <?php endfor; ?>
                                    <?php endif; ?>
                            </ul>
                            <?php if ($investigation->open) : ?>
                                <form action="<?php echo 'http://localhost:3000/create_investigation_comment.php?type=' . $type . '&investigationId=' . $investigation->id; ?>" class="create_comment_form">
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
                            <div class="investigation_metadata_container col m12 l12">
                                <h4 class="center-align m12 l12 col">Metadata</h4>
                                <div class="metadata col m12">
                                    <input type="text" name="start_date" value=<?php echo '"' . date('H:i, D j, M Y', strtotime($investigation->createdAt)) . '"'; ?> readonly>
                                    <label for="start_date">Start Date</label>
                                    <input type="text" name="open" value=<?php echo $investigationStatus; ?> readonly>
                                    <label for="open">Investigation Status</label>
                                </div>
                                <h4 class="center-align col m12 l12">Investigators</h4>
                                <div class="investigators_list col m12">
                                    <ul class="investigators">
                                        <?php for ($i = 0; $i < count($investigation->investigators); $i++) :
                                            $username = getUsername($investigation->investigators[$i]->investigator_id);
                                        ?>
                                            <li class="investigator">
                                                <div class="username_wrapper">
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
                            <div class="button_wrapper col m12 l12">
                                <a href=<?php echo 'http://localhost:3000/reports.php?modal=viewReport&reportId=' . $investigation->report_id . '&placeId=' . getReport($investigation->report_id)->place_id; ?> class="btn">View Report</a>
                                <?php if (($rank === 'police_admin' || $isInvestigator) && $investigation->open) : ?>
                                    <a href=<?php echo 'http://localhost:3000/actions/close_investigation.php?investigationId=' . $investigation->id; ?> class="btn">Close</a>
                                <?php endif; ?>
                                <a href='#' name="view_investigation_back_button" class="btn">Back</a>
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
                <div class="investigations_list_search col s12 m10 push-m1 l10 push-l1">
                    <form action="http://localhost:3000/actions/search_investigations.php" class="search_investigations_form">
                        <?php if ($rank !== 'civilian') : ?>
                            <div class="input-field col s12 m10 l10 push-m1 push-l1">
                                <input type="text" name="report_author" value=<?php echo '"' . $searchParams->reportAuthor . '"' ?>>
                                <label for="report_author">Report Author</label>
                            </div>
                        <?php endif; ?>
                        <div class="switch center-align col s12 m10 l10 push-m1 push-l1">
                            <label>
                                Open
                                <input type="checkbox" name="search_by_open">
                                <span class="lever"></span>
                                Closed
                            </label>
                        </div>
                        <div class="button_wrapper col s12 m12 l12">
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
                                        <?php if ($rank === 'civilian') : ?>
                                            <?php echo 'Investigation on Report ' . $investigation->report_id; ?>
                                        <?php else : ?>
                                            <?php echo 'Investigation on Report ' . $investigation->report_id . ' by ' . getUsername(getReport($investigation->report_id)->author); ?>
                                        <?php endif; ?>
                                    <?php else : ?>
                                        <?php if ($rank === 'civilian') : ?>
                                            <?php echo 'Investigation on Report ' . $investigation->report_id . ' (Closed)'; ?>
                                        <?php else : ?>
                                            <?php echo 'Investigation on Report ' . $investigation->report_id . ' (Closed) by '  . getUsername(getReport($investigation->report_id)->author); ?>
                                        <?php endif; ?>
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
    <script type="text/javascript">

    </script>
    <?php
    include "./components/footer.php"
    ?>