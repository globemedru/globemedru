(function($){
	
	var toggleActionsMenu = function openActionsMenu(obj, e) {
		$('.actions-menu').not(obj).removeClass('menu-show');
		$(obj).prev()
			.addClass('active')
			.attr('aria-expanded', 'true');
		$(obj)
			.addClass('menu-show')
			.attr('aria-expanded', 'true');
	};
	
	$.fn.createValkyrieOptionsMenu = function() {
		$(this).on('click keypress', '.actions-toggle', function(e){
			var $this = $(this),
				$actions_menu = $('.actions-menu');
			if(e.which === 13 || e.type === 'click') {
				if ($this.hasClass("btn_disabled") || $this[0].hasAttribute("disabled")) {
					return false;
				} else {
					toggleActionsMenu($this.next($actions_menu));
				}
			}
			$('body').click(function(e) {
				if(!$(e.target).is('.actions-toggle, .actions-toggle *, .actions-parent')) {
					$actions_menu
						.removeClass('menu-show')
						.attr('aria-expanded', 'false');
					$actions_menu.prev().attr('aria-expanded', 'false');
				}
			});
		});
	};
	
	$(function() {
		var $rows = $('.list-item .list-item-actions .actions-toggle-wrapper');
		if ($rows.length) {
			$rows.each(function(idx, row) {
				var $row = $(row).clone(true),
					$actions = $row.find('[data-primaryaction]'),
					$dest = $(row).closest('.list-item').find('.list-item-body'),
					html = [],
					$acts;
				if ($actions.length && $dest.length) {
					$actions.each(function(i, action) {
						var $action = $(action),
							text = $action.is('input') ? $action.attr('value') : $action.text(),
							href = $action.is('a') ? $action.attr('href') : "javascript:;",
							onclick = $action.attr('onclick'),
							target = $action.attr('target'),
							icon = 'icn-' + ($action.data('icon') ? $action.data('icon') : 'pencil3'),
							$acts;
						$action.remove();
						html.push('<a href="' + href + '"' + (onclick ? (' onclick="' + onclick + '"') : '') + (target ? (' target="' + target + '"') : '') + '><i class="' + icon + '"></i><span>' + text + '</span></a>');
					});
					$acts = $('<div class="list-item-actions-bar">' + html.join(' ') + '</div>');
					$row.find('.actions-toggle').append('<i class="icn-more-vertical"></i>');
					$dest.append($acts);
					if ($row.find(':button, a').length) {
						$acts.append($row);
					}
					$dest.closest('.list-item').addClass('list-item-responsive-actions');
				}
			});
		}
		
		$('.actions-toggle-wrapper').createValkyrieOptionsMenu();

	});
	
}(jQuery));

