var configMdTheme = function($mdThemingProvider) {
				$mdThemingProvider.definePalette("csmColor1", {
				    "50": "666666",
				    "100": "e0e0e0",
				    "200": "bdbdbd",
				    "300": "a1a1a1",
				    "400": "7a7a7a",
				    "500": "000000",
				    "600": "000000",
				    "700": "000000",
				    "800": "000000",
				    "900": "000000",

				    "A100": "7a7a7a",
				    "A200": "a1a1a1",
				    "A400": "666666",
				    "A700": "000000",

				    "contrastDefaultColor": "light",    // whether, by default, text (contrast)
				                                        // on this palette should be dark or light
				    "contrastDarkColors": [				//hues which contrast should be "dark" by default
				    	"50", "100", "200", "300", "400", "A100"
				    ],
				    "contrastLightColors": undefined    // could also specify this if default was "dark"
				  });
				  $mdThemingProvider.definePalette("csmColor2", {
				    "50": "e06685",
				    "100": "f8e0e6",
				    "200": "f2bdca",
				    "300": "eca1b4",
				    "400": "e47a95",
				    "500": "cc0033",
				    "600": "7a001f",
				    "700": "180006",
				    "800": "250009",
				    "900": "31000c",

				    "A100": "e47a95",
				    "A200": "eca1b4",
				    "A400": "e06685",
				    "A700": "180006",

				    "contrastDefaultColor": "light",    // whether, by default, text (contrast)
				                                        // on this palette should be dark or light
				    "contrastDarkColors": [				//hues which contrast should be "dark" by default
				    	"50", "100", "200", "300", "400", "A100"
				    ],
				    "contrastLightColors": undefined    // could also specify this if default was "dark"
				  });
				  $mdThemingProvider.theme("default")
				    .primaryPalette("csmColor1")
				    .accentPalette("csmColor2")
				};

	

var frameidx=0;
var onestopinline = false;

function nextFrame() {
  frameidx++;
  if (frameidx >= 3) { frameidx=1; }
  return frameidx;
}

(function($){ $(document).ready(function() { $('.ranking-score').popover(); }); })(jQuery);

		jQuery(document).ready(function() {
			var p = new YAHOO.widget.Panel('res-feedback',{fixedcenter:true,visible:false,modal:true});
			p.render(document.body);
			jQuery('#res-comment>a').click(function() { p.show(); return false; });	
			
		});
	

		function asyncAjaxLoaderFireRequest(div_id, source, mode, get_string) {
			var $ = jQuery;
			if (mode == 'http') {
				//hit a web accessible script directly
				var request_url = source;
				if (request_url.indexOf('?') != -1) {
					request_url += '&'+get_string;
				} else {
					request_url += '?'+get_string;
				}
			} else {
				//hit dedicated php script that handles processing (.inc files)
				var pars = '?mode=ajax&async_data='+source+'&async_mode='+mode+'&async_div_id='+div_id+'&'+get_string;
				var request_url = '/utils/asyncDriver.php'+pars;
			}
			
			var ajax_request = $.ajax({
				url: request_url, 
				context: $('#'+div_id), 
				success: function(response) {
					$(this).html(response);
				}
			});

			$('a').on('click',function() { ajax_request.abort(); });
		}

		function asyncAjaxReload(div_id, source, mode, get_string) {
			document.getElementById(div_id).innerHTML = "<img src='/images/ajax-loader.gif' style='display:block;margin:auto;' alt='Loading'><div style='text-align:center; margin-top:10px;'>Loading Similar Jobs</div>";
			asyncAjaxLoaderFireRequest(div_id, source, mode, get_string);
		}
		function fetchLinkedInAuthorize() {
		if (window.XMLHttpRequest) {
			AJAX=new XMLHttpRequest();
		} else {
			AJAX=new ActiveXObject("Microsoft.XMLHTTP");
		}
		if (AJAX) {
			AJAX.open("GET", '/utils/linkedInAuthURL.php', false);
			AJAX.send(null);
			window.open(AJAX.responseText,'linkedin_auth','resizable=0,status=0,menubar=0,location=0');
			return AJAX.responseText;
		} else {
			return false;
		}
	}

var i18s = [];
function i18(str, domain) {
	if (i18s[domain] && i18s[domain][str]) {
		return i18s[domain][str];
	} else {
		return str;
	}
}
