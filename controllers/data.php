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
    $myquery = "select name,count(*) as value, HOUR(timestamp) as timing from movement_combined where 
    day = '".$inputDay."' group by name, HOUR(timestamp);";

    $query = pdo_query($myquery);
    
    if ( ! $query ) {
        echo pdo_error();
        die;
    }
    
    $data = array();
    
    for ($x = 0; $x < pdo_num_rows($query); $x++) {
        $result = pdo_fetch_assoc($query);
        $data[] = $result;
    }
    
    unset($server);
    echo json_encode($data);     
?>