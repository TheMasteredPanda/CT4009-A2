<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
include "../../../functions/investigation_functions.php";
include "../../../functions/user_functions.php";
$investigation = getInvestigation($_GET['investigationId'])->investigation;
?>

<div class="police_view_investigation_container container">
    <div class="updates_container">
        <div class="updates_container_header">
            <h4>Updates</h4>
        </div>
        <ul class="updates">
            <?php if (count($investigation->updates) === 0) : ?>
                <li class="center-align no_updates_container">
                    <h5>No Updates</h5>
                </li>
            <?php else : ?>
                <?php for ($i = 0; $i  < count($investigation->updates); $i++) :
                    $update = $investigation->updates[$i]; ?>
                    <li class="update">
                        <div class="container">
                            <h6 class="author"><?php echo getUsername($update->author); ?></h6>
                            <p class="content"><?php echo $update->content; ?></p>
                            <?php if (count($update->images) > 0) : ?>
                                <div class="button_wrapper">
                                    <?php if ($detect->isMobile()) : ?>
                                        <a href=<?php echo 'http://localhost:3000/pages/police/mobile/view_update_evidence.php?investigationId=' . $investigation->id . '&updateId=' . $update->id; ?> class="btn-small">View Evidence</a>
                                    <?php else : ?>
                                        <a href=<?php echo 'http://localhost:3000/pages/police/investigations.php?investigationId=' . $investigation->id . '&updateId=' . $update->id; ?>>View Evidence</a>
                                    <?php endif; ?>

                                </div>
                            <?php endif; ?>
                            <h6 class="right-align"><?php echo $update->createdAt; ?></h6>
                        </div>
                    </li>
                <?php endfor; ?>

            <?php endif; ?>
        </ul>
        <div class="button_wrapper">
            <a href=<?php echo "http://localhost:3000/pages/police/mobile/add_investigation_update.php?investigationId=" . $investigation->id; ?> class="btn-small">Add Update</a>
        </div>
    </div>
    <div class="comments_container">
        <div class="comments_container_header">
            <h4>Comments</h4>
        </div>
        <ul class="comments">
            <?php if (count($investigation->comments) === 0) : ?>
                <li class="center-align no_comments_container">
                    <h5>No Comments</h5>
                </li>
            <?php else : ?>
                <?php for ($i = 0; $i < count($investigation->comments); $i++) :
                    $comment = $investigation->comments[$i];
                    $username = getUsername($comment->author);
                ?>
                    <li class="comment">
                        <div class="container">
                            <h6 class="author"><?php echo $username; ?></h6>
                            <p class="comment"><?php echo $comment->comment; ?></p>
                            <h6 class="right-align"><?php echo $comment->createdAt; ?></h6>
                        </div>
                    </li>
                <?php endfor; ?>
            <?php endif; ?>
        </ul>
        <form action="#" class="create_comment_form">
            <div class="input-field">

                <input type="text" name="comment">
                <label for="comment">Comment</label>
            </div>
            <input type="submit" value="Send" class="btn-small">
        </form>
    </div>
    <div class="investigation_metadata_container">
        <div class="metadata_container_title">
            <h4>Metadata</h4>
        </div>
        <div class="metadata">
            <input type="text" name="start_date">
            <input type="text" name="duration">
            <input type="text" name="last_update">
        </div>
        <div class="metadata_container_title">
            <h4>Investigators</h4>
        </div>
        <div class="investigators_list">
            <ul class="investigators">
                <?php for ($i = 0; $i < count($investigation->investigators); $i++) :
                    $username = getUsername($investigation->investigators[$i]);
                ?>
                    <li class="investigator">
                        <div class="username_wrapper">
                            <h5><?php echo $username ?></h5>
                        </div>
                        <?php if (count($investigation->investigators) > 1) : ?>
                            <div class="button_wrapper">
                                <a href=<?php echo "http://localhost:3000/actions/remove_investigator.php?investigationId=" . $investigation->id . '&investigatorId=' . $investigation->investigator[$i]; ?> class="btn-small">Remove</a>
                            </div>
                        <?php endif; ?>
                    </li>
                <?php endfor; ?>
            </ul>
            <form action="#" class="add_investigator_form">
                <div class="input-field">
                    <input type="text" name="add_investigator_name" class="validate">
                    <label for="add_investigator_name">Police Officer Name</label>
                </div>
                <input type="submit" value="Add" class="btn-small" name="add_investigator_button">
            </form>
        </div>
    </div>
    <div class="button_wrapper">
        <a href="#" class="btn-small indigo">View Report</a>
    </div>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/home.bundle.js"></script>
<script type="text/javascript" src="http://localhost:3000/scripts/investigations.bundle.js"></script>
<?php
include "../../../components/footer.php";
?>