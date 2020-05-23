<?php
include "../components/header.php";
include "../components/navbar.php";
include "../functions/investigation_functions.php";
$userId = json_decode($_COOKIE['ct4009Auth'])->id;
$investigation = getInvestigation($_GET['investigationId']);
$investigatorIds = array_map(function ($investigator) {
    return $investigator->investigator_id;
}, $investigation->investigators);
$isInvestigator = in_array($userId, $investigatorIds);
$investigationStatus = 'Open';
$type = 'civilian';

if (isset($_GET['type'])) {
    $type = $_GET['type'];
}

$comments = getInvestigationComments($investigation->id, $type);

if (!$investigation->open) {
    $investigationStatus = 'Closed';
}
?>

<div class="view_investigation_container row">
    <div class="updates_container col s12">
        <h4 class="center-align">Updates</h4>
        <ul class="updates">
            <?php if (count($investigation->updates) === 0) : ?>
                <li class="center-align no_updates_container">
                    <h5>No Updates</h5>
                </li>
            <?php else : ?>
                <?php for ($i = 0; $i  < count($investigation->updates); $i++) :
                    $update = $investigation->updates[$i]; ?>
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

                                <?php if (count($update->images) > 0) : ?>
                                    <h5 class="center-align">Evidence</h5>
                                    <ul class="images">
                                        <?php for ($i = 0; $i < count($update->images); $i++) :
                                            $image = $update->images[$i]; ?>
                                            <li class="image"><img class="materialboxed" src=<?php echo 'http://localhost:5555/' . $image->uri; ?>></img></li>
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
                <a href=<?php echo 'http://localhost:3000/mobile/add_investigation_update.php?investigationId=' . $investigation->id; ?> class="btn-small">Add Update</a>
            </div>
        <?php endif; ?>
    </div>
    <?php if ($rank === 'civilian') : ?>
        <div class="comments_container civilian_comments_container col s12">
        <?php else : ?>
            <div class="comments_container police_comments_container col s12">
            <?php endif; ?>
            <div class="comments_container_header">
                <h4 class="center-align">Comments</h4>
            </div>
            <?php if ($rank !== 'civilian') : ?>
                <div class="comment_buttons">
                    <a name="civilian_comments_button" href=<?php echo 'http://localhost:3000/mobile/view_investigation.php?investigationId=' . $investigation->id  . '&type=civilian'; ?> class="btn-small indigo">Civilian</a>
                    <a name="police_comments_button" href=<?php echo 'http://localhost:3000/mobile/view_investigation.php?investigationId=' . $investigation->id . '&type=investigators'; ?> class="btn-small indigo">Investigators</a>
                </div>
            <?php endif; ?>
            <ul class="comments">
                <?php if (count($comments) === 0) : ?>
                    <li class="center-align no_comments_container">
                        <h5>No Comments</h5>
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
                                    <div class="author"><?php echo $username ?></div>
                                    <div><?php echo getBadgeFor($comment->author); ?></div>
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
                                    <div class="date"><?php echo date('H:i, D j, M Y', strtotime($comment->createdAt)) ?></div>
                                </div>
                            </div>
                            </li>
                        <?php endfor; ?>
                    <?php endif; ?>
            </ul>
            <?php if ($investigation->open) : ?>
                <form action="#" class="create_comment_form">
                    <div class="input-field">

                        <input type="text" name="comment">
                        <label for="comment">Comment</label>
                    </div>
                    <input type="submit" value="Send" class="btn-small">
                </form>
            <?php endif; ?>
            </div>
            <div class="investigation_metadata_container col s12">
                <h4 class="center-align col s12">Metadata</h4>
                <div class="metadata col s12">
                    <input type="text" name="start_date" value=<?php echo '"' . date('H:i, D j, M Y', strtotime($investigation->createdAt)) . '"'; ?> readonly>
                    <label for="start_date">Start Date</label>
                    <input type="text" name="open" value=<?php echo $investigationStatus; ?> readonly>
                    <label for="open">Investigation Status</label>
                </div>
                <h4 class="center-align col s12">Investigators</h4>
                <div class="investigators_list col s12">
                    <ul class="investigators">
                        <?php for ($i = 0; $i < count($investigation->investigators); $i++) :
                            $username = getUsername($investigation->investigators[$i]->investigator_id);
                        ?>
                            <li class="investigator">
                                <div class="username_wrapper">
                                    <h5><?php echo ucfirst($username); ?></h5>
                                    <div><?php echo getBadgeFor($investigation->investigators[$i]->investigator_id); ?></div>
                                </div>
                                <?php if (count($investigation->investigators) > 1 && $rank === 'police_admin' && $investigation->open) : ?>
                                    <div class="button_wrapper">
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
                            <input type="submit" value="Add" class="btn-small" name="add_investigator_button">
                        </form>
                    <?php endif; ?>
                </div>
            </div>
            <div class="button_wrapper col s12">
                <?php if ($detect->isMobile()) : ?>
                    <a href=<?php echo 'http://localhost:3000/mobile/view_report.php?reportId=' . $investigation->report_id; ?> class="btn-small">View Report</a>
                <?php else : ?>
                    <a href=<?php echo 'http://localhost:3000/reports.php?model=viewReport&reportId=' . $investigation->report_id; ?> class="btn-small">View Report</a>
                <?php endif; ?>
                <?php if (($rank === 'police_admin' || $isInvestigator) && $investigation->open) : ?>
                    <a href=<?php echo 'http://localhost:3000/actions/close_investigation.php?investigationId=' . $investigation->id; ?> class="btn-small">Close</a>
                <?php endif; ?>
                <a href='http://localhost:3000/investigations.php' class="btn-small">Back</a>
            </div>
        </div>

        <script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
        <script type="text/javascript" src="http://localhost:3000/scripts/investigations.bundle.js"></script>
        <?php
        include "../components/footer.php";
        ?>