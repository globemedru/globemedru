(function() {
	'use strict';

	angular.module('studentCSMApp')
	.factory('BaseResourceService', BaseResourceService);

	function BaseResourceService($resource, $injector, growl, $filter, API_PREFIX) {
		this.getDefaultActions = function(args) {
			var actions = {
				query: {
					method: 'GET',
					params: {}
				},
				get: {
					method: 'GET',
					params: {}
				},
				save: {
					method: 'POST',
					params: {}
				},
				update: {
					method: 'PUT',
					params: {}
				},
				delete: {
					method: 'DELETE',
					params: {}
				}
			};

			if (args.params) {
				angular.forEach(actions, function(action, key) {
					if (args.params[key]) {
						angular.extend(actions[key].params, args.params[key]);
					}
				})
			}
			if (args.actions) {
				actions = angular.extend(actions, args.actions);
			}

			return actions;
		};

		this.getModelRoute = function(model_name) {
			//add unusal routes here ie which are different from the class name as in student_profile's route is just "profile"
			var maps = {
				student_profile: 'profile'
			};
			var route = model_name;
			if (angular.isDefined(maps[model_name])) {
				route = maps[model_name]
			} else {
				route = $filter('hyphenize')(route);
			}
			return route;
		};

		this.getServiceName = function(model_name) {
			var route = this.getModelRoute(model_name);
			route = $filter('hyphenize')(route);
			return $filter('camelize')(route) + 'Service';
		};

		this.getService = function(model_name) {
			return $injector.get(this.getServiceName(model_name));
		};

		this.initModel = function(model_name, args) {

			var route = this.route = this.setRoute(model_name);

			var actions = this.getDefaultActions(args);
			var model = $resource(API_PREFIX + '/' + route + '/:id', {id: '@' + args.pkey}, actions);
			angular.extend(model.prototype, {
				$id: function () {
					return this[args.pkey];
				},
				$model: model_name,
				$key_column: args.pkey,
			});
			return model;
		};

		this.setRoute = function(model_name) {
			return this.route = this.getModelRoute(model_name);
		};

		return this;
	}
}());
