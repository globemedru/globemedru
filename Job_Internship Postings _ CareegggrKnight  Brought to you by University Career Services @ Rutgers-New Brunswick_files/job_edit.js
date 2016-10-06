function showHideContactInfo(inField,form) {
  var prefix = 'so_formfield_'+inField.id.substring(0,inField.id.indexOf('show_contact_info_'));
  //var prefix = 'so_formfield_dnf_class_values_job__';
  if (document.getElementById(prefix + 'show_contact_info_')){
    if((inField.getAttribute('type')=='checkbox' && inField.checked) ||
       (inField.getAttribute('type')=='radio' && inField.value=='1')){
      showField = "";
    } else {
      showField = "none";
    }
    document.getElementById(prefix + 'contact_info_').style.display = showField;
    if(document.getElementById(prefix + 'contact_info__blurb')) {
      document.getElementById(prefix + 'contact_info__blurb').style.display = showField;
    }
    if(document.getElementById(prefix + 'contact_info__divider')) {
      document.getElementById(prefix + 'contact_info__divider').style.display = showField;
    }
  }
}

function checkFormAddDocsChange(inField,form) {
  var prefix = 'so_formfield_'+inField.id.substring(0,inField.id.indexOf('additional_documents__'));
  if (document.getElementById(prefix+'documents_required___')){
    checkVals = getGroupSelection(inField);
    var showField = "none";
    var countChecked = checkVals.length;
    if (inField.checked){
      countChecked = countChecked + 1;
    }
    if (countChecked > 0){
      showField = "";
    }
    var field_name = prefix+'documents_required__';
    document.getElementById(field_name + '_').style.display = showField;
    if(document.getElementById('blurb')) {
      document.getElementById(field_name + 'blurb').style.display = showField;
    }
    if(document.getElementById(field_name + '__blurb')) {
      document.getElementById(field_name + '__blurb').style.display = showField;
    }
    if(document.getElementById(field_name + 'divider')) {
      document.getElementById(field_name + 'divider').style.display = showField;
    }
    //If unchecking additional document, always uncheck document required
    if (inField.checked == false){
      myID = inField.id;
      myRegExp = new RegExp('additional_documents');
      myID = myID.replace(myRegExp,'documents_required');
      document.getElementById(myID).checked = inField.checked;
    }
  }
}

function checkFormReqDocChange(inField,form) {
	var prefix = 'so_formfield_'+inField.id.substring(0,inField.id.indexOf('documents_required__'));
  //If checking a required doc, always set the additional doc to be checked as well
  if (document.getElementById(prefix+'additional_documents___') && inField.checked==true){
    myID = inField.id;
    myRegExp = new RegExp('documents_required');
    myID = myID.replace(myRegExp,'additional_documents');
    document.getElementById(myID).checked = true;
  }
}

function getGroupSelection(thisElement) {
  var range = document.getElementsByTagName('input');
  var selected = new Array();
  var j = 0;
  for (i=0; i<range.length; i++) {
    if (range[i].name == thisElement.name && range[i].type == thisElement.type && range[i] != thisElement && range[i].checked == true) {
      selected[j] = range[i].value;
      j++;
    }
  }
  return selected;
}

function checkFormResumeReceiptChange(inField,form) {
	var prefix = 'so_formfield_'+inField.id.substring(0,inField.id.indexOf('resume_mode__'));

  if(inField.value == "email") {
	
    var showField = (inField.checked) ? "" : "none";
    if (document.getElementById(prefix + 'resume_email_')){
      document.getElementById(prefix + 'resume_email_').style.display = showField;
    }
    if(document.getElementById(prefix + 'resume_email__blurb')) {
      document.getElementById(prefix + 'resume_email__blurb').style.display = showField;
    }
    if(document.getElementById(prefix + 'resume_email__divider')) {
      document.getElementById(prefix + 'resume_email__divider').style.display = showField;
    }
  } else if(inField.value.match("other")) {
    siblings = inField.parentNode.childNodes;
    show = false;
    for(i = 0; i < siblings.length && !show; i++){
       if(siblings[i].nodeType == 1 && siblings[i].nodeName == "INPUT" && siblings[i].value.match("other")){
            show = show || siblings[i].checked;
       }
    }
    var showField = (show) ? "" : "none";
    if (document.getElementById(prefix + 'contact_blurb_')){
      document.getElementById(prefix + 'contact_blurb_').style.display = showField;
    }
    if(document.getElementById(prefix + 'contact_blurb__blurb')) {
      document.getElementById(prefix + 'contact_blurb__blurb').style.display = showField;
    }
    if(document.getElementById(prefix + 'contact_blurb__divider')) {
      document.getElementById(prefix + 'contact_blurb__divider').style.display = showField;
    }
  }
}

function addInterviewerName(button, room){
  var names = button.form['oci_interviewers[' + room + '][]'];
  var html = '';
  var button_html = '<input type="button" value="' + i18('Add Name','misc') +'" onclick="addInterviewerName(this, \'' + room +'\')" class="btn btn_primary space-left-sm">';
  if (names.length) {
    for (var i = 0; i < names.length; ++i) {
      html += '<input name="oci_interviewers[' + room + '][]" value="' + names[i].value + '">';
      if (i == 0) {
        html += button_html;
      }
      html += '<br>';
    }
  } else {
    html = '<input name="oci_interviewers[' + room + '][]" value="' + names.value + '">' + button_html + '<br>';
  }
  html += '<input name="oci_interviewers[' + room + '][]" value=""><br>';
  var room_td = document.getElementById('interviewers_' + room);
  room_td.innerHTML = html;
}


function addEmpInterviewerName(button) {
	var names = button.form['oci_interviewers[]'];
	var html = '';
	var button_html = '<input type="button" value="' + i18('Add Name','misc') +'" onclick="addEmpInterviewerName(this)" class="btn btn_primary">';
	if (names.length) {
		for (var i = 0; i < names.length; ++i) {
			if (typeof RESPONSIVE_THEME != 'undefined' && RESPONSIVE_THEME == 1) {
				html += '<p><input class="input-text" name="oci_interviewers[]" value="' + names[i].value + '"></p>';
			} else {
				html += '<input name="oci_interviewers[]" value="' + names[i].value + '">';
				if (i === 0) {
					html += button_html;
				}
				html += '<br>';
			}
		}
	} else {
			if (typeof RESPONSIVE_THEME != 'undefined' && RESPONSIVE_THEME == 1) {
				html = '<p><input class="input-text" name="oci_interviewers[]" value="' + names.value + '"></p>';
			} else {
				html = '<input name="oci_interviewers[]" value="' + names.value + '">' + button_html + '<br>';
			}
	}
	if (typeof RESPONSIVE_THEME != 'undefined' && RESPONSIVE_THEME == 1) {
		html += '<p><input class="input-text" name="oci_interviewers[]" value=""></p>' + button_html;
	} else {
		html += '<input name="oci_interviewers[]" value=""><br>';
	}
	var name_td = document.getElementById('interviewers_data');
	name_td.innerHTML = html;
}
