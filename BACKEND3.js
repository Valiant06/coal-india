"use strict";
var viewMode = 'desktop';
var pageOptions = document.getElementById("page-options");
var currentPage = pageOptions.dataset.pagename;
var safeExec = 1;
var localeCode = document.getElementById("locale-code");
var mobileSearchEnabled = false;
var pendingRefreshOnUserAction = false;
var refreshOverlayRequired = true;
var overlayNavigation = false;
var userSubscribed = false;
var cookieBannerChecked = false;
var ringsideCookieAttempts = 1;

if (!String.prototype.trim) {
  (function () {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function () {
      return this.replace(rtrim, '');
    };
  })();
}

function animateTo(elementID) {
  var scrollToEle = document.getElementById(elementID);
  scrollToEle.scrollIntoView({behavior: "smooth"});
}

function getQueryParams(qs) {
  qs = qs.split('+').join(' ');

  var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}

//before onload - if page==search
var currentParams = getQueryParams(document.location.search);
if (currentParams && pageOptions && typeof pageOptions.dataset.geolocation_enabled !== "undefined" && typeof pageOptions.dataset.pagename !== "undefined" && (pageOptions.dataset.pagename == "index" || pageOptions.dataset.pagename == "search") && pageOptions.dataset.geolocation_enabled == "1" && (typeof currentParams.location === 'undefined' || currentParams.location.length < 1)) {
  get_location();
}

alterScreen();

function getParams(url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
}

function serializeParams(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function setQueryStringParameter(name, value) {

  var params = getParams(window.location.search);
  params[name] = value;
  window.history.replaceState({}, "", window.location.pathname + '?' + serializeParams(params));

}

function populateRingsideVars(node, str) {

  if (node.nodeType == 3) {
    node.data = node.data.replace(/{{ringside_rsc}}/g, str);
  }
  if (node.nodeType == 1 && node.tagName == "A") {
    node.href = node.href.replace(/{{ringside_rsc}}/g, str);
  }
  if (node.nodeType == 1 && node.nodeName != "SCRIPT") {
    for (var i = 0; i < node.childNodes.length; i++) {
      populateRingsideVars(node.childNodes[i], str);
    }
  }

}

function getCookie(c_name) {
  var c_value = " " + document.cookie;
  var c_start = c_value.indexOf(" " + c_name + "=");
  if (c_start == -1) {
    c_value = 'x';
  } else {
    c_start = c_value.indexOf("=", c_start) + 1;
    var c_end = c_value.indexOf(";", c_start);
    if (c_end == -1) {
      c_end = c_value.length;
    }
    c_value = unescape(c_value.substring(c_start, c_end));
  }
  return c_value;
}

function emptyAdBlocks() {

  var adBlocks = document.getElementsByClassName("ad-block");

  for (var i = 0; i < adBlocks.length; i++) {

    adBlocks[i].innerHTML = '';

  }

}

function applyRingsideSystem1(rsc = "") {

  if (typeof window.ringside_callback !== 'undefined') {

    if (rsc.length > 0) {
      setQueryStringParameter('bjokid', rsc);
    }

    emptyAdBlocks();

    window.ringside_callback();

  }

}

function getRingsideCookie() {

  console.log('ringside cookie call');

  var gotCookie = getCookie('_rsc');

  if (gotCookie != 'x') {

    populateRingsideVars(document.body, gotCookie);
    applyRingsideSystem1(gotCookie);

  } else {

    setTimeout(function () {

      ringsideCookieAttempts = ringsideCookieAttempts + 1;

      if (ringsideCookieAttempts < 10) {
        getRingsideCookie();
      } else {
        applyRingsideSystem1();
      }

    }, 1000);
  }

}

window.onload = function () {

  if (typeof pageOptions.dataset.ringside_enabled !== "undefined" && pageOptions.dataset.ringside_enabled.length > 0) {
    getRingsideCookie();
  }

  // if(typeof pageOptions.dataset.sms_permitted_carriers !== "undefined" && pageOptions.dataset.sms_permitted_carriers.length > 0){ //pageOptions.dataset.sms_permitted_carrier currently doesn't exist
  //   getCarrier();
  // }

  if (typeof pageOptions.dataset.flashy_title !== 'undefined') {

    var title_config = JSON.parse(pageOptions.dataset.flashy_title);

    titleToAttention({
      first_title: title_config.first_title,
      second_title: title_config.second_title,
      delay: 1200
    });

  }

  window.addEventListener("resize", function () {
    alterScreen()
  });
  window.addEventListener("scroll", function () {
    scrollEvents()
  });

}

function scrollEvents() {

  closeCookieBanner();

}

function replaceBackAction(url) {


  var currentStateParams = window.location.href.split('/');
  currentStateParams = currentStateParams[currentStateParams.length - 1];

  window.history.replaceState(null, document.title, window.location.pathname + "#!/back");
  window.history.pushState(null, document.title, currentStateParams);

  window.addEventListener("popstate", function () {
    if (location.hash === "#!/back") {
      window.history.replaceState(null, document.title, window.location.pathname);
      setTimeout(function () {
        window.location.replace(url);
      }, 0);
    }
  }, false);

}

function screenDimensions() {
  var dimensions = new Array();
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];

  dimensions['width'] = w.innerWidth || e.clientWidth || g.clientWidth;
  dimensions['height'] = w.innerHeight || e.clientHeight || g.clientHeight;

  return dimensions;

}

