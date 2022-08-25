"use strict";
/*POLYFILLS*/
if (!document.querySelectorAll) {
  document.querySelectorAll = function (selectors) {
    var style = document.createElement('style'), elements = [], element;
    document.documentElement.firstChild.appendChild(style);
    document._qsa = [];

    style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
    window.scrollBy(0, 0);
    style.parentNode.removeChild(style);

    while (document._qsa.length) {
      element = document._qsa.shift();
      element.style.removeAttribute('x-qsa');
      elements.push(element);
    }
    document._qsa = null;
    return elements;
  };
}
if (!document.getElementsByClassName) {
  document.getElementsByClassName = function (classname) {
    var elArray = [];
    var tmp = document.getElementsByTagName("*");
    var regex = new RegExp("(^|\\s)" + classname + "(\\s|$)");
    for (var i = 0; i < tmp.length; i++) {

      if (regex.test(tmp[i].className)) {
        elArray.push(tmp[i]);
      }
    }

    return elArray;
  };
}
if (!document.querySelector) {
  document.querySelector = function (selectors) {
    var elements = document.querySelectorAll(selectors);
    return (elements.length) ? elements[0] : null;
  };
}
if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}
if (!window.Element || !window.Element.prototype || !window.Element.prototype.hasAttribute) {
  (function () {
    function hasAttribute(attrName) {
      return typeof this[attrName] !== 'undefined'; // You may also be able to check getAttribute() against null, though it is possible this could cause problems for any older browsers (if any) which followed the old DOM3 way of returning the empty string for an empty string (yet did not possess hasAttribute as per our checks above). See https://developer.mozilla.org/en-US/docs/Web/API/Element.getAttribute
    }

    var inputs = document.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].hasAttribute = hasAttribute;
    }
  }());
}
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement, fromIndex) {

    var k;

    // 1. Let o be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of o with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = o.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of o with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of o with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

/*MISC HELPFUL FUNCTIONS*/
var helpers = {

  isValid: function (indat) {
    var valid = false;
    if (indat != '' && indat != ' ' && indat != 'null' && indat != null && typeof indat != 'undefined') {
      valid = true;
    }
    return valid;
  },
  isTouchDevice: function () {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  },
  elementType: function (ele) {
    var eleType = ele.nodeName.toLowerCase();
    return eleType;
  },
  parent: function (ele) {
    return ele.parentNode;
  },
  isJson: function (str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },
  getItemsByRelevance: function (ele, type) {

    var nodes = ele.childNodes;
    var nodesFiltered = [];

    if (type == 'form') {

      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeName.toLowerCase() == 'input' || nodes[i].nodeName.toLowerCase() == 'textarea' || nodes[i].nodeName.toLowerCase() == 'select') {
          nodesFiltered.push(nodes[i]);
        }
      }

    }

    return nodesFiltered;

  },
  contains: function (needle, haystack) {
    return haystack.indexOf(needle) > -1;
  }
};

