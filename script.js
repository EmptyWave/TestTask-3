var trackMultitouch = function(trackerType, domain, path, trackerName) {
  // ------------------------------------------------------------------------

  this.conversion = function() { //
    var d = domain || ('.' + (/(www.)?([^\/]+)/.exec(document.location.hostname)[2]));
    var p = path || '/';
    if (!getCookie('__mtvis')){
      trackSession(function() {
        trackGAEvent(trackerName, trackerType, getCookie('__mtvis'));
        deleteCookie('__mtvis', p, d);
      });
    }
    else {
      trackGAEvent(trackerName, trackerType, getCookie('__mtvis'));
      deleteCookie('__mtvis', p, d);
    }
  };

  // ------------------------------------------------------------------------
  var getCurrentSourceMedium = function(callback) {  // тут как я понимаю происходит разбор значениея куки из запроса чтобы узнать откуда к нам пришел пользователь
    var utmz = getCookie('__utmz'); // информация 6 есячной давности
    if (_gaq instanceof Array) {
      setTimeout(arguments.callee(callback), 4000);
    }

    var medium, source, m_changed, s_changed;

    m_changed = false;
    s_changed = false;

    if (/utmgclid/.exec(utmz)) {
      return callback("adw");
    }
    else {
      try {
        medium = /utmcmd=\(?([^\|;]+)\)?/.exec(utmz)[1]; // категория источника запроса
        source = /utmcsr=\(?([^\|;\)]+)/.exec(utmz)[1]; // источник трафика - поисковик/домен/..
      }
      catch (err) {
        medium = 'error';
        source = 'error';
      }
    }

    if (source.indexOf("fashion") !== -1) {
      source = source.replace(/fashion/g, "f-");
      s_changed = true;
    }
    else if (source.indexOf("yandex_") !== -1){
      source = source.replace(/yandex_/g, "y-");
      s_changed = true;
    }
    else if (source.indexOf("yandex") !== -1){
      source = source.replace(/yandex/g, "y-");
      s_changed = true;
    }
    else if (source.indexOf("rambler") !== -1){
      source = source.replace(/rambler/g, "r-");
      s_changed = true;
    }
    else if (source.indexOf("vkont_") !== -1){
      source = source.replace(/vkont_/g, "vk-");
      s_changed = true;
    }
    else if (source.indexOf("rasprodaga") !== -1){
      source = source.replace(/rasprodaga/g, "rp-");
      s_changed = true;
    }
    else if (source.indexOf("gnezdo") !== -1){
      source = source.replace(/gnezdo/g, "gn-");
      s_changed = true;
    }
    else if (source.indexOf("shopping") !== -1){
      source = source.replace(/shopping/g, "s-");
      s_changed = true;
    }
    else if (source.indexOf("widget") !== -1){
      source = source.replace(/widget/g, "w-");
      s_changed = true;
    }
    else if (source.indexOf("mamba_") !== -1){
      source = source.replace(/mamba_/g, "m-");
      s_changed = true;
    }


    if (medium.indexOf("partner") !== -1) {
      medium = medium.replace(/partner_/g, "p-");
      m_changed = true;
    }
    else if (medium.indexOf("vkont_") !== -1) {
      medium = medium.replace(/vkont_/g, "vk-");
      m_changed = true;
    }


    return callback( (s_changed ? source : source.slice(0, 5)).replace(/_/g, "-") + '/' + (m_changed ? medium : medium.slice(0, 5)).replace(/_/g, "-") );


    /*
    switch(medium) {
        case "organic":
            return  callback(source.slice(0,2) + "/org");
        case "referral":
            return callback("ref");
        case "(none)":
            return callback("drct");
        case "error":
            return callback("err");
        case '':
            return callback("err");
        case "yandex_cpc":
            return callback("ynd");
        case "begun_cpc":
            return callback("beg");
        case "vk_cpc":
            return callback("vk");
        case "partner":
            return callback("vk");
        default:
            return callback(source.slice(0,3) + '/' + medium.slice(0,3));
    }
    */
  };

  var updateMTCookie = function(value, path, domain) { // тут как я понял отслеживается изменение источника запроса
    var mtvis = getCookie('__mtvis');
    var res;

    if (!mtvis) {
      res = value;
    }

    else {
      var current_value = mtvis.split("_");
      var last_value = parseInt(current_value[current_value.length - 1], 10) ? { val : current_value[current_value.length - 2], isNumber : true } :
        { val : current_value[current_value.length - 1], isNumber : false };

      if (last_value.val === value) {
        if (last_value.isNumber) {
          current_value[current_value.length - 1] = parseInt(current_value[current_value.length - 1], 10) + 1;
        }
        else {
          current_value.push('2');
        }
      }
      else {
        current_value.push(value);
      }

      res = current_value.join("_");
    }

    var date = new Date();
    date.setDate(date.getDate() + 30);                        //засекаем время хранения
    setCookie('__mtvis', res, date.getFullYear(), date.getMonth(), date.getDate(), path, domain, '');
  };

  var trackSession = function(callback) { // страт отслеживания
    var p = path || '/';
    var d = domain || ('.' + (/(www.)?([^\/]+)/.exec(document.location.hostname)[2]));

    getCurrentSourceMedium(function(value) {
      updateMTCookie(value, p, d);
      setCookie('__mtsess', 1, '', '', '', p, d, '');
      if (callback instanceof Function) { //если колбек функция то выполняем его
        callback();
      }
    });
  };

  var trackGAEvent = function(trackerName, trackerType, value) { // выбор трекера в зависимости от типа отслеживания
    if (trackerType === 'async') {//
      var trackerFunction = trackerName ? trackerName + '._trackEvent' : '_trackEvent';
      _gaq.push([trackerFunction, 'Mtouch', value]);    // добавляем команду в массив отслеживания
    }
    else if (trackerType === 'sync') {
      trackerName._trackEvent('Mtouch', value);
    }
  };


  // ------------------------------------------------------------------------
  var getCookie = function(cookie_name) {             // функция возвращающая куки если они есть
    try {
      var results = document.cookie.match ('(^|;) ?' + cookie_name + '=([^;]*)(;|$)'); //проверка на соответствие регуляру

      if (results) {
        return (unescape(results[2]));                  // перекодируев в utf8
      }
      else {
        return null;
      }
    } catch(e) {}
  };

  var setCookie = function(name, value, exp_y, exp_m, exp_d, path, domain, secure) { // заводим куки
    var cookie_string = name + "=" + escape (value);    // перекодируев в ascii

    if (exp_y) {
      var expires = new Date (exp_y, exp_m, exp_d);
      cookie_string += "; expires=" + expires.toGMTString();  // дата в формате UTC
    }
    if (path) {
      cookie_string += "; path=" + escape (path);
    }

    if (domain) {
      cookie_string += "; domain=" + escape (domain);
    }

    if (secure) {
      cookie_string += "; secure";
    }

    document.cookie = cookie_string;
  };

  var deleteCookie = function(name, path, domain) { //какое-то хитрое обнуление/замена строки с сохранением параметров если были и явно истекшей датой
    if (document.cookie.match(name)) {
      document.cookie = name + "=" + ((path) ? ";path=" + path : "") + ((domain) ? ";domain=" + domain : "") +
        ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
    }
  };

  // ------------------------------------------------------------------------

  if (getCookie('__mtsess')) {
    return;
  }

  else {
    trackSession();
  }
};