var Tools = function() {	
	return {
		addClass : function(el, cls) {
			var rgx = new RegExp('\\b'+cls+'\\b');
			if (rgx.test(el.className)) return;
			if (el.className.length > 0) cls = el.className+' '+cls;
			el.className = cls;
		},		
		removeClass : function(el, cls) {			
			if (el.className.length == 0) return;
			var rgx = new RegExp('\\b'+cls+'\\b');
			el.className = el.className.replace(rgx,'');
		}
	}
}();


function Hilite(c, r) {
	//var row = document.getElementById(r);
	var row = YAHOO.util.Dom.get(r);
	if (document.getElementById(c).checked) {
		YAHOO.util.Dom.removeClass(row,'checked');
	} else {
		YAHOO.util.Dom.addClass(row,'checked');
//		Tools.addClass(row,'checked');
	}
}

function setHilites(inForm,inField) {
  if (inForm) {
    len = inForm.elements.length;
    var i=0;	
    var idString="";
    for( i=0 ; i<len ; i++) {
      if (inForm.elements[i].name==inField) {
	checkVal=inForm.elements[i].checked;
	if (document.getElementById) {
	  if (checkVal) {
	    YAHOO.util.Dom.addClass(YAHOO.util.Dom.get('row_'+inForm.elements[i].value),'checked');
	  }
	}
      }
    }
  }
}

function setChecked(inForm,inField,val,class_pkey,cursite,doHilite,key_suffix,TAB_SESSION_LINK,responsive) {
  var row;
  var idString="";
  var checkVal = val >= 1 ? 1 : 0;
  var len = inForm.elements.length;
  for(var i=0 ; i<len ; i++) {
    if (inForm.elements[i].name==inField) {
      if (inForm.elements[i].disabled && checkVal) {
        continue;
      }
      inForm.elements[i].checked=checkVal;
      if (doHilite) {
      	if (document.getElementById) {
	    row = document.getElementById('row_'+inForm.elements[i].value);
	    if (checkVal) { 
		YAHOO.util.Dom.addClass(row,'checked');
	    } else {
		YAHOO.util.Dom.removeClass(row,'checked');
	    }
/*	  var row_cells = document.getElementById('row_'+inForm.elements[i].value).cells;
          for (var c=0; c<row_cells.length; c++) {
              row_cells[c].style.backgroundColor = checkVal ? '#DAE2EB' : '';
          } */
	}
      }
    }
  }
	var target = '';
	if(TAB_SESSION_LINK){
		target="/utils/setCheck.php"+TAB_SESSION_LINK+"?id=ALL&state="+checkVal+"&class_pkey="+class_pkey+"&cursite="+cursite+"&key_suffix="+key_suffix;
	}else{
		target="/utils/setCheck.php?id=ALL&state="+checkVal+"&class_pkey="+class_pkey+"&cursite="+cursite+"&key_suffix="+key_suffix;
	}

	if (responsive) {
		target += "&responsive=true";
	}

  _fidx=nextFrame();
  if (onestopinline){
    frames['__hiddenframe' + _fidx].location.href=target;
  } else {
    if (parent.frames['__hiddenframe' + _fidx]) {
      var mainWin = parent;
    } else {
      var mainWin = opener.parent;
    }
    mainWin.frames['__hiddenframe' + _fidx].location.href=target;
  }
}

function setCheck(value,state,cursite,key_suffix,TAB_SESSION_LINK,responsive) {
	var target = '';
	if(TAB_SESSION_LINK){
		target="/utils/setCheck.php"+TAB_SESSION_LINK+"?id="+escape(value)+"&cursite="+cursite+"&key_suffix="+key_suffix+"&state=";
	}else{
		target="/utils/setCheck.php?id="+escape(value)+"&cursite="+cursite+"&key_suffix="+key_suffix+"&state=";
	}

  if (state) {
    target+="1";
  } else {
    target+="0";
  }

	if (responsive) {
		target += "&responsive=true";
	}

  _fidx=nextFrame();
  if (onestopinline){
    frames['__hiddenframe' + _fidx].location.href=target;
  } else {
    if (parent.frames['__hiddenframe' + _fidx]) {
      mainWin = parent;
    } else {
      mainWin = opener.parent;
    }
    mainWin.frames['__hiddenframe' + _fidx].location.href=target;
  }
  return true;
}

function reSetChecked(inForm,inField,cursite,key_suffix,checkedBox,TAB_SESSION_LINK) {
  if (typeof inForm  == 'undefined') return;
  var i=0;
  var idString="";
  var len = inForm.elements.length;
  for( i=0 ; i<len ; i++) {
    if (inForm.elements[i].name==inField) {
      if (inForm.elements[i].disabled) {
        continue;
      }
      var checkVal = 0;
      for (var j=0; j<checkedBox.length; j++) {
	if(inForm.elements[i].id == 'checkbox_'+checkedBox[j]) {
	  checkVal = 1;
	}
      }
      inForm.elements[i].checked=checkVal;
    }
  }
if(TAB_SESSION_LINK){
        var target="/utils/setCheck.php"+TAB_SESSION_LINK+"?id=recheck&cursite="+cursite+"&key_suffix="+key_suffix;
}else{
  var target="/utils/setCheck.php?id=recheck&cursite="+cursite+"&key_suffix="+key_suffix;
}
  _fidx=nextFrame();
  if (onestopinline){
    frames['__hiddenframe' + _fidx].location.href=target;
  } else {
    if (parent.frames['__hiddenframe' + _fidx]) {
      var mainWin = parent;
    } else {
      var mainWin = opener.parent;
    }
    mainWin.frames['__hiddenframe' + _fidx].location.href=target;
  }
}

function killOnClick(id) {
      document.getElementById(id).onclick = function() { void(0) }
}	
function setOnClick(id,func) {
	document.getElementById(id).onclick = function() { eval(func) }
	}
	