function alterScreen() {

  var screenXY = screenDimensions();
  var screenWidth = screenXY.width;
  if (screenWidth <= 1024) {
    viewMode = 'tablet';
  }
  if (screenWidth <= 650) {
    viewMode = 'mobile';
  }
  if (screenWidth > 1024) {
    viewMode = 'desktop';
  }

// if(typeof placements !== "undefined"){
// if(safeExec == 1){
// placements.populateAds(screenWidth);
//   }
// }

}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function closeCookieBanner() {

  if (!cookieBannerChecked) {

    cookieBannerChecked = true;

    var cookieBannerEle = document.getElementById('cookie-banner');

    if (typeof cookieBannerEle !== 'undefined' && cookieBannerEle) {

      var parent = cookieBannerEle.parentNode;
      parent.removeChild(cookieBannerEle);

      setCookie('cookie-terms-granted', '1', 365);

    }

  }

}

function resetInput(ele) {

  ele.value = '';

  if (typeof ele.dataset.value_owner !== 'undefined') {
    var ele_val_owner = document.getElementById(ele.dataset.value_owner);
    ele_val_owner.value = '';
  }

  if (typeof ele.dataset.key_owner !== 'undefined') {
    var ele_key_owner = document.getElementById(ele.dataset.key_owner);
    ele_key_owner.value = '';
  }

}

function actionSuggestion(inputID, suggestionContainerID, suggestion, strict_value) {

  var suggestionContainer = document.getElementById(suggestionContainerID);
  var ele = document.getElementById(inputID);
  var ele_val_owner = false;
  var ele_key_owner = false;

  if (typeof ele.dataset.value_owner !== 'undefined') {
    ele_val_owner = document.getElementById(ele.dataset.value_owner);
  }

  if (typeof ele.dataset.key_owner !== 'undefined') {
    ele_key_owner = document.getElementById(ele.dataset.key_owner);
  }

  suggestionContainer.innerHTML = '';
  suggestionContainer.style.display = 'none';

  ele.value = decodeURIComponent(suggestion);

  if (typeof strict_value !== 'undefined' && strict_value.trim().length > 0 && ele_val_owner) {
    ele_val_owner.value = decodeURIComponent(strict_value);
  }

  if (ele_key_owner) {
    ele_key_owner.value = suggestion;
  }

  if (typeof ele.dataset.pillify !== 'undefined') {

    var parent = ele.parentNode;
    ele.style.display = 'none';
    var tag = document.createElement("div");
    tag.setAttribute("rapid-pill", "");
    tag.innerHTML = suggestion;
    tag.onclick = function () {
      resetInput(ele);
      parent.removeChild(tag);
      ele.style.display = 'block';
    }

    rapid.removeHint(ele);
    parent.appendChild(tag);

  }

}

function checkSuggestions(inputID, suggestionContainerID, type) {

  console.log(inputID, suggestionContainerID, type)

  var suggestionContainer = document.getElementById(suggestionContainerID);
  var ele = document.getElementById(inputID);

  if (ele.value.length > 1) {

    var suggestionReqURL = 'handlers/get/suggestions?suggestions=' + type + '&suggestion_str=' + encodeURIComponent(ele.value);

    rapid.ajax(suggestionReqURL, 'GET', '', function (data) {

      var suggestionArry = [];
      if (data) {
        suggestionArry = JSON.parse(data);
      }

      if (suggestionArry.length > 0) {

        var suggestionHTML = "";

        for (var i = 0; i < suggestionArry.length; i++) {
          suggestionHTML += '<div onclick="actionSuggestion(\'' + inputID + '\', \'' + suggestionContainerID + '\', \'' + suggestionArry[i].suggestion + '\', \'' + suggestionArry[i].strict_value + '\');">' + decodeURIComponent(suggestionArry[i].suggestion) + '</div>';
        }

        suggestionContainer.innerHTML = suggestionHTML;
        suggestionContainer.style.display = 'block';

      } else {
//if no suggestions hide the container
        suggestionContainer.innerHTML = '';
        suggestionContainer.style.display = 'none';
      }

    });

  } else {
    suggestionContainer.innerHTML = '';
    suggestionContainer.style.display = 'none';
  }

}

