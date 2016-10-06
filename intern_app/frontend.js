/* 
 * frontend.js
 *
 * This file contains code SHARED across student, employer, event and other 
 * "front-facing" interfaces.
 *
 * Code intended for use on only a single interface should be placed in {interface}.js
 *
 */

self.focus();

var hat_switcher_switched = false;
var hat_switcher_switched_index = 0;
function switchHatSwitcher() {
  document.getElementById('hat_switcher_user_name').style.display = (hat_switcher_switched ? 'inline' : 'none');
  document.getElementById('hat_switcher_menu').style.display = (hat_switcher_switched ?  'none' : 'inline');
  hat_switcher_switched = !hat_switcher_switched;
}

var popwin_use_window = false;
function confirmDel(whatString) {
  if (!whatString) { whatString='entry'; }
     return confirm(i18('Are you sure you want to delete this','misc')+' '+whatString+'? '+i18('This cannot be undone.','misc')) && confirm(i18('Are you absolutely sure?','misc'));
}


(function($) {

		
	// Make tabs fit
	// requires: jQuery.
	E = YAHOO.util.Event;
		
	
	$(document).ready(function() {
	
		// add proper class names to input elements
		$("input")
			.filter(':submit').addClass('input-submit').end()
			.filter(':button').addClass('input-button').end()
			.filter(':reset').addClass('input-reset')
		;

		/* TEST OVERLAID PANELS IN NEW DESIGN
		var p = new YAHOO.widget.Panel('testpanel',{modal:true,fixedcenter:true});
		p.setBody('Hello!');
		p.setHeader('Test Panel');
		p.setFooter('foot');
		p.render(document.body);
		p.show();
		*/
		
		// function to determine if tabs fit in their row
		var tabsFit = function($tabrow) {
			var availWidth = $tabrow.width();
			var usedWidth = 0;
			$tabrow.find('>li').each(function() {
				usedWidth += $(this).outerWidth();
				$(this).find('.tabtext')
					.data('line-breaks',0)
					.data('truncated',0)
				;				
			});
			return (usedWidth <= availWidth);		
		};
				
		
		// adds line break to longest tab. returns 0 if no line breaks were added
		var lineBreakTabs = function($tabrow) {
			var char = '',
				bestCandidate = null,
				bestCandidateWidth = 0,
				addInitialBreakTo = [],
				parentEl;

			$tabrow.find('li').each(function() {
				parentEl = this;
				$(parentEl).find('.tabtext').each(function() {				
					if ($(this).find('br.tab-mid-break').size() == 0) {
						txt = $(this).text();
						// NOTE: bestCandidate == null is forcing first item to be 'best' to improve readability
						// simplify logic or revert it
						if (txt.indexOf(' ') != -1) {
							addLineBreakToTab(this,' ');
							/*
							if (bestCandidate != null) {
								addInitialBreakTo.push(bestCandidate);							
							}
							bestCandidate = this;
							bestCandidateWidth = $(parentEl).width();
							char = ' ';
							*/
						} else if (txt.indexOf('/') != -1) {
							addLineBreakToTab(this,'/');
							/*						
							if (bestCandidate != null) {
								addInitialBreakTo.push(bestCandidate);
							}
							bestCandidate = this;
							bestCandidateWidth = $(parentEl).width();
							char = '/';
							*/
						} else {
							addInitialBreakTo.push(this);
						}						
					}
				});				
			});
			$(addInitialBreakTo).each(addInitialBreakToTab);
		};
		
		var reSpaces = /\s+/;
		var trimL = /^\s+/;
		var trimR = /\s+$/;
		var addLineBreakToTab = function(tab,char) {
			$(tab).find('br.tab-init-break').remove();
			var txt = $(tab).text().replace(reSpaces,' ').replace(trimL,'').replace(trimR,'');
			var chunks = txt.split(char);
			var middle = Math.ceil(chunks.length/2)-1;
			if (middle == (chunks.length-1)) middle = 0;			
			var txt = '';
			var added = false;
			if (chunks.length > 1) {				
				$(chunks).each(function(n) {
					txt += chunks[n];
					if (n == middle) txt += char + '<br class="tab-mid-break" />';
					txt += ' ';
				});
				$(tab).html(txt);
				return true;
			} else {
				return false;			
			}
		}
		
		var addInitialBreakToTab = function() {
			if ($(this).find('br.tab-init-break').length == 0) {
				$(this).prepend('<br class="tab-init-break" />&nbsp;');
			}
		}

		// find and fix overflowing tabs
		$('.tbrw').each(function() {
			var brokelines = true,
				truncated = true;
			if (!tabsFit($(this))) {
				lineBreakTabs($(this));
			}
			/*
			while (!tabsFit($(this)) && brokelines) {				
				brokelines = lineBreakTabs($(this));
			}
			*/
			while (!tabsFit($(this)) && truncated) {
				truncated = false; // truncateTabs($(this));
			}
			$(this).css('height','auto');
		});
		
		
		// find and fix overflowing nav
		var nav_items = $('#csm-navbar>li');
		
		if (nav_items.length) {
			var init_top = nav_items.first().offset().top,
				last_top;
			nav_items.end();
			last_top = nav_items.last().offset().top;
			
			if (init_top != last_top) {
				var h = 0,
					addPad = [];
				$('#csm-navbar>li>a').each(function() {
					if (addLineBreakToTab(this,' ') || addLineBreakToTab(this,'/') || addLineBreakToTab(this,'-')) {
					h = $(this).height();
					} else {
						addPad.push(this);
					}
				});
				if (h > 0) {
						 	
					$(addPad).each(function() {
						var pad = (h - $(this).height()) / 2;
						$(this).css({paddingTop: parseInt($(this).css('padding-top')) + pad, paddingBottom: parseInt($(this).css('padding-bottom')) + pad});
					});					 
					
					// initial break
					//$(addPad).each(addInitialBreakToTab)
					 
					// suffix break
					$(addPad).each(function() {
					//	$(this).css('height',h);
					})
				}
			}
		}
		
		$('#feed-load-more').click(function(e) {
			e.preventDefault();
			
			$.ajax({
				url: 'home/ajax_feed.php',
				dataType: 'json',
				success: function(data) {
							
					var icn = data.icn;
					var type = data.type;
					var title = data.title;
					var link = data.link;
					var body = data.body;
					
					if (icn!='') {
						var item_icn = "feed-item-"+icn;
					}
					if (type!='') {
						var item_type = "feed-item-"+type;
					} else {
						var item_type = "feed-item-misc";
					}
											
					var feed_list_html = "<li class=\"feed-item "+item_icn+" "+item_type+"\">";
										feed_list_html += "<div class=\"feed-item-content\">";
										feed_list_html += "<div class=\"feed-item-label\">"+icn+"</div>";
					if (title!="") {	feed_list_html += "<h4 class=\"feed-item-ttl\">"; }
					if (link!="") {		feed_list_html += "<a href=\""+link+"\">"; }
										feed_list_html += title;
					if (link!="") {		feed_list_html += "</a>"; }
					if (title!="") {	feed_list_html += "</h4>"; }
										feed_list_html += body;
										feed_list_html += "</div>";
										feed_list_html += "</li>";
					
					$('#feed-main #fp-feed .last').removeClass('last');			
					$('#feed-main #fp-feed').append(feed_list_html);
					$('#feed-main #fp-feed li').last().addClass('last');
			
				}			
			});
		});
		
		$('.feed-item .dismiss').click(function(e) {
			e.preventDefault();
			
			if($(this).hasClass("expand")) {
				if($(this).parents('li').hasClass("permanent")) {
					$(this).parents('li').children('.feed-item-content').children().not('.feed-item-ttl, .dismiss').slideDown("normal", function() {
						$(this).parents('li').removeClass("collapsed");
					});
					$(this).parents('li').animate({ "background-position-x": "10px" }, "fast");
				}					
				$(this).removeClass("expand").html("<img src=\"/si_ei/images/x-tan-8.png\" alt=\"Dismiss\" />").attr("title","Expand");
			} else {
				if($(this).parents('li').hasClass("permanent")) {
					$(this).parents('li').animate({ "background-position-x": "-50px" }, "fast", function() {
						$(this).addClass("collapsed");
						$(this).children('.feed-item-content').children().not('.feed-item-ttl, .dismiss').slideUp();
					});
				} else {				
					$(this).parents('li').animate({ "background-position-x": "-50px" }, "fast", function() {
						$(this).addClass("collapsed");
						$(this).children('.feed-item-content').slideUp(function() {
							$(this).parents('li').slideUp();
						});
					});
				}				
				$(this).addClass("expand").html("<img src=\"/si_ei/images/plus-tan-8.png\" alt=\"Expand\" />").attr("title","Expand");
			}
			
		});
		
		if ($('#home-feed #fp-rss a').tipsy) {
			$('#home-feed #fp-rss a').tipsy({gravity: 'n'});
		}
		
		// DASHBOARD
		var dashboard_size_gauge = 0;
		$('.dashboard_static .dashboard_panel').each(function() {
			if($(this).height() > dashboard_size_gauge) {
				dashboard_size_gauge = $(this).height();
			}
		}).css("height",dashboard_size_gauge);
		
		if ($('.dashboard').masonry) {
			$('.dashboard').masonry({
				itemSelector:'.dashboard_panel',
				columnWidth: 487
			});
		}
	
	});
	
})(jQuery);


