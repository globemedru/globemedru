(function() {
	'use strict';

	angular
	.module('studentCSMApp')
	.directive('notifications', notifications);

	function notifications($timeout) {
		var directive = {
			restrict: 'E',
			replace: false,
			controller: notificationsController,
			controllerAs: 'vm',
			link: scrollSetup,
			templateUrl: '/students/psx/app/notifications/notifications.html',	
			scope: {
				showHide: '=ngModel',
				toggle: '=ngModel'
			}
		};

		return directive;

		function scrollSetup(scope,el,attr,ctrl){
			var debounce = function(func, wait, immediate) {
				var timeout;
				return function() {
					var context = this, args = arguments;
					var later = function() {
						timeout = null;
						if (!immediate) func.apply(context, args);
					};
					var callNow = immediate && !timeout;
					clearTimeout(timeout);
					timeout = setTimeout(later, wait);
					if (callNow) func.apply(context, args);
				};
			};

			var $ = jQuery;

			$.fn.CheckScroll = function() {				
				var $wrapper = $(this);				
				var check = debounce(function() {
					var scrollTop = $(window).scrollTop();
					if (scrollTop > 88) {
						$('.toolbar-notifications').addClass("notifications-scroll");	
						$('.triangle1').addClass("triangle1-scroll");	
						$('.triangle2').addClass("triangle1-scroll");
					} else {
						$('.toolbar-notifications').removeClass("notifications-scroll");
						$('.triangle1').removeClass("triangle1-scroll");
						$('.triangle2').removeClass("triangle1-scroll");
					}
				}, 250);
				$(window).on('scroll', check);				
				check();
			};

			$timeout(function() {
				$('body').CheckScroll();	
			});

		}
	}

	function notificationsController($scope, $timeout, notificationFactory, $location, $sce){
		var vm = this;
		vm.showHide = false;
		vm.toggle = false;
		vm.selectedArray = [];	
		vm.totalUnread;		
		vm.notifications = notificationFactory.fetchNotifications().then(function(results) { 
			vm.notifications = results;
			angular.forEach(vm.notifications.model, function(notification) {
				notification.template = $sce.trustAsHtml(notification.template);
			});
			});
		vm.markAllRead = notificationFactory.markAllRead;

		//adding list item to array 
		vm.itemClicked = function($index){
			vm.selectedArray.push($index);	
		}

		//if item is in array, mark as read
		vm.checkArray = function($index){
			if(vm.selectedArray.indexOf($index) > -1){
				return true;				
			}else{
				return false;
			}
		}
		//fill up entire array to mark all as red and set counter to 0
		vm.fillArray = function(limit){
			for(var i=0;i<=limit;i++){
				vm.selectedArray.push(i);
			}			
			vm.totalUnread = 0;
		}

		//mark list item as read and decrement counter
		vm.markRead = function(notification_id, url, read_flag, employer_activity_id){
			var empFlag = 0;
			var id = '';
			if(notification_id){
				id = notification_id;
			}else{
				id = employer_activity_id;
				empFlag = 1;
			}
			if(id){
				if(read_flag == '0'){
					if(!vm.totalUnread){
						vm.totalUnread = vm.notifications.totalUnread;
						vm.totalUnread--;
					}else{
						vm.totalUnread--;
					}				
					notificationFactory.markRead(id, empFlag).then(function(resp){	
						if(url !== null){				
							var new_location = ("/students/index.php?"+ url);
							window.location.replace(new_location);
							console.log(new_location);
						}
					}, function(error){
						console.log(error);						
					});
				}else{
					if(url !== null){
						var new_location = ("/students/index.php?"+ url);
						window.location.replace(new_location);
					}
				}
			}
		}
	}
	notificationsController.$inject = ['$scope', '$timeout', 'notificationFactory', '$location', '$sce'];
}());