function closeSuggestions(suggestionContainerID) {

  var suggestionContainer = document.getElementById(suggestionContainerID);

  setTimeout(function () {
    suggestionContainer.innerHTML = '';
    suggestionContainer.style.display = 'none';
  }, 300);

  if (typeof suggestionContainer.dataset.value_owner !== 'undefined') {
    var ele_val_owner = document.getElementById(ele.dataset.value_owner);
    ele_val_owner.value = '';
  }

  if (typeof suggestionContainer.dataset.key_owner !== 'undefined') {
    var ele_key_owner = document.getElementById(ele.dataset.key_owner);
    ele_key_owner.value = '';
  }

}

function submit_radius() {

  event.preventDefault();

  var radiusForm = document.getElementById("submit_radius");
  var search_radius = document.getElementById("search_radius");
  var url = 'jobs?' + radiusForm.dataset.value + '&r=' + search_radius.value;

  document.location.href = (url);

}

function get_location() {

  var search_form = document.getElementById("header-search");
  var locale_country = document.getElementById("locale-country");

  if (navigator.geolocation) {

    console.log("Asking for/getting location.");

    navigator.geolocation.getCurrentPosition(function (position) {

      if (position.coords.latitude && position.coords.longitude) {

        rapid.ajax('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude, 'get-3rdparty', '', function (data) {
          if (typeof data != 'undefined' && data.length > 0) {

            var resultArry = JSON.parse(data);

            if (typeof resultArry.error === "undefined" && typeof resultArry.address != 'undefined' && typeof resultArry.address.postcode != 'undefined' && resultArry.address.postcode.length > 0) {

              var geo_location = resultArry.address.postcode.toLowerCase();
              var search_location = document.getElementById("location");
              search_location.value = geo_location;
              var search_form = document.getElementById("header-search");
              search_form.submit();

            }
          }

        });

      }

    }, function (error) {
      console.log(error);
    }, {enableHighAccuracy: true, timeout: 60000});

  } else {
    console.log("location not enabled");
  }

// rapid.ajax('https://maps.google.com/maps/api/geocode/json?address='+address+', '+locale_country.value, 'get-3rdparty', '', function(data){
// if(typeof data != 'undefined' && data.length > 0){
//
// var resultArry = JSON.parse(data);
// if(resultArry.status == "OK"){
//
// resultArry = resultArry.results[0];
// resultArry = resultArry.geometry.location;
//
// callback(resultArry.lat, resultArry.lng, passthrough);
//
// }else{
// //simply submit form
// search_form.submit();
// }
//
// }
//
//   });

}

function whatisit(ele) {
  console.log(ele.checked);
  console.log(ele.value);
}

function set_location(lat, lng) {

  var search_form = document.getElementById("header-search");
  var search_lat = document.getElementById("lat");
  var search_lng = document.getElementById("lng");
  search_lat.value = lat;
  search_lng.value = lng;
  search_form.submit();

}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function search_submit(search_form_id) {

  var search_form_id = (typeof search_form_id !== 'undefined' && search_form_id !== null) ? search_form_id : "search";

  var search_form = document.getElementById(search_form_id);
  var search_keywords = search_form.elements[0];
  var search_location = search_form.elements[1];

  if (typeof pageOptions.dataset.compound_searches_enabled !== 'undefined' && pageOptions.dataset.compound_searches_enabled) {

    var compoundPosition = '';
    var compoundLocation = '';

    if (search_keywords.value.trim().length > 0) {
      compoundPosition = slugify(search_keywords.value) + '-jobs';
    } else {
      compoundPosition = 'jobs'
    }

    if (search_location.value.trim().length > 0) {
      compoundLocation = '-in-' + slugify(search_location.value);
    }

    if (search_keywords.value.trim().length < 1 && search_location.value.trim().length < 1) {
      compoundPosition = '';
    }

    search_form.action = search_form.action + '/' + compoundPosition + compoundLocation;
    search_keywords.disabled = true;
    search_location.disabled = true;

  }

  /*
  if(locationToSearch.length == 4 && locationToSearch.match(/^[0-9]+$/) != null){
  var locale_country = document.getElementById("locale-country");
  locationToSearch = locationToSearch+', '+locale_country.value;
  search_location.value = locationToSearch;
  }
  */

  search_form.submit();

}

