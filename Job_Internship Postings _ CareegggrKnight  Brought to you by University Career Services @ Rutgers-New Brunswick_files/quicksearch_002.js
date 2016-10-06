(function() {
	'use-strict';

	angular
	.module('studentCSMApp')
	.service('quicksearchService', quicksearchService);

	function getLookFor(employer) {
		var arr = [];
		if (typeof(employer.look_for.job) !== 'undefined') {
			arr.push(
				{
					category: 'job',
					grouped_display: 'Look For',
					icon: 'work',
					label: employer.look_for.job,
					first_of_type: 1,
					employer_label: employer.label,
					employer_id: employer.id
				});
		}
		if (typeof(employer.look_for.presentation) !== 'undefined') {
			arr.push(
				{
					category: 'presentation',
					grouped_display: 'Look For',
					icon: 'today',
					label: employer.look_for.presentation,
					employer_label: employer.label
				});
		}
		return arr;
	}

	function quicksearchService($resource, API_PREFIX) {
		var quicksearch_service = $resource(API_PREFIX + '/search', 
			{
				keyword: '@keyword',
				format: '@format',
				original: '@original'
			}, 
			{
				'get': {
					method: 'GET', 
					url: API_PREFIX + '/search',
					ignoreLoadingBar: true,
					interceptor: {
						response: function(response) {
							var types = response.data.types;
							var grouped = [];

							angular.forEach(types, function(dataVal, dataKey) {
								angular.forEach(dataVal.models, function(val, key) {
									// Setup second line
									var subtype = null;
									switch (dataKey) {
										case 'Job':
											subtype = (val.meta.employer.field ? val.meta.employer.field : "");
											subtype += (val.meta.employer.field && val.meta.location.field ? " - " : "");
											subtype += (val.meta.location.field !== null ? val.meta.location.field : "");
											break;
										case 'Event':
										case 'Presentation':
										case 'Workshop':
											subtype = (val.meta.date.field ? val.meta.date.field : "");
											break;
										case 'StudentDocument':
											var filetype_ext = null;
											var filesize = null;
											if (val.meta.filetype.field == "application/pdf") {
												filetype_ext = "PDF";
												val.icon = " ";
												val.icon_class = "mdi mdi-file-pdf";
											} else if (val.meta.filetype.field == "application/msword" || val.meta.filetype.field == "application/vnd.openxmlformats-o") {
												filetype_ext = "DOC";
												val.icon = "description";
											} else if (val.meta.filetype.field == "text/plain") {
												filetype_ext = "TXT";
												val.icon = "assignment";
											} else {
												filetype_ext = null;
											}
											if (val.meta.size.field && typeof(val.meta.size.field) !== 'undefined') {
												filesize = val.meta.size.field;
											} else {
												filesize = null;
											}
											subtype = (filetype_ext ? filetype_ext : "") + (filetype_ext && filesize ? " - " : "") + filesize;
											break;
									}
									val.subtype = subtype;
									grouped.push(val);
								});
							});

							if (typeof(types) !== 'undefined') {
								if (typeof(types.Employer) !== 'undefined' && types.Employer.models.length) {
									var arrLoc = 0;
									if (typeof(types.Job) !== 'undefined' && types.Job.models.length) {
										arrLoc = types.Job.models.length;
									}
									var lookFor = getLookFor(types.Employer.models[0]);
									for (i = 0, j = lookFor.length; i < j; i++) {
										grouped.splice(arrLoc + i, 0, lookFor[i]);
									}
								}
							}

							if (typeof(response.data.suggestion) !== 'undefined' && response.data.suggestion !== '') {
								response.data.suggestion.category = 'term';
								grouped.push(response.data.suggestion);
							}

							angular.forEach(response.data.navigation, function(val, key) {
								val.category = 'navigation';
								grouped.push(val);
							});

							response.data.grouped = grouped;
							return response.data;
						}
					}
				},
				fetch: {
					method: 'GET',
					url: API_PREFIX + '/search/fetch-term',
					isArray: true,
					ignoreLoadingBar: true,
				},
				save: {
					method: 'PUT',
					url: API_PREFIX + '/search/save-term',
					ignoreLoadingBar: true,
					isArray: true
				}
			}
		);

		return quicksearch_service;
	}
}());
