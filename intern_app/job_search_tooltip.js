(function($) {
    $(document).ready(function() {
        
        var help_icon_timer; 
        function hideIconTimer() {
            help_icon_timer = setTimeout(function() { $(".search_help_icon").hide();}, 100);
        }

        var checkFocus = function() {
            if($(".ui-autocomplete-input, .search_help_icon").is(':focus')) {
               return true;
            } else {
                return false;
            }
        };

        function checkModalShowing() {
            if ($(".help_box").hasClass('help_box_showing')) {
                return true;
            } else {
                return false;
            }
        }

        function hideIcon() {
            var isFocused = checkFocus();
            var isModalShowing = checkModalShowing();
            if (isFocused || isModalShowing) {
                $(".search_help_icon").css('display','block');
            } else {
                hideIconTimer();
            }
        }

        $(".ui-autocomplete-input, .search_help_icon").on('focusin', function() {
            clearTimeout(help_icon_timer);
            $(".search_help_icon").css('display','block');
        }).on('focusout', function() {
            hideIconTimer();       
        });

        $(".search_help_button").click(function() {
            clearTimeout(help_icon_timer);
            $(".help_box").toggleClass('help_box_showing');
            $(".search_help_icon").toggleClass('search_help_icon_colored');
        });

        $(".help_box_close_button").click(function() {
            $(".help_box").removeClass('help_box_showing');
            $(".search_help_icon").removeClass('search_help_icon_colored');
            hideIconTimer();    
         });
    });
}(jQuery));