function suggestion_submit(ele) {

  var suggested_location = ele.dataset.suggestion;
  go_to_location('', '', ele);

}

function go_to_location(lat, lng, ele) {

  var search_form = document.getElementById("header-search");
  var search_location = document.getElementById("location");
  search_location.value = ele.dataset.suggestion;
  search_form.submit();

}

function getFunctionParts(func) {
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');

  var params = [];

  var param_arry = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

  if (param_arry !== null) {

    param_arry.forEach(function (param) {

      params.push(param.replace(/['"]+/g, ''));

    });

  }

  var fnName = null;
  fnName = fnStr.split('(')[0];

  return {name: fnName, parameters: params};
}

function closeOverlayCallback(response = false) {

  var mailOverlayBtn = document.getElementById("mailing-overlay-button");

  var requireSubscription = document.getElementById("require-subscription");
  if (typeof requireSubscription !== "undefined") {
    requireSubscription.value = "0";
  }

  var subscribeContainerForm = document.getElementById("subscribe-container-form");
  var subscribeContainerSuccess = document.getElementById("subscribe-container-success");
  var subscribeContainerJ2C = document.getElementById("subscribe-container-j2c");

  subscribeContainerForm.style.display = "none";

  var refreshPage = false;
  var autoClose = false;

  if (typeof response.overridden !== 'undefined' && (response.overridden == true || response.overridden == "true")) {
    if ((typeof response.job_suggestion !== 'undefined' && response.job_suggestion)) {
      pendingRefreshOnUserAction = true;
    } else {
      refreshPage = true;
    }
  }

  if ((typeof subscribeContainerJ2C !== 'undefined' && subscribeContainerJ2C.dataset.available == '1') || (response && typeof response.job_suggestion !== 'undefined' && response.job_suggestion)) {

    if (response.job_suggestion) {

      refreshOverlayRequired = false;

      var dynamicSubscribeHeader = document.getElementById("dynamic-subscribe-header");
      var dynamicSubscribeTitleLink = document.getElementById("dynamic-subscribe-title");
      var dynamicSubscribeDetails = document.getElementById("dynamic-subscribe-details");
      var dynamicSubscribeButton = document.getElementById("dynamic-subscribe-button");

      dynamicSubscribeTitleLink.href = dynamicSubscribeButton.href = response.job_suggestion.result.url;

      var title_text = response.job_suggestion.result.title;

      if (typeof response.job_suggestion.result.city !== 'undefined' && response.job_suggestion.result.city.length > 0) {
        title_text += ' - ' + response.job_suggestion.result.city;
      }

      if (typeof response.overridden_search_text !== 'undefined' && response.overridden_search_text.length > 0) {
        dynamicSubscribeHeader.innerHTML = response.overridden_search_text;
      }

      // if(typeof response.job_suggestion.result.mousedown !== 'undefined'){
      //
      //   var fnDetails = getFunctionParts(response.job_suggestion.result.mousedown);
      //   dynamicSubscribeTitleLink.onmousedown = dynamicSubscribeButton.onmousedown = function(){
      //     window[fnDetails.name].apply(null, fnDetails.parameters);
      //
      //   };
      //
      // }

      // dynamicSubscribeTitleLink.onclick = dynamicSubscribeButton.onclick = function(){ recordThenCloseOverlay(response.job_suggestion.result.feedName, response.job_suggestion.result.cpc); };

      dynamicSubscribeTitleLink.innerHTML = title_text;
      dynamicSubscribeButton.innerHTML = response.job_suggestion.result.btn_text;
      dynamicSubscribeDetails.innerHTML = response.job_suggestion.result.details;

    }

    subscribeContainerJ2C.style.display = "block";

  } else {

    subscribeContainerSuccess.style.display = "block";
    autoClose = true;

  }

  if (refreshPage) {

    refreshPage();

  }

  if (autoClose) {

    setTimeout(function () {
      manualCloseOverlay();
    }, 4000);

  }

  navigateToPresetJob();
  userSubscribed = true;

}

function navigateToPresetJob() {

  var compareWith = document.getElementById('compare-with');

  if (overlayNavigation) {

    if (compareWith && window.innerWidth <= 981 && window.location.search.indexOf('hideOverlay') === -1) {
      var compareWindow = window.open(window.location.href + '&hideOverlay=true', '_blank');
      window.location.href = compareWith.value;
      compareWindow.focus();
    } else {
      if (overlayNavigation.dtlID !== null && typeof window['dtl'] !== 'undefined') {

        dtl.navigate(overlayNavigation.dtlID);
        overlayNavigation = false;
        return;

      }

      var win = null;

      if (overlayNavigation.click !== null) {

        win = window.open(overlayNavigation.click, '_blank');

      } else {

        win = window.open(overlayNavigation.url, '_blank');

      }

      overlayNavigation = false;

      if (win) {

        win.focus();

      }
    }

  } else if (compareWith) {
    if (window.innerWidth <= 981 && window.location.search.indexOf('hideOverlay') === -1) {
      var compareWindow = window.open(window.location.href + '&hideOverlay=true', '_blank');
      window.location.href = compareWith.value;
      compareWindow.focus();
    }

  }

}

function fireMetricsEvent(type, key, cpc, source, currency) {

  var adjustedCPC = parseFloat(parseFloat(cpc) / 100);

  if (typeof pageOptions.dataset.ringside_enabled !== "undefined" && pageOptions.dataset.ringside_enabled.length > 0 && typeof ringside !== 'undefined' && typeof ringside.sendEvent === 'function') {
    ringside.sendEvent('macro', type, key, cpc, source, '', '', currency);
    console.log('Ringside fired.');
  }

  if (typeof fbq !== 'undefined') {
    fbq('track', 'Purchase', {content_category: type, content_type: source, currency: currency, value: adjustedCPC});
    console.log('FB fired.');
  }

  if (typeof pageOptions.dataset.gtag_override_events_id !== 'undefined' && pageOptions.dataset.gtag_override_events_id.length > 0 && typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
      'send_to': pageOptions.dataset.gtag_override_events_id,
      'value': adjustedCPC,
      'currency': currency,
      'transaction_id': '',
      'event_callback': function () {
        console.log('Gtag Fired. Adjusted CPC: ' + adjustedCPC);
      }
    });
  }

}

function refreshPage() {

  var position_override_ele = document.getElementById("subscribe-position-override");
  position_override = position_override_ele.value;
  position_override.trim();
  var location_override_ele = document.getElementById("subscribe-location-override");
  location_override = location_override_ele.value;
  location_override.trim();

  var search_keywords = document.getElementById("keywords");
  var search_location = document.getElementById("location");
  var search_form = document.getElementById("header-search");

  if (refreshOverlayRequired) {

    var overlay_suggestion_marker = document.createElement("input");
    overlay_suggestion_marker.setAttribute("type", "hidden");
    overlay_suggestion_marker.setAttribute("name", "overlay_suggestion_marker");
    overlay_suggestion_marker.setAttribute("value", "1");
    search_form.appendChild(overlay_suggestion_marker);

  }

  if (position_override.length > 0) {
    search_keywords.value = position_override;
  }

  if (location_override.length > 0) {
    search_location.value = location_override;
  }

  search_form.submit();

}

function fireRocketJobs() {

  if (typeof pageOptions.dataset.rocketjobs) {

    var body = document.getElementsByTagName("BODY")[0];
    var rocketJobs = document.createElement("img");
    rocketJobs.setAttribute("src", "//ls-track.com/api/convert?org=" + pageOptions.dataset.rocketjobs);
    rocketJobs.setAttribute("width", "0");
    rocketJobs.setAttribute("height", "0");

    body.appendChild(rocketJobs);

  }

}

function fireAppcastPixel() {

  if (typeof pageOptions.dataset.appcast_pixel) {

    var body = document.getElementsByTagName("BODY")[0];
    var appcast_pixel = document.createElement("script");
    appcast_pixel.setAttribute("src", "https://click.appcast.io/pixels/ss3-9421.js?ent=" + pageOptions.dataset.appcast_pixel);

    body.appendChild(appcast_pixel);

  }

}

function fireUpwardPixel() {

  if (typeof pageOptions.dataset.upward_pixel) {

    var body = document.getElementsByTagName("BODY")[0];
    var upward_pixel = document.createElement("img");
    upward_pixel.setAttribute("src", "//l5srv.net/AdServer/convert.ads?aid=" + pageOptions.dataset.upward_pixel);
    upward_pixel.setAttribute("width", "0");
    upward_pixel.setAttribute("height", "0");

    body.appendChild(upward_pixel);

  }

}

function compileEventData(ele) {

  var evnt_data = {
    cpc: '',
    source: '',
    currency: ''
  };

  if (ele && typeof ele.dataset.cpc !== 'undefined' && ele.dataset.cpc.length > 0) {
    evnt_data.cpc = ele.dataset.cpc;
  }

  if (ele && typeof ele.dataset.source !== 'undefined' && ele.dataset.source.length > 0) {
    evnt_data.source = ele.dataset.source;
  }

  if (ele && typeof ele.dataset.currency !== 'undefined' && ele.dataset.currency.length > 0) {
    evnt_data.currency = ele.dataset.currency.toUpperCase();
  }

  return evnt_data;

}

function recordThenCloseOverlay(feedName, feedValue = '0', ele = false) {

  var cpc_value = feedValue;

  if (typeof cpc_value === 'string' && cpc_value.length < 1) {
    cpc_value = 0;
  }

  var evnt_data = compileEventData(ele);

  fireMetricsEvent(ele.dataset.ringside_type, ele.dataset.ringside_key, evnt_data.cpc, evnt_data.source, evnt_data.currency);

  if (typeof ga !== 'undefined') {

    ga('send', 'event', {
      eventCategory: 'Job Click',
      eventAction: feedName + ' Post Subscription',
      eventLabel: '',
      eventValue: cpc_value,
      hitCallback: function () {

        if (typeof fbq !== 'undefined') {

          fbq('trackCustom', 'Subscription Success', {Feed: feedName});

        }

        manualCloseOverlay(1000);

      }
    });

  } else {
    manualCloseOverlay();
  }

}

function closeOverlay(response) {

  if (typeof response !== 'undefined' && typeof response.status !== 'undefined' && response.status == "1") {

    if (response.hasOwnProperty('api_status') && response.api_status.includes('- Ongage SMS -') && response.hasOwnProperty('smsID')) {
      setCookie('smsID', response.smsID, 365);
    }

    if (typeof ga !== 'undefined') {

      ga('send', 'event', {
        eventCategory: 'JBE Sign-Up', eventAction: 'JBE Registration', eventLabel: 'Overlay', hitCallback: function () {
          fireRocketJobs();
          fireAppcastPixel();
          fireUpwardPixel();
          fireBingEvent();
          closeOverlayCallback(response);
        }
      });

    } else {
      closeOverlayCallback(response);
    }
  }

}

function fireBingEvent() {

  if (typeof UET === "function") {
    window.uetq = window.uetq || [];
    window.uetq.push({'ec': 'JBE Sign-Up', 'ea': 'JBE Registration', 'el': 'Overlay', 'ev': 1});
  }

}

function showFormModal() {

  var subscribeContainerForm = document.getElementById("subscribe-container-form");
  var subscribeContainerSuccess = document.getElementById("subscribe-container-success");
  var subscribeContainerJ2C = document.getElementById("subscribe-container-j2c");

  subscribeContainerSuccess.style.display = "none";
  subscribeContainerJ2C.style.display = "none";
  subscribeContainerForm.style.display = "block";

}

function suggestionModalQualifies() {


  var subscribeContainerForm = document.getElementById("subscribe-container-form");
  var subscribeContainerSuccess = document.getElementById("subscribe-container-success");
  var subscribeContainerJ2C = document.getElementById("subscribe-container-j2c");

  var jobExists = typeof subscribeContainerJ2C !== 'undefined' && subscribeContainerJ2C.dataset.available == '1' ? true : false;

  if (jobExists && subscribeContainerSuccess.style.display == 'none' && subscribeContainerJ2C.style.display == 'none' && (subscribeContainerForm.style.display == 'block' || subscribeContainerForm.style.display == '')) {
    return true;
  }

  return false;

}

function manualCloseOverlay(delay = false) {

  navigateToPresetJob();

  if (pendingRefreshOnUserAction) {

    refreshPage();
    return true;

  }

  var invertedLayout = document.getElementById("inverted-layout");

  if (typeof invertedLayout !== "undefined" && invertedLayout.value == "1") {

    showFormModal();
    invertedLayout.value = "0";

  } else {

    if (suggestionModalQualifies()) {

      closeOverlayCallback();

    } else {

      var mailOverlay = document.getElementById("mailing-overlay");
      mailOverlay.style.display = 'none';

      var body = document.getElementsByTagName("BODY")[0];
      body.removeAttribute("style");

    }

    // var mailOverlay = document.getElementById("mailing-overlay");
    // mailOverlay.style.display = 'none';
    //
    // var body = document.getElementsByTagName("BODY")[0];
    // body.removeAttribute("style");

  }

}

function applyButton() {
  var applyBtn = document.getElementById("apply_btn");
  var requireSubscription = document.getElementById("require-subscription");
  requireSubscription = requireSubscription.value;

  if (typeof ga !== 'undefined') {
    ga('send', 'event', {eventCategory: 'JDP Apply Now', eventAction: 'Click Apply'});
  }

  if (requireSubscription == "1") {
    var mailing_overlay = document.getElementById("mailing-overlay");
    var mailing_subtext = document.getElementById("overlay-subtext");
    var mailing_form = document.getElementById("subscribe");
    mailing_subtext.innerHTML = "Please enter your email address below to apply for this job.";
    mailing_form.setAttribute("option-success-callback", "navigateToJob");
    mailing_overlay.setAttribute("option-visible", "1");
    mailing_visible = "1";
    mailing_overlay.style.display = 'block';
  } else {
    navigateToJob();
  }

}

function filterJobTitle(title) {

  var title = title.split(',')[0];
  title = title.split('.')[0];
  title = title.split('|')[0];
  title = title.split('[')[0];
  title = title.split('(')[0];
  title = title.split('-')[0];

  return title.trim();

}

function fetchAndRecordCleanJobTitle(title, location = "", callback) {

  if (title.trim().length > 0) {

    var cleanReqURL = 'handlers/get/position_normalisation?&normalise_title=' + encodeURIComponent(title.trim(title)) + '&location=' + encodeURIComponent(location.trim(location));

    rapid.ajax(cleanReqURL, 'GET', '', function (data) {

      var cleanResults = false;

      if (data) {

        var results = JSON.parse(data);

        if (typeof results.status !== 'undefined' && typeof results.clean_title !== 'undefined' && results.status == 1 && results.clean_title.length > 0) {
          cleanResults = results.clean_title;
        }

      }

      if (callback) {
        callback(cleanResults);
      }

    });

  }

}

function cleanJobTitle(ele, callback = false) {

  if (typeof ele.dataset.job_title !== 'undefined' && ele.dataset.job_title.trim().length > 0) {

    var job_title = "";

    fetchAndRecordCleanJobTitle(ele.dataset.job_title, ele.dataset.job_location, callback);

  }

}

function invokeCleanJobTitles(ele) {

  cleanJobTitle(ele, function (cleanJobTitle) {

    var job_title = "";
    var title_override_field = document.getElementById('subscribe-position-override');

    if (typeof title_override_field !== 'undefined' && title_override_field) {

      if (!cleanJobTitle || cleanJobTitle.trim().length < 1) {
        job_title = filterJobTitle(decodeURIComponent(ele.dataset.job_title.trim()));
      } else {
        job_title = decodeURIComponent(cleanJobTitle.trim());
      }

      if (typeof title_override_field !== 'undefined' && title_override_field) {
        title_override_field.value = job_title;
      }

    }

  });

}

function showOverlay(e, ele) {

  if (!userSubscribed) {

    e.preventDefault();

    var mailing_overlay = document.getElementById("mailing-overlay");
    mailing_overlay.setAttribute("option-visible", "1");
    mailing_overlay.style.display = 'flex';

    var clickEvent = null;

    if (typeof ele.dataset.clickUrl !== 'undefined' && ele.dataset.clickUrl.length > 0) {
      clickEvent = ele.dataset.clickUrl;
    }

    var dtlCampaignID = null;

    if (typeof ele.dataset.dtlCampaignid !== 'undefined') {
      dtlCampaignID = ele.dataset.dtlCampaignid;
    }

    overlayNavigation = {url: ele.href, click: clickEvent, dtlID: dtlCampaignID, element: ele};

  } else {

    if (typeof ele.dataset.dtlCampaignid !== 'undefined' && typeof window['dtl'] !== 'undefined') {
      dtl.navigate(ele.dataset.dtlCampaignid);
    }

  }


}

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}

