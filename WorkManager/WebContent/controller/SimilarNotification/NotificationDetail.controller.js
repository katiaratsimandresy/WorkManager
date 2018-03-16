/** @module Similar notifications - Detail */

sap.ui.define([
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               "sap/ui/core/routing/History"
               ], function(BaseController, UIComponent, Formatter, History) {
	"use strict";

	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.SimilarNotification.NotificationDetail", {

		formatter: Formatter,
		/**
         * Triggered on view init
         * Register to events.
         */
		onInit: function () {

			ctl = this;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(ctl);
			oRouter.getRoute("NotificationDetail").attachPatternMatched(ctl._onObjectMatched, ctl);

		},
		/**
         * Go to previous page
         */
		handleNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("SimilarNotification");
			}
		},
		/**
		 * RoutePatternMatched event handler
		 * @param{sap.ui.base.Event} oEvent router pattern matched event object
		 */
		_onObjectMatched: function(oEvent){
			var sName = oEvent.getParameter("name");
			if (sName === "NotificationDetail"){
				ctl.getView().bindElement({
					path: "/NotifHeaderSet("+oEvent.getParameter("arguments").NotifNo+")?$expand=NotifItem,NotifComponent,NotifAttach",
					model: "work",
					events:  {
						change: ctl._bindingChange
					}
				});
			}

		},
		/**
		 * Triggered when binding has finished
		 * @param{sap.ui.base.Event} oEvent: change event
		 */
		_bindingChange: function(oEvent){
			var oSource = oEvent.getSource(),
			oContext = $.isEmptyObject(oSource) ? null : oSource.getBoundContext(),
					oListAttach = $.isEmptyObject(oContext) ? null : oContext.getProperty('NotifAttach');
			if (window.cordova){
				var oModel = ctl.getOwnerComponent().getModel("work");
				oModel.read(oContext.sPath + '/NotifAttach',{
					success: function(oData, response) {
						var arAttachment = oData.results;
						$.each(oData.results, function(key, attachData) {
							if (window.cordova) {
								arAttachment[key].src = attachData.__metadata.media_src;
							} else {
								arAttachment[key].src = kalydia.logon.ApplicationContext.applicationEndpointURL + arAttachment[key].__metadata.edit_media.substring(arAttachment[key].__metadata.uri.lastIndexOf("/"))
							}
							if (arAttachment[key] && arAttachment[key].__metadata) {
								delete arAttachment[key].__metadata;
							}
							if (arAttachment[key] && arAttachment[key].__proto__) {
								delete arAttachment[key].__proto__;
							}
						});
						// update upload collection
						ctl.updateUploadCollection(arAttachment);
					},
					error: function(oError) {
						if (sap.Logger) {
							sap.Logger.error("Error Read ::" + oError);
						}
					}
				});
			} else {
				if(!$.isEmptyObject(oListAttach)){
					var arAttachment = [];
					$.each(oListAttach, function(key, attachUrl){
						arAttachment.push({
							src: kalydia.logon.ApplicationContext.applicationEndpointURL + '/' + attachUrl + '/$value'
						});						
						if (!$.isEmptyObject(arAttachment)){
							ctl.updateUploadCollection(arAttachment);
						}
					});

				}				
			}
		},

		/**
		 * Helper Function to update upload collection
		 * @param {array} aAttach   array of attachment
		 * **/
		updateUploadCollection: function(aAttach) {
			var oHbox = ctl.getView().byId('attachedImageBox');
			if (!$.isEmptyObject(aAttach)) {
				// remove all items
				oHbox.removeAllItems();
				$.each(aAttach, function(index, imageData) {
					oHbox.addItem(new sap.m.Image({
						press: ctl._enlargeImage,
						width: "100px",
						height: "75px",
						src: imageData.src
					}).addStyleClass("sapUiTinyMargin"));
				});
			} else {
				oHbox.removeAllItems();
			}
		},

		/************************************************************************/
		/*   FORMATTERS															*/
		/************************************************************************/
		/**
		 * Removes leading zeros from a string
		 * @param {string} value: value to be modified
		 * @returns {string} Input string without the leading zeros
		 */
		formatRemoveLeadingZeros: function(value){
			return Formatter.removeLeadingZeros(value);
		},
		/**
		 * Transforms JS date time into a human readable date
		 * @param {edm.DateTime} value: JS datetime
		 * @returns {string} Human readable date time
		 */
		formatDateTimeToString: function(value){
			return Formatter.DateTimeToString(value);
		}

	});

});