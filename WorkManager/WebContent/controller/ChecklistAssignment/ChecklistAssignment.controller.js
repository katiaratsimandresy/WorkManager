/** @module Cheklist Assignment */

sap.ui.define([
               'sap/m/Button',
               'sap/m/Dialog',
               'sap/m/Text',
               'sap/ui/model/json/JSONModel',
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               "com/kalydia/edfen/workmanager/model/models"
               ], function(Button, Dialog, Text, JSONModel, BaseController, UIComponent, Formatter, models) {
	"use strict";
	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.ChecklistAssignment.ChecklistAssignment", {
		Formatter: Formatter,
		
		/************************************************************************/
		/*   INITIALIZATIONS													*/
		/************************************************************************/
		/**
		 * Init component. Attach routing event
		 */
		onInit: function() {
			ctl = this;
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(ctl);
			oRouter.getRoute("ChecklistAssignment").attachPatternMatched(ctl._onObjectMatched, ctl);

			// SEARCH HELP FOR CHECKLIST
			ctl.checklistSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.checklistSelect", ctl);
			ctl.getView().addDependent(ctl.checklistSelect);
		},
		
		/**
		 * Treatments to be executed after routing to the view
		 * @param   oEvent: routing event
		 */
		_onObjectMatched: function(oEvent){
			ctl.initModels();
			ctl.initSearchOptions();
			ctl.loadOrderOperations();
		},

		/**
		 * Init models for this specific view
		 */
		initModels: function() {
			var oView = ctl.getView();
			// Model for the view, only once
			if(!oView.getModel("ViewModel")){
				oView.setModel(
						new JSONModel(),
						"ViewModel"
				);
			};
			ctl.getView().getModel("ViewModel").setProperty("/Manager", true);
			ctl.getView().getModel("ViewModel").setProperty("/ShowAll", true);
			ctl.getView().getModel("ViewModel").setProperty("/Busy", false);
			
			// Model for activity list, only once
			if(!oView.getModel("ActivityModel")){
				oView.setModel(
						new JSONModel(),
						"ActivityModel"
				);
			};
		},
		/**
		 * Init search options for order operations
		 */
		initSearchOptions: function() {
			// This object will have to be modified through the controller in order to change search parameters
			// Never touch directly the load method
			ctl.oSearchOptions = {};

			// Model
			ctl.oSearchOptions.model = "plant";
			// Set
			ctl.oSearchOptions.path  = "/OrderHeaderSet";
			// Sorter by default
			ctl.oSearchOptions.sorter = {};
			ctl.oSearchOptions.defaultSorter 	   = {};
			ctl.oSearchOptions.defaultSorter.field = "Orderid";
			ctl.oSearchOptions.defaultSorter.desc  = true;
			// Expand by default
			ctl.oSearchOptions.expand = "OrderOperation,OrderOperation/OrderOperationCheckList";
			// Filters by default 
			ctl.oSearchOptions.filters = {};
			ctl.oSearchOptions.filters.InProcess  = new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, ' ');
			ctl.oSearchOptions.filters.Complete   = new sap.ui.model.Filter("Complete",  sap.ui.model.FilterOperator.EQ, ' ');
			ctl.oSearchOptions.filters.MnWkCtr    = new sap.ui.model.Filter("MnWkCtr",   sap.ui.model.FilterOperator.EQ, ctl.getWorkCenter());
			ctl.oSearchOptions.filters.OrderType  = new sap.ui.model.Filter("OrderType", sap.ui.model.FilterOperator.EQ, 'ENS1');
			// String query
			ctl.oSearchOptions.searchString = "";
		},

		/************************************************************************/
		/*   METHODS															*/
		/************************************************************************/
		/**
		 * Assign checklist to order operation
		 * @param{JSON} oData: checklist data
		 */
		assignChecklistToOperation: function(oData){

			var oChecklistAssignmentData = {
					"ChklstId": oData.ChklstId,
					"Titre"	  : oData.Titre
			}

			ctl.submitChecklistAssignment(oChecklistAssignmentData);

		},
		/**
		 * Handle change on filter on top of page
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleFilterChange: function(oEvent) {
			// Order type
			var sOrderType = 'ENS'+oEvent.getParameter('selectedKey');
			// Update filter on order type
			ctl.oSearchOptions.filters.OrderType = new sap.ui.model.Filter("OrderType", sap.ui.model.FilterOperator.EQ, sOrderType);
			// Order status
			if (sOrderType == 'ENS1' || sOrderType == 'ENS2') {
				// Apply filter on In Process flag...
				ctl.oSearchOptions.filters.InProcess = new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, ' ');
			} else {
				// ...or do not
				ctl.oSearchOptions.filters.InProcess = null;
			}
			ctl.loadOrderOperations();
		},
		/**
		 * Handle request to refresh the list
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleRefresh: function(oEvent) {
			ctl.loadOrderOperations();
		},
		/**
		 * Handle research for checklist in search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchChecklist: function(oEvent){
			ctl.searchChecklist(oEvent.getParameter("value"));
		},
		/**
		 * Handle click on sorters
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSorting: function(oEvent) {
			ctl.oSearchOptions.sorter.field = oEvent.getParameter("selectedItem").getKey();
			ctl.oSearchOptions.sorter.desc  = false;
			ctl.loadOrderOperations();
		},
		/**
		 * Handle unassign checklist button click
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleUnassignChecklist: function(oEvent){
			var oActivity = ctl.getView().getModel("ActivityModel").getProperty(oEvent.oSource.oParent.oParent.getBindingContextPath());
			ctl.sChecklistToRemovePath = oActivity.sPath+"/OrderOperationCheckList"; 
			var dialog = new Dialog({
				title: ctl.getI18nValue("checklistAssignment.unassign.title"),
				type: 'Message',
				content: new Text({ text: ctl.getI18nValue("checklistAssignment.unassign.text") }),
				beginButton: new Button({
					text: ctl.getI18nValue("common.frag.button.confirm"),
					press: function () {
						ctl.removeChecklist(ctl.sChecklistToRemovePath);
						ctl.sChecklistToRemovePath = '';
						dialog.close();
					}
				}),
				endButton: new Button({
					text: ctl.getI18nValue("common.frag.button.cancel"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();

		},
		/**
		 * Load operations from outstanding order
		 */
		loadOrderOperations: function() {
			ctl.getView().getModel("ViewModel").setProperty("/Busy", true);
			/* Sorters */
			var aSorters = [];
			if (ctl.oSearchOptions.sorter.hasOwnProperty('field')) {
				aSorters.push(new sap.ui.model.Sorter(ctl.oSearchOptions.sorter.field, ctl.oSearchOptions.sorter.desc));
			}
			aSorters.push(new sap.ui.model.Sorter(ctl.oSearchOptions.defaultSorter.field, ctl.oSearchOptions.defaultSorter.desc));
			/* Filters */
			var aFiltersMain = [];
			var oOrderTypeFilter  = ctl.oSearchOptions.filters.OrderType;
			var oCompleteFilter   = ctl.oSearchOptions.filters.Complete;
			var oWorkCenterFilter = ctl.oSearchOptions.filters.MnWkCtr;
			var oOrderidFilter    = new sap.ui.model.Filter("Orderid",   sap.ui.model.FilterOperator.Contains, ctl.oSearchOptions.searchString);
			var oFunctLocFilter   = new sap.ui.model.Filter("FunctLoc",  sap.ui.model.FilterOperator.Contains, ctl.oSearchOptions.searchString);
			
			// Only if something searchbar is filled with something
			if (ctl.oSearchOptions.searchString != "") {
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oOrderidFilter);
					aFiltersDetail.push(oFunctLocFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFiltersMain.push(oMainFilter);
				} else {
					aFiltersMain.push(oOrderidFilter);
				}
			}
			
			aFiltersMain.push(oOrderTypeFilter);
			aFiltersMain.push(oCompleteFilter);
			aFiltersMain.push(oWorkCenterFilter);

			if (ctl.oSearchOptions.filters.InProcess) {
				var oInProcessFilter  = ctl.oSearchOptions.filters.InProcess;
				aFiltersMain.push(oInProcessFilter);
			}
				
			var oFilter = new sap.ui.model.Filter({
				filters: aFiltersMain,
				and: true
			});
			
			// Data query with all options
			ctl.getOwnerComponent().getModel(ctl.oSearchOptions.model).read(ctl.oSearchOptions.path,{
				sorters: aSorters,
				filters: aFiltersMain,
				urlParameters: {
					$expand: ctl.oSearchOptions.expand
				},
				success: ctl.loadOrderOperationsCallback,
				error: function(oError) {
					ctl.getView().getModel("ViewModel").setProperty("/Busy", false);
					ctl.getView().byId("refreshBar").hide();
					ctl.oDataCallbackFail(oError);
				}
			});
		},
		/**
		 * Callback for when order operations data has been read
		 * @param{Object} oData: operations' data
		 */
		loadOrderOperationsCallback: function(oData) {
			var oActivity   = {};
			var oActivities = {
				Activities: []
			};
			var aUriParts = [];
			for (var i in oData.results) {
				for (var j in oData.results[i].OrderOperation.results) {
					aUriParts = [];
					oActivity = {};
					oActivity.Orderid   	 	  = oData.results[i].Orderid;
					oActivity.InProcess 	 	  = oData.results[i].InProcess;
					oActivity.FunctLoc  	 	  = oData.results[i].FunctLoc;
					oActivity.ProductionStartdate = oData.results[i].ProductionStartdate;
					oActivity.OrderOperation 	  = oData.results[i].OrderOperation.results[j];
					aUriParts 					  = oData.results[i].OrderOperation.results[j].__metadata.uri.split('/');
					oActivity.sPath				  = '/'+aUriParts[aUriParts.length - 1];
					oActivities.Activities.push(oActivity);
				}
			}
			ctl.getView().getModel("ActivityModel").setData(oActivities);
			ctl.getView().getModel("ViewModel").setProperty("/Busy", false);
			ctl.getView().byId("refreshBar").hide();
		},
		/**
		 * Use search field to filter operations list
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		onSearch: function(oEvent) {
			ctl.oSearchOptions.searchString = oEvent.getParameter("newValue");
			ctl.loadOrderOperations();
		},
		/**
		 * Open search help for checklist
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		openChecklistSelect: function(oEvent){   
			// Define Path for activity
			var oActivity = ctl.getView().getModel("ActivityModel").getProperty(oEvent.oSource.oParent.oParent.getBindingContextPath());
			ctl.sActivityPathForChecklist = oActivity.sPath; 
			ctl.ChklstSiteId = oActivity.FunctLoc.substr(0, 4);
			ctl.searchChecklist("");
			ctl.checklistSelect.setMultiSelect(false);
			ctl.checklistSelect.open();
		},
		/**
		 * Unassign checklist from activity
		 * @param{string} sPath: checklist URI
		 */
		removeChecklist: function(sPath){
			ctl.getView().getModel("plant").read(sPath,{
				success: function(oData){
					if (window.cordova) {
						var sPath = oData.__metadata.uri.replace(kalydia.oData.stores[ctl.getWorkCenter()].serviceUri, "");
					} else {
						var sPath = oData.__metadata.uri.substring(oData.__metadata.uri.lastIndexOf("/"));
					}
					var lineRemoveChecklist = {
							ChklstId : "",
							ChklstSiteId : "",
							Comment : "",
							CreatedBy : "",
							CreatedByName : "",
							CreatedOn :null,
							Inactive : "",
							Titre : ""
					};
					ctl.getView().getModel("plant").update(sPath, lineRemoveChecklist, {
						merge: true,
						success: ctl.loadOrderOperations,
						error: ctl.oDataCallbackFail
					});
				},
				error: ctl.oDataCallbackFail
			});
		},
		/**
		 * Search for checklist using search bar value
		 * @param{string} sFilterValue: filter text value
		 */
		searchChecklist: function(sFilterValue){
			var oView = ctl.getView();

			/* Deletion of existing items */
			ctl.checklistSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oFilterWorkCenter = new sap.ui.model.Filter("ChklstSiteId", sap.ui.model.FilterOperator.EQ, ctl.ChklstSiteId);
			var oInactiveFilter    = new sap.ui.model.Filter("Inactive", sap.ui.model.FilterOperator.EQ, " ");
			if (sFilterValue != "") {
				/* Only if search field is not empty */
				var oTitreFilter = new sap.ui.model.Filter(
						"Titre",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oTitreFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oTitreFilter);
				}
			}
			aFilters.push(oInactiveFilter);
			aFilters.push(oFilterWorkCenter);
			if (window.cordova){
				ctl.checklistSelect.setGrowingThreshold(100);
			}

			var oBindingInfo = ctl.checklistSelect.getBindingInfo("items");
			oBindingInfo.filters = aFilters;
			oBindingInfo.sorter = new sap.ui.model.Sorter('ChklstId', true);
			ctl.checklistSelect.bindAggregation("items", oBindingInfo);

		},
		/**
		 * Send request to assign a checklist to an order activity
		 * @param{JSON} oData: checklist assignment data
		 */
		submitChecklistAssignment: function(oData){
			var sPath = ctl.sActivityPathForChecklist.replace("OrderOperation", "OrderOperationCheckList");
			ctl.getView().getModel("plant").update(sPath, oData,{
				success: function(){
					var message = ctl.getI18nValue("workOrderDetails.checklist.assignment.createOk");
					sap.m.MessageToast.show(message);
					ctl.addMessage(message, sap.ui.core.MessageType.Success);
					ctl.loadOrderOperations();
				},
				error: ctl.oDataCallbackFail,
				merge: true
			})

		},
		/**
		 * Assign checklist to activity
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validChecklist: function(oEvent){
			var aSelectedChecklist = oEvent.getParameter("selectedContexts")
			if (aSelectedChecklist.length) {
				var oView = ctl.getView();
				aSelectedChecklist.map(function(oSelectedChecklist) {
					ctl.getView().getModel().read(oSelectedChecklist.sPath,{
						success: ctl.assignChecklistToOperation
					})
				})
			}
		},
		/************************************************************************/
		/*   FORMATTERS															*/
		/************************************************************************/
		/**
		 * Convert datetime object to string
		 * @param{object} value: datetime object
		 * @returns{string}
		 */
		formatDateTimeToDateString: function(value){
			return Formatter.DateTimeToDateString(value);
		},
		/**
		 * Define visibility of activity line, depending on checklist assignment and view option
		 * @param{object} value: flag of assigned checklist title
		 * @param{string} bShowAll: display option
		 * @returns{string}
		 */
		formatItemVisible: function(value, bShowAll) {
			if (Formatter.formatFlag(value) && !bShowAll) {
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Define humane readable status for the work order
		 * @param{object} value: flag of in process status
		 * @returns{string}
		 */
		formatStatus: function(value) {
			if (Formatter.formatFlag(value)) {
				return ctl.getI18nValue("oData.OrderHeader.InProcess");
			} else {
				return ctl.getI18nValue("checklistAssignment.status.open")
			}
		}

	});

});