function navigateToJob() {

  closeOverlay();

  var applyBtn = document.getElementById("apply_btn");
  var applyURL = applyBtn.dataset.url;

  window.location = applyURL;

}

function correctSubEmail(ele) {

  var subInput = document.getElementById("subscribe-input");
  var subBtn = document.getElementById("subscribe-btn");
  var repWith = ele.innerText;
  subInput.value = repWith;
  rapid.invoke(subBtn);

}

function testFn() {
  console.log("test function fired!");
}

function fireEvents(event, ele) {

  if (typeof ele.dataset.residual !== 'undefined') {
    event.preventDefault();
  }

  ggleEvnt(ele);
  residualEvent(ele);

  var evnt_data = compileEventData(ele);
  fireMetricsEvent(ele.dataset.ringside_type, ele.dataset.ringside_key, evnt_data.cpc, evnt_data.source, evnt_data.currency);

}

function residualEvent(ele) {

  if (typeof ele.dataset.residual !== 'undefined') {

    var link = ele.getAttribute("href");

    var evnt = JSON.parse(ele.dataset.residual);
    evnt = JSON.parse(evnt);

    var criteria = "";

    if (evnt.residual_criteria == "0") {
      criteria = evnt.job_title;
    } else if (evnt.residual_criteria == "1") {
      criteria = evnt.job_company;
    }

    window.location.replace(pageOptions.dataset.site_protocol + pageOptions.dataset.site_locale.toLowerCase() + '.' + pageOptions.dataset.site_url + '/search.php?position=' + encodeURIComponent(criteria) + '&location=' + encodeURIComponent(evnt.search_location) + '&residuals=1');

    window.open(link, '_blank');

  }

}

