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
    $whichPlace = htmlspecialchars($_GET["place"]);
    $whatTime = (int) htmlspecialchars($_GET["time"]);
    $position = htmlspecialchars($_GET["position"]);

    $firstquery =  pdo_query("select * from places where name = '".$whichPlace."'");
    $firstresult = pdo_fetch_assoc($firstquery);
    $xposition =  $firstresult["x"];
    $yposition =  $firstresult["y"];
    $selectedCategory =  $firstresult["category"];

    if(strcasecmp($position,"after")){
        $myquery = "Select place.name, count(*) as number, place.category, place.x, place.y from movement move, (select id,min(timestamp) as timestamp from movement where id in 
        (select distinct(m.id) from movement m where x =".$xposition." and y =".$yposition." and day = '".$inputDay."' 
        and HOUR(m.timestamp) = ".$whatTime.") and day = '".$inputDay."' and HOUR(timestamp) = ".($whatTime+1)." group by id) as temp, places place where 
        temp.timestamp = move.timestamp and temp.id = move.id and place.x = move.x and move.y = place.y
        group by place.name order by number DESC limit 5";
    } else {
        $myquery = "Select place.name, count(*) as number, place.category, place.x, place.y from movement move, (select id,max(timestamp) as timestamp from movement where id in 
        (select distinct(m.id) from movement m where x =".$xposition." and y =".$yposition." and day = '".$inputDay."' 
        and HOUR(m.timestamp) = ".$whatTime.") and day = '".$inputDay."' and HOUR(timestamp) = ".($whatTime-1)." group by id) as temp, places place where 
        temp.timestamp = move.timestamp and temp.id = move.id and place.x = move.x and move.y = place.y
        group by place.name order by number DESC limit 5";
    }

    $query = pdo_query($myquery);
    if (!$query) {
        echo pdo_error();
        die;
    }
    $data[] = [$selectedCategory,0,0];
    
    for ($x = 0; $x < pdo_num_rows($query); $x++) {
        $result = pdo_fetch_assoc($query);
        $distance = round(abs(sqrt(pow(($xposition-$result["x"]), 2)+pow(($yposition-$result["y"]), 2))));
        $result["distance"] = $distance;
        $data[] = $result;
    }

    unset($server);
    echo json_encode($data);     
?>