/** @module Models */

sap.ui.define([
               "sap/ui/model/json/JSONModel",
               "sap/ui/Device",
               "com/kalydia/edfen/workmanager/scripts/logon"
               ], function(JSONModel, Device, Logon) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createMainTilesModel: function(ComponentMetadata) {
			var oConfig = ComponentMetadata.getConfig();
			var oModel = new JSONModel(oConfig.mainTilesJSON);
			//oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},

		createAppModel: function(ComponentMetadata) {
			var oConfig = ComponentMetadata.getConfig();
			return new JSONModel({
				appImage: oConfig.appIconImage,
				backGroundImage: oConfig.backGroundImage,
				busy: false,
				loaded: true,
				connected: com.kalydia.edfen.workmanager.scripts.app.isOnline,
				syncIcon: "cloud", // download-from-cloud, upload-to-cloud, tag-cloud-chart
				errorIcon: false ? "message-error" : "message-success",
				connectIcon: com.kalydia.edfen.workmanager.scripts.app.isOnline ? "connected" : "disconnected",
				Logon: {
					appId: com.kalydia.edfen.workmanager.scripts.logon.AppId,
					applicationContext: com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext,
				},
				SelectedPlanPlant: null,
				SelectedPlanPlants: null,
				MaxPlanPlants: 2,
				EmployeeData: null,
				showUserMenu: true,
				lastSelectedEmployee : null,
				lastSynchronization: null
			});
		},

		createOdataModel: function() {
			var uri = com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.applicationEndpointURL;
			var user = com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.registrationContext.user;
			var password = com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.registrationContext.password;
			var headers = {
					"X-SMP-APPCID": com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.applicationConnectionId
			}

			/**
			 * Due to creation of general offline store
			 **/
			if (window.cordova) {
				uri = uri + ".general";
			}

			var oModel = new sap.ui.model.odata.ODataModel(uri, true, user, password, headers);
			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Inline);
			return oModel;
		},

		createOdataPlanPlantModel: function(uri) {
			if ($.isEmptyObject(uri)) {
				return null;
			}
			var user = com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.registrationContext.user;
			var password = com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.registrationContext.password;
			var headers = {
					"X-SMP-APPCID": com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.applicationConnectionId
			}

			var oModel = new sap.ui.model.odata.ODataModel(uri, true, user, password, headers);
			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Inline);
			oModel.setSizeLimit(1000);
			return oModel;
		}
	};

});
