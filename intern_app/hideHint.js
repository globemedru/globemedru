(function () {

		var dom = YAHOO.util.Dom;
		var event = YAHOO.util.Event;

		var HideHint = function () {
				this.closeTag = 'a';
				this.closeClass = 'dismiss_link';
				this.hintTag = 'div';
				this.containerID = 'all_user_hints';
				this.user = window.HideHint.user;
		}
		
		HideHint.prototype = {
				
				init: function () {
						var sel = this.closeTag + '.' + this.closeClass;
						event.delegate(this.containerID, 'click', this.hideHint, sel, this, true);
				},

				checkRemaining: function () {
						var c = dom.get(this.containerID),
						region, fade, el;

						if (c && !c.hasChildNodes()) {
								region = dom.getRegion(c);

								fade = new YAHOO.util.Anim(c, {
										opacity: { to: 0 },
										height: { from: region.bottom - region.top, to: 0},
										padding: { to: 0 }
								}, .3);

								fade.onComplete.subscribe(function() {
										el = this.getEl();
										el.parentNode.removeChild(el);
								});

								fade.animate();
						}
				},

				hideHint: function (ev) {
						var t = event.getTarget(ev),
						hint = dom.getAncestorByTagName(t, this.hintTag),
						fade;

						if (hint) {
								hideHint(hint.id, this.user);

								fade = new YAHOO.util.Anim(hint, {
										opacity: { to: 0 },
										height: { to: 0 }
								}, .25);

								fade.onComplete.subscribe(function() {
										hint.parentNode.removeChild(hint);
										this.checkRemaining();
								}, this, true);

								fade.animate();
						}
				}

		};

		window.HideHint = HideHint;
		
})();


YAHOO.util.Event.onDOMReady(function () {
		HideHint = new HideHint();
		HideHint.init();
});
