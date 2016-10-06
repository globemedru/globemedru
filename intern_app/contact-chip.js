(function() {
	'use strict';

	angular
	.module('studentCSMApp')
	.directive('contactChip', contactChip);

	function contactChip() {
		var directive = {
			restrict: 'E',
			replace: false,
			scope: {},
			controller: ContactChipController,
			controllerAs: 'vm',
			link: setupContactChip,
			templateUrl: '/students/psx/app/layout/toolbar/contact-chip.html'
		};
		return directive;

		function setupContactChip(scope, el, attr, ctrl) {
			var openTools = function(e) {
				e.stopImmediatePropagation();
				jQuery('.contact-chip', this).addClass('user-tools-open');
				var contact_toggle_icon = jQuery('.contact-chip .toggle-icon', this);
				var openClass = contact_toggle_icon.attr('data-openclass');
				var closedClass = contact_toggle_icon.attr('data-closedclass');
				contact_toggle_icon.addClass(openClass).removeClass(closedClass);
				jQuery('.badge-toggle', this).removeClass('badge-toggle-closed').addClass('badge-toggle-open');
				return false;
			};

			var closeTools = function(e) {
				e.stopImmediatePropagation();
				jQuery('.contact-chip', this).removeClass('user-tools-open');
				var contact_toggle_icon = jQuery('.contact-chip .toggle-icon', this);
				var openClass = contact_toggle_icon.attr('data-openclass');
				var closedClass = contact_toggle_icon.attr('data-closedclass');
				contact_toggle_icon.addClass(closedClass).removeClass(openClass);
				jQuery('.badge-toggle', this).removeClass('badge-toggle-open').addClass('badge-toggle-closed');
				return false;
			};

			var setup = function() {
				jQuery(this).on('click', '.contact-chip .badge-toggle-closed', jQuery.proxy(openTools, this));
				jQuery(this).on('click', '.contact-chip .badge-toggle-open', jQuery.proxy(closeTools, this));
			};

			jQuery(jQuery.proxy(setup, this));

		}

	}

	function ContactChipController($scope, SOAuthService, StudentService, $q, $http, $sce, $compile, $location) {
		var vm = this;

		SOAuthService.requestCurrentUser().then(function(response) {
			$scope.student = response;
			$scope.profile_pic_url = false;
			var size = 40,
			id = $scope.student.id;
			StudentService.getImageBySize({size: size, id : id}).$promise.then(function(resp) {
				if (resp.type !== 'error') {
					$scope.profile_pic_url = "/api/v2/student/" + id + "/image/" + size;
				}
			});

			var account_array = [
				"personal_info", 
				"academic_info",
				"privacy",
				"learn_more_gts",
				"notification_settings",
				//"activity",
				"timezone",
				"password",
				"logout"
			];

			var tool_array = [
				"xlate-switcher",
				"facebook",
				"linkedin",
				"help",
				"acc",
				//"vid"
			];

			var section = $location.search().s;
			var subsection = $location.search().ss;
			var mode = $location.search().mode;
			var subtab = $location.search().subtab;
			var helpparam = $location.search().helpparam;
			if (!section) {
				var section = 'psx';
			}

			if (!subsection) {
				var subsection = $location.path().split("/")[1] ? $location.path().split("/")[1] : "";
			}

			$http({
				method: "GET",

				url: "/api/v2/student/" + id + "/navigation-tools?section=" + section + "&subsection=" + subsection + "&mode=" + mode + "&subtab=" + subtab + "&helpparam=" + helpparam
			}).then(function (response) {
				var data = response.data;
				var tools_array = { tools: { label: "Tools", items: {} }, account: { label: "Account", items: {} } };
				for (var index in data) {
					data[index]["target"] = "_self";
					if (index == "timezone") {
						data[index]["html"] = "<a href=\"javascript:void(0)\" title=\"Select your timezone\" onclick=\"newpopframe(this, 'select_tz', 'Select your timezone', '/utils/tzSelector.php', 400, 300, 'center')\">" + data[index]["label"] + "</a>";
					}
					if (index == "xlate-switcher") {
						var xli_selected = "";
						data[index]["html"] = "<form id=\"xlate-lang-form\"><select onchange=\"self.location.href='?_lang_switch=' + this.options[selectedIndex].value\" id=\"" + data[index]["id"] + "\" name=\"which_lang\">";
						for (var xli in data[index]["langs_supported"]) {
							if (xli == data[index]["current_lang"]) {
								xli_selected = " selected=\"selected\" ";
							} else {
								xli_selected = "";
							}
							data[index]["html"] += "<option value=\"" + xli + "\"" + xli_selected + ">" + data[index]["langs_supported"][xli] + "</option>";
						}
						data[index]["html"] += "</select><input type=\"submit\" value=\"Go\" class=\"acc_hide\"></form>";
					}
					if (index == "help") {
						data[index]["target"] = "csm-help";
					}
					if ("html" in data[index]) {
						data[index]["html"] = $sce.trustAsHtml(data[index]["html"]);
					}
					if (jQuery.inArray(index, tool_array) > -1) {
						tools_array["tools"]["items"][index] = data[index];
					} else if (jQuery.inArray(index, account_array) > -1) {
						tools_array["account"]["items"][index] = data[index];
					}
				}
				$scope.tools = tools_array;
			});
		});

	}
	ContactChipController.$inject = ['$scope', 'SOAuthService', 'StudentService', '$q', '$http', '$sce', '$compile', '$location'];

}());
