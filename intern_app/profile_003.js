(function() {
	'use strict';

	angular
	.module('studentCSMApp')
	.controller('ProfileViewController', ProfileViewController);

	function ProfileViewController(profile, student, form_fields,ProfileFactory, StudentFactory, $element, $timeout, SOAuthService, $filter, $location, PicklistService, soConfirm, SystemSettingsService, $scope, $anchorScroll, $mdDialog, $mdMedia, SocialMediaService, BaseResourceService, NotificationService, DOMService, API_PREFIX, growl) {
		var vm = this;
		var alert;
		var profile_api_fields = ['degree_level', 'gpa', 'graduation_date', 'major', 'personal_website', 'public_url', 'show_gpa', 'year']; //api_fields in student classdef for profile
		vm.student_profile = profile;
		vm.student = student;
		vm.student.image = vm.student.image || {};
		vm.student.image.display_name="profile";
		vm.student.cover_image = vm.student.cover_image || {};
		vm.student.cover_image.display_name="cover";
		vm.student.cover_image.url = "assets/images/cover_image.png";
		vm.currentLocation = $location.protocol() + '://' + $location.host();
		ProfileFactory.enableN2NFieldsResourceService(vm.student_profile);
		vm.form_fields = form_fields;
		var resume_right_promise = StudentFactory.checkRights('resume');
		resume_right_promise.then(function(resp) {
			vm.hasResumeRight = resp.data;
		});
		StudentFactory.checkRights('profile_edit').then(function(resp){
			vm.hasProfileEditRight = resp.data;
		});

		vm.hasFormField = function(fid, form) {
			if (form_fields[form].hasOwnProperty(fid) && !form_fields[form][fid]._form_field_widget_options.skip_field) {
				return true;
			}
			return false;
		};

		vm.isFieldRO = function(fid, form) {
			if (form_fields[form].hasOwnProperty(fid) && form_fields[form][fid]._form_field_widget_options.read_only) {
				if (form_fields[form][fid]._form_field_widget_options.read_only === true || form_fields[form][fid]._form_field_widget_options.read_only == 1) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		vm.isPicklistMulti = function(fid, form) {
			if (form_fields[form].hasOwnProperty(fid) && form_fields[form][fid]._form_field_widget_options.multiple) {
				if (form_fields[form][fid]._form_field_widget_options.multiple === true || form_fields[form][fid]._form_field_widget_options.multiple == 1) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		vm.isFieldRequired = function(fid, form) {
			if (form_fields[form].hasOwnProperty(fid) && form_fields[form][fid]._form_field_required) {
				if (form_fields[form][fid]._form_field_required === true || form_fields[form][fid]._form_field_required == 1) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		vm.skills = {selected_skills: []};		
		if (!_.isUndefined(vm.student_profile.skills) && !_.isNull(vm.student_profile.skills)) {
			vm.skills.selected_skills = angular.copy(vm.student_profile.skills);
		}
		
		var n2n_fields = ProfileFactory.getN2NFields();
		_.each(n2n_fields, function(field) {
			vm[field] = [];
			if(field == 'education') {
				vm[field]['current'] = {};
			}
			if (_.isArray(vm.student_profile[field]) && vm.student_profile[field].length > 0) {
				_.each(vm.student_profile[field], function(n2n_data, index) {
					vm[field][index] = {};
					if (field == 'projects' &&
						(_.isUndefined(vm.student_profile[field][index].skills)  ||
						 _.isNull(vm.student_profile[field][index].skills))) {
						vm.student_profile[field][index].skills = [];
					}
				});
			}
		});
		
		vm.reload_profile_pic = false;
		vm.getProfilePic = function() {
			StudentFactory.getImageBySize(160, vm.student.student_id).then(function(resp) {
				if (resp.type !== 'error') {
					vm.profile_pic_url = API_PREFIX + '/student/' + vm.student.student_id + '/image/160';
				}
			}, function(err) {
				vm.profile_pic_url = false;
			});
		};
		vm.getProfilePic();

		$scope.$watch(function() { return vm.reload_profile_pic; }, function(new_val, old_val) {
			if (new_val) {
				vm.getProfilePic();
			}
		});

		vm.$mdMedia = $mdMedia;

		$scope.$watch(function() {
			return SystemSettingsService.initialized;
		}, function(data) {
			if (SystemSettingsService.initialized) {
				vm.settings = SystemSettingsService.getSettings(['allow_students_to_modify_profile_pic', 'student_doc_approvals', 'student_max_majors', 'use_flat_major_pick', 'student_profilelock','student_profilepersonal_lock', 'student_email_editable', 'student_alumni_allow_email_edit', 'maximum_resumes', 'law_consortia', 'school_name', 'hide_psx_current_education']);
				if ((form_fields.student_profile.major._form_field_type_attributes.hasOwnProperty('hierpicklist') && form_fields.student_profile.major._form_field_type_attributes.hierpicklist === '1') || form_fields.student_profile.major._form_field_widget.toLowerCase() == 'hierpicklist') {
					vm.settings['use_flat_major_pick'] = false;
				} else if (!form_fields.student_profile.major._form_field_type_attributes.hasOwnProperty('hierpicklist') || form_fields.student_profile.major._form_field_widget.toLowerCase() == 'picklist') {
					vm.settings['use_flat_major_pick'] = true;
				}
				if (vm.settings['law_consortia'] && vm.student_profile.institution) {
					vm.current_school_name = vm.student_profile.institution;
				} else {
					vm.current_school_name = vm.settings['school_name'];
				}
			}
		});

		vm.publishProfile = function() {
			var sp = {
				profile_id: vm.student_profile.profile_id,
				publish: vm.student_profile.publish 
			};
			var service = BaseResourceService.getService('student_profile');
			new service(sp).$update({json_mode: 'raw', populateRelationFields: true, skip_processors: true, skipRequiredIfNoField: true}).then(function(resp){
				vm.student_profile.publish = resp.publish;
			});
		};
		
		vm.showAlert =function($event, $url) {
			var shareable_url = vm.getShareableUrl();
			var parentEl = angular.element(document.body);
			$mdDialog.show({
				parent: parentEl,
				targetEvent: $event,
				template: '<md-dialog aria-label="Share Profile" class="share-profile">' +										
					'  <md-dialog-content class="md-dialog-content" role="document" tabindex="-1">'+
					'		<h2 class="md-title">' + $filter("translate")("profile responsive.Share Profile") + '</h2>'+
					'		<form so-form="student_profile" name="publish.form" ng-if="student_profile.publish == \'0\'">' +
					'		<div layout="column">' +
					'			<div>' +
									$filter("translate")("profile responsive.Ready to share your profile? Great- just publish it to get started.") +
					'			</div>' +
					'			<div layout="row" layout-align="start center">' +
					'				<md-switch' +
					'					ng-model="student_profile.publish"' +
					'					name="publish" ' +
					'					aria-label="Publish your profile when you are ready to share it"' +
					'					ng-true-value="\'1\'"' +
					'					ng-false-value="\'0\'"' +
					'					ng-change="publishProfile();"' +
					'				>' +
					'				</md-switch>' +
					'				<div flex="grow">' +
					'					Publish' +
					'				</div>' +
					'			</div>' +
					'		</div>' + 
					'		</form>' +
					'		<div ng-if="student_profile.publish == \'1\'">' +
					'			<md-input-container><label>' + $filter("translate")("profile responsive.Copy & paste to share") + '</label><textarea id="share_url_text" rows="2" aria-multiline="true" aria-label="Share URL" ng-readonly="true">'+shareable_url+'</textarea></md-input-container>'+
					'			<div><img ng-src="/students/psx/assets/images/icons/social/facebook_share.png" aria-label="Facebook" ng-click="FBShare()"></img>'+
					'			<img ng-src="/students/psx/assets/images/icons/social/linkedin_share.svg" class="linkedin" aria-label="Linkedin" ng-click="INShare()"></img>' +
					'			<a href="https://twitter.com/share" target="_blank" class="twitter-share-button"{count} data-url="' + shareable_url +'" data-text="Check out my profile">Tweet</a></div>'+
					'		</div>' +
					'  </md-dialog-content>' +
					'  <md-dialog-actions>' +
					'    <md-button ng-click="closeDialog()" class="md-primary">' +
					     $filter("translate")("profile responsive.Close") +
					'    </md-button>' +
					'  </md-dialog-actions>' +
					'</md-dialog>',
				locals: {
					items: $scope.items
				},
				onComplete: function() { 
					IN.parse(document); 
					twttr.widgets.load(); 
					SocialMediaService.initFB();  
					angular.element("#share_url_text").focus().select();
				},
				controller: DialogController
			});
			function DialogController($scope, $mdDialog, items) {
				$scope.student_profile = vm.student_profile;
				$scope.publishProfile = vm.publishProfile;
				$scope.items = items;
				$scope.closeDialog = function() {
					$mdDialog.hide();
				};
				$scope.FBShare = function() {
					SocialMediaService.shareFB(vm.getShareableUrl(), 'Check out my profile');
				};
				$scope.INShare = function () {
					SocialMediaService.shareIN(vm.getShareableUrl(), 'Check out my profile', 'Check out my profile');
				};
			}
			DialogController.$inject = ['$scope', '$mdDialog', 'items'];
		};

		vm.showLockedAlert = function($event) {
			$mdDialog.show(
				$mdDialog.alert()
				.parent(angular.element(document.body))
				.clickOutsideToClose(true)
				.title($filter('translate')('profile responsive.This information is not editable'))
				.textContent($filter('translate')('profile responsive.Your career center has locked this information from being edited. Please contact the career center staff if you need to change this information.'))
				.ariaLabel($filter('translate')('profile responsive.Information not editable'))
				.ok($filter('translate')('profile responsive.Got it!'))
				.targetEvent($event)
			);
		};
		
		vm.checkUrl = function ( field_ctrl, url ) {
			if (!field_ctrl.$touched) {
				field_ctrl.$setTouched(true);
			}
			vm.checking_url = true;
			field_ctrl.$setValidity('profanity', true);
			field_ctrl.$setValidity('invalid_chars', true);
			field_ctrl.$setValidity('invalid_url',true);
			var PUBLIC_URL_REGEXP = /^[a-zA-Z0-9._]*$/;
			if (PUBLIC_URL_REGEXP.test(url)) {
				ProfileFactory.checkUrl(url).then(function(resp) {
					if (resp.hasOwnProperty('errors')) {
						field_ctrl.$setValidity('invalid_url', false);
						field_ctrl.$setValidity('profanity', false);
						vm.valid_url = false;
						return;
					}
					vm.valid_url = resp.available;
					vm.checking_url = false;
					field_ctrl.$setValidity('invalid_url', vm.valid_url);
					field_ctrl.$setValidity('invalid_chars', true);
					field_ctrl.$setValidity('profanity', true);
				});
			} else {
				vm.checking_url = false;
				field_ctrl.$setValidity('invalid_chars', false);
			}
		};

		vm.getShareableUrl = function() {
			return vm.currentLocation + '/profiles/' + vm.student_profile.public_url;
		};

		vm.prompts = ProfileFactory.getPrompts();
		vm.progress_index = 0;
		vm.profile_index = 0;

		vm.setCurrentPrompt = function() {   
			var prompts_copy = vm.prompts.length;
			for (var k=0; k < prompts_copy; k++){
				for (var j in vm.profile_progress.complete_fields){
					if(vm.prompts[k].field_name == vm.profile_progress.complete_fields[j] && vm.prompts[k].repeat == 'no'){
						vm.prompts.splice(k, 1);
						prompts_copy--;
						if(k > 0){
							k--;  
						}else{
							k = 0;
						}
					}
				}

				for (var f in vm.profile_progress.incomplete_fields){
					if((vm.profile_progress.incomplete_fields[f] =='resume' && vm.student.resume.length > 0 ) && (vm.prompts[k].field_name == 'resume' && vm.prompts[k].repeat == 'no')){
						vm.prompts.splice(k, 1);
						prompts_copy--;
						if(k > 0){
							k--;  
						}else{
							k = 0;
						}
					}
				}

				switch(vm.prompts[k].field_name) {
					case 'permanent_email' :
					case 'linkedin_url' :
					case 'facebook_url' :
						if (vm.student[vm.prompts[k].field_name] !== '' && vm.student[vm.prompts[k].field_name] !== null && vm.prompts[k].repeat == 'no') {
							vm.prompts.splice(k, 1);
							prompts_copy--;
							if (k >0) {
								k--;
							} else {
								k = 0;
							}
						}
				}
			}

			if (vm.progress_index < vm.prompts.length - 1){
				vm.current_progress_prompt = vm.prompts[vm.progress_index];
			}else{
				vm.progress_index = 0;
				vm.current_progress_prompt = vm.prompts[vm.progress_index];
			}
			if (vm.profile_index < vm.prompts.length - 1){
				vm.current_profile_prompt = vm.prompts[vm.profile_index];
			}else{
				vm.profile_index = 0;
				vm.current_profile_prompt = vm.prompts[vm.profile_index];
			}
		};

		vm.nextPrompt = function (prompt_type, prompt_index){
			if (vm[prompt_index] < vm.prompts.length -1) {
				vm[prompt_index]++;
				if(vm.prompts[vm[prompt_index]].field_name == 'skills'){
					for (var p in vm.prompts){
						if(vm.prompts[p].repeat == 'no'){
							vm[prompt_index]++;
							vm.nextPrompt(prompt_type, prompt_index);
						}else{
							vm[prompt_type] = vm.prompts[vm[prompt_index]];

						}
					}
				}else if(vm.prompts[vm[prompt_index]].field_name == 'projects'){
					for (var q in vm.prompts){
						if(vm.prompts[q].repeat == 'no'){
							vm[prompt_index]++;
							vm.nextPrompt(prompt_type, prompt_index);
						}else{
							vm[prompt_type] = vm.prompts[vm[prompt_index]];

						}
					}
				}else{
					vm[prompt_type] = vm.prompts[vm[prompt_index]];
				}
			}else {
				vm[prompt_index] = 0;
				vm[prompt_type] = vm.prompts[vm[prompt_index]];
			}
		};


		vm.progress_promise = ProfileFactory.fetchProfileProgress();
		vm.progress_promise.then(function(progress) {
			vm.profile_progress = progress;
			resume_right_promise.then(function(resp) {
				if (!resp.data) {
					var idx = _.findIndex(vm.prompts, {field_name: 'resume'});
					vm.prompts.splice(idx, 1);
				}
				vm.setCurrentPrompt();
			});
		});



		vm.getMajorPicks = function() {
			var picks = PicklistService.$cache.get('major');
			return picks;
		};
		vm.selected_majors = [];

		var findPickFromOptions = function(pick_options, pick_id, depth) {
			if(depth > 10) {
				console.log('crap');
			}
			for (var i in pick_options) {
				var item;
				if(pick_options[i].id == pick_id) {
					item = pick_options[i];
				} else {
					item = findPickFromOptions(pick_options[i].children, pick_id, depth + 1); 
				}
				if (item) {
					return item;
				}
			}
			return false;
		};

		vm.prepareMajorsForHierPicklist = function() {
			for(var i in vm.student_profile.major) {
				var resp = findPickFromOptions(PicklistService.$cache.get('major'), vm.student_profile.major[i], 0);
				if (resp) {
					delete resp._hsmeta;
					vm.selected_majors.push(resp);
				}
			}
		};
		vm.prepareMajorsForHierPicklist();


		vm.setSelectedMajors = function(items) {
			if (_.isFunction(vm.getForm)) {
				var form = vm.getForm();
				form.$setDirty();
				form.major.$setDirty();
				if (_.isEmpty(items)) {
					form.major.$touched = true;
					form.major.$setValidity('required', false);
				} else {
					form.major.$setValidity('required', true);
					form.major.$setValidity('server', true);
				}
			}
			vm.student_profile.major = vm.student.student_profile.major = _.pluck(items, 'id');
			vm.selected_majors = items;
		};


		vm.gotoAnchor = function(id, args) {
			$location.hash(id);
			$anchorScroll();
			if (ProfileFactory.getN2NFields().indexOf(args.field) > -1 && args.model ==='student_profile') {
				if (args.idx !== 'new') {
					vm.enableEdit(args.field, args.idx);
				} else {
					vm.addNew(args.model, args.field);
				}
			} else {
				vm.enableEdit(args.field);
			}
		};

		vm.addNew = function(model, field) {
			if (!vm[model][field]) {
				vm[model][field] = [];
			}
			vm[model][field].push({});
			var idx = vm[model][field].length - 1;
			vm.enableEdit(field, idx);
			if (ProfileFactory.getN2NFields().indexOf(field) > -1) {
				vm[field][idx].new = model;
			} else {
				vm[field].new = model;
			}
			if (model === 'student_profile' && ProfileFactory.getN2NFields().indexOf(field) > -1) {
				idx = vm.student_profile[field].length - 1;
				vm.student_profile[field][idx].profile_id = vm.student_profile.profile_id;
				var Service = BaseResourceService.getService(field);
				vm.student_profile[field][idx] = new Service();
				if (field == 'projects') {
					vm.student_profile[field][idx].skills = [];
				}
			}
		};

		vm.hasEdit = function(field) {
			for(var i=0; i<vm[field].length; i++) {
				if (vm[field][i].edit === true) {
					return true;
				}
			}
			return false;
		};

		vm.enableEdit = function(field, index) {
			if (ProfileFactory.getN2NFields().indexOf(field) > -1) {
				if (!vm[field][index]) {
					vm[field][index] = {};
				}
				vm[field][index].edit = true;
				vm[field][index].backupModel = {};
				if (_.isNumber(index)) {
					angular.copy(vm.student_profile[field][index], vm[field][index].backupModel);
					var selector = 'form[name="profileView.' + field + '[' + index + '].form"]';
				}
				if (!_.isNumber(index)) {
					if (field == 'education' &&  index == 'current') {
						var curr_edu_fields = ['graduation_date', 'major', 'gpa', 'show_gpa', 'degree_level'];
						_.each(curr_edu_fields, function(fid) {
							vm[field][index].backupModel[fid] = angular.copy(vm.student_profile[fid]);
						});
					}
					var selector = 'form[name="profileView.' + field + '[\'' + index + '\'].form"]';
				}
				$timeout(function(){
					var form_el = angular.element(document).find(selector)[0];
					if(form_el) {
						var offset = DOMService.getOffsetTop(form_el);
						var inputEl = angular.element(form_el).find('input')[0];
						DOMService.scrollTo(offset - 120, 600);
						if(inputEl){
							inputEl.focus();
						}
					}
				});
			} else {
				if (!vm[field]){
					vm[field] = {};
				}
				vm[field].edit = (typeof index !== 'undefined' ? index : true);
			}
		};

		vm.disableEdit = function(field, idx) {
			if (ProfileFactory.getN2NFields().indexOf(field) > -1) {
				vm[field][idx].edit = false;
				var model = 'student_profile';
				if (vm[field][idx].new) {
					vm[field].splice(idx,1);
					if (idx !== false && typeof idx !== 'undefined') {
						vm[model][field].splice(idx,1);
					}
				}
			} else {
				vm[field].edit = false;
				if(vm[field].new) {
					var model = vm[field].new;
					delete vm[field].new;
					if (idx !== false && typeof idx !== 'undefined') {
						vm[model][field].splice(idx,1);
					}
				}
			}
		};

		vm.clearServerErrors = function (form) {
			for(var i in form) {
				if (i.indexOf('$') < 0 && !_.isFunction(form[i])) {
					form[i].$setValidity('server', true);
				}
			}
		};

		vm.saveStudentForm = function(section) {
			var form = vm[section].form;
			form.$submitted = true;
			vm.clearServerErrors(form);
			if (form.$valid) {
				var form_fields = {
					student_id : vm.student.student_id,
					student_profile : {
						profile_id : vm.student_profile.profile_id
					}
				};
				for(var i in form) {
					if (i.indexOf('$') < 0 && !_.isFunction(form[i])) {
						if (profile_api_fields.indexOf(i) > -1 && vm.student.student_profile.hasOwnProperty(i)) {
							form_fields.student_profile[i] = vm.student.student_profile[i];
						} else if (vm.student.hasOwnProperty(i)){
							form_fields[i] = vm.student[i];
						}
					}
				}
				var student_service = BaseResourceService.getService('student');
				student_service = new student_service(form_fields);
				student_service.$update({json_mode: 'raw', populateRelationFields: true, skip_processors: true, skipRequiredIfNoField: true, skip_executeFormFieldCallback: true}).then(function(resp) {
					for(var fid in vm.student.student_profile) {
						vm.student.student_profile[fid] = resp.student_profile[fid];
					}
					delete resp.student_profile;
					angular.extend(vm.student, resp);
					angular.extend(vm.student_profile, vm.student.student_profile);

					var email_header = resp.$httpHeaders('Email-Update');
					if (email_header !== null) {
						growl.info(email_header, {ttl: 9000});
					}

					vm.onSave(resp);
				},
				function(resp) {
					vm.onError(resp);
				});
			}
		};

		vm.saveStudentProfile = function(section) {
			var form = vm[section].form;
			form.$submitted = true;
			vm.clearServerErrors(form);
			if (form.$valid) {
				var form_fields = {
					profile_id: vm.student_profile.profile_id
				};
				for(var i in form) {
					if (i.indexOf('$') < 0 && !_.isFunction(form[i]) && vm.student_profile.hasOwnProperty(i)) {
						form_fields[i] = vm.student_profile[i];
					}
				}
				var profile_service = BaseResourceService.getService('student_profile');
				profile_service = new profile_service(form_fields);
				profile_service.$update({json_mode: 'raw', populateRelationFields: true, skip_processors: true, skipRequiredIfNoField: true, skip_executeFormFieldCallback: true}).then(function(resp){
				vm.student_profile = resp;
				ProfileFactory.enableN2NFieldsResourceService(vm.student_profile);
				for(var fid in vm.student.student_profile) {
					vm.student.student_profile[fid] = vm.student_profile[fid];
				}
					vm.onSave(resp);
				},
				function(resp){
					vm.onError(resp);
				});
			}
		};

		vm.saveN1 = function(field, index) {
			var form = form = vm[field][index].form;
			form.$submitted = true;
			if (form.$valid) {
				if (vm[field][index].new) {
					delete vm[field][index].new;
				}
				if (vm.student_profile[field][index].hasOwnProperty(vm.student_profile[field][index].$key_column)) {
					var promise = vm.student_profile[field][index].$update({profile_id: vm.student_profile.profile_id, json_mode:'raw'});
				} else {
					var promise = vm.student_profile[field][index].$save({profile_id: vm.student_profile.profile_id, json_mode: 'raw'});
				}
				promise.then(function(resp) {
					vm.progress_promise = ProfileFactory.fetchProfileProgress();
					vm.progress_promise.then(function(progress) {
						vm.profile_progress = progress;
						vm.setCurrentPrompt();
					});
					vm[field][index].edit = false;
					if (vm[field][index].new) {
						delete vm[field][index].new;
					}
				});
			}

		};

		vm.deleteN1 = function(field, pkey_field, index) {
			soConfirm.open({
				action: 'delete this item'
			}).then(function(confirmed) {
				if(confirmed){
					var id = vm.student_profile[field][index][pkey_field];
					ProfileFactory.deleteN1(field, id).then(function(resp) {
						vm.student_profile[field].splice(index, 1);
						vm.disableEdit(field, index);
						vm.setCurrentPrompt();
					});
				}
			});
		};

		vm.updateProgressAndPrompts = function() {
			vm.progress_promise = ProfileFactory.fetchProfileProgress();
			vm.progress_promise.then(function(progress) {
				vm.profile_progress = progress;
				vm.setCurrentPrompt();
			});
		};

		vm.onSave = function(resp) {
			vm.updateProgressAndPrompts();
			var form_name = vm.getForm().$name;
			var split = vm.getForm().$name.split('.');
			if (split.length > 1) {
				var changed_field = split[1];
			} else {
				var changed_field = form_name;
			}
			vm.disableEdit(changed_field);
		};

		vm.onError = function(resp) {
			vm.isSubmitting = false;
			vm.result = 'error';
			var form = vm.getForm();
			if ((resp.status === 422) && resp.data.errors) { //server side validation failed
				if (resp.data.errors.form_errors) {
					angular.forEach(resp.data.errors.form_errors, function (form_error) {
						NotificationService.pushForCurrentRoute(
							'FORM_SAVE_ERROR',
							'danger',
							{error: form_error}
						);
					});
				}
				if (resp.data.errors.field_errors) {
					angular.forEach(resp.data.errors.field_errors, function (errors, field) {
						if (form[field]) {
							var errs = [];
							if (_.isObject(errors) && errors._error_message) {
								errs.push(errors._error_message);
							}
							//tell the form that the field is invalid
							form[field].$setValidity('server', false);
							//set the fields error messages from server
							if (_.isArray(errors)) {
								errs.push(errors.join(', '));
							}
							form[field].$error['server'] = errs.join(', ');
						} else {
							throw new Error('field ' + field + ' is missing in this form');
						}
					});
				}
				$timeout(function(){
					var el = document.getElementsByClassName('error').item(0);
					if(el) {
						var offset = DOMService.getOffsetTop(el);
						var inputEl = angular.element(el).find('input')[0];
						DOMService.scrollTo(offset - 120, 600);
						if(inputEl){
							inputEl.focus();
						}
					}
				}, 0);
			}
		};

		vm.saveCurrentEducation = function() {
			vm.education.current.form.$submitted = true;
			vm.clearServerErrors(vm.education.current.form);
			if (vm.education.current.form.$valid) {
				var post = {profile_id: vm.student_profile.profile_id};
				for(var i in vm.education.current.form) {
					if (i.indexOf('$') < 0 && !_.isFunction(vm.education.current.form[i]) && ProfileFactory.getN2NFields().indexOf(i) < 0 && !_.isFunction(vm.student_profile[i])) {
						post[i] = vm.student_profile[i];
					}
				}
				var Service = BaseResourceService.getService('student_profile');
				var ps = new Service(post);
				ps.$update({json_mode:'raw', populateRelationFields: true, skip_processors: true, skipRequiredIfNoField: true, skip_executeFormFieldCallback: true}).then(function(resp) {
					for(var fid in vm.student.student_profile) {
						vm.student.student_profile[fid] = resp[fid];
					}
					vm.disableEdit('education', 'current');
				},
				function(resp) {
					vm.onError(resp);
				}
				);
			}

		};


		vm.cancelEdit = function(section_name, index) {
			if (section_name === 'skills') {
				vm.skills.selected_skills = [];
				if (!_.isUndefined(vm.student_profile.skills) && !_.isNull(vm.student_profile.skills)) {
					vm.skills.selected_skills = angular.copy(vm.student_profile.skills);
				}
				return;
			}
			var form = vm.getForm();
			if (ProfileFactory.getN2NFields().indexOf(section_name) > -1) {
				if (!_.isEmpty(vm[section_name][index])) {
					form = vm[section_name][index].form;
				} else {
					return;
				}
			}
			if (form.$dirty || form.$invalid || section_name == 'projects') {
				if(section_name === 'header' || section_name === 'contact' || section_name === 'links') {
					section_name = 'student_profile'; //for subform fields
				}
				var model_name,
				backup_model = vm.backupModel;
				if (backup_model.hasOwnProperty('student_id')) {
					model_name = 'student';
				}
				if (backup_model.hasOwnProperty('profile_id') || ProfileFactory.getN2NFields().indexOf(section_name) > -1) {
					model_name = 'student_profile';
				}
				if (model_name) {
					if (ProfileFactory.getN2NFields().indexOf(section_name) > -1) {
						backup_model = vm[section_name][index].backupModel;
						if (index === 'current') {
							var curr_edu_fields = ['graduation_date', 'major', 'gpa', 'show_gpa'];
							_.each(curr_edu_fields, function(fid) {
								vm.student_profile[fid] = angular.copy(backup_model[fid]);
							});
							vm.student.student_profile.major = vm.student_profile.major;
							vm.selected_majors = [];
							vm.prepareMajorsForHierPicklist();
						} else {
							angular.extend(vm.student_profile[section_name][index], vm[section_name][index].backupModel);
						}
					} else {
						_.each(backup_model, function(value, field_name) {
							if (form[field_name]) {
								vm[model_name][field_name] = angular.copy(value);
							} else if (field_name === section_name && backup_model[field_name]) {
								vm[model_name][field_name] = angular.copy(backup_model[field_name]);
								if (field_name === 'student_profile' && form.hasOwnProperty('major')) {
									vm.student_profile.major = vm.student.student_profile.major;
									vm.selected_majors = [];
									vm.prepareMajorsForHierPicklist();
								}
							}
						});
					}
				}
			}
		};

		vm.getSkills = function (kw) {
			return ProfileFactory.getSkills(kw);
		};

		vm.saveSkills = function() {
			var sp = {
				profile_id: vm.student_profile.profile_id,
				skills: vm.skills.selected_skills
			};
			var service = BaseResourceService.getService('student_profile');
			new service(sp).$update({json_mode: 'raw', populateRelationFields: true, skipRequiredIfNoField: true}).then(function(resp){
				vm.student_profile.skills = [];
				if (!_.isUndefined(resp.skills) && !_.isNull(resp.skills)) {
					vm.student_profile.skills = angular.copy(resp.skills);
				}
				vm.skills.selected_skills = angular.copy(vm.student_profile.skills);
				vm.disableEdit('skills');
				vm.progress_promise = ProfileFactory.fetchProfileProgress();
				vm.progress_promise.then(function(progress) {
					vm.profile_progress = progress;
					vm.setCurrentPrompt();
				});
			});
		};
		
		vm.transformSkill = function(skill) {
			if (!angular.isObject(skill)) {
				skill = {skill_name: skill, new: true};
			}
						
			return skill;
		};

		vm.setProjectWorkExperience = function(project_index, work_exp_id) {
			if (work_exp_id !== 'other') {
				var work_exp = _.findWhere(vm.student_profile.work_experience, {work_experience_id : work_exp_id});
				vm.student_profile.projects[project_index].company_name = work_exp.company;
				vm.student_profile.projects[project_index].position = work_exp.title;
			} else {
				var company_name = null, position = null;
				if (vm.projects[project_index].backupModel.work_experience === 'other') {
					company_name = vm.projects[project_index].backupModel.company_name;
					posittion = vm.projects[project_index].backupModel.position;
				}
				vm.student_profile.projects[project_index].company_name = company_name;
				vm.student_profile.projects[project_index].position = position;
			}
		};
	}

}());
