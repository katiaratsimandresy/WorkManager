/** @module Home */

sap.ui.define([
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent'
               ], function(BaseController, UIComponent) {
	"use strict";

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.Home", {
		/**
		 * Init controller: call fragments, attach routing event, init models
		 */
		onInit: function() {
			var aTileModel = this.getOwnerComponent().getModel("mainTiles").getProperty('/TileCollection');
			var oEmployeeData = this.getEmployeeData();
			var aComputedModel = [];
			// Set number for each tile from Employee Data
			if (!$.isEmptyObject(oEmployeeData)) {
				if (!$.isEmptyObject(aTileModel)) {
					$.each(aTileModel, function(index, tileModel) {
						if (oEmployeeData.isAreaManager === tileModel.AreaManager || oEmployeeData.isTechnician === tileModel.Technician) {
							aComputedModel.push(tileModel);
						}
					});
				}
				this.getOwnerComponent().getModel("mainTiles").setProperty('/TileCollection', aComputedModel);
			}

		},
		/**
		 * After view has been rendered, remove loading screen
		 */
		onAfterRendering: function() {
			$("#splash-screen").remove();
		},
		/**
		 * Handle routing when clicking on tiles
		 * @param {sap.ui.base.Event} oEvent: click event
		 */
		navTo: function(oEvent) {
			var sTarget = oEvent.getSource().getBindingContext("mainTiles").getObject().target;
			UIComponent.getRouterFor(this).navTo(sTarget);
			this.getOwnerComponent().getModel("app").setProperty('/showUserMenu', false);
		}

	});

});
