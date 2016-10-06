(function() {
	'use-strict';

	angular
	.module('studentCSMApp')
	.factory('notificationFactory', notificationFactory);

	function notificationFactory(notificationsService) {

		var factory = {
			fetchNotifications: fetchNotifications,
			markRead: markRead,
			markAllRead: markAllRead
		};

		return factory;

		function fetchNotifications() {
			return notificationsService.get().$promise
			.then(function(notifications) {
				return notifications;
			}, function(error) {
				return false;
			});		
		}

		function markRead(id, empFlag){
			return notificationsService.markRead({id:id, empFlag:empFlag}).$promise
		}

		function markAllRead(){
			return notificationsService.markAllRead().$promise
			.then(function(notifications) {
				console.log("Marked all as read");
				return notifications;
			}, function(error) {
				return false;
			});              
		}

	}
}());
