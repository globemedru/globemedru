'use strict';
// Source: widgets/src/widgets-module.js
angular.module('SOWidgets', ['flow', 'mgcrea.ngStrap']);

// Source: widgets/src/confirm-click-directive.js
/**
 @ngdoc directive
 @name SOWidgets.confirmClick
 @description
 Open a confirmation modal prompt (with optional defined message and/or template url), then run a defined action if user confirms.

 @example
 <example module="SOWidgets">
 <file name="index.html">
 <form so-form="dummy">
 <fieldset>
 <button name="test1" type="button" confirm-click="test1='Confirmed'"
  confirm-template="../widgets/src/confirm-modal.html">{{test1 || 'Confirm'}}</button>
 <button name="test2" type="button" confirm-click="test2='Confirmed'" confirm-if="test1"
  confirm-template="../widgets/src/confirm-modal.html">{{test2 || 'Confirm'}} conditionally</button>
 <button name="test3" type="button" confirm-click="test3='Confirmed'" confirm-message="Really?"
  confirm-template="../widgets/src/confirm-modal.html"">{{test3 || 'Confirm'}} with custom message</button>
 </fieldset>
 </form>
 </file>
 </example>
 */
angular.module('SOWidgets')

.directive('confirmClick', function ($modal, soConfirm) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			var clickAction = attr.confirmClick;

			var confirm_args = {
				template: attr.confirmTemplate,
				action: attr.confirmAction,
				message: attr.confirmMessage
			};

			element.bind('click',function () {
				if (typeof attr.confirmIf === 'undefined' || scope.$eval(attr.confirmIf)) {
					soConfirm.open(confirm_args).then(function (confirmed) {
						if (confirmed) {
							scope.$eval(clickAction);
						}
					});
				} else {
					scope.$eval(clickAction);
				}
			});
		}
	};
});

// Source: widgets/src/confirm-service.js
angular.module('SOWidgets')


.factory('soConfirm', function soConfirm($rootScope, $modal, confirmConfig, $q) {
	return {
		open: function (args) {
			var config = confirmConfig.config;
			var action = args.action || config.action;

			var newScope = $rootScope.$new();
			newScope.message = args.message || (config.prompt + ' ' + action + '?');

			$modal({template: args.template || config.template, scope: newScope});

			var defer = $q.defer();
			newScope.resolveConfirmResult = function (confirmed) {
				defer.resolve(confirmed);
			};

			return defer.promise;
		}
	};
})

.provider('confirmConfig', function () {
	var config = this.config = {
		template: '/components/song/widgets/src/confirm-modal.html',
		prompt: 'Are you sure you want to',
		action: 'perform this action',
	};

	this.$get = function () {
		return {
			config: config
		};
	};
});

// Source: widgets/src/date-range-directive.js
angular.module('SOWidgets')
	.directive('dateRange', function ($filter, soWidgetsConfig) {
		return {
			require: 'ngModel',
			restrict: 'E',
			scope: {
				model: '=ngModel'
			},
			templateUrl: function (element, attrs) {
				return (attrs.templateUrl || '/components/song/widgets/src/date-range.html');
			},
			link: function (scope, element, attrs, modelCtrl) {
				scope.name = attrs.name;
				scope.flattenValues = !soWidgetsConfig.jsonFilters;
				scope.date = {
					from: '',
					to: ''
				};

				if (scope.flattenValues) {
					if (typeof scope.model === 'string') {
						scope.model = scope.model.split(',');
					}
					if (angular.isArray(scope.model)) {
						scope.date.from = scope.model[0];
						scope.date.to = scope.model[1];
					}
				} else {
					scope.date = scope.model;
				}

				scope.date = {
					from: angular.isArray(scope.model) ? scope.model[0] : '',
					to: angular.isArray(scope.model) ? scope.model[1] : ''
				};

				scope.$watchCollection('date', function(){
					updateModel();
				});

				scope.$watch('model', function (val) {
					if (scope.flattenValues) {
						scope.date.from = (angular.isArray(val)) ? ($filter('date')(val[0], 'yyyy-MM-dd') || '') : '';
						scope.date.to = (angular.isArray(val)) ? ($filter('date')(val[1], 'yyyy-MM-dd') || '') : '';
					}
				});

				var updateModel = function () {
					var sv;
					if (angular.isDefined(scope.date) && (scope.date.from || scope.date.to)) {
						sv = [
							scope.date.from,
							scope.date.to
						];
						if (!scope.flattenValues) {
							sv = scope.date;
						}
					} else {
						sv = [];
						if (!scope.flattenValues) {
							sv = {
								from: '',
								to: ''
							};
						}
					}
					modelCtrl.$setViewValue(sv);
				};

			}

		};
	});

