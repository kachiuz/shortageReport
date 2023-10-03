<?php

$resultArray = array();
$errors = array();

require_once("postCheck.php");
require_once("loginDetails.php");

if(!empty($_POST['usernameLocalStorage'])){
	$usernameLocalStorage = $_POST['usernameLocalStorage'];
	//$productQuantities = $_POST['productQuantities'];	
}else{
	$errors[] = 'User name has not been submitted!';
	
	$resultArray += array("errors"=>$errors);
	Die ($jsonFile = json_encode($resultArray));
}

if(!empty($_POST['passwordLocalStorage'])){
	$passwordLocalStorage = $_POST['passwordLocalStorage'];
	//$productQuantities = $_POST['productQuantities'];	
}else{
	$errors[] = 'Password has not been submitted!';
	
	$resultArray += array("errors"=>$errors);
	Die ($jsonFile = json_encode($resultArray));
}


//compare back end and fron end user name and password values

if($usernameLocalStorage == $usernameBackEnd AND $passwordLocalStorage == $passwordBackEnd) {
	$sessionIsSet = true;
	
} else {
	$sessionIsSet = false;
}

$resultArray += array("sessionIsSet"=>$sessionIsSet, "errors"=>$errors);
$jsonFile = json_encode($resultArray);
echo $jsonFile;

?>