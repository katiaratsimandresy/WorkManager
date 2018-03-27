/** @module My Work Orders - Master */

sap.ui.define([
               'sap/ui/model/json/JSONModel',
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               "com/kalydia/edfen/workmanager/model/models"
               ], function(JSONModel, BaseController, UIComponent, Formatter, models) {
	"use strict";
	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.MyWorkOrders.MyWorkOrdersMaster", {
		/**
		 * Init component. Attach routing event
		 */
		onInit: function() {
			ctl = this;
			ctl.getRouter("MyWorkOrders").attachRoutePatternMatched(ctl.onRouteMatched, ctl);
		},

		onAfterRendering: function(){

		},
		/**
		 * RoutePatternMatched event handler
		 * @param{sap.ui.base.Event} oEvent router pattern matched event object
		 */
		onRouteMatched: function(oEvent) {
			ctl.getView().setModel(
					new JSONModel(),
					"ViewModel"
			);

			var sName = oEvent.getParameter("name");
			if (sName === "MyWorkOrders"){
				// All in Process Filter
				ctl.myWorkOrdersDisplay();
			} 
			if (sName === "PrepareWorkOrder"){
				// Open Order Filter
				ctl.prepareWorkOrderDisplay();
			} 
			if (sName === "MyWorkOrders" || sName === "PrepareWorkOrder"){
				ctl.loadOrders("", oEvent);
			}

		},
		/************************************************************************/
		/*   DATA LOADERS														*/
		/************************************************************************/
		/**
		 * Load orders belonging to the current workcenter
		 * @param{string}			 sSearchString: text filter on order attributes
		 * @param{sap.ui.base.Event} oEvent: Event that triggered the loading, depends on the context
		 */
		loadOrders: function(sSearchString, oEvent){
			var oView = ctl.getView();
			ctl.sSearchString = sSearchString;

			/* filter/sorters definition */
			var aFilters = $.extend(true, [], ctl.aFilters);
			var oEnterDateSorter = new sap.ui.model.Sorter("EnterDate", true);

			if(sSearchString){
				/* Only if search field is not empty */        		
				var oOrderidFilter = new sap.ui.model.Filter(
						"Orderid", 
						sap.ui.model.FilterOperator.Contains, 
						sSearchString
				);
				var oFunctLocFilter = new sap.ui.model.Filter(
						"FunctLoc", 
						sap.ui.model.FilterOperator.Contains, 
						sSearchString
				);
				var oShortTextFilter = new sap.ui.model.Filter(
						"ShortText", 
						sap.ui.model.FilterOperator.Contains, 
						sSearchString
				);
				if(window.cordova){
					var aFiltersDetail = [];    				
					aFiltersDetail.push(oOrderidFilter);
					aFiltersDetail.push(oFunctLocFilter);
					aFiltersDetail.push(oShortTextFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				}
				else{
					aFilters.push(oOrderidFilter);
				}
			}

			/* Data binding */
			if(ctl.getView().byId("iconTabBar").getSelectedKey() != "myWorkOrders") {
				/* General case */
				ctl.getView().getModel("ViewModel").setProperty("/MyOrders", false);
				var oBindingInfo = oView.byId("orderTable").getBindingInfo("items");
				oBindingInfo.model = "plant";
				oBindingInfo.path = "/OrderHeaderSet";
				oBindingInfo.filters = new sap.ui.model.Filter({
					filters: aFilters,
					and: true
				})
				oBindingInfo.sorter = oEnterDateSorter;
				ctl.getView().byId("orderTable").bindAggregation("items", oBindingInfo);
			} else {
				/* In this case we have to search for assignents first,
				 * and then search for corresponding orders
				 */
				/* Init table */
				ctl.getView().getModel("ViewModel").setProperty("/MyWorkOrders", []);
				ctl.getView().getModel("ViewModel").setProperty("/MyOrders", true);
				var aFiltersAssignment = [];
				/* Filter with user name */
				aFiltersAssignment.push(new sap.ui.model.Filter("Employeenumber", sap.ui.model.FilterOperator.EQ, ctl.getEmployeeData().PersonNo));
				aFiltersAssignment.push(new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant()));
				/* Controller filters */
				ctl.aOrderFilter = aFilters;
				/* Sorter */
				var sorter = new sap.ui.model.Sorter("EnterDate", true);
				var oBinding = ctl.getView().byId("myOrderTable").getBinding("items");
				oBinding.sort(sorter);

				/* Read assignments set */
				oView.getModel("plant").read("/OrderOperationAssignmentSet",{
					filters: aFiltersAssignment,
					success: function(oData){
						var aBuffer = [];

						/* For each order operation that we found */
						$.each(oData.results, function(index, oValue){
							if(!aBuffer[oValue.Orderid]){
								aBuffer[oValue.Orderid] = true;
								/* Add a value to the filter */
								var aOrderFilter = $.extend(true, [], ctl.aOrderFilter);
								aOrderFilter.push(new sap.ui.model.Filter("Orderid", sap.ui.model.FilterOperator.EQ, oValue.Orderid));
								/* Read the corresponding order */
								oView.getModel("plant").read("/OrderHeaderSet",{
									filters: aOrderFilter,
									success: function(oData){
										var aMyOrders = ctl.getView().getModel("ViewModel").getProperty("/MyWorkOrders");
										$.each(oData.results, function(index, oValue){
											aMyOrders.push(oValue);
										})
										ctl.getView().getModel("ViewModel").setProperty("/MyWorkOrders", aMyOrders);
									},
									error: ctl.oDataCallbackFail
								})
							}
						})

					},
					error: ctl.oDataCallbackFail
				})
			}

			if(oEvent){
				var sEventId = oEvent.getId();
				var oEventSource = oEvent.oSource;
				ctl.getView().byId("orderTable").attachEventOnce("updateFinished", function() {
					if ("refresh" === sEventId && !$.isEmptyObject(oEventSource)){
						oEventSource.hide();
					}
				}, ctl);
				ctl.getView().byId("myOrderTable").attachEventOnce("updateFinished", function() {
					if ("refresh" === sEventId && !$.isEmptyObject(oEventSource)){
						oEventSource.hide();
					}
				}, ctl);
			}
		},
		/**
		 * Change selected tab
		 * @param{string} tab: Key of the tab selected for display
		 */
		changeFilter: function(tab){
			/* Screen elements */
			ctl.getView().getModel("ViewModel").setProperty("/MyOrders", false);
			ctl.getView().getModel("ViewModel").setProperty("/SearchOrder", "");
			ctl.getView().byId("sorter").setSelectedKey("EnterDate");

			var oBindingInfo = ctl.getView().byId("orderTable").getBindingInfo("items");
			ctl.aFilters = [];
			ctl.aFilters.push(new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant()));
			switch (tab){
			case "OpenOrders":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, " "));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				var OrderTypeENS1 = new sap.ui.model.Filter("OrderType", sap.ui.model.FilterOperator.EQ, "ENS1");
				var OrderTypeENS2 = new sap.ui.model.Filter("OrderType", sap.ui.model.FilterOperator.EQ, "ENS2");
				var aFiltersOrderType = [];
				aFiltersOrderType.push(OrderTypeENS1);
				aFiltersOrderType.push(OrderTypeENS2);
				var oFiltersOrderType = new sap.ui.model.Filter({
					filters: aFiltersOrderType,
					and: false
				});
				ctl.aFilters.push(oFiltersOrderType);
				break;
			case "allOrders":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X"));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				break;
			case "veryHigh":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X"));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				ctl.aFilters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, "1"));
				break;
			case "high":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X"));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				ctl.aFilters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, "2"));
				break;
			case "medium":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X"));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				ctl.aFilters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, "3"));
				break;
			case "low":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X"));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				ctl.aFilters.push(new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, "4"));
				break;
			case "ens1WorkOrders":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X"));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				ctl.aFilters.push(new sap.ui.model.Filter("OrderType", sap.ui.model.FilterOperator.EQ, "ENS1"));
				break;
			case "myWorkOrders":
				ctl.aFilters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X"));
				ctl.aFilters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, " "));
				ctl.loadOrders("");
				return;
				break;
			default:
				debugger
				break;
			}
			// Remove previous filters
			oBindingInfo.filters = ctl.aFilters;
			// Data binding
			ctl.getView().byId("orderTable").bindAggregation("items", oBindingInfo);
		},
		/************************************************************************/
		/*   SCREEN MANAGEMENT													*/
		/************************************************************************/
		/**
		 * Init view component to display open work orders
		 */
		prepareWorkOrderDisplay: function(){
			ctl.getView().byId("OpenOrderFilter").setVisible(true);
			ctl.getView().byId("AllOrdersFilter").setVisible(false);
			ctl.getView().byId("Priority1Filter").setVisible(false);
			ctl.getView().byId("Priority2Filter").setVisible(false);
			ctl.getView().byId("Priority3Filter").setVisible(false);
			ctl.getView().byId("Priority4Filter").setVisible(false);
			ctl.getView().byId("ENS1Filter").setVisible(false);
			ctl.getView().byId("MyWorkOrdersFilter").setVisible(false);
			ctl.getView().byId("iconTabBar").setSelectedKey("9");
			ctl.changeFilter("OpenOrders");
		},
		/**
		 * Init view components to display released work orders
		 */
		myWorkOrdersDisplay: function(){
			ctl.getView().byId("OpenOrderFilter").setVisible(false);
			ctl.getView().byId("AllOrdersFilter").setVisible(true);
			ctl.getView().byId("Priority1Filter").setVisible(true);
			ctl.getView().byId("Priority2Filter").setVisible(true);
			ctl.getView().byId("Priority3Filter").setVisible(true);
			ctl.getView().byId("Priority4Filter").setVisible(true);
			ctl.getView().byId("ENS1Filter").setVisible(true);
			ctl.getView().byId("MyWorkOrdersFilter").setVisible(true);
			ctl.getView().byId("iconTabBar").setSelectedKey("allOrders");
			ctl.changeFilter("allOrders");
		},

		/************************************************************************/
		/*   ACTION HANDLERS													*/
		/************************************************************************/
		/**
		 * Handle icon selection on the tab bar
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (click on a tab)
		 */
		handleIconTabBarSelect: function(oEvent){
			ctl.changeFilter(oEvent.getParameter("key"));
		},
		/**
		 * Handle order selection
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (click on an order)
		 */
		handleOrderPress: function(oEvent){ 
			var orderGet;
			var aSplit = oEvent.getSource().getBindingContextPath().split("(");
			if (aSplit[1]){
				aSplit = aSplit[1].split(")");
				orderGet = aSplit[0];
			}else{
				orderGet = "'" + ctl.getView().getModel('ViewModel').getProperty(oEvent.getSource().getBindingContextPath()).Orderid + "'";
			}
			/* Call of the other view */
			UIComponent.getRouterFor(ctl).navTo("MyWorkOrdersDetail", {
				Orderid: orderGet
			});
		},
		/**
		 * Handle order list refresh
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (pull to refresh)
		 */
		handleRefresh: function(oEvent){
			ctl.loadOrders(ctl.sSearchString, oEvent);
		},
		/**
		 * Handle search orders with string filter
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (live change or search)
		 */
		handleSearch: function(oEvent){
			if(oEvent.sId == "liveChange"){
				ctl.loadOrders(oEvent.getParameter("newValue"), oEvent);
			}
			else if(oEvent.sId == "search"){
				ctl.loadOrders(oEvent.getParameter("query"), oEvent);
			}
		},
		/**
		 * Handle sorting of the order list
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (sort)
		 */
		handleSorting: function(oEvent) {
			var sortPath = oEvent.getParameter("selectedItem").getKey();
			var desc = "Priority" !== sortPath;
			var sorter = new sap.ui.model.Sorter(sortPath, desc);
			var oBinding = ctl.getView().byId("orderTable").getBinding("items");
			oBinding.sort(sorter);
			var oBinding = ctl.getView().byId("myOrderTable").getBinding("items");
			oBinding.sort(sorter);
		},

		/************************************************************************/
		/*   FORMATTERS															*/
		/************************************************************************/
		/**
		 * Format order status to a ObjectListItem status
		 * @param{string} value: order status
		 * @returns{string} 
		 */
		formatState: function(value){
			return Formatter.formatState(value);
		},
		/**
		 * Format SAP flag to a boolean
		 * @param{string} value: Flag value in SAP
		 * @returns{boolean} 
		 */
		formatFlag: function(value){
			return Formatter.formatFlag(value);
		},
		/**
		 * Call of formatFlag function with a NOT operator
		 * @param{string} value: Flag value in SAP
		 * @returns{boolean} 
		 */
		formatNotFlag: function(value){
			return !Formatter.formatFlag(value);
		},
		/**
		 * Format a date object to a human readable date
		 * @param{string} value: date object to transform
		 * @returns{string} 
		 */
		formatDateTimeToDateString: function(value){
			return Formatter.DateTimeToDateString(value);
		},
		/**
		 * Format SAP identifiers removing the leading zeros
		 * @param{string} value: SAP identifier
		 * @returns{string} 
		 */
		formatRemoveLeadingZeros: function(value){
			return Formatter.removeLeadingZeros(value);
		},

		/**
		 * display icon in case of backend error
		 * @param {boolean} inErrorState: Backend error
		 * @returns {string} icon
		 */
		iconSaveStatus: function(inErrorState){
			return Formatter.iconSaveStatus(inErrorState);
		}
	});

});