jQuery.sap.declare("com.kalydia.edfen.workmanager.scripts.logon");
jQuery.sap.require("com.kalydia.edfen.workmanager.scripts.oData");

com.kalydia.edfen.workmanager.scripts.logon = {
		AppId: "com.edfen.workmanager",
		DefaultContext: {
			"appName": "EDF EN Workmanager",
			"serverHost": "enx-r3ssw01.edf-re.com",
			"https": "false",
			"serverPort": "8000",
			"communicatorId": "REST",
			"custom": {
				"hiddenFields": ["serverPort","resourcePath","farmId","securityConfig","https"],
				"backgroundImage": "../../../images/background.jpg",
				"copyrightLogo": "../../../images/logo.png",
				"copyrightMsg": [""],
				"hideLogoCopyright": false,
				"disablePasscode": true,
				"styleSheet": "../../../css/sapui5.css"
			}
		},
		ApplicationContext: null,

		/**
		 * Initialization method to set up the Logon plugin.
		 * This will register the application with the SMP server and also authenticate the user with servers on the network.
		 * This step must be done first prior to any attempt to communicate with the SMP server.
		 */
		init: function() {
			var that = this;
			sap.Logon.init($.proxy(that.initSuccessCallback, that), $.proxy(that.initErrorCallback, that), that.AppId, that.DefaultContext);
		},

		unregister: function() {
			sap.Logon.core.deleteRegistration(this.unregisterSuccessCallback, this.errorCallback);
		},

		/**
		 * The function that is invoked if initialization is successful.
		 * The current context is passed to this function as the parameter
		 * @param context current context
		 */
		initSuccessCallback: function(context, appId) {
			var that = this;
			if ($.isEmptyObject(context.registrationContext.serverHost) || context.registrationContext.serverHost.length < 1) {
				//If not, nothing we can do now
				that.logout();
				return;
			}

			com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext = context;
			com.kalydia.edfen.workmanager.scripts.app.startApp();
			com.kalydia.edfen.workmanager.scripts.app.showScreen("content");
		},

		/**
		 * this method is called if the user cancels the registration.
		 * @param error
		 */
		initErrorCallback: function(error) {
			var that = this;
			that.errorCallback(error);
			that.logout();
		},

		/**
		 * this method delete the data vault and all data stored therein.
		 */
		logout: function() {
			var that = this;
			sap.Logon.deletePasscodeManager($.proxy(that.successdeletePasscodeManager, that), $.proxy(that.errorCallback, that));
		},

		/**
		 * This function that is invoked if the deletion is successful.
		 */
		successdeletePasscodeManager: function() {
			var that = this;
			that.ApplicationContext = null;
			com.kalydia.edfen.workmanager.scripts.app.stopApp();
			com.kalydia.edfen.workmanager.scripts.app.showScreen("content");
			switch (device.platform) {
			case "android":
				navigator.app.exitApp();
				break;
			case "windows":
				window.close();
				break;
			}
			//that.init();
		},

		/**
		 * this method manage and update the back-end passcode that Logon stores in the data vault 
		 * that is used to authenticate the client to the server.
		 */
		changePassword: function() {
			var that = this;
			sap.Logon.changePassword($.proxy(that.successchangePassword, that), $.proxy(that.errorCallback, that));
		},

		/**
		 * This function that is invoked if the change Password is successful.
		 */
		successchangePassword: function() {
			var that = this;
		},

		/**
		 * this method launch the UI screen for application users to manage and update the data vault passcode.
		 */
		managePasscode: function() {
			var that = this;
			sap.Logon.managePasscode($.proxy(that.successmanagePasscode, that), $.proxy(that.errorCallback, that));
		},

		/**
		 * This function that is invoked if the change Password is successful.
		 */
		successmanagePasscode: function() {
			var that = this;
		},	

		errorCallback: function(error) {
			console.error(error);
		},

		unregisterSuccessCallback: function(result) {
			var that = this;
			that.logout();
		},

		lock: function() {
			var that = this;
			sap.Logon.lock(that.lockSuccessCallback, that.errorCallback);
		},

		lockSuccessCallback: function(result) {
			console.log(JSON.stringify(result));
			var that = this;
		},

		unlock: function() {
			var that = this;
			sap.Logon.unlock(that.initSuccessCallback, that.errorCallback);
		}
};

if (!kalydia) {
	var kalydia = {};
}
kalydia.logon = com.kalydia.edfen.workmanager.scripts.logon;
