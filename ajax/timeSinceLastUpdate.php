<?php


//$datetime1 = new DateTime('2009-10-11 12:12:00');
$currentTime = date_create()->format('Y-m-d H:i:s');
//$currentTime = new DateTime('2009-10-13 10:12:00');
//$interval = $lastUpdate->diff($currentTime);
//$interval->format('%H');


$start_datetime = new DateTime($currentTime); 
$diff = $start_datetime->diff(new DateTime($lastUpdate)); 

//$diff->h diff is an object an h it's his property and -> is a way to access it.
if($diff->h >3){
	
	$moreThan3HoursAgo = true;
} else {
	$moreThan3HoursAgo = false;
	
}

//if the differnce between last update and current time is more then 3 hours, 
//the last update time in html file will be colored red.
$resultArray += array("moreThan3HoursAgo"=>$moreThan3HoursAgo);


?>