(function($){
	$(document).ready(function() {

		$(document).on('click', 'a.btn-follow-add, a.btn-follow-hi', function() {
			var action = '';
			var $link = $(this);
			var add_class = 'btn-follow-add';
			var remove_class = 'btn-follow-hi';

			
			if ($link.is('.btn-follow-add')) {
				action = 'add';
			} else {
				action = 'remove';
			}
			var emp_id = $(this).attr('employer_id');
			var user_type = 'student';
			var user_id = '';
			if ($(this).attr('student_id')) {
				user_id = $(this).attr('student_id');
			} else if ($(this).attr('faculty_id')) {
				user_id = $(this).attr('faculty_id');
				user_type = 'faculty';
			} else if ($(this).attr('user_id')) {
				user_id = $(this).attr('user_id');
			}
			$link.parent().append("<span class='temploadingspinner'> <img src='/images/spinner.gif'> </span>");
			$link.hide();
			var add_fav = $.post("/utils/add_favorite_employer.php",{employer_id: emp_id, user_id:user_id, action: action, user_type: user_type }, function(){}).done(function (data) {
					if (data == 'success') {
						if (action == 'add') {
							$link.removeClass(add_class).addClass(remove_class);
							$link.find('i').addClass('icn-check').removeClass('icn-add');
							$link.find('.-text').text($link.attr("data-following-text"));
						} else {
							$link.removeClass(remove_class).addClass(add_class);
							$link.find('i').addClass('icn-add').removeClass('icn-check');
							$link.find('.-text').text($link.attr("data-follow-text"));
						}
					}
					$(".temploadingspinner").remove();
					$link.show();
			});
		});
	});
	
})(jQuery);
