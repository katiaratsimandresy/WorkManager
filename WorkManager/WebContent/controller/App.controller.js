/** @module App Controller */

sap.ui.define([
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'com/kalydia/edfen/workmanager/util/Formatter'
               ], function(BaseController, Formatter) {
	"use strict";
	var oControl;
	return BaseController.extend("com.kalydia.edfen.workmanager.controller.App", {

		onInit: function() {
			oControl = this;
			oControl.formatter = Formatter;
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			// ActionList
			this._oAppUserItem = sap.ui.xmlfragment("AppUserItem", "com.kalydia.edfen.workmanager.view.AppUserItem",
					this.getView().getController());
			this.getView().addDependent(this._oAppUserItem);
			this._oAppConnectIcon = sap.ui.xmlfragment("AppConnectIcon", "com.kalydia.edfen.workmanager.view.AppConnectIcon",
					this.getView().getController());
			this.getView().addDependent(this._oAppConnectIcon);
			this._oConfirmLogout = sap.ui.xmlfragment("ConfirmLogout", "com.kalydia.edfen.workmanager.view.ConfirmLogout",
					this.getView().getController());
			this.getView().addDependent(this._oConfirmLogout);
			oControl.getRouter().attachRoutePatternMatched(oControl.onRouteMatched, oControl);
		},
		/**
		 * RoutePatternMatched event handler
		 * @param{sap.ui.base.Event} oEvent router pattern matched event object
		 */
		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");
			if (sName === "appHome"){
				oControl.updateTilesCounters();
				oControl.updateErrorIndicator();
			}
		},
		/**
		 * Triggered when user clicks on home icon.
		 * Route to home page
		 * @param {sap.ui.base.Event} oEvent: click on icon event
		 */
		handlePressHome: function(oEvent) {
			this.getRouter().navTo("appHome");
			this.getOwnerComponent().getModel("app").setProperty('/showUserMenu', true);
		},
		/**
		 * Triggered when user clicks on error icon.
		 * Route to error page
		 * @param {sap.ui.base.Event} oEvent: click on icon event
		 */
		handleOdataErrorPress: function(oEvent) {
			this.getRouter().navTo("OdataError");
		},
		/**
		 * Triggered when user clicks on user icon.
		 * @param {sap.ui.base.Event} oEvent: click on icon event
		 */
		handleUserItemPressed: function(oEvent) {
			var oButton = oEvent.getSource();
			if (this._oAppUserItem.isOpen()) {
				this._oAppUserItem.close();
			} else {
				this._oAppUserItem.openBy(oButton);
			}
		},
		/**
		 * Triggered when user clicks on connectivity icon.
		 * @param {sap.ui.base.Event} oEvent: click on icon event
		 */
		handleConnectIconPressed: function(oEvent) {
			var oButton = oEvent.getSource();
			if (this._oAppConnectIcon.isOpen()) {
				this._oAppConnectIcon.close();
			} else {
				this._oAppConnectIcon.openBy(oButton);
			}
		},
		/**
		 * Triggered when user clicks on refresh link.
		 * @param {sap.ui.base.Event} oEvent: click on refresh link
		 */
		handleRefreshPressed: function(oEvent) {
			if (window.cordova) {
				sap.m.MessageToast.show(oControl.getI18nValue("synchronization.start"));
				oControl.setAppSync(false,true,true);
				kalydia.oData.refreshStore(
						oControl.getPlanPlant(), 
						function(storename){
							oControl.setAppSync(false,false,true);
							var lastRefresh = new Date();
							var lastRefreshString = Formatter.DateTimeToString(lastRefresh);
							if (oControl.getPlanPlant() == storename){
								oControl.getOwnerComponent().getModel("app").setProperty('/lastSynchronization', lastRefreshString);
								oControl.updateTilesCounters();
								oControl.updateErrorIndicator();
							}
						},
						function (storename, oError) {
							oControl.setAppSync(false,false,false);
							oControl.updateErrorIndicator();
							oControl.addMessage(oError.errorDomain, sap.ui.core.MessageType.Error, oError.errorMessage);
							// If there if authentication problem
							if (oError.errorCode == '3' &&
								oError.errorDomain == 'OfflineStoreErrorDomain' &&
								oError.errorMessage.substr(0, 8) == '[-10207]') {
								oControl._notifyLogout();
							}
						},
						oControl.setAppSyncProgress);
			}
		},
		/**
		 * Triggered when user clicks on manage passcode link.
		 * @param {sap.ui.base.Event} oEvent: click on manage passcode link
		 */
		handleManagePasscodePress: function(oEvent) {
			com.kalydia.edfen.workmanager.scripts.logon.managePasscode();
		},
		/**
		 * Triggered when user clicks on change password link.
		 * @param {sap.ui.base.Event} oEvent: click on change password link
		 */
		handleChangePasswordPress: function(oEvent) {
			com.kalydia.edfen.workmanager.scripts.logon.changePassword();
		},
		/**
		 * Triggered when user clicks on logout link.
		 * @param {sap.ui.base.Event} oEvent: click on logout link
		 */
		handleLogoutPress: function() {
			oControl._oConfirmLogout.open();
		},
		/**
		 * Triggered when user clicks on cancel logout link.
		 * @param {sap.ui.base.Event} oEvent: click on cancel logout link
		 */
		cancelLogout: function(oEvent){
			oControl._oConfirmLogout.close();
		},
		/**
		 * Triggered when user clicks on confirm logout link.
		 * @param {sap.ui.base.Event} oEvent: click on confirm logout link
		 */
		confirmLogout: function() {
			com.kalydia.edfen.workmanager.scripts.logon.logout();
		},
		/**
		 * Notify user that a problem occured with his credentials, then logout
		 */
		_notifyLogout: function() {
			var oDialog = new sap.m.Dialog({
				title: oControl.getI18nValue("authErrorTitle"),
				type: 'Message',
				state: 'Error',
				content: new sap.m.Text({
					text: oControl.getI18nValue("authErrorText")
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function() {
						oDialog.close();
						oControl.confirmLogout();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});
			
			oDialog.open();
		},
		/**
		 * Triggered when user clicks on planplant link.
		 * @param {sap.ui.base.Event} oEvent: click on planplant link
		 */
		handlePlanPlantPress: function(oEvent) {
			var bUserMenuDisplayed = this.getOwnerComponent().getModel("app").getProperty('/showUserMenu');
			if (bUserMenuDisplayed) {
				this.openPlanPlantSelection();
			}
		},

	});
});
