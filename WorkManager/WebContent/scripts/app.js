jQuery.sap.declare("com.kalydia.edfen.workmanager.scripts.app");
jQuery.sap.require("com.kalydia.edfen.workmanager.scripts.logon");

//Pour déboguer du code durant le chargement d'une page dans Ripple ou sur les appareils/émulateurs Android, lancez votre application, définissez des points d'arrêt, 
//puis exécutez "window.location.reload()" dans la console JavaScript.

com.kalydia.edfen.workmanager.scripts.app = {
		appStart: false,
		/**
		 * Wait for device API libraries to load
		 */
		initialize: function() {
			// for handling syntax error
			window.onerror = com.kalydia.edfen.workmanager.scripts.app.onError;

			// Wait for device API libraries to load
			document.addEventListener("deviceready", jQuery.proxy(this.onDeviceReady, this), false);
		},

		/**
		 * onError Message in case error in HTML5 code
		 * @param sMessage {string} Error message
		 * @param sUrl {string} Url where error is detected
		 * @param sLine {string} line where error is detected
		 */
		onError: function(sMessage, sUrl, sLine) {
			if (!$.isEmptyObject(sUrl)) {
				var idx = sUrl.lastIndexOf("/");
				var file = "???";
				if (idx > -1) {
					var file = sUrl.substring(idx + 1);
				}
			}
			console.error("An error occurred in " + file + " (at line # " + sLine + "): " + sMessage);
			console.error(sMessage);
//			sap.m.MessageBox.show(
//			"An error occurred in " + file + " (at line # " + sLine + "): " + sMessage, {
//			icon: sap.m.MessageBox.Icon.ERROR,
//			title: "Error",
//			actions: sap.m.MessageBox.Action.OK,
//			onClose: null,
//			styleClass: "",
//			initialFocus: null,
//			textDirection: sap.ui.core.TextDirection.Inherit
//			});
			return false;
		},


		/**
		 * Handle when application is ready
		 */
		onDeviceReady: function() {
			// Register Event function pause and resume
			document.addEventListener("pause", jQuery.proxy(this.onPause, this), false);
			document.addEventListener("resume", jQuery.proxy(this.onResume, this), false);
			com.kalydia.edfen.workmanager.scripts.logon.init();
		},

		/** 
		 * Handle when application is pausing
		 */
		onPause: function() {
			// Lock application
			//com.kalydia.edfen.workmanager.scripts.logon.lock();
		},

		/**
		 * Handle when application is resuming
		 */
		onResume: function() {
			// Unlock application
			//com.kalydia.edfen.workmanager.scripts.logon.unlock();
		},

		showScreen: function(screenIDToShow) {
			var screenToShow = document.getElementById(screenIDToShow);
			screenToShow.style.display = "block";
			var screens = document.getElementsByClassName('sapUiBody');
			for (var i = 0; i < screens.length; i++) {
				if (screens[i].id != screenToShow.id) {
					screens[i].style.display = "none";
				}
			}
		},

		startApp: function() {
			console.log("startApp");
			// Start SAPUI5 App
			if (!com.kalydia.edfen.workmanager.scripts.app.appStart) {
				com.kalydia.edfen.workmanager.scripts.app.appStart = true;
				sap.ui.getCore().attachInit(
						function() {
							sap.ui.require(["sap/ui/core/ComponentContainer"],
									function(ComponentContainer) {
								new ComponentContainer("startApp", {
									name: "com.kalydia.edfen.workmanager",
									height: "100%"
								}).placeAt("content");
							});
						}
				);
			}
		},

		stopApp: function(){
			if (!com.kalydia.edfen.workmanager.scripts.app.appStart){
				com.kalydia.edfen.workmanager.scripts.app.appStart = false;
				sap.ui.getCore().byId("startApp").destroy();
			}
		}
};
