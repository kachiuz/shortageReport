<?php
date_default_timezone_set("Europe/London");
//fetch data from front end, two arrays are sent of product codes and quantities
$resultArray = array();
$errors = array();

//for security purpose
require_once("postCheck.php");


$productCodes = array();
if(!empty($_POST['productCodes'])){
	$productCodes = explode(",", $_POST['productCodes']);
	//$productCodes = $_POST['productCodes'];	

}else{$errors[] = 'No products have been submited!';}

$productQuantities = array();
if(!empty($_POST['productQuantities'])){
	$productQuantities = explode(",", $_POST['productQuantities']);
	//$productQuantities = $_POST['productQuantities'];	

}else{$errors[] = 'No product quantities have been submited!';}



require('../../shortageReport_connectDB.php');

//variables to store results for table to be generated

$expectedDatesArray = array();
$expectedQuantitiesArray = array();
$resourceDescriptionArray = array();
//this array contais either yes or no text string.
$coverOrNotArray = array();

//will need todays date to calculate the differnece between delivery date and today
$today = date("Y-m-d");
$today = date_create($today);

//query database for each product
for ($i = 0; $i< count($productCodes); $i++ ) {
	//first I should select min date, as there might be several deliveries in upcoming days. then do a query with that date.
	
	$queryMinDate = "SELECT MIN(Expected_Date) FROM `deliveries` WHERE `Resource` = '$productCodes[$i]'";
	$queryResultMinDate = mysqli_query($shortageReportDB, $queryMinDate);
	
	$num = mysqli_num_rows($queryResultMinDate);
	if ($num > 0){
		while ($row = mysqli_fetch_array($queryResultMinDate, MYSQLI_ASSOC))
		{
			$expectedDate = $row['MIN(Expected_Date)'];
			if ($expectedDate !== NULL) {
				
				//apparanetly expected date is a string and without converting it to date format the below sql query doesn't work
				//additionaly, this way I remove h:m:s from the date 
				$expectedDate=date_create($expectedDate);
				$expectedDate = date_format($expectedDate,"Y-m-d");
				//if we have a date, the query the databas again, to get other values like quantity and suplier.
				//SUM because there might be more then 1 delivery for the same product that day
				$queryDatabase = "SELECT SUM(Expected_Receipt_Qty), Resource_Description FROM `deliveries` WHERE `Resource` = '$productCodes[$i]' AND `Expected_Date` = '$expectedDate'";
				$queryResult = mysqli_query($shortageReportDB, $queryDatabase);
			

				$num2 = mysqli_num_rows($queryResult);
				if ($num2>0){
					while ($row2 = mysqli_fetch_array($queryResult, MYSQLI_ASSOC))
					{
						
						$expectedQuantity = $row2['SUM(Expected_Receipt_Qty)'];
						$resourceDescription = $row2['Resource_Description'];
					} 
					
					
					//here we will compare dates, to replace date with words today or tomorrow depending on the result.
					
					$expectedDate=date_create($expectedDate);

					$difference = (array) date_diff($today, $expectedDate);
					$difference = $difference['days'];
					
					//need to convert date back and forth because first the sql query doesn't work, and later wont let it convert the date to string.
					//
					$expectedDate = date_format($expectedDate,"d-m-Y");
					
					
					if ($difference == 1) {
						
						
						//since the date diff value is not negative, in case I have a deliver from yesterday, instead of -1 the datediff will still be 1
						//thats why I need additional conditioning to determine if the date is tomorrow or yesterday
						$today2 = date_format($today,"d-m-Y");
						//in order for the additional conditioning to work, I need to create a $today variable with same date format as expected date
						
						//at the last day of every month this conditioniog returns Yesterday, so I'll add one more
						//if statmenet to check if this is the last day of the mont, and if it is, instead of tomorrow and yesterday, just return numeric date.
						//i order to do that I'll create a bew variable currentMonthDay.
						//$currentMonthDay = date_format($today2,"d-m");
						//$resultArray += array("currentMonthDay"=>$currentMonthDay);
						$currentMonthDay = date_format($today,"m-d");
						
						//compare today to each months last day, if it is not the last day of the month, add tomorrow or yesterday instead of date.
						if($currentMonthDay != "01-31" AND $currentMonthDay != "02-28" AND $currentMonthDay != "02-29" AND	
							$currentMonthDay != "03-31" AND $currentMonthDay != "04-30" AND $currentMonthDay != "05-31" AND 
							$currentMonthDay != "06-30" AND $currentMonthDay != "07-31" AND $currentMonthDay != "08-31" AND 
							$currentMonthDay != "09-30" AND $currentMonthDay != "10-31" AND $currentMonthDay != "11-30" AND 
							$currentMonthDay != "12-31"){
								
							if($today2 < $expectedDate) {
							$expectedDate = "Tomorrow";
							}
							else {
								$expectedDate = "Yesterday";
							}

						}

					} else if ($difference == 0) {
						$expectedDate = "Today";
					}else {
						//just leave the date.
					}

				} else {
					//nothing
				}
			
			} else {
				$resourceDescription = "No description available";
				//if no date is found means there is no delivery scheduled
				$expectedQuantity=0;
				$expectedDate = "No delivery scheduled";
			}
		} 
	}else{
		//if no date is found means there is no delivery scheduled
		$resourceDescription = "No description available";
		$expectedQuantity=0;
		$expectedDate = "No delivery scheduled";
	}
		
	//add the date to dates array for table to be generated
	array_push($expectedDatesArray,$expectedDate);
	array_push($expectedQuantitiesArray,$expectedQuantity);
	array_push($resourceDescriptionArray,$resourceDescription);
	
	$enoughToCover = "";
	
	if ($expectedQuantity>= $productQuantities[$i]){
		$enoughToCover = "Yes";
	}else if ($expectedQuantity< $productQuantities[$i]){
		$enoughToCover  = "No";
	} else {
		$enoughToCover  = "No";
	}
	array_push($coverOrNotArray,$enoughToCover);

}

//since the database can be update by another user or from a different browser, I'll get the last update time every time I'm quering database
//it is the same code as in loadLAstUpdate.php
$queryLastUpdate = "SELECT last_update FROM `lastUpdate` WHERE 1";
$resultLastUpdate = mysqli_query($shortageReportDB, $queryLastUpdate);

$num = mysqli_num_rows($resultLastUpdate);
if ($num > 0){
	while ($row = mysqli_fetch_array($resultLastUpdate, MYSQLI_ASSOC))
		{
			$lastUpdate = $row['last_update'];	
		}
} else {
	$lastUpdate = "No Data!";
}

require_once("timeSinceLastUpdate.php");

mysqli_close($shortageReportDB);
			
$resultArray += array("expectedDatesArray"=>$expectedDatesArray, "coverOrNotArray"=>$coverOrNotArray, "lastUpdate"=>$lastUpdate);
$resultArray += array("expectedQuantitiesArray"=>$expectedQuantitiesArray, "resourceDescriptionArray"=>$resourceDescriptionArray, "errors"=>$errors,);

$jsonFile = json_encode($resultArray);
echo $jsonFile;

?>