(function() {
	'use-strict';

	angular
	.module('studentCSMApp')
	.factory('quicksearchFactory', quicksearchFactory);

	function quicksearchFactory(quicksearchService, SOAuthService, $q, PSX_MODE) {

		var factory = {
			fetchMixedResults: fetchMixedResults,
			fetchGroupedResults: fetchGroupedResults,
			fetchPreviousSearches: fetchPreviousSearches,
			fetchItemLink: fetchItemLink,
			fetchCategoryLink: fetchCategoryLink,
			saveQuery: saveQuery
		};

		return factory;

		function fetchMixedResults(query) {
			return quicksearchService.get({keyword: query, format: 'long'}).$promise.then(function(response) {
				return response;
			});
		}

		function fetchGroupedResults(query) {
			return quicksearchService.get({keyword: query, format: 'short'}).$promise.then(function(response) {
				return response.grouped;
			});
		}

		function fetchPreviousSearches() {
			return quicksearchService.fetch().$promise.then(function(response) {
				return response;
			});
		}

		function fetchItemLink(item, format) {
			if (typeof(item) !== 'undefined') {
				return $q(function(resolve, reject) {

					SOAuthService.requestCurrentUser().then(function(user) {
						var student_id = user.id;
						var link;
						switch (item.category) {
							case 'job':
								if (typeof format !== 'undefined' && format == 'long') {
									// PSX interface
									//link = '#/jobs/' + item.id;

									// OLD interface
									link = '/students/?mode=form&s=jobs&ss=jobs&id=' + item.id;
								} else {
									if (item.grouped_display == "Look For") {
										link = '/students/?s=employers&ss=employers&mode=profile&id=' + item.employer_id + '&sss=postings';
									} else {
										// PSX interface
										//link = '#/jobs?keyword=' + encodeURIComponent(item.label);

										// OLD interface
										link = '/students/?mode=list&s=jobs&ss=jobs&job_type=0&keywords=' + encodeURIComponent(item.label);
									}
								}
								break;
							case 'employer':
								link = '/students/?s=employers&ss=employers&mode=profile&id=' + item.id + '&sss=overview';
								break;
							case 'fair':
								link = '/students/?s=event&ss=cf&mode=form&id=' + item.id + '&student=' + student_id;
								break;
							case 'presentation':
								if (item.grouped_display == "Look For") {
									link = '/students/?s=event&ss=is&mode=list&keywords=' + item.employer_label;
								} else {
									link = '/students/?s=event&ss=is&mode=form&id=' + item.id;
								}
								break;
							case 'workshop':
								if (item.grouped_display == "Look For") {
									link = '/students/?s=event&ss=ws&mode=list&keywords=' + item.employer_label;
								} else {
									link = '/students/?s=event&ss=ws&mode=form&id=' + item.id;
								}
								break;
							case 'document':
								var rbID = item.meta.resume_builder.field;
								if (rbID !== null) {
									var rbType = (item.meta.subtitle.field == 'Cover letter' ? 'cover' : 'resume');
									link = '/students/?s=resume&ss=rb&rbtype=' + rbType + '&rbmode=form&rbid=' + rbID;
								} else {
									// Need to know whether document is approved or pending
									//var rType = (item.meta.status.field == 'approved' ? 'resumes' : 'pending');
									var rStatus = 'resumes';
									link = '/students/?s=resume&ss=' + rStatus + '&mode=form&id=' + item.id;
								}
								break;
							case 'navigation':
								link = item.link;
								break;
							case 'term':
								if (PSX_MODE == 'embedded') {
									link = '/students/?s=quicksearch&query=' + item.label;
								} else {
									// PSX interface
									link = '#/search/' + encodeURIComponent(item.label);
								}
						}
						if (typeof(link) !== 'undefined' && link !== null) {
							resolve(link);
						} else {
							reject('No Link');
						}
					});
				});
			}
		}

		function fetchCategoryLink(category, query) {
			return $q(function(resolve, reject) {
				SOAuthService.requestCurrentUser().then(function(user) {
					var student_id = user.id;
					var link;
					switch (category) {
						case 'Job':
							link = '/students/?mode=list&s=jobs&ss=jobs&keywords=' + query;
							break;
						case 'Employer':
							link = '/students/?s=employers&ss=employers&mode=list&keywords=' + query;
							break;
						case 'Event':
							// No specific search for Career Fairs, only view all
							link = '/students/?s=event&ss=cf&mode=list';
							break;
						case 'Presentation':
							link = '/students/?s=event&ss=is&mode=list&keywords=' + query;
							break;
						case 'Workshop':
							link = '/students/?s=event&ss=ws&mode=list&keywords=' + query;
							break;
						case 'StudentDocument':
							// No search for documents, only view all
							link = '/students/?s=resume&ss=resumes';
							break;
					}
					if (typeof(link) !== 'undefined' && link !== null) {
						resolve(link);
					} else {
						reject('No Link');
					}
				});
			});
		}

		function saveQuery(label) {
			quicksearchService.save({keyword: label});
		}

	}

}());
