function getGroupSelection(thisElement,includeThis) {
  if (includeThis == null) { includeThis = false; } 
  var range = document.getElementsByTagName('input');
  var selected = new Array();
  var j = 0;
  for (i=0; i<range.length; i++) {
    if (range[i].name == thisElement.name && range[i].type == thisElement.type && range[i].checked == true) {
	if (includeThis || range[i] != thisElement) {   
		selected[j] = range[i].value;
      		j++;				
	}
    }
  }
  return selected;
}
 
function fillForm_open(id) {
	if (document.getElementById(id).style.display == 'none') {
		fillForm(id);
	}
}
function fillForm_close(id) {
	if (document.getElementById(id).style.display != 'none') {
		fillForm(id);
	}
}
function openIfChecked(thisElement,val,target) {
	selected = getGroupSelection(thisElement,true);
	if (in_array(thisElement.value,selected)) {
		fillForm_open(target);
	}
}
function unhidePantoneDetails(id,fieldtext) {
    var trigger = new RegExp("Pantone");
    var inkdetails_id = 'so_formfield_'+id.substring(0,id.length-1)+'details_';
    if (trigger.test(fieldtext)) { // Pantone color!
      document.getElementById(inkdetails_id).style.display = "";
    } else { // NOT a Pantone color! Hide Pantone Details field
      document.getElementById(inkdetails_id).style.display = "none";
    }
}

function unhidePackageQuantity(fieldtext) {
	var checkboxgroup = document.product_order_form["dnf_class_values[product_order][packaging][]"];
    var checkboxes_clicked = false;
    for (i=0; i<checkboxgroup.length; i++) {
        if (checkboxgroup[i].checked) {
            checkboxes_clicked = true;
        }
    }
	// IF NONE Packaging CHECKED -> HIDE Packaging Quantity ELSE SHOW
    if (checkboxes_clicked) {
      document.getElementById('so_formfield_dnf_class_values_product_order__packaging_quant_').style.display = "";
    } else {
      document.getElementById('so_formfield_dnf_class_values_product_order__packaging_quant_').style.display = "none";
    }
}

function handleYUIConnectionSuccess(o) {
  restoreYUIIndicator(o.argument);
  if (o.argument.evalScripts) {
    AjaxYUI.evalScripts(o.responseText);
    o.responseText = AjaxYUI.stripScripts(o.responseText);
  }
  if (o.argument.updater) {
    if (typeof o.argument.updater == 'string') {
      o.argument.updater = document.getElementById(o.argument.updater);
    }
    o.argument.updater.innerHTML = o.responseText;
  } else if (!o.argument.evalScripts) {
    alert(o.responseText);
  }
  if (o.argument.onComplete) {
    o.argument.onComplete(o);
  }
}

function handleYUIConnectionFailure(o){
  restoreYUIIndicator(o.argument);
  var html = "There was an error processing your request:";
  if(o.responseText !== undefined){
    html += "\n\n    " + (o.argument.name ? o.argument.name + ": " : "") + o.statusText;
  }
  html += "\n\nPlease try again or contact support.";
  alert(html);
}

function restoreYUIIndicator(argument) {
  if (argument.indicator.tagName == 'IMG') {
    argument.indicator.style.width = argument.restore_indicator.style.width;
    argument.indicator.style.height = argument.restore_indicator.style.height;
    if (argument.indicator.src.indexOf("working-16x16.gif") > -1) {
      argument.indicator.src = argument.restore_indicator.src;
    }
  } else {
    argument.indicator.innerHTML = argument.restore_indicator;
  }
}

var yui_current_request = false;

function callYUIConnect(util, pars, argument, post){
  if (!argument.delayed) {
    argument.name = util;

    if (!argument.indicator) {
      argument.indicator = argument.updater;
    }
    if (typeof argument.indicator == 'string') {
      argument.indicator = document.getElementById(argument.indicator);
    }
    if (argument.indicator.tagName == 'IMG') {
      argument.restore_indicator = argument.indicator.cloneNode(false);
      argument.indicator.style.width = '16px';
      argument.indicator.style.height = '16px';
      argument.indicator.src = "/yui/build/assets/working-16x16.gif";
    } else if (argument.indicator) {
      argument.restore_indicator = argument.indicator.innerHTML;
      argument.indicator.innerHTML = '<div style="text-align:center; color:brown;"><img src="/yui/build/assets/working-16x16.gif" style="vertical-align:middle;margin-right:.25em;margin-bottom:1px" alt="">processing</div>';
    }
  }

  if (yui_current_request && YAHOO.util.Connect.isCallInProgress(yui_current_request)) {
    argument.delayed = true;
    setTimeout(function() { callYUIConnect(util, pars, argument, post) }, 500);
    return;
  }

  var callback = {
    success: handleYUIConnectionSuccess,
    failure: handleYUIConnectionFailure,
    argument: argument
  };
    if (post) {
      var url = '/utils/' + util;
      var yui_current_request = YAHOO.util.Connect.asyncRequest('POST', url, callback, pars);
    } else {
      var url = '/utils/' + util + '?' + pars;
      var yui_current_request = YAHOO.util.Connect.asyncRequest('GET', url, callback);
    }
}

var AjaxYUI = {
  ScriptFragment: '(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)',

  stripScripts: function(html) {
    return html.replace(new RegExp(AjaxYUI.ScriptFragment, 'img'), '');
  },

  evalScripts: function(html) {
    var matchAll = new RegExp(AjaxYUI.ScriptFragment, 'img');
    var matchOne = new RegExp(AjaxYUI.ScriptFragment, 'im');
    var scripts = html.match(matchAll);
    if (scripts) {
      for(var i=0; i<scripts.length; i++) {
        var js = scripts[i].match(matchOne);
        if (js[1]) {
          eval(js[1]);
        }
      }
    }
  }
}

AjaxYUI.Updater = function(elem,url,params){
  if (typeof elem == 'string') {
    elem = document.getElementById(elem);
  }
  params.updater = elem;
  var callback = {
    success: handleYUIConnectionSuccess,
    failure: handleYUIConnectionFailure,
    argument: params
  };
  var request = YAHOO.util.Connect.asyncRequest('GET', url, callback);
};

function verifyPhoneFormat(txtBox){
  value = txtBox.value;
  var regex = new RegExp("[^0-9|\-]");
  if(value.match(regex)){
    alert("only numeric and dash are allowed.");
    txtBox.value="";
  }else{
    var dash_regex = new RegExp("-","g");
    var replaced_str = value.replace(dash_regex,"");
    if(replaced_str.length != 10){
      alert("your phone number should be 10 digits !");     
      txtBox.value="";
    }
  }  
}

