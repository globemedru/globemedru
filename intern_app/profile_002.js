(function() {
	'use strict';

	angular
	.module('studentCSMApp')
	.factory('ProfileService', ProfileService)
	.factory('StudentService', StudentService)
	.factory('EducationService', EducationService)
	.factory('WorkExperienceService', WorkService)
	.factory('ProjectsService', ProjectsService)
	.factory('SkillsService', SkillsService);

	function ProfileService(BaseResourceService, API_PREFIX) {
		var args = {
			pkey: 'profile_id',
			actions : {
				getProfileProgress: {
					method : 'GET',
					url: API_PREFIX + '/profile/progress',
					ignoreLoadingBar: true
				},
				checkUrl: {
					method : 'GET',
					url: API_PREFIX + '/profile/check-url',
					params: {
						url: '@url'
					},
					ignoreLoadingBar: true
				},
				getProfileFormFields: {
					method: 'GET',
					url: API_PREFIX + '/profile/form-fields',
					ignoreLoadingBar: true
				}
			}
		};
		return BaseResourceService.initModel('student_profile', args);
	}

	function StudentService(BaseResourceService, API_PREFIX) {
		var args = {
			pkey: 'student_id',
			actions: {
				update: {
					method: 'PUT',
					interceptor : {
						response: function(response) {
							response.resource.$httpHeaders = response.headers;
							return response.resource;
						}
					}
				},
				getImageBySize : {
					method : 'GET',
					url: API_PREFIX + '/student/:id/image/:size',
					params: {
						size: '@size',
						id: '@student_id'
					}
				},
				checkRights: {
					method: 'GET',
					url: API_PREFIX + '/auth/check-rights/:attribute',
					params: {
						attribtue: '@attribute'
					}
				}
			}
		};

		return BaseResourceService.initModel('student', args);
	}

	function EducationService(BaseResourceService) {
		var args = {
			pkey : 'education_id',
			params: {
				profile_id: '@profile_id'
			}
		};
		return BaseResourceService.initModel('education', args);
	}

	function WorkService(BaseResourceService) {
		var args = {
			pkey : 'work_experience_id',
			params: {
				profile_id: '@profile_id'
			}
		};
		return BaseResourceService.initModel('work_experience', args);
	}

	function ProjectsService(BaseResourceService) {
		var args = {
			pkey : 'project_id',
			params: {
				profile_id: '@profile_id'
			}
		};
		return BaseResourceService.initModel('projects', args);
	}

	function SkillsService(BaseResourceService, API_PREFIX) {
		var args = {
			pkey : 'skill_id',
			actions: {
				getSkills : {
					method : 'GET',
					url : API_PREFIX + '/skills/',
					params: {
						kw : '@kw'
					},
					isArray : true
				},
				saveSkills : {
					method : 'PUT',
					url: API_PREFIX + '/skills',
					isArray : true
				}
			},
		};
		return BaseResourceService.initModel('skills', args);
	}

}());
