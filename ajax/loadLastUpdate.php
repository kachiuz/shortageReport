<?php

//load last update every time the page gets loaded
$resultArray = array();
$errors = array();

require_once("postCheck.php");

require('../../shortageReport_connectDB.php');

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
$resultArray += array("lastUpdate"=>$lastUpdate);
$jsonFile = json_encode($resultArray);
echo $jsonFile;