// Source: widgets/src/file-upload-directive.js
angular.module('SOWidgets')
	.directive('fileUpload', function($http, growl, soConfirm, soWidgetsConfig) {
	return {
		restrict: 'E',
		templateUrl: function (element, attrs) {
			return (attrs.templateUrl || '/components/song/widgets/src/file-upload.html');
		},
		scope: {
			model: '=',
			parentObjectId: '=',
			parentObject: '@',
			fileFieldName: '@',
			static: '@',
			parent: '='
		},
		require: '^?form',
		link: {
			pre: function (scope) {
				scope.apiPath = soWidgetsConfig.apiPath;
			},
			post: function (scope, element, attrs, form) {
				scope.uploadInProgress = false;
				scope.showUploadTable = (scope.$eval(attrs.showUploadTable) !== false);
				scope.multiple = (scope.$eval(attrs.multiple) === true);
				scope.static = (scope.$eval(attrs.static) === true);
				scope.enableDragdrop = (scope.$eval(attrs.enableDragdrop) !== false);
				scope.showImagePreview = (scope.$eval(attrs.showImagePreview) === true);
				scope.imagePreviewClass = attrs.imagePreviewClass;

				if (scope.multiple) {
					scope.max = (!attrs.max) ? Number.MAX_VALUE : attrs.max;
				} else {
					scope.max = 1;
				}

				if (scope.model === null || typeof scope.model === 'undefined') {
					scope.model = (scope.multiple) ? [] : {};
				}

				scope.getPercentComplete = function(transfers) {
					var progress = 0;
					var numFiles = transfers.length;
					if (numFiles) {
						angular.forEach(transfers, function (file) {
							progress += file.progress();
						});
						progress = Math.round((progress * 100) / numFiles);
					}
					return progress;
				};

				scope.startUpload = function() {
					scope.uploadInProgress = true;
				};

				scope.finishUpload = function($flow) {
					scope.resetFlowFiles($flow);
					scope.uploadInProgress = false;
				};

				// TODO: Pending deprecation, replace uploadCompleted with endUpload to be more consistent with start/finish upload functions
				scope.uploadCompleted = function($flow) {
					scope.finishUpload($flow);
				};

				scope.resetFlowFiles = function($flow) {
					$flow.files = [];
				};

				scope.addFile = function(file) {
					if (scope.multiple) {
						scope.model.push(file);
					} else {
						scope.model = file;
					}
					form.$setDirty();
				};

				scope.isFileObject = function(file) {
					return (file === null || typeof file === 'undefined' || file === 'string' || !file.size || file.size === 0 || file.user_file_name === null) ? false : true;
				};

				scope.getModelArray = function() {
					var out = [];
					if (scope.multiple) {
						for (var i in scope.model) {
							var file = scope.model[i];
							if (scope.isFileObject(file)) {
								out.push(file);
							}
						}
					} else {
						if (scope.isFileObject(scope.model)) {
							out.push(scope.model);
						}
					}
					return (out.length > 0) ? out : null;
				};

				scope.maxReached = function() {
					var model = scope.getModelArray();
					return (model === null || model.length < scope.max) ? false : true;
				};

				scope.deleteFile = function(fileId) {
					if (scope.multiple) {
						for (var i in scope.model) {
							if (scope.model[i].file_id === fileId) {
								scope.model.splice(i, 1);
							}
						}
					} else {
						scope.model = undefined;
					}

					if(scope.parentObject === 'logo' && scope.fileFieldName === 'original' && scope.parent){
						delete scope.parent.preview;
						delete scope.parent.thumbnail;
						delete scope.parent.pdf_png;
					}
				};

				scope.handleDeletion = function(file, confirmTemplate) {
					var fileId = file.file_id;
					var confirm_message = 'Are you sure you want to delete this file? This operation CANNOT be undone.';
					soConfirm.open({message: confirm_message, template: confirmTemplate}).then(function (confirmed) {
						if (confirmed) {
							$http({
								url: soWidgetsConfig.apiPath + '/files/' + fileId,
								method: 'DELETE',
								params: {
									parent: scope.parentObject,
									parentId: scope.parentObjectId,
									fileFieldName: scope.fileFieldName
								}
							}).success(function() {
								scope.deleteFile(fileId);
							});
						}
					});
				};

				scope.displaySize = function(sizeInBytes) {
					if (sizeInBytes < 1000) {
						return sizeInBytes + ' bytes.';
					} else if (sizeInBytes < 1000000) {
						return (sizeInBytes * 1.0 / 1000).toFixed(2) + ' KB.';
					} else if (sizeInBytes < 1000000000) {
						return (sizeInBytes * 1.0 / 1000000).toFixed(2) + ' MB.';
					} else {
						return (sizeInBytes * 1.0 / 1000000000).toFixed(2) + ' GB.';
					}
				};

				scope.isImage = function(file) {
					return (scope.isFileObject(file) && file.filetype !== null && file.filetype.indexOf('image') >= 0) ? true : false;
				};

				scope.onFileSuccess = function($flow, file, message) {
					var returned_file_data = scope.$eval(message);
					for (var i in returned_file_data) {
						scope.addFile(returned_file_data[i]);
						file.file_id = returned_file_data[i].file_id;
					}
				};

				scope.checkMaxFilesAllowed = function($files, $flow) {
					var model = scope.getModelArray();
					var size = (model === null) ? 0 : model.length;
					var numCount = size + $flow.files.length;
					var allowed = scope.max - numCount;

					if ($files.length > allowed) {
						if (allowed > 0) {
							growl.error('MAX_REACHED_ERROR', {variables: {max: scope.max, object: 'files'}});
						} else {
							growl.error('FILE_UPLOAD_LIMIT_ERROR', {variables: {max: scope.max}});
						}
						return false;
					}
				};
			}
		}
	};
});

