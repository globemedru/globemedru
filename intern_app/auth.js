'use strict';
// Source: auth/src/so-auth-module.js
angular.module('SOAuth', ['mgcrea.ngStrap', 'focusOn']);

// Source: auth/src/so-auth-config-provider.js
angular.module('SOAuth')
  .provider('soAuthConfig', function() {
      var config = {
        apiPath: '/api'
      };

      config.$get = function() {
				delete config.$get;
				return config;
      };

      return config;
    });
// Source: auth/src/so-auth-queue.js
angular.module('SOAuth')
	.factory('SOAuthInterceptorService', function ($q, $injector, SOAuthRetryQueueService) {
		return {
			'responseError': function(rejection) {
				if (rejection.status === 401) {
					// The request bounced because it was not authorized - add a new request to the retry queue
					var promise = SOAuthRetryQueueService.pushRetryFn('unauthorized-server', function retryRequest() {
						// We must use $injector to get the $http service to prevent circular dependency
						return $injector.get('$http')(rejection.config);
					});
					return promise;
				}
				return $q.reject(rejection);
			}
		};
	})
	.factory('SOAuthRetryQueueService', function ($q, $log) {
		var retryQueue = [];
		var service = {
			// The security service puts its own handler in here!
			onItemAddedCallbacks: [],

			hasMore: function () {
				return retryQueue.length > 0;
			},
			push: function (retryItem) {
				retryQueue.push(retryItem);
				// Call all the onItemAdded callbacks
				angular.forEach(service.onItemAddedCallbacks, function (cb) {
					try {
						cb(retryItem);
					} catch (e) {
						$log.error('SOAuthRetryQueueService.push(retryItem): callback threw an error' + e);
					}
				});
			},
			pushRetryFn: function (reason, retryFn) {
				// The reason parameter is optional
				if (arguments.length === 1) {
					retryFn = reason;
					reason = undefined;
				}

				// The deferred object that will be resolved or rejected by calling retry or cancel
				var deferred = $q.defer();
				var retryItem = {
					reason: reason,
					retry: function () {
						// Wrap the result of the retryFn into a promise if it is not already
						$q.when(retryFn()).then(function (value) {
							// If it was successful then resolve our deferred
							deferred.resolve(value);
						}, function (value) {
							// Othewise reject it
							deferred.reject(value);
						});
					},
					cancel: function () {
						// Give up on retrying and reject our deferred
						deferred.reject({message: 'You must log in to access this part of the application', data:{}, config:{}});
					}
				};
				service.push(retryItem);
				return deferred.promise;
			},
			retryReason: function () {
				return service.hasMore() && retryQueue[0].reason;
			},
			cancelAll: function () {
				while (service.hasMore()) {
					retryQueue.shift().cancel();
				}
			},
			retryAll: function () {
				while (service.hasMore()) {
					retryQueue.shift().retry();
				}
			}
		};
		return service;
	});

