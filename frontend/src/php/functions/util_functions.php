<?php 

function getButtonType() {
    global $detect;
    if ($detect->isMobile()) {
        return 'btn-small';
    } else {
        return 'btn';
    }
}
