'use strict';
// Source: notifications/src/notifications-module.js
angular.module('SONotifications', []);
// Source: notifications/src/i18n-service.js
/**
 @ngdoc service
 @name SONotifications.i18nService
 @description
 Generate translation service.

 @example
 <doc:example module="SONotifications">
 <doc:source>
 <script>
 angular.module('SONotifications')
 	.controller('DemoCtrl', function ($scope, i18nService, I18N_MESSAGES) {
		$scope.msgKey = 'FORM_SAVE_ERROR';
		$scope.message = I18N_MESSAGES[$scope.msgKey];
		$scope.params = {error: 'Whaaat?'};
		$scope.translation = i18nService.get($scope.msgKey, $scope.params);
	});
 </script>
 <div ng-controller="DemoCtrl">
 	<p>Message: {{message}}</p>
 	<p>Params: {{params|json}}</p>
 	<p>Static translation: {{translation}}</p>
 	<p><input ng-model="params.error"></p>
 	<p>Dynamic translation with a filter: {{ msgKey | translate:params }}</p>
 </div>
 </div>
 </doc:source>
 </doc:example>
 */
angular.module('SONotifications')
	.factory('i18nService', function ($interpolate, I18N_MESSAGES) {
		return {
			get : function (msgKey, interpolateParams) {
				var msg =  I18N_MESSAGES[msgKey];
				if (msg) {
					if(interpolateParams) {
						return $interpolate(msg)(interpolateParams);
					}
					return msg;
				} else {
					return msgKey;//assuming no message in I18N_MESSAGES so return message as-is
				}
			}
		};
	})
	/**
	 @ngdoc filter
	 @name SONotifications.translate
	 @description
	 See {@link SONotifications.i18nService i18nService} for an example
	 */
	 .filter('translate', function (i18nService) {
		return function (text, interpolateParams) {
			interpolateParams = interpolateParams || {};
			return i18nService.get(text, interpolateParams);
		};
	})
	.constant('I18N_MESSAGES', {//OVERRIDE THIS CONSTANT IN YOUR APP in app.js - YOU WILL HAVE TO DEFINE THE BELOW DEFAULT MESSAGES AGAIN THERE
		FORM_SAVE_SUCCESS: '{{class}} with id {{id}} saved successfully',
		FORM_SAVE_ERROR: 'Form save errorssssss: {{error}}',
		OBJECT_DELETE_SUCCESS: '{{class}} deleted successfully'
	});
// Source: notifications/src/notifications-controller.js
/**
 @ngdoc controller
 @name SONotifications.NotificationsCtrl
 @description
 Simple notifications controller.
 */
angular.module('SONotifications')
	.controller('NotificationsCtrl', function ($scope, NotificationService) {
		$scope.notifications = NotificationService;
	});
// Source: notifications/src/notifications-service.js
/**
 @ngdoc service
 @name SONotifications.NotificationService
 @requires SONotifications.i18nService
 @description
 Generate notifications service.
 */
angular.module('SONotifications')
	.factory('NotificationService', function ($rootScope, i18nService, $http, soNotificationConfig, $timeout) {

		var notifications = {
			'STICKY': [],
			'ROUTE_CURRENT': [],
			'ROUTE_NEXT': []
		};
		var notificationsService = {};

		var prepareNotification = function (msgKey, type, interpolateParams, otherProperties) {

			var type = type || 'success';
			otherProperties = otherProperties ? otherProperties : {};
			otherProperties.template = otherProperties.template || soNotificationConfig.template;
			otherProperties.placement = otherProperties.placement || 'top';

			return angular.extend({
				message: i18nService.get(msgKey, interpolateParams),
				type: type
			}, otherProperties);
		};

		var addNotification = function (notificationsArray, notificationObj) {
			notificationsArray.push(notificationObj);
			return notificationObj;
		};

		$rootScope.$on('$stateChangeSuccess', function () {
			notifications.ROUTE_CURRENT.length = 0;

			notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
			notifications.ROUTE_NEXT.length = 0;
		});

		notificationsService.getCurrent = function () {
			return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
		};

		notificationsService.pushSticky = function (msgKey, type, interpolateParams, otherProperties) {
			return addNotification(notifications.STICKY, prepareNotification(msgKey, type, interpolateParams, otherProperties));
		};

		notificationsService.pushForCurrentRoute = function (msgKey, type, interpolateParams, otherProperties) {
			return addNotification(notifications.ROUTE_CURRENT, prepareNotification(msgKey, type, interpolateParams, otherProperties));
		};

		notificationsService.pushForNextRoute = function (msgKey, type, interpolateParams, otherProperties) {
			return addNotification(notifications.ROUTE_NEXT, prepareNotification(msgKey, type, interpolateParams, otherProperties));
		};

		notificationsService.remove = function (notification) {
			angular.forEach(notifications, function (notificationsByType) {
				var idx = notificationsByType.indexOf(notification);
				if (idx > -1) {
					notificationsByType.splice(idx, 1);
				}
			});
		};

		notificationsService.setDismissed = function (notificationId) {
			if (notificationId) {
				$http.patch(soNotificationConfig.apiEndpoint + '/' + notificationId, {dismissed: true});
			}
		};

		notificationsService.setTTL = function (notification) {
			if (notification.autoDismissible === true) {
				$timeout(function () {
					notificationsService.hide = true;
					notificationsService.setDismissed(notification.id);
				}, 5000);
			} else {
				notificationsService.hide = false;
			}
		};

		notificationsService.removeAll = function () {
			angular.forEach(notifications, function (notificationsByType) {
				notificationsByType.length = 0;
			});
		};

		return notificationsService;
	});

// Source: notifications/src/so-notification-config-provider.js
angular.module('SONotifications')
  .provider('soNotificationConfig', function() {
      var config = {
        apiEndpoint: '/api/notifications',
		template: '/components/song/notifications/src/notifications.html'
      };

      config.$get = function() {
				delete config.$get;
				return config;
      };

      return config;
    });
