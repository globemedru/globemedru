YAHOO.namespace('YAHOO.CSM');
CSM = YAHOO.CSM;

CSM.spinner = new YAHOO.widget.Panel('spinner', {
										 modal: true,
										 fixedcenter: true,
										 visible: false,
										 width: '300px'
									 });
CSM.spinner.setHeader('Please wait...');
CSM.spinner.setBody('<p style=\"margin:12px;text-align:center\"><img src="/si_ei/2010/progress.gif" alt="Processing your request..."></p>');

YAHOO.util.Event.onAvailable('csm-content', function() { CSM.spinner.render('csm-content');});

startFullSpinner = startSpinner  = function() {
	CSM.spinner.show();
};
stopFullSpinner = stopSpinner = function() {
	CSM.spinner.hide();		
};
