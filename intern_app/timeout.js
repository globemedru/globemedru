
var sess_timer_panel = new YAHOO.widget.Panel("sess_timer_panel", {
    width:"300px",
    fixedcenter:true,
    close:false,
    draggable:false,
    modal:true,
    zIndex: 9999,
    visible:false });

function showSessionTimeoutWarning(warn_time_milliseconds,warn_time_minutes,logouttarget,silent_refresh){
  if (silent_refresh == true){
    //if keep me logged in cookie was set - just silently update the timestamp
    updateSessionTimestamp(logouttarget,false);
  } else {
    //else show the warning
    timeout_tracker2 = setTimeout("logoutUserExpireSession('"+logouttarget+"')",warn_time_milliseconds);
    sess_timer_panel.setHeader(i18("Your session is about to expire!", "misc"));
    sess_timer_panel.setBody("<div class='errors' style='margin:0;border:none;'>" + i18("Your session has been inactive and will automatically log out in", "misc") + " " + warn_time_minutes + " " + i18("minutes unless you click", "misc") + " '" +  i18("keep me logged in", "misc") + "'.</div>");
    sess_timer_panel.setFooter("<div style='text-align:center'><input class='btn_reset' type='button' value='" + i18("keep me logged in","misc") + "' onclick='updateSessionTimestamp(\""+logouttarget+"\",true)'> <input type='button' value='" + i18("logout","misc") + "' onclick='logoutUserExpireSession(\""+logouttarget+"\")' class='btn_delete'></div>");
    sess_timer_panel.body.style.padding = "0";
    sess_timer_panel.footer.style.fontSize = "100%";
    YAHOO.util.Dom.addClass(document.body,'yui-skin-sam');
    sess_timer_panel.render(document.body);
    sess_timer_panel.show();
    sess_timer_panel.body.tabIndex = 0;
    sess_timer_panel.body.focus();
  }
}

function updateSessionTimestamp(logouttarget,clear_tracker2){
  
  var handleSuccess = function(o){
    eval(o.responseText);
    sess_timer_panel.hide();
  }
  var handleFailure = function(o){}
  var yuicallback = { 
        success:handleSuccess, 
        failure: handleFailure
  };
  var pars = 'ltarget='+logouttarget+'&ctracker='+clear_tracker2;
  var scriptName = '/utils/updateSessionTimeout.php';
  var yuirequest = YAHOO.util.Connect.asyncRequest('POST', scriptName, yuicallback,pars);
  
}
function logoutUserExpireSession(logouttarget){
  document.location.href = '/logout.php?_lt='+logouttarget;
}
