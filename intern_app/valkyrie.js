(function() {
	'use strict';

	angular.module('studentCSMApp', [
		'ngMaterial',
		'ui.router',
		'ngAnimate',
		'ngResource',
		'angular-loading-bar',
		'SOAuth',
		'mgcrea.ngStrap',
		'focusOn',
		'angular-growl',
		'ngAria',
		'ngSanitize',
	])
	.constant('API_PREFIX', '/api/v2')
	.constant('PSX_MODE', 'embedded')
	.config(config)
	.factory('psxInterceptor', psxInterceptor);

	function config ($mdThemingProvider, SOAuthorizationServiceProvider, soAuthConfigProvider, API_PREFIX, $httpProvider, growlProvider,$provide, $locationProvider) {

		$locationProvider.html5Mode({enabled: true, requireBase: false, rewriteLinks: false});

		$httpProvider.interceptors.push('psxInterceptor');
		$httpProvider.interceptors.push(growlProvider.serverMessagesInterceptor);
		growlProvider.globalTimeToLive(3000);
		growlProvider.globalDisableCloseButton(true);
		growlProvider.globalDisableCountDown(true);
		growlProvider.globalDisableIcons(true);
		growlProvider.messagesKey("messages");
		growlProvider.messageTextKey("text");
		growlProvider.messageSeverityKey("type");
		growlProvider.messageVariableKey("vars");

		soAuthConfigProvider.apiPath = SOAuthorizationServiceProvider.apiPath = API_PREFIX;

		configMdTheme($mdThemingProvider);
	}

	function psxInterceptor($q, growl, $window) {
		return {
			request: function(config) {
				config.headers['x-requested-system-user'] = 'students';
				return config;
			},
			'responseError': function(response) {
				if (response.data && response.data.errors
				&& response.data.errors.field_errors) {
					_.each(response.data.errors.field_errors, function(value, key) {
						if (value._error_message) {
							growl.error(value._error_message);
						} else {
							if(_.isString(value[0])){
								growl.error(value.join(','));
							} else if (_.isObject(value[0])) {
								var sub_field = value[0];
								var errors = []; 
								for(var i in sub_field) {
									errors.push(sub_field[i]);
								}
								value[0] = errors.join(', ');
							}
						}
					});
				}
				if (response.status === 401) {
					$window.location = '/students';
					$q.reject(response);
				}
				if (response.status === 404) {
					$q.reject(response);
				}
				if (response.status >= 400) {
					$q.reject(response);
				}
				return response;
			}
		};
	}

	angular
	.module('studentCSMApp')
	.controller('AppController', AppController);

	function AppController() {
	}

}());
