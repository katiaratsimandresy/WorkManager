/** @module Similar notifications */

sap.ui.define([
               'sap/ui/model/json/JSONModel',
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               'sap/ui/model/Sorter',
               'sap/ui/core/routing/History'
               ], function(JSONModel, BaseController, UIComponent, Formatter, Sorter, History) {
	"use strict";

	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.SimilarNotification.SimilarNotification", {

		formatter: Formatter,
		/**
         * Triggered on controller initialisation.
         * register to events
         */
		onInit: function () {

			ctl = this;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(ctl);
			oRouter.getRoute("SimilarNotification").attachPatternMatched(ctl._onObjectMatched, ctl);

		},
		/**
         * Triggered when user clicks on notification. Go to notification detail.
         *  @param{sap.ui.base.Event} oEvent: click on a notification
         */
		openNotification: function(oEvent) {
			var aSplit = oEvent.getSource().getBindingContextPath().split("(");
			aSplit = aSplit[1].split(")");
			/* Call of the other view */
			UIComponent.getRouterFor(ctl).navTo("NotificationDetail", {
				NotifNo: aSplit[0]
			});
		},
		/**
         * Triggered when user clicks on a sort option.
         *  @param{sap.ui.base.Event} oEvent: click on a sort option
         */
		handleSorting : function(oEvent) {
			var sSortPath = oEvent.getParameter("selectedItem").getKey();			
			var bDesc = "Priority" !== sSortPath;
			var oSorter = new sap.ui.model.Sorter(sSortPath, bDesc);
			var oBinding = ctl.getView().byId("NotificationTable").getBinding("items");
			oBinding.sorters = [];
			oBinding.sort(oSorter);
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
				oRouter.navTo("appHome");
			}
		},
		/**
		 * Treatments to be executed after routing to the view
		 * @param {sap.ui.base.Event} oEvent: routing event
		 */
		_onObjectMatched: function(oEvent){
			var sName = oEvent.getParameter("name");
			if (sName === "SimilarNotification"){

				var oHistory = History.getInstance();
				if(oHistory._sCurrentDirection == "Backwards"){
					/* If we are coming from a "child" view, no need to reload */
					return;
				} 

				const cSeparator = "-"; 
				var oView = ctl.getView();
				var oModel = oView.getModel("plant");

				/* Split of functional location's different levels */
				var aLevels = oEvent.getParameter("arguments").FunctLoc.split(cSeparator);

				/* Building of selection key */
				if(aLevels.length > 1){
					/* We only use 2 first levels */
					var funcLocSearchKey = aLevels[0]+cSeparator+aLevels[1];
				}
				else{
					var funcLocSearchKey = aLevels[0];
				}

				/* Search for Functional location's description */
				ctl.getView().byId("detailForm").bindElement({
					path: "/FuncLocSet('"+funcLocSearchKey+"')",
					model: "plant"
				});

				/* Search for functional location's notifications */

				/* Sorters definition */
				var aSorters = [];
				var oDateSorter =  new sap.ui.model.Sorter({
					path: "CreatedDate", 
					descending: true
				});
				ctl.getView().byId("sorter").setSelectedKey("CreatedDate");

				/* Filters' definition */
				var aFilters = [];
				var oFilterWorkCenter = new sap.ui.model.Filter("WorkCntr", sap.ui.model.FilterOperator.EQ, ctl.getWorkCenter());
				var oFilterFuncLoc = new sap.ui.model.Filter("FunctLoc", sap.ui.model.FilterOperator.StartsWith, funcLocSearchKey);
				var oFilterComplete = new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, "");
				aFilters.push(oFilterWorkCenter); 
				aFilters.push(oFilterFuncLoc);
				aFilters.push(oFilterComplete);

				var oBindingInfo = oView.byId("NotificationTable").getBindingInfo("items");
				oBindingInfo.path = "/NotifHeaderSet";
				oBindingInfo.filters = aFilters;
				oBindingInfo.sorter  = oDateSorter;
				ctl.getView().byId("NotificationTable").bindAggregation("items", oBindingInfo);
			}
		},

		/************************************************************************/
		/*   FORMATTERS															*/
		/************************************************************************/
		/**
		 * remove leading zeros from SAP identifier
		 * @param{string} value: SAP identifier
		 * @returns{string}
		 */
		formatRemoveLeadingZeros: function(value){
			return Formatter.removeLeadingZeros(value);
		},
		/**
		 * Convert date object to string
		 * @param{object} value: date object
		 * @returns{string}
		 */
		formatDateTimeToDateString: function(value){
			return Formatter.DateTimeToDateString(value);
		},
		/**
		 * Format flag value so it can be interpreted by DOM attributes
		 * @param   {string}value: flag value in backend
		 * @returns {boolean}      true if flag is true
		 */
		formatState: function(value){
			return Formatter.formatState(value);
		}

	});

});