function ggleEvnt(ele) {

  if (typeof ele.dataset.events !== 'undefined') {

    var evnts = JSON.parse(ele.dataset.events);

    if (typeof ga !== 'undefined' && evnts.length > 0) {
      var evnt;
      for (var i = 0; i < evnts.length; i++) {
        evnt = JSON.parse(evnts[i])
        ga(evnt.instruction, evnt.type, {
          eventCategory: evnt.category,
          eventAction: evnt.action,
          eventLabel: evnt.label,
          eventValue: evnt.val
        });
      }
    }

  }

}

function titleToAttention(config) {

  var pause;

  if (!config) config = {};

  var delay = config.delay || 0

  var timeout = config.timeout || false;
  var first_title = config.first_title || document.title;
  var second_title = config.second_title || '';
  var flashWhenBlurred = config.flashWhenBlurred || false;

  if (flashWhenBlurred) {

    pause = setInterval(function () {
      if (document.hidden) {
        flash();
      }
    }, delay);

  } else {

    hold = setInterval(function () {
      flash();
    }, delay);

  }

  function flash() {
    document.title === first_title ? document.title = second_title : document.title = first_title;
  }

  if (timeout) {
    setTimeout(function (hold) {
      clearInterval(hold);
    }, timeout);
  }

}

function toggleSearch() {

  var headerSearch = document.getElementById("header-form");

  if (headerSearch.classList.contains('visible')) {
    mobileSearchEnabled = false;
    headerSearch.classList.remove('visible');
  } else {
    mobileSearchEnabled = true;
    headerSearch.classList.add('visible');
  }

}

