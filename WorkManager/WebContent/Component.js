/** @module Component */

sap.ui.define([
               "sap/ui/core/UIComponent",
               "sap/ui/model/json/JSONModel",
               "sap/ui/Device",
               "com/kalydia/edfen/workmanager/model/models",
               "com/kalydia/edfen/workmanager/scripts/logon",
               "com/kalydia/edfen/workmanager/ErrorHandler"
               ], function(UIComponent, JSONModel, Device, models, Logon, ErrorHandler) {
	"use strict";

	return UIComponent.extend("com.kalydia.edfen.workmanager.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// initialize the error handler with the component
			//this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set Tiles Model
			this.setModel(models.createMainTilesModel(this.getMetadata()), "mainTiles");
			// set App Model
			this.setModel(models.createAppModel(this.getMetadata()), "app");

			// MessageProcessor - MessagePopover
			this.oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			sap.ui.getCore().getMessageManager().registerMessageProcessor(this.oMessageProcessor);
			this.oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: "message>/",
					template: new sap.m.MessagePopoverItem({
						description: "{message>description}",
						type: "{message>type}",
						title: "{message>message}"
					}),
					sorter : new sap.ui.model.Sorter('title', false)
				}
			});
			// create the views based on the url/hash
			this.getRouter().initialize();

		},

		createGeneralModel: function(){
			// set Odata Model
			this.setModel(models.createOdataModel());
		},
		
		createWorkCenterModel: function(workcenter) {
			if (!$.isEmptyObject(kalydia.oData.stores) && !$.isEmptyObject(kalydia.oData.stores[workcenter])
					&& !$.isEmptyObject(kalydia.oData.stores[workcenter].serviceUri)) {
				var oModel = models.createOdataWorkCenterModel(kalydia.oData.stores[workcenter].serviceUri);
				if (!$.isEmptyObject(oModel)) {
					this.setModel(oModel, "work");
					console.log("work model set with uri " + kalydia.oData.stores[workcenter].serviceUri);
				}
			} else {
				if (!window.cordova) {
					this.setModel(models.createOdataModel(), "work");
				}
			}

		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function() {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});

});
