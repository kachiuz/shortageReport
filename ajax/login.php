<?php
//login page

$resultArray = array();
$errors = array();

require_once("postCheck.php");
require_once("loginDetails.php");

if(!empty($_POST['userNameValue'])){
	$userNameValue = $_POST['userNameValue'];
	//$productQuantities = $_POST['productQuantities'];	
}else{
	$errors[] = 'User name has not been submitted!';
	
	$resultArray += array("errors"=>$errors);
	Die ($jsonFile = json_encode($resultArray));
}

if(!empty($_POST['passwordValue'])){
	$passwordValue = $_POST['passwordValue'];
	//$productQuantities = $_POST['productQuantities'];	
}else{
	$errors[] = 'Password has not been submitted!';
	
	$resultArray += array("errors"=>$errors);
	Die ($jsonFile = json_encode($resultArray));
}


//check if username matches

if($userNameValue != $usernameBackEnd) {
	$errors[] = 'User Name Not Found!';
	
	$resultArray += array("errors"=>$errors);
	Die ($jsonFile = json_encode($resultArray));
}

if($passwordValue != $passwordBackEnd) {
	$errors[] = 'Incorrect Password!';
	
	$resultArray += array("errors"=>$errors);
	Die ($jsonFile = json_encode($resultArray));
}

//if all the above conditions have been met, approve login
$approveLogin = true;

$resultArray += array("approveLogin"=>$approveLogin, "errors"=>$errors);
$jsonFile = json_encode($resultArray);
echo $jsonFile;
?>