// Source: auth/src/so-auth-service.js
angular.module('SOAuth')
	.provider('SOAuthorizationService', {
		requireAuthenticatedUser: ['SOAuthorizationService', function (SOAuthorizationService) {
			return SOAuthorizationService.requireAuthenticatedUser();
		}],
		$get: ['SOAuthService', 'SOAuthRetryQueueService', function (SOAuthService, SOAuthRetryQueueService) {
			var service = {
				// Require that there is an authenticated user
				// (use this in a route resolve to prevent non-authenticated users from entering that route)
				requireAuthenticatedUser: function () {
					var promise = SOAuthService.requestCurrentUser().then(function () {
						if (!SOAuthService.isAuthenticated()) {
							return SOAuthRetryQueueService.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
						}
					});
					return promise;
				}
			};
			return service;
		}]
	})
	.factory('SOAuthService', function ($http, $q, $location, SOAuthRetryQueueService, $modal, $timeout, focus, soAuthConfig, $sessionStorage) {
		// Redirect to the given url (defaults to '/')
		var queue = SOAuthRetryQueueService;

		function redirect(url) {
			url = url || '/';
			$location.path(url);
		}

		// Login form dialog stuff
		var loginModal = null;

		function openLoginModal(templateUrl) {
			if (!loginModal) {
				loginModal = $modal({
					backdrop: false,
					template: templateUrl || '/app/common/login-modal.html'
				});
			}
			return loginModal;
		}

		function closeLoginModal(success) {
			if (loginModal) {
				loginModal.$promise.then(loginModal.hide);
			}
			onLoginModalClose(success);
		}

		function onLoginModalClose(success) {
			loginModal = null;
			if (success) {
				queue.retryAll();
			} else {
				queue.cancelAll();
				redirect();
			}
		}

		// Register a handler for when an item is added to the retry queue
		queue.onItemAddedCallbacks.push(function () {
			if (queue.hasMore()) {
				service.showLogin();
			}
		});

		// The public API of the service
		var service = {

			// Get the first reason for needing a login
			getLoginReason: function () {
				return queue.retryReason();
			},

			getLoginModal: function () {
				return loginModal;
			},

			// Show the modal login dialog
			showLogin: function (templateUrl) {
				var loginModal = openLoginModal(templateUrl);
				loginModal.$promise.then(function () {
					$timeout(function () {
						focus('login-modal');
					});
				});
			},

			// Attempt to authenticate a user by the given email and password
			login: function (email, password) {
				var request = $http.post(soAuthConfig.apiPath + '/auth/login', {email: email, password: password});
				return request.then(function (response) {
					service.currentUser = response.data.user;
					if (service.isAuthenticated()) {
						closeLoginModal(true);
					}
					return service.isAuthenticated();
				});
			},

			// Give up trying to login and clear the retry queue
			cancelLogin: function () {
				closeLoginModal(false);
			},

			// Logout the current user and redirect
			logout: function (redirectTo) {
				$http.delete(soAuthConfig.apiPath + '/auth/logout').then(function () {
					service.currentUser = null;
					$sessionStorage.$reset();
					redirect(redirectTo);
				});
			},

			// Ask the backend to see if a user is already authenticated - this may be from a previous session.
			requestCurrentUser: function () {
				if (service.isAuthenticated()) {
					return $q.when(service.currentUser);
				} else {
					return $http.get(soAuthConfig.apiPath + '/auth/current-user', {ignoreLoadingBar: true}).then(function (response) {
						service.currentUser = response.data.user;
						return service.currentUser;
					});
				}
			},

			// Information about the current user
			currentUser: null,

			// Is the current user authenticated?
			isAuthenticated: function () {
				return !!service.currentUser;
			},

			// Is the current user an adminstrator?
			isAdmin: function () {
				return !!(service.currentUser && service.currentUser.admin);
			},

			isLoginModalOpen: function() {
				return !!loginModal;
			}
		};

		return service;
	});

// Source: auth/src/so-login-controller.js
angular.module('SOAuth')
	.controller('SOLoginCtrl', function ($scope, SOAuthService) {
		// The model for this form
		$scope.user = $scope.user || {};

		// Any error message from failing to login
		$scope.authError = null;

		// The reason that we are being asked to login
		$scope.authReason = null;
		if (SOAuthService.getLoginReason()) {
			$scope.authReason = (SOAuthService.isAuthenticated() ?
				'Not Authorized' :
				'Not Authenticated'
			);
		}

		// Attempt to authenticate the user specified in the form's model
		$scope.login = function () {
			// Clear any previous security errors
			$scope.authError = null;

			// Try to login
			return SOAuthService.login($scope.user.email, $scope.user.password).then(function (loggedIn) {
				if (!loggedIn) {
					// If we get here then the login failed due to bad credentials
					$scope.authError = 'Invalid Credentials';
				}
				return loggedIn;
			}, function (serverError) {
				$scope.authError = serverError.data;
				if ($scope.authError.messages) {
					$scope.authError = $scope.authError.messages[0].text;
				}
				return false;
			});
		};

		$scope.clearForm = function () {
			$scope.user = {};
		};

		$scope.cancelLogin = function () {
			SOAuthService.cancelLogin();
		};
	});

// Source: auth/src/so-login-directive.js
angular.module('SOAuth')
	.directive('soLoginToolbar', function (SOAuthService) {
		return {
			templateUrl: function (element, attrs) {
				return (attrs.templateUrl || '/app/common/login-toolbar.html');
			},
			restrict: 'E',
			replace: true,
			scope: true,
			link: function ($scope) {
				$scope.isAuthenticated = SOAuthService.isAuthenticated;
				$scope.login = SOAuthService.showLogin;
				$scope.logout = SOAuthService.logout;
				$scope.$watch(function () {
					return SOAuthService.currentUser;
				}, function (currentUser) {
					$scope.currentUser = currentUser;
				});
			}
		};
	});
