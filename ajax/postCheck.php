<?php

if ( $_SERVER[ 'REQUEST_METHOD' ] != 'POST' ){
	$errors[] = 'Wrong Method!';
	$loadIndexesArray = array("errors"=>$errors);
	Die ($jsonFile = json_encode($loadIndexesArray));
}



?>