YAHOO.namespace('YAHOO.CSM.JobDisplay');
CSM = YAHOO.CSM;

(function($) {

	/* sidebars

		sb_howtoapply
		sb_requesteddocs
		sb_apply
		sb_appstatus
		sb_defaultemail
		
		sb_interviewlocation
		sb_bidpoints
		sb_bidslots
		sb_bidslots_avail
		sb_timeline
		sb_relatedinfosess
		sb_contactblurb
		sb_jobshadow-placed
		sb_attachments
		sb_placementaward
		
		sb_contactinfo
	*/

	CSM.JobDisplay.applyButton = null;	
	CSM.JobDisplay.interviewButton = null;
	
	CSM.JobDisplay.interviewButtonLink = null;
	CSM.JobDisplay.nonQualify = false;

	var	job_form = $('#job_resume_form,#sb_apply'),	
		interview_form = $('#interview_request_form'),
		contact_info = $('#sb_contactinfo .sb-body'),
		contact_content = $('#contact_content'),

		job_acts_form_height,
		
		boxPos,
		newBoxHeight,
		totalFormHeight,
		
		move_to_apply = $('#sb_apply, #sb_howtoapply, #sb_requesteddocs, #sb_appstatus')
	;

	// move contact info	
	if (contact_info.length && contact_content.length) {
		contact_info.appendTo(contact_content);
		$('#sb_contactinfo').remove();
		$('#job_contact_section').css('display','block');
	}
	
	
	CSM.JobDisplay.toggleSendDocs = {
		open: function() {
			CSM.JobDisplay.toggleSendDocs.align();
			$('#job_acts_form')
				.css('display','block')
			;
			boxPos = $('#job_acts_form_wrapper').offset();
			totalFormHeight = job_acts_form_height + boxPos.top + 120;
			if(totalFormHeight > $(document).height()) {
				newBoxHeight = $(document).height() - boxPos.top - 120;
			} else {
				var newBoxHeight = job_acts_form_height;
			}
			if(self.location.href.indexOf("jobact.apply=1") == -1) {
				var cur_url = self.location.href;
				var add_frame = "jobact.apply=1";
				self.location.href = cur_url + "#" + add_frame;
			}
			$('#job_acts_form_content')
				.css({'overflow':'auto'})
				.stop()
				.animate({height: newBoxHeight },'easeIn', function() {
					$('#job_acts_form_content').css({'height':newBoxHeight});
				})
			;
			return false;					
		},
		close: function() {
			$('#job_acts_form_content')
				.stop()
				.animate({height: 0},'easeIn',function() {
					$('#job_acts_form').css('display','none');
				})
			;
			return false;					
		},
		toggle: function() {
			if ($('#job_acts_form_content').is(':visible')) {
				CSM.JobDisplay.toggleSendDocs.close();
			} else {
				CSM.JobDisplay.toggleSendDocs.open();	
			}
			return false;
		}, 
		align: function() {
			var but_bot = $('#job_buttons').offset().top + $('#job_buttons').height(),
				my_top = $('#job_acts_form_wrapper').offset().top,
				diff = but_bot - my_top + 10;
			if (diff != 0) {
				$('#job_acts_form').css('top',
					diff + 'px'
				);
			}
		}
	};
	
	CSM.JobDisplay.init = function() {

		// show buttons and move sidebars
		if (CSM.JobDisplay.applyButton || CSM.JobDisplay.interviewButton) {
			$('#job_buttons').css('display','block');
			// move sidebar into pop-up form container
			$('#job_acts_form_content').append(move_to_apply);
			$('#job_acts_form_content .sb-head').eq(0).remove();
			$('#job_acts_form_content .section-blurb').eq(0).css({marginTop: 0, paddingTop: 0});
			if (CSM.JobDisplay.interviewButton == 'requested') {
				$('#job_acts_form_content').prepend('<div id="job_int_requested_msg" class="hint">'+CSM.JobDisplay.i18.requested_msg+'</div>');
			}

			// resize container to fit
			$('#job_acts_form').css({visibility:'hidden',display:'block'});			
			job_acts_form_height = $('#job_acts_form_content').height();
			$('#job_acts_form').css({visibility:'inherit',display:'none'});
			
			
	
		}
		
		if (CSM.JobDisplay.applyButton) {
			$('#job_acts_form_content').css({height:0});
			$('td#job_send_docs')
				.css('display','block')
				.live('click',CSM.JobDisplay.toggleSendDocs.toggle)
			;
			$('li#job_send_docs')
				.css('display','block')
				.live('click',CSM.JobDisplay.toggleSendDocs.toggle)
			;
			if (CSM.JobDisplay.applyButton == 'applied') {
				$('#job_send_docs').addClass('jobact-complete');
				$('#badge_applied').css("display", "");
			}
			$('#job_send_docs .jobstep-txt').html(CSM.JobDisplay.i18[CSM.JobDisplay.applyButton]);
			$('#jobacts-ttl > span').html(CSM.JobDisplay.i18[CSM.JobDisplay.applyButton]);
			if (self.location.hash.replace('#','').indexOf('jobact.apply=1') != -1 || $('#job_acts_form_content .errors-section').length > 0) {
				$(document).ready(function() { 
					$('#job_send_docs').click();
				});
			}
		}
		
		
		if (CSM.JobDisplay.interviewButton && CSM.JobDisplay.applyButton != 'apply_interview') {
			$('#job_acts_form_content').css({height:0});
			$('td#job_interview').css('display','table-cell');
			$('li#job_interview').css('display','block');
			if (CSM.JobDisplay.interviewButtonLink) {			
				$('#job_interview > a').attr('href',CSM.JobDisplay.interviewButtonLink);	
			} else {
				$('td#job_interview')
					.css('display','table-cell')
					.live('click',CSM.JobDisplay.toggleSendDocs.toggle)
				;
				$('li#job_interview')
					.css('display','block')
					.live('click',CSM.JobDisplay.toggleSendDocs.toggle)
				;
			}
			if (CSM.JobDisplay.interviewButton == 'scheduled') {
				$('#job_interview').addClass('jobact-complete');
			} else if (CSM.JobDisplay.interviewButton == 'requested') {
				$('#job_interview').addClass('jobact-pending');
			}
			$('#job_interview .jobstep-txt').html(CSM.JobDisplay.i18[CSM.JobDisplay.interviewButton]);
			$('#jobacts-ttl > span').html(CSM.JobDisplay.i18[CSM.JobDisplay.applyButton]+'; '+CSM.JobDisplay.i18[CSM.JobDisplay.interviewButton]);			
		}
		
		$('#job_buttons li').not(':visible').remove();
		
		
	};

/*	
$(document).ready(function() {
	function boxAdjust() {			
		var boxHeight;	
		//find the box position
		var boxPos = $('#job_acts_form_wrapper').offset();
		//check to determine box height
		if ($('.job_acts_form_content').outerHeight() > window.innerHeight) {
			boxHeight = window.innerHeight - boxPos.top;
			$('#job_acts_form_content').css('overflow', 'auto');
		}
		else {
			boxHeight = $('#job_acts_form').height();	
		}	

		//add detemined box height to css classes and id 
		$('#job_acts_form, #job_acts_form_content').height(boxHeight);
	}
	boxAdjust();
	$(window).resize(function() { boxAdjust(); });
 });
	*/
})(jQuery);


