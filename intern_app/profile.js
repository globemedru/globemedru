(function() {
	'use strict';

	angular
	.module('studentCSMApp')
	.factory('ProfileFactory', ProfileFactory)
	.factory('StudentFactory', StudentFactory);

	function ProfileFactory(ProfileService, PicklistService, BaseResourceService, $injector, SkillsService){

		var student_profile = {};
		var picklist_fields = { student_profile: ['major', 'year', 'degree_level', 'work_authorization'],
								project: ['project_type']
							};
		var n2n_fields =['education', 'work_experience', 'projects'];

		var prompts = [ {field_name: 'resume', edit_state:'links', value: "profile responsive.Upload Resume", repeat:'no'}, 
						{field_name:'skills', edit_state:'skills', value: "profile responsive.Add A Skill", repeat:'no'}, 
						{model:'student_profile', field_name:'work_experience', edit_state:'work_experience', value: "profile responsive.Add Experience", repeat:'no'}, 
						{model:'student_profile', field_name:'projects', edit_state:'projects', value: "profile responsive.Add A Project", repeat:'no'},  
						{field_name:'permanent_email', edit_state: 'contact', value: "profile responsive.Add Permanent Email", repeat:'no'},
						{field_name: 'skills', edit_state:'skills', value: "profile responsive.Add Another Skill", repeat:'yes'},
						{field_name: 'personal_website', edit_state:'links', value: "profile responsive.Add Personal Website", repeat:'no'}, 
						{model:'student_profile', field_name: 'projects', edit_state:'projects',  value: "profile responsive.Add Another Project", repeat:'yes'},
						{field_name:'career_objective', edit_state:'career_objective', value: "profile responsive.Add Personal Statement", repeat:'no'}, 
						{field_name:'linkedin_url', edit_state: 'contact', value: "profile responsive.Add LinkedIn Profile", repeat:'no'},
						{field_name:'facebook_url', edit_state: 'contact', value: "profile responsive.Add Facebook Profile", repeat:'no'}
					];

		var profile_factory = {
			getStudentProfile: function() {
				return student_profile;
			},

			setStudentProfile: function(profile) {
				student_profile = profile;
			},

			fetchStudentProfile: function(obj) {
				var promise = ProfileService.get(obj).$promise;
				var profile_factory = this;
				promise.then(function(profile) {
					profile_factory.setStudentProfile(profile);
					ProfileService.profile_id = profile.profile_id;
				});
				return promise;
			},

			fetchProfileProgress : function() {
				return ProfileService.getProfileProgress().$promise;
			},

			getAllPicklists : function() {
				for(var model in picklist_fields) {
					_.forEach(picklist_fields[model], function(field){
						if(!PicklistService.$cache.get(field)) {
							PicklistService.query({model: model, field: field, picklistId: field}).$promise.
							then(function(resp) {
								PicklistService.$cache.put(field, resp);
							});
						}
					});
				}
			},

			deleteN1 : function(field, id) {
				var service_name = BaseResourceService.getServiceName(field);
				if ($injector.has(service_name)) {
					var service = $injector.get(service_name);
					return service.delete({id: id, profile: student_profile.profile_id}).$promise;
				} else {
					console.warn(BaseResourceService.getServiceName(field) + 'does not exist.');
				}
			},

			checkUrl : function(url) {
				return ProfileService.checkUrl({url : url}).$promise;
			},

			getSkills : function(keyword) {
				return SkillsService.getSkills({kw : keyword}).$promise;
			},

			saveSkills : function(skills, profile_id) {
				return SkillsService.saveSkills({profile_id: profile_id}, skills).$promise;
			},

			enableN2NFieldsResourceService: function(student_profile) {
				_.each(n2n_fields, function(field) {
					if (_.isArray(student_profile[field]) && student_profile[field].length > 0) {
						var Service = BaseResourceService.getService(field);
						for (var i = 0; i < student_profile[field].length; i++) {
							student_profile[field][i] =  new Service(student_profile[field][i]);
						}
					}
				});
			},
			getN2NFields : function() {
				return n2n_fields;
			},

			getProfileFormFields : function() {
				return ProfileService.getProfileFormFields().$promise;
			},

			getPrompts: function(){
				return prompts;
			}

		};
		return profile_factory;
	}

	function StudentFactory(StudentService, PicklistService, $q) {
		var student = {};
		var picklist_fields = ['student_status'];

		var student_factory = {

			getStudent:function() {
				return student;
			},

			setStudent: function(student_obj) {
				student = student_obj;
			},

			fetchStudent: function(obj) {
				var student_factory = this;
				var promise = StudentService.get(obj).$promise;
				promise.then(function(student) {
					student_factory.setStudent(student);
					StudentService.student_id = student.student_id;
				});
				return promise;
			},

			getAllPicklists : function() {
				_.forEach(picklist_fields, function(field){
					if(!PicklistService.$cache.get(field)) {
						PicklistService.query({model: 'student', field: field, picklistId: field}).$promise.
						then(function(resp) {
							PicklistService.$cache.put(field, resp);
						});
					}
				});
			},

			getImageBySize: function(size, id) {
				if (!id) {
					id = student.student_id;
				}
				return StudentService.getImageBySize({size: size, id : id}).$promise;
			},
			checkRights: function(attr) {
				return StudentService.checkRights({attribute: attr}).$promise;
			}
		};

		return student_factory;
	}
}());
