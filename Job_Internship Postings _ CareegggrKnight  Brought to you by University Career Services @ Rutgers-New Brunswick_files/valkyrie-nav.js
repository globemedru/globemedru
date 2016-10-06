
'use strict';

(function($) {
	
	var throttle = function(callback, limit) {
		var wait = false;
		return function () {
			var context = this, args = arguments;
			if (!wait) { 
				callback.apply(context, args);
				wait = true;
				setTimeout(function () {
					wait = false;
				}, limit);
			}
		}
	};	
	
	var debounce = function(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
	
	$.fn.ValkyrieMenu = function(options) {
		
	var mask_tid,
		closed = true;

		var open = function(e) {
			e.stopPropagation();
			if (closed) {
				$(this).addClass('nav-container-open');
				clearTimeout(mask_tid);
				$('.nav-mask').css('display','block');
				mask_tid = setTimeout(function() {
					$('.nav-mask').addClass('active');
				}, 0);
				closed = false;
			}
		};
		
		var hover = function(e) {
			$(e.currentTarget).addClass('hover');
		};

		var unhover = function(e) {
			$(e.currentTarget).removeClass('hover');
		};
		
		var close = function(e) {
			e.stopPropagation();
			if (!closed) {
					$(this).removeClass('nav-container-open');
				clearTimeout(mask_tid);
				mask_tid = setTimeout(function() {
					$('.nav-mask').removeClass('active');
					setTimeout(function() { 
						$('.nav-mask').css('display', 'none');
					}, 330);
				}, 25);
				closed = true;
			}
		};
		var getSubMenu = function(element) {
			return $('.nav-level', element.parentNode).first();
		};
		
		var toggleChild = function(e) {
			var $target = $(e.currentTarget);
			var sub = getSubMenu(e.currentTarget);
			
			if (sub.length) {
				if (!sub.hasClass('nav-level-open')) {
					openChild(sub, $target);
				} else {
					closeChild(sub, $target);
				}
				return false;
			}
		};
						 	
		var openChild = function(sub, $target) {
			sub.addClass('nav-level-open');
			$target.attr('aria-expanded', true);
		};

		var closeChild = function(sub, $target) {
			sub.removeClass('nav-level-open');
			$target.attr('aria-expanded', false);
		};
		
		var toggle = function(e) {
			var args = arguments;
			if (e) {
				e.stopPropagation();
			}
			if (closed) {
				open.apply(this, args);
			} else {
				close.apply(this, args);
			}
		};
		
		var onKeyUp = function(e) {
		
			// if tab key was pressed
			if (e.which == 9) {
				// determine which, if any, navigation element has focus
				var $focused = $('a:focus', this);
				if ($focused.length) {
					// ensure the menu is open
					open.apply(this, [e]);
					// open any child menu that might exist
					var $target = $(e.target);
					var $sub = getSubMenu(e.target);
					// if a submenu was found, open it.
					if ($sub.length) {
						openChild.apply(this, [$sub, $target]);
					// otherwise, check if the focused element is the child of a submenu and open that.
					} else {
						var $parentsub = $target.closest('.nav-level').not('.nav-level-open');
						if ($parentsub.length) {
							var $parentanchor = $parentsub.siblings('a');
							openChild.apply(this, [$parentsub, $parentanchor]);
						}
					}
				}
			}
		};
		
		var bindEvents = function () {
			
			$(this).on('keyup', $.proxy(onKeyUp, this))
			$(this).on('mouseenter click', $.proxy(open, this));
			$(this).on('mouseleave blur', $.proxy(close, this));

			$('.nav-mask').on('click', $.proxy(close, this));
			$('.nav-item a', this).on('click', $.proxy(toggleChild, this));
			$('.nav-item a', this).on('mouseenter', $.proxy(hover, this));
			$('.nav-item a', this).on('mouseleave', $.proxy(unhover, this));

			$('.nav-toggle').on('click', $.proxy(toggle, this));
			
		};
		
		var setup = function() {
			bindEvents.apply(this);
		};

		$($.proxy(setup, this));
		
	};
	
	$.fn.ValkyrieUserBadge = function() { 
		

		var openTools = function(e) {
			e.stopImmediatePropagation();
			$('.contact-chip', this).addClass('user-tools-open');
			var $icon = $('.contact-chip .toggle-icon', this);
			var openClass = $icon.attr('data-openclass');
			var closedClass = $icon.attr('data-closedclass');
			$icon.addClass(openClass).removeClass(closedClass);
			$('.badge-toggle', this).removeClass('badge-toggle-closed').addClass('badge-toggle-open');
			return false;
		};
		
		var closeTools = function(e) {
			e.stopImmediatePropagation();
			$('.contact-chip', this).removeClass('user-tools-open');
			var $icon = $('.contact-chip .toggle-icon', this);
			var openClass = $icon.attr('data-openclass');
			var closedClass = $icon.attr('data-closedclass');
			$icon.addClass(closedClass).removeClass(openClass);
			$('.badge-toggle', this).removeClass('badge-toggle-open').addClass('badge-toggle-closed');
			return false;
		};
		
		
		var setup = function() {
			$(this).on('click', '.contact-chip .badge-toggle-closed', $.proxy(openTools, this));
			$(this).on('click', '.contact-chip .badge-toggle-open', $.proxy(closeTools, this));
		};

		$($.proxy(setup, this));
		
	};
	
	$.fn.ValkyrieGlobalSearch = function() {
		
		
		var openSearch = function() {
			$('body').addClass('search-open');
		};
		
		var closeSearch = function() {
			setTimeout(function() {
				if (!isFocused()) {
					$('body').removeClass('search-open');
				}
			}, 100);
		};
		
		var isFocused = function() {
			return !!$('#hqs *:focus').length;
		};
		
		if (isFocused()) {
			openSearch();
		}
		$('#hqs').on('focus', '*', openSearch);
		$('#hqs').on('blur', '*', closeSearch);
		
	};
	
	$.fn.ValkyrieFixedHeader = function() {
		
		var $wrapper = $(this);
		
		var check = debounce(function() {
			var scrollTop = $(window).scrollTop();
			if (scrollTop > 88) {
				$wrapper.addClass('scrolled');
			} else {
				$wrapper.removeClass('scrolled');
			}
		}, 250);
		
		$(window).on('scroll', check);
		
		check();
	};
	
			
	
	$(function() {
		$('#nav-container').ValkyrieMenu();
		$('#page-user').ValkyrieUserBadge();
		$('#srch-area').ValkyrieGlobalSearch();
		$('body').ValkyrieFixedHeader();
	});
	
	
})(jQuery);
