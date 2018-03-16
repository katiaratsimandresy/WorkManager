/** @module Not Found */

sap.ui.define([
               'com/kalydia/edfen/workmanager/controller/BaseController'
               ], function(BaseController) {
	"use strict";

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.NotFound", {

		/**
		 * Navigates to the home when the link is pressed
		 * @public
		 */
		onLinkPressed: function() {
			this.getRouter().navTo("appHome");
		}

	});

});