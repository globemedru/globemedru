(function() {
	'use-strict';

	angular
	.module('studentCSMApp')
	.service('notificationsService', notificationsService);

	function notificationsService($resource, API_PREFIX) {
		var notifications_service = $resource(API_PREFIX + '/my/notifications', null,
			{
				'get': {
					method: 'GET',
					url: API_PREFIX + '/my/notifications?includeAggregator=1'
				},
				'markRead':{
					method: 'PUT',
					params: {
						id: '@id',
						empFlag: '@empFlag'
					},
					url: API_PREFIX + '/my/notifications/:id/mark-read?employer_flag=:empFlag'
				},
				'markAllRead':{
					method: 'PUT',
					url: API_PREFIX + '/my/notifications/mark-read'
				}
			}
		);
		return notifications_service;
	}
}());
