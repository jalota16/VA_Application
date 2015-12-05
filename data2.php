<?php
include_once("pdo_mysql.php");
    $username = "root"; 
    $password = "";   
    $host = "localhost";
    $database="vaproject";
	
    $server = pdo_connect($host, $username, $password);
    $connection = pdo_select_db($database, $server);
    $datasets = ["fri", "sat", "sun"];
    $datasetsLabels= ["Friday", "Saturday", "Sunday"];
    $whichDay = htmlspecialchars($_GET["day"]);
    $whichDay = array_search($whichDay,array_values($datasetsLabels));
    $inputDay = $datasets[$whichDay];
    $myquery = "SELECT places.name,movement.id,CONCAT(HOUR(movement.timestamp),'00') as timing FROM movement INNER JOIN places ON places.x=movement.x AND places.y=movement.y AND day = '".$inputDay."' order by places.name, HOUR(movement.timestamp);";

    $query = pdo_query($myquery);
    
    $xLabels= ['800','900','1000','1100','1200','1300','1400','1500','1600','1700','1800','1900','2000','2100',
              '2200','2300'];

    
    if ( ! $query ) {
        echo pdo_error();
        die;
    }
    
    $data = array();
    
    for ($x = 0; $x < pdo_num_rows($query); $x++) {
        $result = pdo_fetch_assoc($query);
        //$data[]= $result["name"],(int)$result["timing"],(int)$result["value"];
        $data[] = $result;
        //$data[]=[array_search($result["name"],array_values($yLabels)),array_search($result["timing"],array_values($xLabels)),
        //(int)$result["value"]];
    }
    
    unset($server);
    echo json_encode($data);     
?>