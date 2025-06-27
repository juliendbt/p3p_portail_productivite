<?php
$mot = "password";
$hash = '$2y$10$xmFX7dBWSpwkat2ZNeZnEuor.1U.te91kdMsclpzzx42OS8O0c.l.';

if (password_verify($mot, $hash)) {
    echo "OK";
} else {
    echo "NON";
}
