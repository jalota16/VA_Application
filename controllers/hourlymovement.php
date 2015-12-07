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
    $whatTime = (int)htmlspecialchars($_GET["time"]);
    $table = "movement_fri";

    if(!strcasecmp($inputDay,"sat")){
        $table = "movement_sat";
    } else if (!strcasecmp($inputDay,"sun")){
        $table = "movement_sun";
    }

    $myquery = "select count(*) as number, CONCAT(origin,\",\",destination) as place, origin, destination 
    from (select min(timestamp),name as origin,id,HOUR(timestamp) as time from ".$table." where 
    HOUR(TIMESTAMP) = ".$whatTime." group by id) as temp, (select min(timestamp),name as destination,id,
    HOUR(timestamp) as time from ".$table." where HOUR(TIMESTAMP) = ".(string)($whatTime+1)." group by id) as 
    temp1 where temp.id = temp1.id and temp.time = (temp1.time -1) group by place";

    $rides = ["Atmosfear","Auvilotops Express","Beelzebufo","Blue Iguanodon","Creighton Pavilion","Cyndisaurus Asteroid",
      "Daily Slab Maps and Info","Dykesadactyl Thrill","Eberlasaurus Roundup","Enchanted Toadstools","Firefall","Flight of the Swingodon",
      "Flying TyrAndrienkos","Galactousaurus Rage","Grinosaurus Stage","Ichyoroberts Rapids","Jeradctyl Jump","Jurassic Road",
      "Kauf's Lost Canyon Escape","Keimosaurus Big Spin","Kristandon Kaper","Maiasaur Madness","Paleocarrie Carousel","Raptor Race",
      "Rhynasaurus Rampage","SabreTooth Theatre","Sauroma Bumpers","Scholz Express","Squidosaur","Stegocycles","Stone Cups","TerroSaur",
      "Wendisaurus Chase","Wild Jungle Cruise","Wrightiraptor Mountain"];

    $query = pdo_query($myquery);
    
    if ( ! $query ) {
        echo pdo_error();
        die;
    }
    
    $temp = "";
    $tempArray=array();

    for ($x = 0; $x < pdo_num_rows($query); $x++) {
        $result = pdo_fetch_assoc($query);
        if(strcasecmp($temp,$result["origin"])){
            if($x > 0){
                $data[] = $tempArray;
            }
            $temp = $result["origin"];
            $tempArray=[];
        } 
        $tempArray[] = $result["number"];
    }

    unset($server);
    echo json_encode($data);     
?>