timeout_tracker = setTimeout("showSessionTimeoutWarning(300000,5,'students','');",3300000);
(function($){$(window).load(function(){
		var logo = $("#job_emp_logo");
		if (logo.length) {
			var colorThief = new ColorThief();
			var palette = colorThief.getPalette(logo[0], 3);
			var best_color = null;
			for (var i=0; i<palette.length; i++) {
				var rgb = palette[i];
				var darkness = rgb[0] + rgb[1] + rgb[2];
				if (darkness <= (200 * 3)) {
					best_color = palette[i];
					break;
				}
			}
			if (best_color != null) {
				$("#job_header_bg_colorfield").css("background-color", "rgba(" + best_color.join(",") + ",1)");
			}
		}
	});})(jQuery);
jQuery('#fave-move a').prependTo('.job_title');
(function($) { $(function() { 
	$("#fave_move_from").appendTo($("#fave_move_to")); 
	$("[data-moveme]").each(function(idx, el) {
		$dest = $($(el).data("moveme"));
		if ($dest.length) {
			$dest.append(el);
		}
	});
	
})})(jQuery)
jQuery('#follow_button_placeholder').replaceWith(jQuery('#follow_button > *'));

    function getHelpWindow(sys,section,subsection,tab) {
      if (sys != null && section != null) {
        newWin = window.open('/utils/help.php?sys=students&sy='+sys+'&se='+section,'','width=300,height=350,resizable=1,menubar=no,scrollbars=yes,toolbar=no,statusbar=no');
      } else {
        newWin = window.open('/utils/help.php/utils/help.php?sy=students&se=jobs&ta=jobs','','width=300,height=350,resizable=1,menubar=no,scrollbars=yes,toolbar=no,statusbar=no');
      }
      newWin.focus();
      return false;
    }
  


function openTZPanel(url, w, h, sc, fb) {

	tzPanel = new YAHOO.widget.Panel('tzPanel', {
                    contraintoviewport: true,
                    underlay: 'none',
                    modal: true,
                    draggable: true,
                    close: true,
                    fixedcenter: true,
                    width: '420px'
                }); 
                
     tzPanel.setHeader('Select Your Time Zone');
     tzPanel.setFooter(' ');
     tzPanel.render(document.body);
     tzPanel.show();
     tzPanel.setBody('<div><iframe width=' + w + ' src=' + url + '  scrolling=' + sc + ' height=' + h + ' + frameborder=' + fb + '></div>');
     tzPanel.center();
  
}


angular.bootstrap(document.getElementById('page-user'), ['studentCSMApp', 'ngStorage']);