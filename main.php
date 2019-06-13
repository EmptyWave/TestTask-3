<?php
/**
 * Created by PhpStorm.
 * User: dimon
 * Date: 13.06.2019
 * Time: 17:37
 */

const CSV_NAME = 'sum.csv';
const ROW_DELIMITER = "\r\n";
const DIGIT_NUMBER = 50;
const NUMBER_COUNT = 50;

function randomDigitNumber($length)
{
  $returnString = mt_rand(1, 9);
  while (strlen($returnString) < $length) {
    $returnString .= mt_rand(0, 9);
  }
  return $returnString;
}

$sum = 0;

$file = fopen (CSV_NAME, "w");

for ($i = 1; $i <= NUMBER_COUNT; $i++){
  $number = randomDigitNumber(DIGIT_NUMBER);
  fputs($file,$number.ROW_DELIMITER);
  $sum += $number;
}

fputs($file,$sum);
fclose($file);