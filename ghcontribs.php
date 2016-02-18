<?php

// Utility function to get dates
function getWeek()
{
    $range = array();
    $cur = time();
    $i = 0;

    while ($i < 7)
    {
        array_push($range, date('Y-m-d', $cur));
        $cur -= 86400; // 24h
        $i++;
    }
    
    return $range;
}

$github_src = file_get_contents("https://github.com/pbondoer");
$values = array();
$matches = array();

// Look through matches
foreach(getWeek() as $day)
{
    if(preg_match('<rect class="day" .+ data-count="(\d+)" data-date="' . $day . '"\\/>', $github_src, $matches))
    {
        str_replace("-", ".", $day);
        $values[date("D j M", strtotime($day))] = $matches[1];
    } else {
        $values[$day] = '0';
    }
}

// Echo results
echo json_encode(array_reverse($values));
?>