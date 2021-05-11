<?php

header("Content-type: application/json; charset=UTF-8");



$update = filter_input(INPUT_POST, 'updates', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$insert = filter_input(INPUT_POST, 'inserts', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$delete = filter_input(INPUT_POST, 'deletes', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);


// ~~Do what you need with data sent ~~



echo json_encode($_POST);