function carrierIsAccepted(carrier) {
  //tbc
  return false;

}

function cacheCarrier(data) {

  var toCache = JSON.stringify(data);
  setCookie('_carrier', toCache, 3);

}

function handleCarrier(data) {

  if (data.type === 'request') {
    cacheCarrier(data);
  }

  if (data.status == "1" && data.carrier.length > 0) {

    if (carrierIsAccepted(decodeURIComponent(data.carrier))) {
      displaySMSField();
    }

  }

}

function getCarrier() {

  var carrierCookieData = getCookie('_carrier');

  if (carrierCookieData != 'x') {

    carrierCookieData = JSON.parse(carrierCookieData);
    carrierCookieData.type = 'cookie';

    handleCarrier(carrierCookieData);

  } else {

    var reqURL = 'handlers/get/carrier';

    rapid.ajax(reqURL, 'GET', '', function (data) {

      if (data) {

        data = JSON.parse(data);
        data.type = 'request';

        handleCarrier(data);

      }

    });

  }

  return false;

}

function displaySMSField() {

}

if ('addEventListener' in document) {
  if (typeof FastClick !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      FastClick.attach(document.body);
    }, false);
  }
}
if ('addEventListener' in document) {
  document.addEventListener('click', trackingApiClickEvent);
}

function trackingApiClickEvent(evt) {
  var smsID = getCookie('smsID');
  if (smsID !== 'x') {
    if (evt.target.classList.contains('read-more') || evt.target.classList.contains('header-submit') || evt.target.classList.contains('user-account-btn') || evt.target.tagName.toLowerCase() === 'a') {
      var params = new URLSearchParams(window.location.search);
      var payload = {
        id: smsID,
        event: 'click',
        position: params.get('position'),
        location: params.get('location'),
        userAgent: navigator.userAgent,
        ipAddress: null
      }

      var eventUrls = [
        "https://api.best-jobs-online.com/events",
        "https://api.thejobexpert.com/events",
        "https://api.just-jobs.com/events",
        "https://api.jifjaf.com/events"
      ];
      for (var i = 0; i<eventUrls.length; i++) {
        rapid.ajax(eventUrls[i], 'POST', JSON.stringify(payload), function (data) {
          console.log('RESPONSE:',  data)
        })
      }
    }
  }
}



if (window.location.search.indexOf('hideOverlay') > -1) {
  document.getElementById('subscribe-container-form').style.display = 'none';
  document.getElementById('subscribe-container-j2c').style.display = 'block';
}