function makeHttpObject() {
  try {
    return new XMLHttpRequest();
  } catch (error) {
  }
  try {
    return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (error) {
  }
  try {
    return new ActiveXObject("Microsoft.XMLHTTP");
  } catch (error) {
  }

  throw new Error("Could not create HTTP request object.");
}

/*RAPID SCRIPT*/


var rapid = {
  clickAction: 'click',
  init: function () {

    var activeEle = "";
    //check if touch device
    var touchDevice = helpers.isTouchDevice;
    if (touchDevice == true) {
      this.clickAction = 'touchend';
    }

    //set listener to listen for enter/submission
    document.addEventListener('keypress', function (e) {
      var key = e.which || e.keyCode;
      if (key === 13) { // 13 is enter

        //get the element that has focus
        activeEle = document.activeElement;
        var eleType = helpers.elementType(activeEle);

        if (eleType == "input" || eleType == "select") {

          var activeParent;

          //get the parent
          if (helpers.elementType(activeEle.parentNode) == 'form') {
            activeParent = activeEle.parentNode;
          } else if (helpers.elementType(activeEle.parentNode.parentNode) == 'form') {
            activeParent = activeEle.parentNode.parentNode;
          } else if (helpers.elementType(activeEle.parentNode.parentNode.parentNode) == 'form') {
            activeParent = activeEle.parentNode.parentNode.parentNode;
          } else if (helpers.elementType(activeEle.parentNode.parentNode.parentNode.parentNode) == 'form') {
            activeParent = activeEle.parentNode.parentNode.parentNode.parentNode;
          }


          if (typeof activeParent !== 'undefined') {

            //get the button within the form
            var activeButton = activeParent.querySelectorAll("[rapid-button]")[0];
            if (helpers.isValid(activeButton)) {
              rapid.invoke(activeButton, e);
            }

          }

        }


      }
    });


    //execute the invoke method on the button

    //get all button elements and add listeners
    var rapidButtons = document.querySelectorAll("[rapid-button]");
    var button;

    for (var i = 0; i < rapidButtons.length; i++) {

      button = rapidButtons[i];

      if (helpers.isValid(button)) {

        button.addEventListener(this.clickAction, function (event) {
          rapid.invoke(this, event)
        });

      }

    }

    //get all hints elements and add listeners
    var rapidHints = document.querySelectorAll("[option-hint]");
    var hint;

    for (var i = 0; i < rapidHints.length; i++) {

      hint = rapidHints[i];

      if (helpers.isValid(hint)) {

        hint.addEventListener("focus", function (event) {
          rapid.focusHint(this, event)
        });
        hint.addEventListener("blur", function (event) {
          rapid.blurHint(this, event)
        });

      }

    }

    //get all close elements and add listeners

    var rapidCloses = document.querySelectorAll("[rapid-close]");
    var close;

    for (var i = 0; i < rapidCloses.length; i++) {

      close = rapidCloses[i];

      if (helpers.isValid(close)) {
        close.addEventListener(this.clickAction, function (event) {
          rapid.invoke(this, event)
        });
      }

    }

    //get specific form items (checkbox group) and add listeners
    var rapidCheckboxes = document.querySelectorAll("[rapid-checkbox-group]");
    var checkbox;

    for (var i = 0; i < rapidCheckboxes.length; i++) {

      checkbox = rapidCheckboxes[i];

      if (helpers.isValid(checkbox)) {

        checkbox.addEventListener(this.clickAction, function (event) {
          rapid.toggleCheckbox(this, event, true, false)
        });

      }

    }

    //get specific form items (checkbox group) and add listeners
    var rapidCheckboxes = document.querySelectorAll("[rapid-checkbox-multi]");
    var checkbox;

    for (var i = 0; i < rapidCheckboxes.length; i++) {

      checkbox = rapidCheckboxes[i];

      if (helpers.isValid(checkbox)) {

        checkbox.addEventListener(this.clickAction, function (event) {
          rapid.toggleCheckbox(this, event, true, true)
        });

      }

    }

    //get specific form items (checkboxes) and add listeners
    var rapidCheckboxes = document.querySelectorAll("[rapid-checkbox]");
    var checkbox;

    for (var i = 0; i < rapidCheckboxes.length; i++) {

      checkbox = rapidCheckboxes[i];

      if (helpers.isValid(checkbox)) {

        checkbox.addEventListener(this.clickAction, function (event) {
          rapid.toggleCheckbox(this, event, false, false)
        });

      }

    }

    //get specific form items (checkboxes) and add listeners
    var rapidCheckboxMultiSelectAlls = document.querySelectorAll("[rapid-checkbox-multi-select-all]");
    var checkboxOption;

    for (var i = 0; i < rapidCheckboxMultiSelectAlls.length; i++) {

      checkboxOption = rapidCheckboxMultiSelectAlls[i];

      if (helpers.isValid(checkboxOption)) {

        var checkboxIdentifier = checkboxOption.getAttribute('rapid-checkbox-multi-select-all');
        var checkboxOptions = checkboxOption.getAttribute("rapid-options");

        checkboxOption.addEventListener(this.clickAction, function (event) {
          rapid.toggleCheckboxMultiple(this, checkboxIdentifier, checkboxOptions, event)
        });

      }

    }

    //get all general action elements and add listeners

    var rapidActions = document.querySelectorAll("[rapid-action]");
    var action;
    var invokeFunction;

    for (var i = 0; i < rapidActions.length; i++) {

      action = rapidActions[i];
      invokeFunction = action.getAttribute("rapid-action");

      if (helpers.isValid(action)) {
        action.addEventListener(this.clickAction, function (event) {

          if (event) {
            event.preventDefault();
          }

          window[invokeFunction]();

        });
      }

    }

    //get all auto tabs

    var rapidTabs = document.querySelectorAll("[rapid-auto-tab]");
    var action;
    var afterStroke;

    for (var i = 0; i < rapidTabs.length; i++) {

      var tab = rapidTabs[i];
      afterStroke = tab.getAttribute("rapid-auto-tab");

      if (helpers.isValid(tab)) {

        tab.addEventListener('keyup', function (event) {

          var currentNode = event.target;

          if (currentNode.value.length >= afterStroke) {

            var allElements = document.querySelectorAll('input, button, a, area, object, select, textarea, [contenteditable]');

            var currentIndex = [].concat(_toConsumableArray(allElements)).findIndex(function (el) {
              return currentNode.isEqualNode(el);
            });

            allElements[currentIndex + 1].focus();

          }

        });

      }

    }

  },
  attributes: function (ele) {
    var attrArry = ele.attributes;
    var attrList = [];
    for (var i = 0; i < attrArry.length; i++) {
      attrList.push(attrArry[i].nodeName);
    }
    return attrList;
  },
  focusHint: function (ele, event) {

    var message = ele.getAttribute("option-hint");
    var messageNode = document.createElement('div');
    var parElem = helpers.parent(ele);

    var existingEle = parElem.getElementsByClassName("rapid-hint");

    if (existingEle.length < 1) {

      messageNode.setAttribute("rapid-hint", "");
      messageNode.setAttribute("class", "rapid-hint");
      messageNode.setAttribute("option-error", "");
      messageNode.innerHTML = message;
      parElem.appendChild(messageNode);
      window.getComputedStyle(messageNode).opacity;
      messageNode.setAttribute("option-visible", "");

    }

  },
  blurHint: function (ele, event) {

    setTimeout(function () {

      rapid.removeHint(ele);

    }, 1000);

  },
  removeHint: function (ele) {

    var parElem = helpers.parent(ele);

    var currentHint = parElem.getElementsByClassName("rapid-hint");
    if (typeof currentHint !== 'undefined' && typeof currentHint[0] !== 'undefined') {
      parElem.removeChild(currentHint[0]);
    }


  },
  actionDerivatives: function (eleID, rpd) {

    if (helpers.isValid(rpd.getAttribute("option-derivatives"))) {

      var derivatives = JSON.parse(rpd.getAttribute("option-derivatives"));

      Object.keys(derivatives).forEach(function (derivativeID) {

        var derivative_operators = derivatives[derivativeID];
        var currentVal = document.getElementById(eleID).value;

        if (derivative_operators.includes('||')) {

          var operator_arry = derivative_operators.split('||');
          var set = false;

          for (var i = 0; i < operator_arry.length; i++) {

            var valToMatch = operator_arry[i];

            if (currentVal == valToMatch) {
              document.getElementById(derivativeID).style.display = 'block';
              document.getElementById(derivativeID).setAttribute('option-ignore-validation', 'false');
              set = true;
              break;
            }

          }

          if (!set) {
            document.getElementById(derivativeID).style.display = 'none';
            document.getElementById(derivativeID).setAttribute('option-ignore-validation', 'true');
          }

          return true;

        }

        return true;

      });

    }


  },
  mirrorTo: function (targetID, source) {
    var target = document.getElementById(targetID);
    if (typeof target !== 'undefined' && target) {
      target.value = source.value;
    }
  },
  toggleCheckboxMultiple: function (ele, groupIdentifier, options, event) {

    var rapidCheckboxOptions = document.querySelectorAll("[rapid-checkbox-multi=" + groupIdentifier + "]");
    var rapidCheckboxBoxControllers = document.querySelectorAll("[rapid-checkbox-multi-select-all=" + groupIdentifier + "]");
    var rapidCheckbox;

    var forceState = 'checked';

    if (options) {

      var parsedOptions = JSON.parse(options, true);

      for (var i = 0; i < rapidCheckboxBoxControllers.length; i++) {

        var rapidCheckboxBoxController = rapidCheckboxBoxControllers[i];

        if (rapidCheckboxBoxController.innerHTML === parsedOptions.deselectedText) {
          rapidCheckboxBoxController.innerHTML = parsedOptions.selectedText;
        } else {
          rapidCheckboxBoxController.innerHTML = parsedOptions.deselectedText;
          forceState = 'unchecked';
        }

      }

    }

    for (var i = 0; i < rapidCheckboxOptions.length; i++) {

      rapidCheckbox = rapidCheckboxOptions[i];

      if (helpers.isValid(rapidCheckbox)) {

        rapid.toggleCheckbox(rapidCheckbox, event, true, true, forceState);

      }

    }

  },
  toggleCheckbox: function (ele, event, grouped, multi, forceState) {
    forceState = forceState || false;
    var active = false;


    if (grouped && !multi) {

      var groupID = ele.getAttribute("rapid-checkbox-group");
      var groupFields = document.querySelectorAll('[rapid-checkbox-group="' + groupID + '"]');

      for (var i = 0; i < groupFields.length; i++) {
        if (groupFields[i] !== ele) {
          groupFields[i].removeAttribute("checked");
        }
      }

    }

    if (!forceState) {

      if (ele.hasAttribute("checked")) {
        ele.removeAttribute("checked");
      } else {
        ele.setAttribute("checked", "");
        active = true;
      }

    } else {

      if (forceState === 'checked') {

        ele.setAttribute("checked", "");
        active = true;

      } else if (forceState === 'unchecked') {

        ele.removeAttribute("checked");

      }

    }

    if (ele.hasAttribute("value-nominee") && ele.hasAttribute("value")) {
      var valNominee = document.getElementById(ele.getAttribute("value-nominee"));
      var val = ele.getAttribute("value");
      if (typeof valNominee !== 'undefined') {

        if (active) {

          if (!grouped || multi) {

            var data = {};

            if (valNominee.value.length > 0) {
              data = JSON.parse(valNominee.value);
            }

            data[ele.id] = val;

            valNominee.value = JSON.stringify(data);

          } else {
            valNominee.value = ele.getAttribute("value");
          }

        } else {

          if (!grouped || multi) {

            var data = {};

            if (valNominee.value.length > 0) {
              data = JSON.parse(valNominee.value);
            }

            delete data[ele.id];

            valNominee.value = JSON.stringify(data);

          } else {
            valNominee.value = '';
          }
        }

        if (valNominee.value == "{}") {
          valNominee.value = "";
        }

      }
    }

  },
  invoke: function (ele, event) {

    if (event) {
      event.preventDefault();
    }
    //check valid item

    if (helpers.isValid(ele)) {

      var invokeID = ele.getAttribute("invoke");
      var invokeFunction = ele.getAttribute("invoke-function");
      var invokeFunctionParams = ele.getAttribute("invoke-function-params");

      if (helpers.isValid(invokeFunction)) {

        if (!helpers.isValid(invokeFunctionParams)) {
          invokeFunctionParams = null;
        }

        window[invokeFunction](invokeFunctionParams);

      } else if (helpers.isValid(invokeID)) {

        var targetEle = document.getElementById(invokeID);

        if (helpers.isValid(targetEle)) {

          var eleType = helpers.elementType(targetEle);

          if (eleType == "div") {

            var rapidAttributes = rapid.attributes(targetEle);

            //IF IS OVERLAY OR MODAL
            if (helpers.contains('rapid-overlay', rapidAttributes) || helpers.contains('rapid-modal', rapidAttributes)) {
              targetEle.style.display = 'none';
            }

          } else if (eleType == 'form') {

            //get the target
            var target = targetEle.getAttribute("action");

            var ajaxEnabled = true;
            if (helpers.isValid(targetEle.getAttribute("option-ajax"))) {
              ajaxEnabled = targetEle.getAttribute("option-ajax");
            }

            var formIsDeferred = false;
            var formDeferralNominees = false;
            var formDeferralAccumilationTarget = false;

            if (helpers.isValid(targetEle.getAttribute("option-deferred"))) {
              formIsDeferred = true;
            }

            if (helpers.isValid(targetEle.getAttribute("option-deferred-field-target"))) {
              formDeferralAccumilationTarget = targetEle.getAttribute("option-deferred-field-target");
              formDeferralAccumilationTarget = document.getElementById(formDeferralAccumilationTarget);
            }

            if (helpers.isValid(targetEle.getAttribute("option-deferral-nominees"))) {

              var formDeferralNomineesArry = targetEle.getAttribute("option-deferral-nominees").split("}");
              var formDeferralNomineesSubArry = [];

              for (var v = 0; v < formDeferralNomineesArry.length; v++) {

                if (formDeferralNomineesArry[v].length > 0) {

                  var deferralNominee = formDeferralNomineesArry[v].split("{")[1];
                  deferralNominee = JSON.parse('{' + deferralNominee + '}');
                  formDeferralNomineesSubArry.push(deferralNominee);

                }

              }

              var formDeferralNominees = [];

              formDeferralNomineesSubArry.map(function (formDeferralNominee) {
                formDeferralNominees.push(document.getElementById(formDeferralNominee.id));
              });

            }

            var valid = 1;
            var validationFields = targetEle.querySelectorAll("[rapid-field]");
            var validation, validateSub, fieldEle, currElement, valMsg, progressLoader, aggregated;
            var validate = true;

            //remove any error messages
            var errorNotifications = targetEle.querySelectorAll("[rapid-notification]");
            //remove previous error messages
            for (var i = 0; i < errorNotifications.length; i++) {
              targetEle.removeChild(errorNotifications[i]);
            }

            var rapidButtons = targetEle.querySelectorAll("[rapid-button]");

            for (var i = 0; i < rapidButtons.length; i++) {

              if (helpers.isValid(rapidButtons[i].getAttribute("option-progress-loader"))) {
                progressLoader = rapidButtons[i].getAttribute("option-progress-loader");

                if (progressLoader.length > 0) {

                  var progressLoaderOptions = JSON.parse(progressLoader);
                  var progressImage = "rapid-assets/loader.svg";
                  var progressWidth = "18px";
                  var progressHeight = "18px";
                  var progressMarginTop = "0";
                  var progressMarginBottom = "0";
                  var progressMarginLeft = "0";
                  var progressMarginRight = "0";
                  var progressPaddingTop = "0";
                  var progressPaddingBottom = "0";
                  var progressPaddingLeft = "0";
                  var progressPaddingRight = "0";
                  var progressPosition = "static";

                  if (helpers.isValid(progressLoaderOptions.image)) {
                    progressImage = progressLoaderOptions.image;
                  }
                  if (helpers.isValid(progressLoaderOptions.width)) {
                    progressWidth = progressLoaderOptions.width;
                  }
                  if (helpers.isValid(progressLoaderOptions.height)) {
                    progressHeight = progressLoaderOptions.height;
                  }
                  if (helpers.isValid(progressLoaderOptions.paddingTop)) {
                    progressPaddingTop = progressLoaderOptions.paddingTop;
                  }
                  if (helpers.isValid(progressLoaderOptions.paddingBottom)) {
                    progressPaddingBottom = progressLoaderOptions.paddingBottom;
                  }
                  if (helpers.isValid(progressLoaderOptions.paddingLeft)) {
                    progressPaddingLeft = progressLoaderOptions.paddingLeft;
                  }
                  if (helpers.isValid(progressLoaderOptions.paddingRight)) {
                    progressPaddingRight = progressLoaderOptions.paddingRight;
                  }
                  if (helpers.isValid(progressLoaderOptions.marginTop)) {
                    progressMarginTop = progressLoaderOptions.marginTop;
                  }
                  if (helpers.isValid(progressLoaderOptions.marginBottom)) {
                    progressMarginBottom = progressLoaderOptions.marginBottom;
                  }
                  if (helpers.isValid(progressLoaderOptions.marginLeft)) {
                    progressMarginLeft = progressLoaderOptions.marginLeft;
                  }
                  if (helpers.isValid(progressLoaderOptions.marginRight)) {
                    progressMarginRight = progressLoaderOptions.marginRight;
                  }
                  if (helpers.isValid(progressLoaderOptions.position)) {
                    progressPosition = progressLoaderOptions.position;
                  }

                  //setup progress loader container
                  var rapidLoaderOrigElementType = rapidButtons[i].tagName;
                  var rapidLoader = document.createElement(rapidLoaderOrigElementType);
                  if (rapidButtons[i].getAttribute("class")) {
                    rapidLoader.setAttribute("class", rapidButtons[i].getAttribute("class"));
                  }
                  if (rapidButtons[i].getAttribute("style")) {
                    rapidLoader.setAttribute("style", rapidButtons[i].getAttribute("style"));
                  }
                  rapidLoader.setAttribute("rapid-loader", "");
                  rapidLoader.innerHTML = '<img src="' + progressImage + '" width="' + progressWidth + ';" height="' + progressHeight + ';" style="padding-top:' + progressPaddingTop + ';padding-bottom:' + progressPaddingBottom + ';padding-left:' + progressPaddingLeft + ';padding-right:' + progressPaddingRight + ';margin-top:' + progressMarginTop + ';margin-bottom:' + progressMarginBottom + ';margin-left:' + progressMarginLeft + ';margin-right:' + progressMarginRight + ';position:' + progressPosition + '" />';
                  rapidButtons[i].style.setProperty("display", "none", "important");
                  rapidButtons[i].parentNode.appendChild(rapidLoader);

                }
              }
            }

            for (var i = 0; i < validationFields.length; i++) {

              currElement = validationFields[i];

              aggregated = currElement.getAttribute("option-aggregated-value");

              if (helpers.isValid(aggregated)) {

                fieldEle = helpers.getItemsByRelevance(currElement, 'form');
                fieldEle = fieldEle[0];

                fieldEle.value = '';

                var values = document.getElementsByName(aggregated);

                values.forEach(function (aggregate) {

                  fieldEle.value += aggregate.value;

                });

              }

              validation = currElement.getAttribute("option-validation");
              if (helpers.isValid(validation)) {

                //fieldEle = currElement.elements;
                fieldEle = helpers.getItemsByRelevance(currElement, 'form');
                fieldEle = fieldEle[0];

                var validationArry = validation.split("}");

                for (var v = 0; v < validationArry.length; v++) {
                  validateSub = validationArry[v].split("{")[1];

                  if (helpers.isValid(validateSub)) {
                    validateSub = JSON.parse('{' + validateSub + '}');
                    if (helpers.isValid(validateSub.message) == false) {
                      valMsg = "Please complete this field.";
                    } else {
                      valMsg = validateSub.message;

                      if (valMsg === '~') {
                        valMsg = "";
                      }

                    }

                    validate = rapid.validate(currElement, fieldEle, validateSub, valMsg);

                    if (validate == false) {
                      valid = 0;
                      break;
                    }

                  }

                }

              }

            }
            /*
            if(helpers.isValid(validation)){

            fieldEle = targetEle.elements[i];

            var validationArry = validation.split("}");
            var validateSub;
            for(var i=0;i<validationArry.length;i++){
            validateSub = validationArry[i].split("{")[1];

            if(helpers.isValid(validateSub)){
            validateSub = JSON.parse('{'+ validateSub +'}');
            if(helpers.isValid(validateSub.message) == false){
            valMsg = "Please complete this field.";
            }else{
            valMsg = validateSub.message;
            }

            var validate = rapid.validate(fieldEle, validateSub.test, validateSub.message);

            if(validate == false){
            valid = 0;
            }

            }

            }

            }
            */
            if (valid === 0) {

              for (var i = 0; i < rapidButtons.length; i++) {

                if (helpers.isValid(rapidButtons[i].getAttribute("option-progress-loader"))) {
                  progressLoader = rapidButtons[i].getAttribute("option-progress-loader");
                  if (progressLoader) {
                    var rapidLoader = rapidButtons[i].parentNode.querySelector("[rapid-loader]");
                    rapidButtons[i].style.display = 'block';
                    rapidButtons[i].parentNode.removeChild(rapidLoader);
                  }
                }
              }

            } else if (valid === 1) {

              if (ajaxEnabled != 'false') {
                if (!event) {
                  event = window.event;
                }

                if (event) {
                  event.preventDefault();
                }

                if (formDeferralNominees) {

                  formDeferralNominees.map(function (formDeferralNominee) {

                    for (var i = 0; i < validationFields.length; i++) {

                      var currElement = validationFields[i];
                      fieldEle = helpers.getItemsByRelevance(currElement, 'form')[0];

                      var nomineeEl = document.createElement("input");
                      nomineeEl.setAttribute("type", fieldEle.type);
                      nomineeEl.setAttribute("style", "display:none;");
                      nomineeEl.setAttribute("name", fieldEle.name);
                      nomineeEl.setAttribute("value", fieldEle.value);

                      formDeferralNominee.appendChild(nomineeEl);

                    }

                  });

                }

                var formSubmitCallback = targetEle.getAttribute("option-submit-callback");

                if (helpers.isValid(formSubmitCallback)) {
                  var formSubmitCallbackArgs = targetEle.getAttribute("option-submit-callback-args");
                  if (helpers.isValid(formSubmitCallbackArgs)) {
                    window[formSubmitCallback](formSubmitCallbackArgs);
                  } else {
                    window[formSubmitCallback]();
                  }

                }

                if (!formIsDeferred) {

                  //get method
                  var reqMethod = targetEle.getAttribute("method");
                  var reqURL = targetEle.getAttribute("action");
                  var reqEnctype = targetEle.getAttribute("enctype");

                  if (typeof reqEnctype !== 'undefined' && reqEnctype === 'multipart/form-data') {

                    var fields = new FormData();

                    for (var i = 0; i < targetEle.elements.length; i++) {

                      var e = targetEle.elements[i];

                      if (e.type === 'file') {
                        fields.append(encodeURIComponent(e.name), e.files[0]);
                      } else {
                        fields.append(encodeURIComponent(e.name), encodeURIComponent(e.value));
                      }

                    }

                  } else {

                    var fieldsArry = [];
                    for (var i = 0; i < targetEle.elements.length; i++) {
                      var e = targetEle.elements[i];
                      fieldsArry.push(encodeURIComponent(e.name) + "=" + encodeURIComponent(e.value));
                    }

                    var fields = fieldsArry.join("&");

                  }


                  //ajax request
                  rapid.ajax(reqURL, reqMethod, fields, function (rapidData) {

                    var ajaxErrorMsg = targetEle.getAttribute("option-error");

                    var ajaxSuccessCallback = targetEle.getAttribute("option-success-callback");
                    var ajaxTimeoutCallback = targetEle.getAttribute("option-timeout-callback");
                    var ajaxResponseHandler = targetEle.getAttribute("option-response-handler");
                    var ajaxTimeout = targetEle.getAttribute("option-timeout");

                    var rapidTimeout;

                    if (helpers.isValid(ajaxTimeout)) {

                      rapidTimeout = setTimeout(function () {
                        if (helpers.isValid(ajaxTimeoutCallback)) {
                          window[ajaxTimeoutCallback](rapidData);
                        }
                      }, ajaxTimeout);

                    }

                    if (rapidData.length > 0 && helpers.isJson(rapidData)) {

                      var rapidjson = JSON.parse(rapidData);
                      var rapidStatus = rapidjson.status;

                      var ajaxSuccessMsg = targetEle.getAttribute("option-success");
                      var ajaxSuccessNavigate = targetEle.getAttribute("option-navigate");

                      if (rapidStatus == "1") {

                        var rapidMessage = rapidjson.msg;

                        if (helpers.isValid(ajaxSuccessMsg) && helpers.isValid(rapidMessage) == false) {
                          targetEle.innerHTML = ajaxSuccessMsg;
                        }

                        if (helpers.isValid(ajaxSuccessCallback)) {

                          var formSuccessCallbackArgs = targetEle.getAttribute("option-success-callback-args");
                          if (helpers.isValid(formSuccessCallbackArgs)) {
                            window[ajaxSuccessCallback](formSuccessCallbackArgs, rapidjson);
                          } else {
                            window[ajaxSuccessCallback](rapidjson);
                          }

                        }

                        if (helpers.isValid(ajaxSuccessNavigate)) {
                          window.location.href = rapidNavigate;
                        }

                        if (helpers.isValid(rapidMessage)) {
                          targetEle.innerHTML = '<div rapid-notification option-success>' + decodeURIComponent(rapidMessage) + '</div>';
                        }

                      } else {

                        clearTimeout(rapidTimeout);

                        for (var i = 0; i < rapidButtons.length; i++) {

                          if (helpers.isValid(rapidButtons[i].getAttribute("option-progress-loader"))) {
                            progressLoader = rapidButtons[i].getAttribute("option-progress-loader");
                            if (progressLoader) {
                              var rapidLoader = rapidButtons[i].parentNode.querySelector("[rapid-loader]");
                              rapidButtons[i].style.display = 'block';
                              rapidButtons[i].parentNode.removeChild(rapidLoader);
                            }
                          }
                        }

                        if (helpers.isValid(rapidjson.message) && !helpers.isValid(ajaxErrorMsg)) {
                          ajaxErrorMsg = rapidjson.message;
                        }

                        var messageNode = document.createElement('div');

                        if (helpers.isValid(rapidjson.message_style)) {
                          messageNode.className = rapidjson.message_style;
                        } else {
                          messageNode.className = 'rapid-error';
                        }
                        messageNode.setAttribute("rapid-notification", "");
                        messageNode.setAttribute("option-error", "");
                        messageNode.innerHTML = ajaxErrorMsg;
                        targetEle.insertBefore(messageNode, targetEle.firstChild);
                        //targetEle.insertBefore(messageNode, targetEle.nextSibling);//add after not before

                      }

                    } else {
                      var messageNode = document.createElement('div');
                      messageNode.innerHTML = ajaxErrorMsg;
                      targetEle.insertBefore(messageNode, targetEle.firstChild);
                    }

                  });

                } else {

                  if (formDeferralAccumilationTarget) {

                    var fieldsArry = [];
                    for (var i = 0; i < targetEle.elements.length; i++) {
                      var e = targetEle.elements[i];
                      if (typeof e.name !== 'undefined' && e.name.length > 0) {
                        var field = document.createElement('input');
                        field.type = "hidden";
                        field.name = e.name;
                        field.value = e.value;
                        formDeferralAccumilationTarget.appendChild(field);
                      }
                    }

                  }

                }

              } else {
                targetEle.submit();
              }
            }


          }//end of form

        }

      }

    }

  },
  validate: function (container, ele, validation, message) {

    var parElem = helpers.parent(ele);

    if (parElem.hasAttribute("option-ignore-validation") && parElem.getAttribute("option-ignore-validation") == "true") {
      return true;
    }

    var valid = 1;
    var errorExists = ele.hasAttribute("option-error");
    var messageNominee = container.hasAttribute("message-nominee");
    //var elementType = helpers.elementType(ele);

    if (validation.test == "empty") {

      if (ele.value.length < 1 || ele.length < 1) {
        valid = 0;
      }

    } else if (validation.test == "email") {

      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(ele.value) == false) {
        valid = 0;
      }

    } else if (validation.test == "postcode") {

      var postcode_country = validation.specifics;

      var re = null;

      if (postcode_country === "UK") {
        re = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
      } else if (postcode_country === "US") {
        re = /^\d{5}(?:-\d{4})?$/;
      } else if (postcode_country === "AU") {
        re = /^(?:(?:[2-8]\d|9[0-7]|0?[28]|0?9(?=09))(?:\d{2}))$/;
      } else if (postcode_country === "IE") {
        re = /^[AC-Y]{1}[0-9]{1}[0-9W]{1}[ \-]?[0-9AC-Y]{4}$/;
      }


      if (re && re.test(ele.value.toUpperCase()) == false) {
        valid = 0;
      }

    } else if (validation.test == "min-length") {

      if (ele.value.length < parseInt(validation.specifics)) {
        valid = 0;
      }

    } else if (validation.test == "max-length") {

      if (ele.value.length > parseInt(validation.specifics)) {
        if (ele.value.length > 0) {
          valid = 0;
        }
      }

    } else if (validation.test == "fixed-length") {

      if (ele.value.length !== parseInt(validation.specifics)) {

        if (ele.value.length > 0) {
          valid = 0;
        }

      }

    } else if (validation.test == "number-only") {

      if (!/^\d*$/.test(ele.value)) {

        if (ele.value.length > 0) {
          valid = 0;
        }

      }

    } else if (validation.test == "max-number") {

      var passed = true;

      if (!/^\d*$/.test(ele.value)) {

        if (ele.value.length > 0) {
          valid = 0;
          passed = false;
        }

      }

      if (passed) {

        if (ele.value > validation.specifics) {
          valid = 0;
        }

      }

    } else if (validation.test == "field-dependency") {

      var dependentField = document.getElementById(validation.specifics);

      if (dependentField.value.length > 0 && ele.value.length < 1) {
        valid = 0;
      }

    }

    if (valid == 0) {

      if (errorExists == false) {

        ele.setAttribute("option-error", "");

        if (!messageNominee) {

          var messageNode = document.createElement('div');
          messageNode.setAttribute("rapid-warning", "");
          messageNode.setAttribute("class", "rapid-warning");
          messageNode.setAttribute("option-error", "");
          messageNode.innerHTML = message;
          parElem.appendChild(messageNode);
          window.getComputedStyle(messageNode).opacity;
          messageNode.setAttribute("option-visible", "");

        } else {

          var messageNomineeID = container.getAttribute("message-nominee");
          var nominatedField = document.getElementById(messageNomineeID);
          nominatedField.innerHTML = message;
          nominatedField.setAttribute("option-visible", "");

        }

      }

      return false;

    } else {

      if (messageNominee) {

        var messageNomineeID = container.getAttribute("message-nominee");
        var nominatedField = document.getElementById(messageNomineeID);

        nominatedField.innerHTML = '';
        ele.removeAttribute("option-error");
        nominatedField.removeAttribute("option-visible");

      } else {

        if (errorExists) {
          var currentMessage = parElem.getElementsByClassName("rapid-warning");
          parElem.removeChild(currentMessage[0]);
          ele.removeAttribute("option-error");
        }

      }

      return true;

    }

  },
  ajax: function (url, method, data, callback, sendthrough) {

    var request = makeHttpObject();
    var isMultipart = false;

    if (method == "GET-3RDPARTY" || method == "get-3rdparty") {

      method = "GET";

      if (new XMLHttpRequest().withCredentials === undefined) {
        var request = new XDomainRequest();
        request.setRequestHeader('Content-Type', 'text/plain');
        request.open(method, url);
      } else {
        request.open(method, url, true);
        request.withCredentials = false;
        request.setRequestHeader('Content-Type', 'text/plain');
      }

    } else {

      request.open(method, url, true);

      if (typeof data.get !== 'undefined') {

        var csrf_token = data.get('_token');

        if (typeof csrf_token !== 'undefined') {
          request.setRequestHeader('X-CSRF-TOKEN', csrf_token);
        }

        var isMultipart = true;

      }

    }

    if (method == "GET" || method == "get") {
      request.send(null);
    } else if (method == "POST" || method == "post") {

      if (!isMultipart) {
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }

      request.send(data);

    } else if (method == "POST_JSON" || method == "post_json") {
      request.setRequestHeader("Content-type", "application/json; charset=utf-8");
      request.send(data);
    }

    request.onreadystatechange = function () {
      if (request.readyState == 4) {

        if (typeof callback !== 'undefined') {
          if (typeof sendthrough != 'undefined') {
            callback(sendthrough, request.responseText)
          } else {
            callback(request.responseText);
          }
        } else {
          return request.responseText;
        }

      }
    };

  }
}
rapid.init();
