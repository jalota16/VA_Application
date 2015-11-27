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
    $myquery = "select name,count(*) as value,CONCAT(HOUR(m.timestamp),'00') as timing from movement m, places p 
    where m.x = p.x and p.y = m.y and day = '".$inputDay."' group by name, HOUR(m.timestamp);";

    $query = pdo_query($myquery);
    $yLabels= ['Wrightiraptor Mountain','Galactousaurus Rage','Auvilotops Express','TerroSaur','Wendisaurus Chase',
            'Keimosaurus Big Spin','Firefall','Atmosfear','Jeradctyl Jump','Sauroma Bumpers','Flying TyrAndrienkos',
            'Cyndisaurus Asteroid','Beelzebufo','Enchanted Toadstools','Stegocycles','Blue Iguanodon','Wild Jungle Cruise','Stone Cups',
            'Scholz Express','Paleocarrie Carousel','Jurassic Road','Rhynasaurus Rampage','Kauf\'s Lost Canyon Escape','Maiasaur Madness',
            'Kristandon Kaper','Squidosaur','Eberlasaurus Roundup','Dykesadactyl Thrill','Ichyoroberts Rapids','Raptor Race',
            'Creighton Pavilion',
            'Grinosaurus Stage','SabreTooth Theatre','Flight of the Swingodon',"Daily Slab Maps and Info"];
    
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