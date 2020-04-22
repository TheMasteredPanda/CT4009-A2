<?php include('./components/header.php');
$login = true;
$forgotCreds = false;
if (isset($_POST['login'])) {
    $GLOBALS['login'] = $_POST['login'];
}

if (isset($_POST['forgotCreds'])) {
    $GLOBALS['forgotCreds'] = $_POST['forgotCreds'];
}

if (isset($_POST['submit_register_form'])) {
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_URL, 'http:/localhost:4000/user/register');
    curl_setopt($curl, CURLOPT_POSTFIELDS, '{username: "' . $_POST['username'] . '", password: "' . $_POST['password'] . '", email: "' . $_POST['email'] . '" }');
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($result === false) {
        echo curl_error($curl);
        return;
    }

    curl_close($curl);

    setcookie('ct4009Auth', $result);
    header('Location: index.php');
}

if (isset($_POST['submit_login_form'])) {
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_URL, 'http://localhost:4000/user/login');
    curl_setopt($curl, CURLOPT_POSTFIELDS, '{username: "' . $_POST['username'] . '", password: "' . $_POST['password'] . '" }');
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    if ($result === false) {
        echo curl_error($curl);
        return;
    }

    curl_close($curl);
    setcookie('ct4009Auth', $result);
    header('Location: index.php');
}
?>

<div class="valign-wrapper row login_or_register_container">
    <?php if ($login) : ?>
        <?php if ($forgotCreds) : ?>
            <?php if ($forgotCredsType === 0) : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form_1 col s10 pull-s1 valign l4 pull-l4 z-depth-2">
                    <input type="hidden" name="forgotCreds" value=true>
                </form>
            <?php elseif ($forgotCredsType === 1) : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form_2 col s10 pull-s1 valign l4 pull-l4 z-depth-2">
                    <input type="hidden" name="forgotCreds" value=true>
                </form>
            <?php elseif ($forgotCresType === 2) : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form_3 col s10 pull-s1 valign l4 pull-l4 z-depth-2">
                    <input type="hidden" name="forgotCreds" value=true>
                </form>
            <?php else : ?>
                <form action="/login.php" method="POST" class="forgot_creds_form col s10 pull-s1 valign l4 pull-l4 z-depth-2">
                    <h5 class="center-align">What have you Forgotten?</h5>
                    <span class="forgot_creds_button_wrapper">
                        <input type="hidden" name="forgotCreds" value=true>
                        <input type="submit" name="forgot_email_button" class="btn grey darken-3" value="Forgot Email Address">
                        <input type="submit" name="forgot_password_button" class="btn grey darken-3" value="Forgot Password">
                        <input type="submit" name="forgot_username_button" class="btn grey darken-3" value="Forgot Username">
                    </span>
                </form>
            <?php endif; ?>
        <?php else : ?>
            <form action="/login.php" method="POST" class="login_form col s10 pull-s1 valign l4 pull-l4 z-depth-3">
                <div class="input-field">
                    <input type="text" name="username" placeholder="Username">
                </div>
                <div class="input-field">
                    <input type="password" name="password" placeholder="Password" class="grey-text">
                </div>
                <span class="center-align">
                    <input type="button" value="Login" class="btn-small grey darken-3">
                    <div class="login_footer_hrefs">
                        <a name="forgot_creds_button" href="#">Forgot Credentials?</a>
                        <a name="create_account_button" href="#">Don't have an account?</a>
                    </div>
                </span>
            </form>
        <?php endif; ?>
    <?php else : ?>
        <form action="/login.php" method="POST" class="register_form col s10 pull-s1 valign l4 pull-l4 z-depth-2">
            <div class="input-field">
                <input type="text" name="username" placeholder="Username">
            </div>
            <div class="input-field">
                <input type="password" name="password" placeholder="Password">
            </div>
            <div class="input-field">
                <input type="password" name="passwordRetype" placeholder="Retype Password">
            </div>
            <div class="input-field">
                <input type="email" name="email" placeholder="Email Address">
            </div>
            <span class="center-align">
                <input type="submit" name="submit_register_form" value="Register" class="btn-small grey darken-3">
                <span class="register_footer_hrefs">
                    <a href="#" name="log_into_account_button">Already have an account? Login.</a>
                </span>
            </span>
        </form>
    <?php endif; ?>
</div>
<?php include('./components/mainScript.php'); ?>
<script type="text/javascript" src="../scripts/login.bundle.js"></script>
<?php include('./components/footer.php'); ?>