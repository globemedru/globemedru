(function($) {
	var secure = (window.location.protocol === 'https:');
	var protocol = 'http://';
	if (secure) {
		var protocol = 'https://';
	}
	var search_url = protocol +  $(location).attr('host') + "/utils/savedSearches.php";
	var pill_url = protocol +  $(location).attr('host') + "/utils/deletePill.php";
	var spinner_dialog = "<div id='ajax_search_busy_dialog'><img src='/si_ei/2010/progress.gif' class='ajax_loading_gif'></div>";
	if (typeof RESPONSIVE_THEME != 'undefined' && RESPONSIVE_THEME == 1) {
		spinner_dialog = '<div id="ajax_search_busy_dialog"><div class="la-ball-clip-rotate"><div></div></div></div>';
	}
	var current_filter_content = '';
				
	$(document).ready(function() {
		var config = window['jobfilters_config'];
		if (config && config.autocomplete) {
			var field_data = {
			  job_title: {label: 'Job Title', order: 0},
			  job_desc: {label: 'Job Description', order: 7}, 
			  job_type: {label: 'Job Type', phrase: 'val Jobs', order: 3},
			  major: {label: 'Major', phrase: 'Jobs for val majors', order: 2},
			  location: {label: 'Location', phrase: 'Jobs near val', order: 6}, 
			  class_level: {label: 'Class Level', phrase: 'Jobs for val class', order: 4},
			  degree_level: {label: 'Degree Level', phrase: 'Jobs for val candidates', order: 5},
			  job_emp: {label: 'Employer', phrase: 'Jobs at val', order: 1}
			};
			$[ "ui" ][ "autocomplete" ].prototype["_renderItem"] = function( ul, item) {
				return $("<li></li>") 
				.data("item.autocomplete", item)
				.append($( "<a></a>" ).html(item.label))
				.appendTo(ul);
			};
			$.widget( "custom.catcomplete", $.ui.autocomplete, {
				_renderMenu: function( ul, items ) {
				  var self = this;
				  var suggestions = [];
				  var currentCategory = "";
				  if (items[3] && items[3].hits) {
					$.each(items[3].hits, function(index, item) {
					  $.each(item.highlight, function(field, data) {
						var container = document.createElement('div');
						container.innerHTML = data[0];
						var value = container.textContent || container.innerText;
						if (field_data[field].phrase)
						  value = field_data[field].phrase.replace('val', value);									 
						if (!suggestions[field_data[field].order])
						  suggestions[field_data[field].order] = {};
						suggestions[field_data[field].order][value] = {value: value, label: data[0], category: field_data[field].label};
					  });
					});
				  }
				  $.each(suggestions, function(order, values) {
					if (values) {
					  $.each(values, function(idx, item) { 
						if (item.category != currentCategory) {
						  ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
						  currentCategory = item.category;
						}
						self._renderItemData(ul, item);
					  });	
					}
				  });
				}
			});
			$('#jobfilters_keywords_').catcomplete({
				source: "/utils/auto_search.php?type=" + config.autocomplete.type,
				select: function(event, ui) {
					if (ui.item) {
						$(this).val(ui.item.value);
					}
					$(".ajax_filter_form").submit();
				}
			});
		}
		var toggleFilterWords = function (action, type) {
			var more = ".ajax_more_filters";
			var less = ".ajax_fewer_filters";

			if (type == 'edit_form') {
				more = ".ajax_edit_filters_toggle " + more;
				less = ".ajax_edit_filters_toggle " + less;
			}

			if (action == 'hide') {
				$(more).show();
				$(less).hide();
			} else if (action == 'show') {
				$(more).hide();
				$(less).show();
			} else if (action == 'toggle') {
				$(more).toggle();
				$(less).toggle();
			}
			
		}

		var handleAdvSearchDisplay = function (action) {
			var id = '.ajax_adv_search_row',
				$win = $(window),
				wrapper_offset = $('.ajax_filter_wrapper').offset()

			toggleFilterWords(action, type);
			$(id).each(function() {
				if (action == 'hide') {
					$(this).hide();
				} else if (action == 'show') {
					$(this).show();
				} else if (action == 'toggle') {
					$(this).toggle();
				}
			});
			
			if ($win.scrollTop() > wrapper_offset.top) {
				window.scrollTo($win.scrollLeft(), wrapper_offset.top);
			}

		}

		var disableSavedSearchesRows = function() {
			$(".existing_saved_row input").each(function() {
				if ($(this).attr('type') != 'button') {
					$(this).prop('disabled', 'disabled');
				}
				if ($(this).attr('type') == 'text') {
					var clickable_val = $(this).val();
					$(this).parent().append("<a href='javascript:;' class='ajax_saved_search_clickable'>" + clickable_val + "</a>");
					$(this).hide();
				}
			});

			$(".existing_saved_row select").each(function() {
				$(this).prop('disabled', 'disabled');
			});
		}

		var enableSavedSearchesRow = function(row_id) {
			$("." + row_id + ", .existing_saved_row input").each(function() {
				if ($(this).attr('type') != 'button') {
					$(this).removeAttr('disabled');
				}
				if ($(this).attr('type') == 'text') {
					$(this).show();
					$(".ajax_saved_search_clickable").remove();
				}
			});

			$("." + row_id + ", .existing_saved_row select").each(function() {
				$(this).removeAttr('disabled');
			});
		}

		var removeSavedSearchesRowButtons = function(row_id) {
			$("." + row_id + ", .existing_saved_row input").each(function() {
				if ($(this).attr('type') == 'button') {
					$(this).remove();
				}
			});
		}

		var resetWindowsAndCSS = function(current) {
			if (current != 'saved_searches') {
				$(".ajax_saved_searches_div").slideUp(100);
				$(".ajax_saved_searches").removeClass('ajax_filter_selected');
			}
			if (current != "filters") {
				$(".ajax_filter_options").slideUp(100);
				$(".ajax_advanced_search_button").removeClass('ajax_filter_selected');
			}

		}

		//these are our filter options
		if ($(".ajax_filter_options").length != 0) {
			$(".ajax_filter_options").hide();
			handleAdvSearchDisplay('hide');
		}

		var updateSavedSearches = function() {
			$.ajax({
				url: search_url,
				data: {type: type, csp_subsystem: csp_subsystem, owner_class:owner_class},
				type: "POST",
				success: function(data) {
					resetSavedSearchesHTML().append(data);
					disableSavedSearchesRows($(".ajax_saved_searches_div"));
				},
				error: function() {
					//do something here if it fails
				},
			});
		}
		
		if ($(".ajax_saved_searches_div").length != 0) {
			updateSavedSearches();
		}
		
		var movePills = function() {
			$(".ajax_filter_form + .ajax_pill_wrapper").remove();
			$(".ajax_pill_wrapper").appendTo($(".ajax_filter_form"));
		}
	movePills();
		
		//advanced options dialog
		$(".ajax_advanced_search_button").click(function() {
			if (current_filter_content) {
				$('.ajax_edit_filter_cancel').click();
			}
			resetWindowsAndCSS('filters');
			$(".ajax_filter_options").slideToggle(100);
			$(".ajax_advanced_search_button").toggleClass('ajax_filter_selected');
		});

		$(".ajax_saved_searches").click(function() {
			resetWindowsAndCSS('saved_searches');
			$(".ajax_saved_searches_div").slideToggle(100);
			$(".ajax_saved_searches").toggleClass('ajax_filter_selected');
		});
		
		$(document).on("click", ".ajax_filter_close, .saved_search_close", function() {
			$('.ajax_edit_filter_cancel').click();
			resetWindowsAndCSS()
		});
		
		$(document).on("submit", ".ajax_filter_form", function() {
			submitFilterForm('default');
			return false;
		});
		
		var loading = function(busy) {
			if (busy) {
				$(spinner_dialog)
					.dialog({modal:true, draggable:false, resizable:false, dialogClass:"ajax_busy_dialog"})
					.siblings('div.ui-dialog-titlebar').remove()
				;
			} else {
				$("#ajax_search_busy_dialog")
					.dialog("close")
					.dialog("destroy")
			}
		}
		
		var submit_xhr;

		var submitFilterForm = function(option, agent_id) {

			if (!submit_xhr || submit_xhr.state() != 'pending') {
				resetWindowsAndCSS();
				$(".ajax_pill_wrapper").remove();
				loading(true);
				if (option == 'default') {
					var postData =  $('.ajax_filter_form').serializeArray();
				} else if (option == 'clear') {
					var postData = {ajax_clear_filters: 'clear'};
				} else if (option == 'agent') {
					var postData = {agent_id: agent_id};
				} else if (option == 'use_session') {
					var postData = '';
				}
				submit_xhr = $.ajax({
					url: processing_url + "&action=ajax_return_list",
					data: postData,
					type: "POST",
					success: function(data) {
						
						$(content_div).empty().append(data);
						movePills();
						loading(false);
					},
					error: function(type, text) {
						//do something here if it fails
						loading(false);
					},
				});
			}
		}

		$(document).on("click", ".ajax_clear_submit", function(e) {
			e.preventDefault();
			$(".ajax_filter_options [id^='hp_input']").each(function(){
				$(this).html('');
			});

			$(".ajax_filter_options [id^='hp_input']").each(function(){
				$(this).val('');
			});

			$(".ajax_filter_options [id^='hp_hidden']").each(function(){
				$(this).val('');
			});

			$(".ajax_filter_options [id$='__real']").each(function(){
				$(this).val('');
			});

			$(".ajax_keyword_filter [name*='keyword']").each(function(){
				$(this).val('');
			});

			$(".ajax_filter_options select").each(function(){
				$(this).val('');
			});

			$(".ajax_filter_options [type='text']").each(function(){
				$(this).val('');
			});
			$(".ajax_filter_options [type='radio']").each(function(){
				$(this).prop('checked', false);
			});
			$(".ajax_filter_options [type='checkbox']").each(function(){
				$(this).val('');
				$(this).prop('checked', false);
			});

			$(".ajax_filter_options [class='ms_field_real']").each(function() {
				var ms_id = $(this).prop('id');
				mult_sel_del_all($(this), ms_id);
			});
			submitFilterForm('clear');
		});

		var saveSearchAgent = function(row_id, agent_id) {
			var label = $("[name='label_" + row_id + "']").val();
			var frequency = $("[name='frequency_" + row_id + "']").val();
			var new_only = $("[name='new_only_" + row_id + "']:checked").val();
			var postData;
			if(agent_id) {
				var filters = $('.ajax_edit_filter_form').serialize();
				postData = {type: type, action: 'update', label: label, frequency: frequency, new_only: new_only, csp_subsystem: csp_subsystem, owner_class: owner_class, agent_id: agent_id, filters: filters}
			} else {
				postData = {type: type, action: 'save', label: label, frequency: frequency, new_only: new_only, csp_subsystem: csp_subsystem, owner_class: owner_class};
			}

			$.ajax({
				url: search_url,
				data: postData,
				type: "POST",
				success: function(data) {
					if(data == 'empty_filters') {
						alert('You must submit a search before it can be saved.');
					} else {
						resetSavedSearchesHTML().append(data);
						disableSavedSearchesRows($(".ajax_saved_searches_div"));
					}
				},
				error: function() {
				},
			});
		}

			//gotta do all the dynamic buttons like this! ack!
		$(document).on('click', '.saved_searches_row_save', function(){
			var row_id = $(this).attr('parent_form');
			saveSearchAgent(row_id);
		});
		
		var resetSavedSearchesHTML = function() {
			ms_already_initialized = false;
			//mult_sel_now_showing = ''; //dynamic hierpicklist hack - if hierpicklist is still using YUI and all actions are based on static ids, you should not remove this
			var close_html = '<a href="javascript:;" class="saved_search_close icon_16 icon_close">Close</a>';
			if (typeof RESPONSIVE_THEME != 'undefined' && RESPONSIVE_THEME == 1) {
				close_html = '<a href="javascript:;" class="saved_search_close ti-close">Close</a>';
			}
			return $(".ajax_saved_searches_div")
				.removeClass('saved_search_edit_dialog')
				.html(close_html)
			;
		};

		var addSavedSearchesEditForm = function(agent_id) {
			$(".ajax_filter_options").hide();
			loading(true);
			$.ajax({
				url: processing_url + "&action=ajax_return_filters",
				data: {agent_id: agent_id, render_edit_form: 'true'},
				type: "POST",
				success: function(data) {
					//var $dialog = $(".ajax_saved_searches_div").append(data);
					var $dialog = $(".ajax_saved_searches_div").html($(".ajax_saved_searches_div").html() + data);
					//$(".ajax_saved_searches_div").css('width', 'auto');
					loading(false);
					fixBustedIframeOnloadEvent(false, true);
					$dialog.find("#jobfilters_keywords_").removeAttr("placeholder");
					$dialog.find(".ajax_filter_close").remove();
					$dialog.find(".ajax_filter_wrapper").removeClass("ajax_filter_wrapper search_filters");
				},
				error: function() {
					loading(false);
				}
			});
		}

		$(document).on('click', '.saved_searches_row_update', function() {
			var row_id = $(this).attr('parent_form');
			var agent_id = $(this).attr('agent_id');
			$("#busyajax_"+agent_id).html('<img src="/images/indicator_arrows_circle.gif">');
			saveSearchAgent(row_id, agent_id);
			var label = $("[name='label_" + row_id + "']").val();
			$("#so_agent_agent_id").find('option[value="'+agent_id+'"]').text(label);
		});

		$(document).on('click', '.saved_searches_row_delete', function(){
			$.ajax({
				url: search_url,
				data: {type: type, action: 'delete', agent_id: $(this).attr('agent_id'), csp_subsystem: csp_subsystem, owner_class: owner_class},
				type: "POST",
				success: function(data) {
					if(data == 'empty_filters') {
						alert('You must submit a search before it can be saved.');
					} else {
						resetSavedSearchesHTML().append(data);
						disableSavedSearchesRows($(".ajax_saved_searches_div"));
					}
				},
				error: function() {
				}
			});
		});

		//ie11 hack - onload iframe event recursively calls when content is set, ready does not.
		var fixBustedIframeOnloadEvent = function(e, set_new) {
			var selector = $("[id ^=ms_field][id $=_frame]");
			if (e) {
				selector = e.find("[id ^=ms_field][id $=_frame]");
			}
			selector.each(function(){
				$(this).attr('onload', 'return;');
				if (set_new) {
				var id = $(this).attr('id');
				var child_id = id.split("_frame");
				var child_id = child_id[0];
				$(this).ready(function() {
					elem = document.getElementById(id);
					var parent = elem.contentWindow.parent;
					p = parent.inManagerIframe && parent.loginas_frame.mult_sel_init ? parent.loginas_frame : (top.frames['mainframe'] && top.frames['mainframe'].mult_sel_init ? top.frames['mainframe'] : (parent.current_popwin_iframe && parent.frames[parent.current_popwin_iframe].mult_sel_init ? parent.frames[parent.current_popwin_iframe] : parent));
					 p.mult_sel_init(child_id, '')
				});
				}
			});
		}
		fixBustedIframeOnloadEvent(false, true);


		var updateFilterBoxForAgent = function(agent_id) {
			loading(true);
			$.ajax({
				url: processing_url + "&action=ajax_return_filters",
				data: {render_filter_form: true, agent_id: agent_id},
				type: "POST",
				success: function(data) {
					var fragment = $(data);
					fixBustedIframeOnloadEvent(fragment, false);
					$(".ajax_filter_form .ajax_filters .ajax_filter_options")
						.html(fragment.find('.ajax_filter_options').html());
					handleAdvSearchDisplay('hide');
					fixBustedIframeOnloadEvent(false, true);

					$(".ajax_temp_keywords [id$='keywords_']").each(function(){
						var val = $(this).val();
						var id = $(this).attr('id');
						$(this).remove();
						$("#" + id).val(val);
					});
					$(".ajax_temp_keywords").remove();
					loading(false);
				},
				error: function() {
					loading(false);
				}
			});
		}

		var resetAdvancedSearchFilterOptions = function() {
			//$(".ajax_filter_options").append(current_filter_content);
			//current_filter_content = '';
		}

		$(document).on('click', '.saved_searches_row_edit', function() {
			var this_row_id = $(this).attr('parent_form');
			var header_row = $(".saved_search_headers")[0].outerHTML;
			var this_row_content = $("." + this_row_id)[0].outerHTML;
			resetSavedSearchesHTML().addClass('saved_search_edit_dialog').append('<div class="edit_saved_search_meta"><table class="slim">' + header_row + this_row_content + '</table></div>');
	
			//current_filter_content = $(".ajax_filter_options").children().detach(); //gotta do this so the widgets don't trip over each other

			enableSavedSearchesRow(this_row_id);
			removeSavedSearchesRowButtons(this_row_id);
			addSavedSearchesEditForm($(this).attr('agent_id'));
			
		});

		$(document).on('click', ".ajax_filters_toggle", function() {
			handleAdvSearchDisplay('toggle');
		});

		$(document).on('click', '.ajax_edit_filter_cancel', function(){
			$('.ajax_edit_filter_save').attr('disabled', 'disabled');
			//resetAdvancedSearchFilterOptions();
			updateSavedSearches();
		});

		var saveEditedSavedSearch = function() {
			var agent_id = $(".ajax_saved_searches_div .existing_saved_row").attr('agent_id');
			var row_id = $(".ajax_saved_searches_div .existing_saved_row").attr('id');
			if (!saveSearchAgent(row_id, agent_id)) {
				$('.ajax_edit_filter_save').removeAttr('disabled');
				$('.ajax_edit_filter_cancel').removeAttr('disabled');
			}
		}

		$(document).on('click', '.ajax_edit_filter_save', function(){
			$('.ajax_edit_filter_save').attr('disabled', 'disabled');
			$('.ajax_edit_filter_cancel').attr('disabled', 'disabled');
			//resetAdvancedSearchFilterOptions();
			saveEditedSavedSearch();
		});


		$(document).on('click', '.ajax_saved_search_clickable', function(){
			//This bears future consideration - for the time being though, at least, I cannot dynamically regenerate the proper widgets with each agent submission.
			//Our jscript widgets tend to break/were not intended to be called ajax-y
			//Alternative option is to set the widget values manually, but that is veeeeery messy (so for now, the refresh)
			var curr_url = $(location).attr('href');
			var form = "<form id='temp_agent_form' action='" + curr_url + "' method='post'> <input type='hidden' value='" + $(this).parent().parent().attr('agent_id') +  "' name='agent_id'> </form>";
			form = $(form);
			form.appendTo(document.body);
			form.submit();
			//submitFilterForm('agent', $(this).parent().parent().attr('agent_id'));
			//updateFilterBoxForAgent($(this).parent().parent().attr('agent_id'));
		});

		$(document).on('click', '.ajax_delete_pill', function(){
			var field_name = $(this).parent().attr('field_name');
			var is_array_field = $(this).parent().attr('is_array_field');
			var field_value = $(this).parent().attr('data-value');
			$.ajax({
				url: pill_url,
				data: {csp_subsystem:csp_subsystem, field_name: field_name, is_array_field: is_array_field, field_value: field_value},
				type: "POST",
				success: function(data) {
					submitFilterForm();
					updateFilterBoxForAgent();
					updateSavedSearches();
				},
			});
		});

	});
}(jQuery));
