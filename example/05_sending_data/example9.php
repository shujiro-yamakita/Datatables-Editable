<?php

header("Content-type: application/json; charset=UTF-8");



$update = filter_input(INPUT_POST, 'updates', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$insert = filter_input(INPUT_POST, 'insert', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$delete = filter_input(INPUT_POST, 'delete', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);


// ~~Do what you need with data sent ~~



echo json_encode($_POST);
// echo false;
