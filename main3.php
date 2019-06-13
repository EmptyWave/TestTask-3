<?php
/**
 * Created by PhpStorm.
 * User: dimon
 * Date: 13.06.2019
 * Time: 21:38
 */

const OLD_CSV_NAME = 'urls.csv';
const NEW_CSV_NAME = 'newUrls.csv';
const ROW_DELIMITER = "\r\n";

$fileR = fopen (OLD_CSV_NAME, "r");
$fileW = fopen (NEW_CSV_NAME, "w");

while (($data = fgetcsv($fileR, 1000, ",")) !== FALSE) {
  $csvStr = '"';
  foreach ($data as $str) {
    if (!next($data))
      $csvStr .= $str.'"';
    else
      $csvStr .= $str.';';
  }
  $csvStr .= ROW_DELIMITER;

  $encoding = mb_detect_encoding($csvStr,'UTF-8,ASCII,ISO-8859-15');
  $csvStr1 = iconv($encoding,"UTF-8",$csvStr);
  fputs($fileW,$csvStr);
}

fclose($fileR);
fclose($fileW);