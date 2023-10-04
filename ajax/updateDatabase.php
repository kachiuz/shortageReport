<?php
date_default_timezone_set("Europe/London");
//fetch data from front end, two arrays are sent of product codes and quantities
$resultArray = array();
$errors = array();

//for security purpose.
require_once("postCheck.php");

//let's count how many of the preferable arrays have not been submitted.
//I do that in order to avoid 6 differenet errors being reported at the same time at front end, in case a file with different column
//names has been subimted.
$errorTrue = 0;
if(!empty($_POST['documentArray'])){
	$documentArray = explode(",", $_POST['documentArray']);
}else{
	$errorTrue++;
}
if(!empty($_POST['dateArray'])){
	$dateArray = explode(",", $_POST['dateArray']);
}else{
	$errorTrue++;
}

if(!empty($_POST['supplierArray'])){
	$supplierArray = explode(",", $_POST['supplierArray']);
}else{
	$errorTrue++;
}

if(!empty($_POST['resourceArray'])){
	$resourceArray = explode(",", $_POST['resourceArray']);
}else{
	$errorTrue++;
}

if(!empty($_POST['descriptionArray'])){
	$descriptionArray = explode(",", $_POST['descriptionArray']);
}else{
	$errorTrue++;
}

if(!empty($_POST['quantityArray2'])){
	$quantityArray2 = explode(",", $_POST['quantityArray2']);
}else{
	$errorTrue++;
}

if($errorTrue>0){
	$errors[] = 'Something went wrong. Please make sure you have copy/paste everything correctly!';
	$resultArray += array("errors"=>$errors);
	Die ($jsonFile = json_encode($resultArray));
}

//find the length of array;
$arrayLength = Count($descriptionArray );

require('../../shortageReport_connectDB.php');

//Delete values from the current table 
//this needs to be done to avoid duplicate data

$queryDelete = "DELETE FROM deliveries WHERE 1 = 1";
$resultDelete = mysqli_query($shortageReportDB, $queryDelete);

for ($i = 0; $i <$arrayLength; $i++){
	
	//sql injection prevention
	
	$documentArray[$i] = htmlentities(mysqli_real_escape_string($shortageReportDB, $documentArray[$i]));
	$supplierArray[$i] = htmlentities(mysqli_real_escape_string($shortageReportDB, $supplierArray[$i]));
	$resourceArray[$i] = htmlentities(mysqli_real_escape_string($shortageReportDB, $resourceArray[$i]));
	$descriptionArray[$i] = htmlentities(mysqli_real_escape_string($shortageReportDB, $descriptionArray[$i]));
	$quantityArray2[$i] = htmlentities(mysqli_real_escape_string($shortageReportDB, $quantityArray2[$i]));
	
	
	//a date needs to be sorted as now it is submitted in a format like this ---> 11\/29\/22 and it does't get inserted into db
	$splitDateArray = explode("/", $dateArray[$i]);
	//compose proper date
	$date = $splitDateArray[2].'-'.$splitDateArray[1].'-'.$splitDateArray[0];
	
	
	$queryInsertData = "INSERT INTO deliveries (
		Expected_Date,
		Document,
		Supplier_Customer,
		Resource,
		Resource_Description,
		Expected_Receipt_Qty) 
	VALUES (
		'$date', 
		'$documentArray[$i]', 
		'$supplierArray[$i]', 
		'$resourceArray[$i]', 
		'$descriptionArray[$i]', 
		'$quantityArray2[$i]')";
	
	$resultInsertdata = mysqli_query($shortageReportDB, $queryInsertData);
}
//Delete old value for lastUpdate.
$queryDelete = "DELETE FROM lastUpdate WHERE 1 = 1";
$resultDelete = mysqli_query($shortageReportDB, $queryDelete);
//insert current time into database
//the reason i dont use mysql now, because I need the current time value in this file to send it back to front end.
$now = date_create()->format('Y-m-d H:i:s');
$queryInsertData2 = "INSERT INTO lastUpdate (last_update)VALUES ('$now')";
$resultInsertdata2 = mysqli_query($shortageReportDB, $queryInsertData2);
mysqli_close($shortageReportDB);

$resultArray += array("errors"=>$errors, "deliveryQuantity"=>$arrayLength, "lastUpdate"=>$now);
$jsonFile = json_encode($resultArray);
echo $jsonFile;

?>