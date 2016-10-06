(function() {
	'use-strict';

	angular
	.module('studentCSMApp')
	.filter('decodeURIComponent', decodeuricomponent)
	.filter('sortByEndDate', sortByEndDate)
	.filter('initials', initials)
	.filter('highlight', highLight)
	.filter('timeago', timeAgo)
	.filter('striphtml', stripHtml)
	.filter('hyphenize', hyphenize);

	function decodeuricomponent() {
		return function (text) {
			return decodeURIComponent(text);
		};
	}

	function sortByEndDate() {
		return function(work_exps) {
			var current = [];
			var others = [];
			var unsorted = [];
			angular.forEach(work_exps, function(work_exp) {
				if (work_exp.current == '1') {
					current.push(work_exp);
				} else if (work_exp.end_date !== '0000-00-00' && work_exp.end_date !== 'null') {
					others.push(work_exp);
				} else {
					unsorted.push(work_exp);
				}
			});
			var sorted_current = _.sortBy(current, 'start_date').reverse();
			var others = _.sortBy(others, 'end_date').reverse();
			return sorted_current.concat(others).concat(unsorted);
		}
	}

	function initials() {
		return function getInitials(full_name){

			function getfirstInitial(name) {
				return name[0].substring(0, 1);
			}

			function isLastInitial(name) {
				return (num_of_initials > 1) ? true : false;
			}

			function getLastInitial(name, num_of_initials) {
				return (isLastInitial(name) ? name[num_of_initials-1].substring(0, 1) : "");
			}

			if (full_name) {
				var name = full_name.split(" ");
				var num_of_initials = name.length;

				return getfirstInitial(name) + getLastInitial(name, num_of_initials);
			}
		};
	}

	function highLight($sce) {
		return function(text, keyword) {
			if (text && keyword) {
				text = text.replace(new RegExp('('+keyword+')', 'gi'), '<span class="keyword-highlight">$1</span>');
			}
			return $sce.trustAsHtml(text);
		}
	}

	function timeAgo() {
		return function createTimeAgo(date, time_format) {
			var relative_time = {};
			if (time_format && time_format.short_time){
				relative_time = {
					future: "in %s",
					past:   "%s",
					s:  "<1h",
					m:  "<1h",
					mm: "<1h",
					h:  "1h",
					hh: "%dh",
					d:  "1d",
					dd: "%dd",
					M:  "1m",
					MM: "%dm",
					y:  "1y",
					yy: "%dy"
				};
			} else {
				relative_time = {
					future: "in %s",
					past:   "%s ago",
					s:  "seconds",
					m:  "a minute",
					mm: "%d minutes",
					h:  "an hour",
					hh: "%d hours",
					d:  "a day",
					dd: "%d days",
					M:  "a month",
					MM: "%d months",
					y:  "a year",
					yy: "%d years"
				};
			}
			moment.locale('en', {
				relativeTime : relative_time
			});
			return moment(date, 'MMMM DD, YYYY').fromNow();
		};
	}

	function stripHtml() {
		return function (data) {
			// removes html tags
			var content = data.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '');

			// converts html entities
			var txt = angular.element("<textarea>" + content + "</textarea>");
			return txt.text();
		};
	}
	
	function hyphenize() {
		return function (input) {
			if ((typeof input === 'string') && input.length) {
				return input.replace(/(_| )/, '-').toLowerCase();
			}
			return '';
		};
	}

}());