// Source: widgets/src/multi-select-directive.js
angular.module('SOWidgets')
	.directive('multiSelect', function ($parse, $filter, $timeout, PicklistService) {

		//  Borrowed from Angular.js //

		function isDefined(value){return typeof value !== 'undefined';}

		function sortedKeys(obj) {
			var keys = [];
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					keys.push(key);
				}
			}
			return keys.sort();
		}

		//000011111111110000000000022222222220000000000000000000003333333333000000000000004444444444444440000000005555555555555550000000666666666666666000000000000000777777777700000000000000000008888888888
		var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/

		return {
			templateUrl: function(element, attrs) {
				if (attrs.templateUrl) {
					return attrs.templateUrl;
				}
				var template = 'multi-select';
				if(attrs.template) {
					template += '-'+attrs.template;
				}
				return '/components/song/widgets/src/' + template +'.html';
			},
			require: 'ngModel',
			scope: {
				model: '=ngModel',
				required: '@required',
				name: '@name',
				pageSize: '=',
				defaultOpenGroups: '=',
				getOptionsFn: '='
			},
			restrict: 'E',
			link: function postLink(scope, element, attrs, modelCtrl) {
				// defaults
				var allSelected = false;
				var openGroups = (angular.isArray(scope.defaultOpenGroups)) ? scope.defaultOpenGroups : [];
				scope.selectAllLabel = "select all";
				scope.showCheckedMessage = "show selected";
				scope.showChecked = false;
				scope.search = {};

				var optionsExp = attrs.options;
				scope.getOptions = scope.getOptionsFn || scope.$parent.getOptions || function (picklistid) {
					return PicklistService.$cache.get(picklistid);
				};

				var fieldName = scope.name;
				var pageSize = attrs.pageSize || 20;

				//override isEmpty to make it return true for empty array (needed for 'required' validation)
				modelCtrl.$isEmpty = function(value) {
					var isEmpty = !value || value.length === 0;
					if (isEmpty && scope.required) {
						scope[fieldName].$error.required = true;
						scope[fieldName].$invalid = true;
					} else if (scope[fieldName]) {
						scope[fieldName].$error.required = false;
						scope[fieldName].$invalid = false;
					}
					return isEmpty;
				};


				//Watch for changes in ng-model and reflect them in the view
				scope.$watch('model', function() {
					if(typeof modelCtrl.$modelValue === 'undefined' || modelCtrl.$modelValue === null || (angular.isArray(modelCtrl.$modelValue) && modelCtrl.$modelValue.length === 0)) {
						scope.checked = [];
					} else {
						if (typeof modelCtrl.$modelValue === 'string') {
							scope.checked = modelCtrl.$modelValue.split(',');
						} else {
							scope.checked = modelCtrl.$modelValue;
						}
						if (scope[fieldName]) {
							scope[fieldName].$pristine = false;
						}
					}

					//trigger a change event (expected by form-field-server-error)
					element.triggerHandler('change');

				});

				scope.showSearchFilter = function () {
					if (scope.options) {
						return (scope.options.length > pageSize);
					} else {
						return false;
					}
				};

				scope.toggleOption = function (option) {
					var index = scope.checked.indexOf(option);
					if(index > -1) {
						scope.checked.splice(index, 1);
					} else {
						scope.checked.push(option);
					}
					//update ng-model
					modelCtrl.$setViewValue(angular.copy(scope.checked));
				};


				scope.toggleShowChecked = function () {
					scope.showChecked = !scope.showChecked;
					scope.showCheckedMessage = scope.showChecked ? "show all" : "show selected";

					if(scope.useGrouping && scope.showChecked) {
						// defer to next apply cycle to avoid animation flicker
						$timeout(toggleGroupState, 0);
					}
				};


				function toggleGroupState() {
					angular.forEach(scope.optionGroups, function (group, key) {
							if(scope.numSelectedInGroup(group) > 0) {
								group.is_open = true;
							}
					});
				}

				scope.showCheckedFilter = function () {
					return function (option) {
						if(scope.showChecked) {
							return scope.isChecked(option.id);
						} else {
							return true;
						}
					}
				};

				scope.selectAll = function () {
					scope.checked = [];
					allSelected = !allSelected;

					if(allSelected) {
						angular.forEach(scope.options, function(value, key){
							scope.checked.push(scope.options[key].id);
						});
						scope.selectAllLabel = "deselect all";
					} else {
						scope.selectAllLabel = "select all";
					}
					//Update ng-model
					modelCtrl.$setViewValue(scope.checked);

				};

				scope.showGroup = function (group) {
					var numSelected = scope.numSelectedInGroup(group);
					var filteredLength = $filter('filter')(group.options, scope.search.keywords).length;

					// Hide the group if the results of filtering or 'showchecked' is a group with no options
					return (filteredLength == 0 || (scope.showChecked && numSelected == 0)) ? false : true;

				};

				scope.numSelectedInGroup = function (group) {
					var num = 0;
					angular.forEach(group.options, function (option) {
						if(scope.isChecked(option.id)) {
							num++;
						}
					});

					return num;
				};

				scope.isChecked = function (id) {
					var checked = false;
					if (angular.isArray(scope.checked)) {
						checked = (scope.checked.indexOf(id) !== -1);
					} else if (angular.isDefined(scope.checked[id]) && scope.checked[id]) {
						checked = true;
					}
					return checked;
				};

				scope.getMidPoint = function (num) {
					return Math.ceil(num / 2);
				}

				// This is borrrowed and repurposed from angular.js
				function setupAsOptions(scope) {
					var match;
					if (!(match = optionsExp.match(NG_OPTIONS_REGEXP))) {
						throw new Error("Whoops! There was an error in the ng-options match expression.  Try in the form of: option as option.label for option in getOptions('picklistid') track by option.id");
					}

					var displayFn = $parse(match[2] || match[1]),
						valueName = match[4] || match[6],
						keyName = match[5],
						groupByFn = $parse(match[3] || ''),
						valueFn = $parse(match[2] ? match[1] : valueName),
						valuesFn = $parse(match[7]),
						track = match[8],
						trackFn = track ? $parse(match[8]) : null;

					scope.useGrouping = (match[3] == undefined) ? false : true;

					// Temporary location for the option groups before we render them
					var optionGroups = {},
						optionGroupNames = [''],
						optionGroupName,
						optionGroup,
						option,
						modelValue = modelCtrl.$modelValue,
						values = valuesFn(scope) || [],
						keys,
						key,
						groupLength, length,
						groupIndex, index,
						locals = {},
						label;

					// We now build up the list of options we need (we merge later)
					var buildOptions = function (resolvedValues) {
						values = resolvedValues ? (resolvedValues.models || resolvedValues) : values;
						keys = keyName ? sortedKeys(values) : values;
					  for(index = 0; length = keys.length, index < length; index++) {
							key = index;
							if(keyName) {
								key = keys[index];
								if(key.charAt(0) === '$') {
									continue;
								}
								locals[keyName] = key;
							}

							locals[valueName] = values[key];
							optionGroupName = groupByFn(scope, locals) || 'baseGroup';

							if(!(optionGroup = optionGroups[optionGroupName])) {
								optionGroup = optionGroups[optionGroupName] = {options: []};
								optionGroups[optionGroupName].is_open = (openGroups.indexOf(optionGroupName) !== -1);
								optionGroupNames.push(optionGroupName);
							}

							label = displayFn(scope, locals); // what will be seen by the user

							// doing displayFn(scope, locals) || '' overwrites zero values
							label = isDefined(label) ? label : '';
							optionGroup.options.push({
								// either the index into array or key from object
								id: trackFn ? trackFn(scope, locals) : (keyName ? keys[index] : index),
								label: label
							});
					  }
					  scope.optionGroups = optionGroups;
					  scope.options = values;
					};
					if (values.$promise) {
					  values.$promise.then(buildOptions);
					} else {
					  buildOptions();
					}
				}

				setupAsOptions(scope);
			}
		};
	});

// Source: widgets/src/so-widgets-config-provider.js
angular.module('SOWidgets')
  .provider('soWidgetsConfig', function() {
			var config = {
				apiPath: '/api',
				jsonFilters: false
			};

			config.$get = function() {
				delete config.$get;
				return config;
			};

			return config;
		});
