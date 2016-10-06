var utility = function() {

	return {

		fillFullName: function(field, form) {

			if (form == undefined || field == undefined || field.name == '') {
				return;
			}

			var field_name = field.name;
			var layer_name = field_name.substring(0, field_name.indexOf(']') + 1);

			var fields = {
				'[fname]': '',
				'[mi]': '',
				'[lname]': ''

			};

			for (var property in fields) {
				var field = form.elements[layer_name + property];
				if (field.value != '') {
					fields[property] = ' ' + field.value;
				}
			};

			var full_name = fields['[fname]'] + fields['[mi]'] + fields['[lname]'];
			form.elements[layer_name + '[fullname]'].value = full_name.trim();

		},

		trackUrl: trackUrl
	};

	function trackUrl(url, user_class, user_id, object_class, object_id) {

		var params = {
			method: "POST",
			url: "/api/v2/track-url",
			contentType: "application/json",
			data: JSON.stringify({
				url: url,
				user_class: user_class,
				user_id: user_id,
				object_class: object_class,
				object_id: object_id
			})
		};

		jQuery.ajax(params);
	}
}();
