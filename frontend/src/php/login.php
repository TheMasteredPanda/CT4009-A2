<?php include './components/header.php';
$login = true;
$forgotCreds = false;

if (isset($_POST['login'])) {
    $GLOBALS['login'] = $_POST['login'];
}

if (isset($_POST['forgotCreds'])) {
    $GLOBALS['forgotCreds'] = $_POST['forgotCreds'];
}

include "./actions/login.php";
include "./actions/register.php";
?>

<div class="valign-wrapper row login_or_register_container">
    <?php if ($login) : ?>
        <?php if ($forgotCreds) : ?>
            <?php if ($forgotCredsType === 0) : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form_1 col s10 pull-s1 valign m6 pull-m3 l4 pull-l4 z-depth-2">
                    <input type="hidden" name="forgotCreds" value=true>
                </form>
            <?php elseif ($forgotCredsType === 1) : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form_2 col s10 pull-s1 valign l4 m6 pull-m3 pull-l4 z-depth-2">
                    <input type="hidden" name="forgotCreds" value=true>
                </form>
            <?php elseif ($forgotCresType === 2) : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form_3 col s10 pull-s1 valign l4 m6 pull-m3 pull-l4 z-depth-2">
                    <input type="hidden" name="forgotCreds" value=true>
                </form>
            <?php else : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form col s10 pull-s1 valign l4 m6 pull-m3 pull-l4 z-depth-2">
                    <h5 class="center-align">What have you Forgotten?</h5>
                    <span class="forgot_creds_button_wrapper">
                        <input type="hidden" name="forgotCreds" value=true>
                        <input type="submit" name="forgot_email_button" class="btn grey darken-3" value="Forgot Email Address">
                        <input type="submit" name="forgot_password_button" class="btn grey darken-3" value="Forgot Password">
                        <input type="submit" name="forgot_username_button" class="btn grey darken-3" value="Forgot Username">
                        <a href="#" name="forgot_creds_back_button">I misclicked, take me back!</a>
                    </span>
                </form>
            <?php endif; ?>
        <?php else : ?>
            <form action="/login.php" method="POST" class="login_form col s10 pull-s1 valign l4 pull-l4 m6 pull-m3 z-depth-3">
                <div class="input-field">
                    <input type="text" class="validate" name="username" placeholder="Username" required>
                    <span class="helper-text" for="username" data-error="Username is required."></span>
                </div>
                <div class="input-field">
                    <input type="password" name="password" class="validate" placeholder="Password" class="grey-text" required>
                    <span class="helper-text" for="password" data-error="Password is required."></span>
                </div>
                <span class="center-align">
                    <input type="submit" value="Login" class="btn-small grey darken-3" name="login_submit_form">
                    <div class="login_footer_hrefs">
                        <a name="forgot_creds_button" href="#">Forgot Credentials?</a>
                        <a name="create_account_button" href="#">Don't have an account?</a>
                    </div>
                </span>
            </form>
        <?php endif; ?>
    <?php else : ?>
        <form action="/login.php" method="POST" class="register_form col s10 pull-s1 m6 pull-m3 valign l4 pull-l4 z-depth-2">
            <div class="input-field">
                <input type="text" class="validate" name="username" placeholder="Username" required> <!-- https://stackoverflow.com/questions/16334765/regular-expression-for-not-allowing-spaces-in-the-input-field -->
                <span class="helper-text" for="username" data-error="Requires a value with no spaces.">A value with no spaces.</span>
            </div>
            <div class="input-field">
                <input type="password" class="validate" name="password" placeholder="Password" pattern="^(?=.*\d).{8,16}$" required> <!--  http://regexlib.com/(X(1)A(PZ0vAdFfntVUDCbw1Bqy7gQoU2soqxaChFl-wLE5HnQ9yXkhg548y5yz8b4Wf8TAheMJ2iwo5v3_6CrGmKfgNhx4mk7MTPfYfBC0v8al9KJDrspZ3Wi7EDcrxTZs5k8IGCyJzdv09LFtnL9csSg1q-jvUBFIRH0GiilDBK8VCBRx0THTNhLFeYxjFKiF9lPt0))/REDetails.aspx?regexp_id=30 -->
                <span class="helper-text" for="password" data-error="Password must be between 8 and 16 characters with at least one digit (0-9)">Password must be between 8 and 16 characters long with at least one digit (0-9).</span>
            </div>
            <div class="input-field">
                <input type="password" class="validate" id="passwordRetypeId" name="passwordRetype" placeholder="Retype Password" required>
                <span class="helper-text" for="passwordRetype" data-error="Password does not match">Retype of the password.</span>
            </div>
            <div class="input-field">
                <input type="email" name="email" class="validate" placeholder="Email Address" required>
                <span class="helper-text" for="email" data-error="Requires a value formatted as an email address.">Requires a value formatted as an email address.</span>
            </div>
            <span class="center-align register_form_footer s10">
                <input type="submit" name="submit_register_form" value="Register" class="btn-small grey darken-3">
                <span class="register_footer_hrefs">
                    <a href="#" name="log_into_account_button">Already have an account? Login.</a>
                </span>
            </span>
        </form>
    <?php endif; ?>
</div>

<script type="text/javascript" src="http://localhost:3000/scripts/login.bundle.js"></script>
<?php include('./components/footer.php'); ?>