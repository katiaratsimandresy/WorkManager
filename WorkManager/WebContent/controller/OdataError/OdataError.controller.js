/** @module OData Error */

sap.ui.define([
               'sap/ui/model/json/JSONModel',
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               "com/kalydia/edfen/workmanager/model/models"
               ], function(JSONModel, BaseController, UIComponent, Formatter, models) {
	"use strict";
	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.OdataError.OdataError", {
		/**
		 * Triggered on controller initialisation.
		 * register to events
		 */
		onInit: function() {

			ctl = this;

			ctl.getRouter("OdataError").attachRoutePatternMatched(ctl.onRouteMatched, ctl);

		},

		/**
		 * RoutePatternMatched event handler
		 * @param{sap.ui.base.Event} oEvent router pattern matched event object
		 */
		onRouteMatched: function(oEvent) {
			ctl.initModels();
			ctl.getView().getModel("work").refresh();
		},
		/**
		 * Not implemented
		 */
		onAfterRendering: function(){

		},
		/**
		 * Initialize view models
		 */
		initModels: function(){
			// Init JSON & XML models for detail view
			ctl.getView().setModel(new JSONModel(), "ViewModel");
			ctl.getView().setModel(new sap.ui.model.xml.XMLModel(), "XMLModel");

			ctl.getView().getModel("ViewModel").setProperty("/DisplayButton", "false");			
		},

		/************************************************************************/
		/*   READERS															*/
		/************************************************************************/
		/**
		 * Read local storage error's details
		 * @param {string} sUrl: error url
		 */
		readErrorDetails: function(sUrl){
			ctl.getView().getModel("work").read(sUrl,{
				success: function(oData){
					ctl.mapErrorData(oData);
				}
			})
		},

		/************************************************************************/
		/*   DATA MAPPING														*/
		/************************************************************************/
		/**
		 * Maps error data into model
		 * @param {json} oData: error data
		 */
		mapErrorData: function(oData){
			var oModel = ctl.getView().getModel("ViewModel");

			// Display management
			oModel.setProperty("/DisplayButton", "true");

			// Direct mapping for some properties
			oModel.setProperty("/RequestURL", oData.RequestURL);
			oModel.setProperty("/RequestMethod", oData.RequestMethod);

			// Transform json string to json object 
			if (oData.RequestBody){
				var oRBody = JSON.parse(oData.RequestBody.replace(/[\s]/g, '-'));	
			} else {
				var oRBody = [];
			}
			var aRBody = [];
			if (oData.RequestBody){
				$.each(oRBody, function(prop, value){
					var object = {
							Key: prop,
							Value: value
					}
					aRBody.push(object);
				})
			}
			// Inject it back into the model
			oModel.setJSON('{"RequestBody":'+JSON.stringify(aRBody)+'}', true);

			ctl.getView().getModel("XMLModel").setXML(decodeURIComponent(oData.Message));		

		},

		/************************************************************************/
		/*   HANDLERS															*/
		/************************************************************************/
		/**
		 * Triggered when user clicks on error in matser view.
		 * @param {sap.ui.base.Event} oEvent: click event
		 */
		handleErrorPress: function(oEvent){
			ctl.initModels();
			ctl.sErrorPath = oEvent.getSource().getBindingContextPath();
			ctl.readErrorDetails(ctl.sErrorPath);
		},
		/**
		 * Triggered when user clicks on delete error button.
		 * @param {sap.ui.base.Event} oEvent: click event
		 */
		deleteError: function(oEvent){
			ctl.getView().getModel("work").remove(ctl.sErrorPath,{
				success: function(oData){
					// Empty detail screen
					ctl.initModels();
					ctl.updateErrorIndicator();
					// Refresh work model
					ctl.getView().getModel("work").refresh(true, true);
				},
				error: ctl.oDataCallbackFail
			})
		},

		/************************************************************************/
		/*   FORMATTERS															*/
		/************************************************************************/
		/**
		 * Retrieve error summary from XML data
		 * @param {XML} message: XML error data
		 * @returns {string}
		 */
		formatMessageSummary: function(message){
			try {
				// Transform xml string to xml object
				var xml = $.parseXML(message);
				// Access to message node
				var xMessage = xml.getElementsByTagName("message")[0];
				// get node text
				return decodeURIComponent(xMessage.childNodes[0].nodeValue);
			} catch (e) {
				return message;
			}
		},
		/**
		 * Convert SAP flag to boolean flag.
		 * @param {string} value: SAP flag
		 * @returns {boolean}
		 */
		formatFlag: function(value){
			return Formatter.formatFlag(value);
		},
		/**
		 * Enable or disable "Delete errors" button, depending on sync. status
		 * @param {string} icon: icon that is currently used in navbar to indicate what is the sync status
		 * @returns {boolean} 
		 */
		isDeleteButtonEnabled: function(icon) {
			if (icon == "upload-to-cloud") {
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Transform error severity into a sap ui5 icon.
		 * @param {string} value: error severity
		 * @returns {sap.ui.core.Icon}
		 */
		severityIcon: function(value){
			if(value == "alert" || value == "error") {
				return "sap-icon://status-error";
			} else if (value == "warning") {
				return "sap-icon://status-critical";
			} else {
				return "sap-icon://status-completed";
			}
		},
		/**
		 * Transform error severity into a color (to apply to an icon).
		 * @param {string} value: error severity
		 * @returns {string}
		 */
		severityColor: function(value){
			if(value == "error" || value == "alert"){
				return sap.ui.core.IconColor.Negative;
			} else if (value == "warning") {
				return sap.ui.core.IconColor.Critical;
			} else {
				return sap.ui.core.IconColor.Positive;
			}
		}

	});
});