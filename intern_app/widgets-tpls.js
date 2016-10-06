angular.module('SOWidgets').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/components/song/widgets/src/confirm-modal.html',
    "<div class=\"modal modal-pretty confirm-modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "\t<div class=\"modal-dialog\">\n" +
    "\t\t<div class=\"modal-content\">\n" +
    "\t\t\t<div class=\"modal-header\">\n" +
    "\t\t\t\t<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "\t\t\t\t<h4 class=\"modal-title\">Confirm Action</h4>\n" +
    "\t\t\t</div>\n" +
    "\t\t\t<div class=\"modal-body\">\n" +
    "\t\t\t\t<form name=\"form\" novalidate>\n" +
    "\t\t\t\t\t<div class=\"form-group\">\n" +
    "\t\t\t\t\t\t<div class=\"input-group\">\n" +
    "\t\t\t\t\t\t\t<div class=\"clearfix\">\n" +
    "\t\t\t\t\t\t\t\t{{message}}\n" +
    "\t\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<hr/>\n" +
    "\t\t\t\t\t<button type=\"button\" class=\"btn btn-default btn-block\" ng-click=\"$hide(); $parent.resolveConfirmResult(false)\">No</button>\n" +
    "\t\t\t\t\t<button type=\"button\" class=\"btn btn-primary btn-block\" ng-click=\"$hide(); $parent.resolveConfirmResult(true)\">Yes</button>\n" +
    "\t\t\t\t</form>\n" +
    "\t\t\t</div>\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('/components/song/widgets/src/date-range.html',
    "<div ng-form=\"{{name}}\">\n" +
    "\t<div class=\"form-group\">\n" +
    "\t\t<label class=\"col-md-3 control-label\">After</label>  \n" +
    "\t\t<div class=\"col-md-9\">\n" +
    "\t\t\t<input type=\"text\" class=\"form-control input-md\" ng-model=\"date.from\" bs-datepicker data-date-format=\"yyyy-MM-dd\" data-date-type=\"string\" data-max-date=\"{{date.to}}\" data-use-native=\"true\">\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "\t<div class=\"form-group\">\n" +
    "\t\t<label class=\"col-md-3 control-label\">Before</label>  \n" +
    "\t\t<div class=\"col-md-9\">\n" +
    "\t\t\t<input type=\"text\" class=\"form-control input-md\" ng-model=\"date.to\" bs-datepicker data-date-format=\"yyyy-MM-dd\" data-date-type=\"string\" data-min-date=\"{{date.from}}\" data-use-native=\"true\">\n" +
    "\t\t</div>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('/components/song/widgets/src/file-upload.html',
    "<div class=\"flow-container\"\n" +
    "\t flow-init=\"{target: apiPath + '/files/chunk-file-upload', query: {static: static}, testChunks: false}\"\n" +
    "\t flow-file-success=\"onFileSuccess($flow, $file, $message)\"\n" +
    "\t flow-files-submitted=\"$flow.upload()\"\n" +
    "\t flow-files-added=\"checkMaxFilesAllowed($files, $flow)\"\n" +
    "\t flow-upload-started=\"startUpload()\"\n" +
    "\t flow-complete=\"uploadCompleted($flow)\">\n" +
    "\n" +
    "    <div class=\"files-list\">\n" +
    "        <div ng-repeat=\"file in getModelArray()\">\n" +
    "            <a href=\"{{apiPath}}/files/{{file.file_id}}\" target=\"_blank\">{{file.user_file_name}}</a> - {{file.filetype}} ({{displaySize(file.size)}})\n" +
    "            <a ng-click=\"handleDeletion(file)\">Delete</a>\n" +
    "            <div class=\"file-list-uploaded\" ng-show=\"showImagePreview && isImage(file) && isFileObject(file)\">\n" +
    "                <img ng-src=\"{{file.url}}\" class=\"{{imagePreviewClass}}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div flow-drop  class=\"flow-dragdrop\" flow-drag-enter=\"dropClass='flow-drag-over'\" flow-drag-leave=\"dropClass=''\" ng-class=\"dropClass\">\n" +
    "\t\t<div flow-transfers>\n" +
    "\t\t\t<div class=\"drop-zone-container\" ng-hide=\"maxReached() || (showUploadTable && uploadInProgress)\">\n" +
    "\t\t\t\t<div class=\"flow-drop-zone\">\n" +
    "\t\t\t\t\t<div class=\"drop-zone-content\">\n" +
    "\t\t\t\t\t\t<div class=\"flow-drag-instructions text-muted\" ng-hide=\"uploadInProgress\">\n" +
    "\t\t\t\t    \t\tDrag and Drop files here or\n" +
    "\t\t\t\t\t\t\t<span ng-hide=\"maxReached()\" clas=\"btn btn-default\" style=\"cursor:pointer\" flow-btn\n" +
    "\t\t\t\t\t\t\t\tflow-attrs=\"{id: (parentObjectId ? parentObjectId : 'new') + '_flow_btn', title: 'browse files'}\">\n" +
    "\t\t\t\t\t\t\t\t<u>browse files to upload</u>\n" +
    "\t\t\t\t\t\t\t</span>\n" +
    "\t\t\t\t\t\t\t<!--\n" +
    "\t\t\t\t    \t\t<a href=\"javascript:void(0)\" ng-hide=\"maxReached()\" flow-btn>\n" +
    "\t\t\t\t    \t\t\tbrowse files to upload file\n" +
    "\t\t\t\t    \t\t</a>\n" +
    "\t\t\t\t\t\t\t-->\n" +
    "\t\t\t\t    \t</div>\n" +
    "\t\t\t\t\t\t<div class=\"flow-drop-instructions text-muted\" ng-hide=\"uploadInProgress\">\n" +
    "\t\t\t\t\t\t\tDrop the Files!\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div class=\"uploading-files text-muted\" ng-show=\"uploadInProgress\">\n" +
    "\t\t\t\t\t\t\tUploading {{transfers.length}} files\n" +
    "\t\t\t\t\t\t\t<div class=\"progress progress-striped\" ng-class=\"{active: file.isUploading()}\">\n" +
    "\t\t                        <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"{{getPercentComplete(transfers)}}\" aria-valuemin=\"0\" aria-valuemax=\"100\" ng-style=\"{width: (getPercentComplete(transfers)) + '%'}\">\n" +
    "\t\t                            <span class=\"sr-only\">{{getPercentComplete(transfers)}}% Complete</span>\n" +
    "\t\t                        </div>\n" +
    "\t\t                    </div>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>\n" +
    "\t\t    </div>\n" +
    "\t    \t<table class=\"table table-hover table-bordered table-striped\" ng-show=\"(showUploadTable && uploadInProgress)\">\n" +
    "\t            <thead>\n" +
    "\t                <tr>\n" +
    "\t                    <!--<th>#</th>-->\n" +
    "\t                    <th>Name</th>\n" +
    "\t                    <th>Options</th>\n" +
    "\t                </tr>\n" +
    "\t            </thead>\n" +
    "\t            <tbody>\n" +
    "\t                <tr ng-repeat=\"file in transfers\">\n" +
    "\t                    <!--<td>{{$index+1}}</td>-->\n" +
    "\t                    <td>\n" +
    "\t                        {{file.name}} ({{displaySize(file.size)}})\n" +
    "\t                        <div class=\"progress progress-striped\" ng-class=\"{active: file.isUploading()}\">\n" +
    "\t                            <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"{{file.progress() * 100}}\" aria-valuemin=\"0\" aria-valuemax=\"100\" ng-style=\"{width: (file.progress() * 100) + '%'}\">\n" +
    "\t                                <span class=\"sr-only\">{{file.progress()}}% Complete</span>\n" +
    "\t                            </div>\n" +
    "\t                        </div>\n" +
    "\t                    </td>\n" +
    "\t                    <td>\n" +
    "\t                        <div class=\"btn-group\">\n" +
    "\t                            <a class=\"btn btn-small btn-warning\" ng-click=\"file.pause()\" ng-hide=\"file.isComplete() || file.paused\">Pause</a>\n" +
    "\t                            <a class=\"btn btn-small btn-warning\" ng-click=\"file.resume()\" ng-show=\"!file.isComplete() && file.paused\">Resume</a>\n" +
    "\t                            <a class=\"btn btn-small btn-danger\" ng-click=\"file.cancel()\">Cancel</a>\n" +
    "\t                            <a class=\"btn btn-small btn-info\" ng-click=\"file.retry()\" ng-show=\"file.error\">Retry</a>\n" +
    "\t                        </div>\n" +
    "\t                    </td>\n" +
    "\t                </tr>\n" +
    "\t            </tbody>\n" +
    "\t        </table>\n" +
    "\t\t</div>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('/components/song/widgets/src/multi-select-inline.html',
    "<div class=\"multi-select clearfix\">\n" +
    "\t<div class=\"multi-select-container multi-select-inline\" ng-form=\"{{name}}\">\n" +
    "\t\t<ul class=\"list-unstyled multi-select-list inline\">\n" +
    "\t\t\t<li ng-repeat=\"option in options\">  \n" +
    "\t\t\t\t<label><input type=\"checkbox\" ng-required=\"required\" ng-checked=\"checked.indexOf(option.id) != -1\" ng-click=\"toggleOption(option.id)\"> {{option.value}}</label>\n" +
    "\t\t\t</li>\n" +
    "\t\t</ul>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('/components/song/widgets/src/multi-select-stacked.html',
    "<div class=\"multi-select clearfix\">\n" +
    "\t<div class=\"multi-select-container multi-select-inline\" ng-form=\"{{name}}\">\n" +
    "\t\t<ul class=\"list-unstyled multi-select-list\">\n" +
    "\t\t\t<li ng-repeat=\"option in options\">  \n" +
    "\t\t\t\t<label><input type=\"checkbox\" ng-required=\"required\" ng-checked=\"checked.indexOf(option.id) != -1\" ng-click=\"toggleOption(option.id)\"> {{option.value}}</label>\n" +
    "\t\t\t</li>\n" +
    "\t\t</ul>\n" +
    "\t</div>\n" +
    "</div>"
  );


  $templateCache.put('/components/song/widgets/src/multi-select.html',
    "<div class=\"multi-select clearfix\">\n" +
    "\t<div class=\"btn-block input-append\" ng-if=\"showSearchFilter()\">\n" +
    "\t\t<input class=\"input-search btn-block\" type=\"search\" placeholder=\"Search Here\" ng-model=\"search.keywords\">\t\n" +
    "\t\t<button class=\"btn btn-search\" type=\"button\">\n" +
    "\t\t\t<span class=\"icon-search\">\n" +
    "\t\t\t\t<span class=\"fa fa-search fa-inverse\"></span>\n" +
    "\t\t\t</span>\n" +
    "\t\t</button>\n" +
    "\t</div>\n" +
    "\t\n" +
    "\t<div class=\"multi-select-container multi-select-searchable\" ng-form=\"{{name}}\">\n" +
    "\t\t\n" +
    "\t\t<!-- using group by -->\n" +
    "\t\t<accordion close-others=\"false\" ng-if=\"useGrouping\">\n" +
    "\t\t\t<div ng-repeat=\"(groupLabel, group) in optionGroups\">\n" +
    "\t\t\t\t<accordion-group is-open=\"group.is_open\" ng-if=\"showGroup(group)\">\n" +
    "\t\t\t\t\t<accordion-heading>\n" +
    "\t\t\t\t\t\t<span class=\"panel-header\" ng-click=\"group.is_open != group.is_open\">{{groupLabel}} <span class=\"text-muted\">{{numSelectedInGroup(group)}} of {{group.options.length}}</span><panel-toggle is-open=\"group.is_open\"></panel-toggle></span>\n" +
    "\t\t\t\t\t</accordion-heading>\n" +
    "\t\n" +
    "\t\t\t\t\t<ul class=\"list-unstyled multi-select-list well well-aside\">\n" +
    "\t\t\t\t\t\t<li ng-repeat=\"option in filtered = (group.options | filter:search.keywords | filter:showCheckedFilter(option.id)) | soPagination:1:getMidPoint(filtered.length)\">  \n" +
    "\t\t\t\t\t\t\t<label><input type=\"checkbox\" ng-required=\"required\" ng-checked=\"isChecked(option.id)\" ng-click=\"toggleOption(option.id)\">{{option.label}}</label>\n" +
    "\t\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t</ul>\n" +
    "\t\t\t\t\t<ul class=\"list-unstyled multi-select-list well well-aside\">\n" +
    "\t\t\t\t\t\t<li ng-repeat=\"option in filtered = (group.options | filter:search.keywords | filter:showCheckedFilter(option.id)) | soPagination:getMidPoint(filtered.length)+1:filtered.length\">  \n" +
    "\t\t\t\t\t\t\t<label><input type=\"checkbox\" ng-required=\"required\" ng-checked=\"isChecked(option.id)\" ng-click=\"toggleOption(option.id)\">{{option.label}}</label>\n" +
    "\t\t\t\t\t\t</li>\n" +
    "\t\t\t\t\t</ul>\n" +
    "\t\t\t\t</accordion-group>\n" +
    "\t\t\t</div>\n" +
    "\t\t</accordion>\n" +
    "\t\t\n" +
    "\t\t<!-- not using group by -->\n" +
    "\t\t<div ng-if=\"!useGrouping\">\n" +
    "\t\t\t<ul class=\"list-unstyled multi-select-list well well-aside\">\n" +
    "\t\t\t\t<li ng-repeat=\"option in filtered = (optionGroups['baseGroup'].options | filter:search.keywords | filter:showCheckedFilter(option.id)) | soPagination:1:getMidPoint(filtered.length)\">  \n" +
    "\t\t\t\t\t<label><input type=\"checkbox\" ng-required=\"required\" ng-checked=\"isChecked(option.id)\" ng-click=\"toggleOption(option.id)\">{{option.label}}</label>\n" +
    "\t\t\t\t</li>\n" +
    "\t\t\t</ul>\n" +
    "\t\t\t<ul class=\"list-unstyled multi-select-list well well-aside\">\n" +
    "\t\t\t\t<li ng-repeat=\"option in filtered = (optionGroups['baseGroup'].options | filter:search.keywords | filter:showCheckedFilter(option.id)) | soPagination:getMidPoint(filtered.length)+1:filtered.length\">  \n" +
    "\t\t\t\t\t<label><input type=\"checkbox\" ng-required=\"required\" ng-checked=\"isChecked(option.id)\" ng-click=\"toggleOption(option.id)\">{{option.label}}</label>\n" +
    "\t\t\t\t</li>\n" +
    "\t\t\t</ul>\n" +
    "\t\t</div>\n" +
    "\t\t\n" +
    "\t</div>\n" +
    "\t<div class=\"multi-select-info\">\n" +
    "\t\t<ul class=\"list-unstyled\">\n" +
    "\t\t\t<li>{{checked.length}} of {{options.length}} selected</li>\n" +
    "\t\t\t<li><a ng-click=\"selectAll()\">{{selectAllLabel}}</a></li>\n" +
    "\t\t\t<li><a ng-click=\"toggleShowChecked()\">{{showCheckedMessage}}</a></li>\n" +
    "\t\t</ul>\n" +
    "\t</div>\n" +
    "</div>"
  );

}]);
