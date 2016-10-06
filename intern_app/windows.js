var openedPopFrames = {};


function newpopframe(form,id,header,url,width,height,align,styletc,event,closeable) {
	closeable = (typeof closeable !== 'undefined' ? closeable : true);
	if (url=='') {
		url = form.action;
		form.target = id+'_inner';
	}
    document.body.style.overflow = 'hidden';
    
    var handleSmear = function(type,dummy,args) {
	document.body.style.overflow = '';
        panel_div = document.getElementById(id);
        panel_div.innerHTML = '';
        args.form.action = args.form.target = '';
    };
    
    var panel = new YAHOO.widget.Panel(id, {
        draggable:true,
		modal:true,
		visible:false,
		//zIndex:9999,
		constraintoviewport:true,
		close:closeable

    });

    panel.setHeader(header);
    panel.beforeShowMaskEvent.subscribe(function() {panel.cfg.setProperty("zIndex",9999);});
    if(height > YAHOO.util.Dom.getViewportHeight()) {
	height = YAHOO.util.Dom.getViewportHeight() - 100;
    }
    if(width > YAHOO.util.Dom.getViewportWidth()) {
	width = YAHOO.util.Dom.getViewportWidth() - 100;
    }
		
    panel.setBody('');
    panel.setBody('<iframe id="'+id+'_inner" name="'+id+'_inner" frameborder="0" src="'+url+'" style="border:none;width:'+width+'px;height:'+height+'px;"></iframe>');
    panel.cfg.setProperty("width",width);
    panel.render(document.body);
    panel.center();
    panel.setFooter('');
    panel.show();
    
   	openedPopFrames[id] = panel;
	panel.hideEvent.subscribe(function() {
		clozeref(id);
		delete openedPopFrames[id];   
	});
	panel.hideEvent.subscribe(handleSmear, {form: form}, panel, true);
}

function clozeref(ref) {
	for (var ref in openedPopFrames) {
		openedPopFrames[ref].hide();
		openedPopFrames[ref].destroy();
	}
}

function clozerefreload(ref,parent_ref,url_reload){
  parent_ref.location.href = url_reload;
  clozeref(ref);
}