function printMe() {
  if (typeof(window.print) == 'function') {
    window.print();
  }
  else {
    print();
  }
}

function openPanel(url, w, h, sc, fb, title, footer) {
	if(typeof yuiPanel == 'undefined') {
		yuiPanel = new YAHOO.widget.Panel('yuipanel', {
			contraintoviewport:true,
			underlay: 'none',
			modal: true,
			draggable: true,
			close: true,
			fixedcenter: true,
			zIndex: 4
		});	
		yuiPanel.setHeader(title);
		yuiPanel.setFooter(footer);
		yuiPanel.render(document.body);
		yuiPanel.setBody('<div><iframe width=' + w + ' src=' + url + ' scrolling=' + sc + ' height=' + h + ' frameborder=' + fb + '></div>');
		yuiPanel.center();
	} else {	
		yuiPanel.setHeader(title);
		yuiPanel.setFooter(footer);
		yuiPanel.render(document.body);
		yuiPanel.setBody('<div><iframe width=' + w + ' src=' + url + ' scrolling=' + sc + ' height=' + h + ' frameborder=' + fb + '></div>');
		yuiPanel.center();
	}
	yuiPanel.show();
}

function highlightLiCheckbox(el) {
	if(el.is(':checked')) {
		el.closest('li').addClass('selected');
	} else {
		el.closest('li').removeClass('selected');
	}
}

function closeYUIpanels() {
	parent.jQuery('.yui-panel-container').css('visibility','hidden');
	parent.jQuery('.mask').css('display','none');
}