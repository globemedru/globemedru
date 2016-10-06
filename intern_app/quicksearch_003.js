(function() {
	'use strict';

	angular
	.module('studentCSMApp')
	.controller('QuicksearchController', QuicksearchController)
	.controller('QuicksearchResultsController', QuicksearchResultsController);

	function QuicksearchController($scope, $timeout, $state, $window, quicksearchFactory, PSX_MODE) {
		var vm = this;
		vm.querySearch = querySearch;
		vm.selectedItemChange = selectedItemChange;
		vm.submitQueryForm = submitQueryForm;
		vm.toggleQueryForm = toggleQueryForm;
		$scope.searchOpen = false;

		function querySearch(query) {
			/* Workaround to style autocomplete dropdown */
			var quicksearchResultsUl = angular.element(document.getElementsByClassName("quicksearch-results"));
			var quicksearchResultsContainer = quicksearchResultsUl.parent().parent().parent();
			quicksearchResultsContainer.addClass("quicksearch-results-container");
			/* end Workaround */

			if (query !== null && query !== '') {
				return quicksearchFactory.fetchGroupedResults(vm.query)
				.then(function(results) {
					var events_category = 0;
					angular.forEach(results, function(val, key){
						if (val.grouped_display == "Events") {
							if (events_category === 0) {
								val.first_of_type = true;
								events_category++;
							} else {
								val.first_of_type = false;
							}
							val.subtype = val.mixed_display + (val.subtype ? " - " + val.subtype : "");
						}
						if (val.type == "Go To") {
							if (!val.grouped_display) {
								val.grouped_display = "Go To";
							}
							if (!val.icon) {
								val.icon = "keyboard_arrow_right";
							}
						}
					});
					return results;
				});
			} else {
				return quicksearchFactory.fetchPreviousSearches()
				.then(function(results) {
					angular.forEach(results, function(val, key){
						if(key === 0) {
							val.first_of_type = 1;
						}
						val.grouped_display = "Recent Searches";
					});
					return results;
				});
			}
		}

		function selectedItemChange(item) {
			if (typeof(item) !== 'undefined' && typeof(item.label) !== 'undefined') {
				quicksearchFactory.saveQuery(item.label);

				var promise = quicksearchFactory.fetchItemLink(item, 'short').then(function(link) {
					$window.location.href = link;
				}, function(reason) {
					return false;
				});
			}
		}

		function submitQueryForm(query) {
			if (query !== null && query !== '') {
				quicksearchFactory.saveQuery(query);
				if (PSX_MODE == 'embedded') {
					$window.location.href = "/students/?s=quicksearch&query=" + query;
				} else {
					$state.go('search', {query: query});
				}
				$scope.searchOpen = false;
			}
		}

		function toggleQueryForm($event) {
			$scope.searchOpen = !$scope.searchOpen;
			setTimeout(function() {
				if ($scope.searchOpen) {
					var searchInput = angular.element(document.getElementById("quicksearch-autocomplete")).children().eq(0).children().eq(0);
					searchInput.focus();
				}
			}, 20);
		}

	}

	function QuicksearchResultsController($state, $stateParams, $window, quicksearchFactory, PSX_MODE) {
		var vm = this;
		vm.linkItem = linkItem;
		vm.linkViewMore = linkViewMore;

		var getQuery;
		if (PSX_MODE == 'embedded') {
			if (!jQuery.getQueryParameters) {
				jQuery.extend({
					getQueryParameters: function(str) {
						return (str || $window.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
					}
				});
			}
			getQuery = function() {
				var params = jQuery.getQueryParameters();
				return params ? params.query : null;
			}
		} else {
			getQuery = function() { 
				return $stateParams.query 
			};
		}

		if (getQuery()) {
			vm.query = getQuery();
			vm.results = quicksearchFactory.fetchMixedResults(vm.query)
			.then(function(results) {
				vm.results = results;
			});
		}

		function linkItem(item) {
			var promise = quicksearchFactory.fetchItemLink(item, 'long').then(function(link) {
				$window.location.href = link;
			}, function(reason) {
				return false;
			});
		}

		function linkViewMore(category, query) {
			var promise = quicksearchFactory.fetchCategoryLink(category, query).then(function(link) {
				$window.location.href = link;
			}, function(reason) {
				return false;
			});
		}

	}

}());
