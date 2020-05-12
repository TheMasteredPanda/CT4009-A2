<?php
include "../../../components/header.php";
include "../../../components/navbar.php";
include "../../../functions/investigation_functions.php";
include "../../../functions/user_functions.php";
$investigation = getInvestigation($_GET['investigationId'])->investigation;
?>

<div class="view_investigation_container container">
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
                    <li>
                        <div class="author"><?php echo getUsername($update->author); ?></div>
                        <div class="content"><?php echo $update->content; ?></div>
                    </li>
                <?php endfor; ?>

            <?php endif; ?>
        </ul>
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
                        <div class="author"><?php echo $username; ?></div>
                        <div class="comment"><?php echo $comment->comment; ?></div>
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