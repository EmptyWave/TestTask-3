<?php
/**
 * Created by PhpStorm.
 * User: dimon
 * Date: 13.06.2019
 * Time: 18:29
 */

function download($src, $dst)
{
  $f = fopen($src, 'rb');
  $o = fopen($dst, 'wb');
  while (!feof($f)) {
    if (fwrite($o, fread($f, 2048)) === FALSE) {
      return 1;
    }
  }
  fclose($f);
  fclose($o);
  return 0;
}

function xmlToArray(SimpleXMLElement $xml): array
{
  $parser = function (SimpleXMLElement $xml, array $collection = []) use (&$parser) {
    $nodes = $xml->children();
    $attributes = $xml->attributes();

    if (0 !== count($attributes)) {
      foreach ($attributes as $attrName => $attrValue) {
        $collection['attributes'][$attrName] = strval($attrValue);
      }
    }

    if (0 === $nodes->count()) {
      $collection['value'] = strval($xml);
      return $collection;
    }

    foreach ($nodes as $nodeName => $nodeValue) {
      if (count($nodeValue->xpath('../' . $nodeName)) < 2) {
        $collection[$nodeName] = $parser($nodeValue);
        continue;
      }

      $collection[$nodeName][] = $parser($nodeValue);
    }

    return $collection;
  };

  return [
    $xml->getName() => $parser($xml)
  ];
}

function xmlCategoriesToArr(array $xml)
{
  $arr = [];
  foreach ($xml as $item) {
    $attr = $item['attributes'];
    $arr[$attr['id']]['parentId'] = $attr['parentId'];
    $arr[$attr['id']]['category'] = $item['value'];
  }
  return $arr;
}

function xmlOffersArrToAssoc(array $xml, $count, $categories)
{
  $arr = [];
  for ($i = 0; $i < $count; $i++) {
    foreach ($xml[$i] as $key => $item) {
      switch ($key) {
        case 'attributes':
          foreach ($item as $title => $str) {
            $arr[$i][$title] = $str;
          }
          break;
        case 'categoryId':
          $cat = $categories[$item['value']];
          $arr[$i]['category'] = $cat['category'];
          $cat = $categories[$cat['parentId']];
          $arr[$i]['parentCategory'] = $cat['category'];
          break;
        default:
          $arr[$i][$key] = $item['value'];
      }
    }
  }
  return $arr;
}

function getOfferStr($offer){
  $fRow = '';
  foreach ($offer as $title => $str){
    if (!next($offer))
      $fRow .= $title.': '.str_replace("\n", ' ', strip_tags($str)).ROW_DELIMITER;
    else
      $fRow .= $title.': '.str_replace("\n", ' ', strip_tags($str)).TAB;
  }
  return $fRow;
}

const ROW_DELIMITER = "\r\n";
const TAB = "\t";
const URL = 'https://ef.icontext.ru/employment/test.xml';

download(URL, 'downloadedXML.xml');

$xml = simplexml_load_file('downloadedXML.xml');

$arr = xmlToArray($xml);

$shop = $arr['yml_catalog']['shop'];
$categoriesXML = $shop['categories']['category'];
$offersXML = $shop['offers']['offer'];

$categories = xmlCategoriesToArr($categoriesXML, count($categoriesXML), 'category');

$offers = xmlOffersArrToAssoc($offersXML, count($offersXML),$categories);

$file = fopen('offersFromXML.txt','w+');
foreach ($offers as $offer) {
  fputs($file, getOfferStr($offer));
}
fclose($file);

