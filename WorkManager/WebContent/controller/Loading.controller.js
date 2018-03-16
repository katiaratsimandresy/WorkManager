/** @module Loading */

sap.ui.define([
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/scripts/oData',
               'sap/m/MessageBox',
               'com/kalydia/edfen/workmanager/util/Formatter',
               'com/kalydia/edfen/workmanager/scripts/network'
               ], function(BaseController, UIComponent, ODataController, MessageBox, Formatter, NetWorkController) {
	"use strict";
	var oControl;
	return BaseController.extend("com.kalydia.edfen.workmanager.controller.Loading", {

		/**
		 * Instantiate Base controller.
		 */
		constructor: function() {
			oControl = this;
			if (!oControl.isInitialized) {
				oControl.isInitialized = false;
			}
			document.addEventListener("online", jQuery.proxy(oControl.onNetWorkChange, oControl), false);
			document.addEventListener("offline", jQuery.proxy(oControl.onNetWorkChange, oControl), false);
		},

		/**
		 * Triggered on Base controller initialisation.
		 */
		onInit: function() {
			var oEventBus = sap.ui.getCore().getEventBus();
			// register event
			oEventBus.subscribe("base", "changeWorkCenterSelection", oControl.changeWorkCenterSelection, oControl);
			oEventBus.subscribe("base", "processChangeWorkCenterSelection", oControl.processChangeWorkCenterSelection, oControl);
			oControl.setAppBusy(true);
			oControl.setAppLoaded(false);
		},

		onAfterRendering: function() {
			var oEventBus = sap.ui.getCore().getEventBus();
			if (!oControl.isInitialized) {
				oControl.initializeApp();
			}
		},
		/**
		 * Triggered when connection has changed (Offline <-> Online).
		 */
		onNetWorkChange: function() {
			// Changement de connection
			oControl.setAppConnect(NetWorkController.isOnline());
			if (NetWorkController.isOnline()) {
				oControl.launchPeriodicRefresh();
			} else {
				oControl.stopPeriodicRefresh();
			}
		},
		/**
		 * Init application.
		 */
		initializeApp: function() {
			var oModel = oControl.getOwnerComponent().getModel();
			oControl.isInitialized = true;
			oControl.setAppConnect(NetWorkController.isOnline());
			if (window.cordova) {
				try {
					// Get in memory previously selected work center 
					sap.Logon.get(function(value) {
						oControl.setWorkCenter(value);
						// Get all saved selected work centers
						sap.Logon.get(function(value) {
							var list = JSON.parse(value) || [];
							if (!$.isEmptyObject(list) && $.isArray(list)) {
								oControl.setSelectedWorkCenters(list);
							}
							oControl.checkWorkCenterSelection();
						},
						function() {},
						"selectedWorkCenters");
					},
					function() {},
					"currentWorkCenter");

				} catch (error) {
					MessageBox.show(
							error, {
								icon: MessageBox.Icon.ERROR,
								title: oControl.getI18nValue("loading.ErrorTitle"),
								actions: MessageBox.Action.OK,
								onClose: kalydia.logon.logout,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
				}
			} else {
				oControl.checkWorkCenterSelection();
			}
		},
		/**
		 * Check that a workcenter has been selected.
		 */
		checkWorkCenterSelection: function() {
			console.log("checkWorkCenter Selection");
			var aWorkcenters = oControl.getSelectedWorkCenters();
			if (!aWorkcenters) {
				aWorkcenters = [];
			}
			if (aWorkcenters.length == 0) {
				oControl.openWorkcenterSelection($.proxy(oControl.startApp, oControl));
			} else {
				oControl.startApp(aWorkcenters);
			}
		}

	});

});
