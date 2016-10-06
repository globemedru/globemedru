(function($) {

	$(document).ready(function() {
		
		//Activate ScrollTabs
		var scrollableTabs = $('.tabs').scrollTabs();
		
		//Highlight field label on input focus
		$('input, textarea, select').on('focus blur', toggleLabelFocus);
		function toggleLabelFocus(e) {
			var inputId = e.target.id;
			if (inputId.length > 0) {
				var inputLabel = $('label[for=' + inputId + ']').parent('.field-label');
				if ( e.type == 'focus' ) {
					inputLabel.addClass('field-label-focused');
				} else {
					inputLabel.removeClass('field-label-focused');
				}
			}
		}
		
		//Show and hide hidden filters
		var filtersOpen = null;
		var filterWrap = $('.search-filters');
		var filterId = filterWrap.attr('id');
		var currFilterStatus = sessionStorage.getItem(filterId);
		var filterBtn = $('#toggle-hidden-filters');
		var showHiddenFilters = function() {
			filtersOpen = true;
			sessionStorage.setItem(filterId, 'open');
			filterWrap.addClass('filters-shown');
			filterBtn.val(i18('Fewer Filters','misc'));
		}
		var hideShownFilters = function() {
			filtersOpen = null;
			sessionStorage.removeItem(filterId);
			filterWrap.removeClass('filters-shown');
			filterBtn.val(i18('More Filters','misc'));
		}
		var toggleHiddenFilters = function() {
			if (filtersOpen) {
				hideShownFilters();
			} else {
				showHiddenFilters();
			}
		}
		if (currFilterStatus) {
			showHiddenFilters();
		}
		filterBtn.click(toggleHiddenFilters);
		
		//Show and hide page tools
		var showPageTools = function(e) {
			var trigger = $(this);
			var toShowClass = trigger.data('child');
			var toShow = $('.' + toShowClass);
			toShow.show();
			e.stopPropagation();
		}
		var hidePageTools = function() {
			$('.hidden-tools').hide();
		}
		$('.show-page-tools').click(showPageTools);
		$('.hide-page-tools').click(hidePageTools);
		$(document).on('click', function(e) {
			if ($('.hidden-tools').length && !$(e.target).closest('.hidden-tools').length) {
				hidePageTools();
			}
		});
		
		function toggleListHeaderElements(counter) {
			$this = counter;
			$batch_btn = $this.closest(".lst-cnt").siblings(".lst-batch").eq(0).find(".ListToolMenuLink, .btn").eq(0);
			if ($this.text().length > 0) {
				$this.siblings(".lst-cnt-string").eq(0).hide();
				$batch_btn.removeClass("ListToolMenuLink btn btn_disabled").addClass("btn btn_primary");
				$batch_btn.attr("href", $batch_btn.attr("data-href"));
				$batch_btn.attr("onclick", $batch_btn.attr("data-onclick"));
			} else {
				$this.siblings(".lst-cnt-string").eq(0).show();
				$batch_btn.removeClass("ListToolMenuLink btn btn_primary").addClass("btn btn_disabled");
				$batch_btn.attr("data-href", $batch_btn.attr("href")).attr("href", "javascript:return false;");
				$batch_btn.attr("data-onclick", $batch_btn.attr("onclick")).attr("onclick", "");

			}
		}
		
		//Hide count string if any items selected
		$('#list_items_selected_counter').each(function() {
			toggleListHeaderElements($('#list_items_selected_counter'));
		}).on('change', function() {
			toggleListHeaderElements($('#list_items_selected_counter'));
		});
	});
	
	$.fn.toggleContent = function(e, options) {
		var $this = this,
			defaults = {
				target : 'form'
			},
			options = $.extend({}, defaults, options),
			target = $this.next(options.target);
		e.preventDefault();
		if (e.type == 'click' || e.which == 13) {
			if ($this.find('.ti-angle-down').is(':visible')) {
				if (target.is(":visible")) {
					target.slideUp().removeClass("open");
				} else {
					target.slideDown().addClass("open");
				}
			}
		}
	}

	//Center Sign In Card
	$.fn.centerSignIn = function(options) {
		var cElm = $(this);
		var wHeight = $(window).height();
		var cHeight = cElm.height();
		var cDelta = (wHeight - cHeight) - 48;
		if (cDelta > 0) {
			cElm.css('top', (cDelta/2) + 'px');
		}
	}
	$(function() {
		$(window).resize(function() {
			$('.login-wrapper').centerSignIn();
		});
		$('.login-wrapper').centerSignIn();
	});
	
	// Hide/Show Toggle
	$.fn.hideShow = function(options) {
			var defaults = {
				trunc : 150,
				toggle : '[data-toggle=desc-toggle]',		
				toggleClass : 'excerpt',
				target : '.list-desc',
				toggleOpen : 'ti-angle-up',
				toggleClose : 'ti-angle-down'				
			},
			options = $.extend({}, defaults, options);
			
		this.each(function() {
			var $this = $(this),
				$desc = $this.find(options.target),
				excerpt = $desc.html().substring(0, options.trunc) + '...',
				fulltext = $desc.html(),
				$toggle = $this.find(options.toggle),
				content;			
			
			$desc.html(excerpt).addClass(options.toggleClass);
			$toggle.addClass(options.toggleClose);
		
			$toggle.on("click keypress", function(e) {
				e.preventDefault();
				$desc.toggleClass(options.toggleClass);
				$toggle.toggleClass(options.toggleOpen + ' ' + options.toggleClose);
				if (e.type === 'click' || e.which === 13) {
					if($desc.hasClass(options.toggleClass)) {
						content = excerpt;
						hidden = true;	
					} else {
						content = fulltext;
						hidden = false;
					}
					$desc.html(content).attr('aria-hidden', hidden);
				}
			});		
		});
	}
})(jQuery);
