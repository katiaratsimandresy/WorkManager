/** @module Time and Material entries */

sap.ui.define([
               'sap/ui/model/json/JSONModel',
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               "com/kalydia/edfen/workmanager/model/models"
               ], function(JSONModel, BaseController, UIComponent, Formatter, models) {
	"use strict";
	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.TimeAndMaterialEntry.TimeAndMaterialEntry", {
		/**
		 * Init controller: call fragments, attach routing event, init models
		 */
		onInit: function() {

			ctl = this;
			ctl.sSearchString = "";

			/* FRAGMENTS */
			ctl.createOrderOperationConfirmation = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.TimeAndMaterialEntry.fragment.createOrderOperationConfirmation", ctl);
			ctl.getView().addDependent(ctl.createOrderOperationConfirmation);
			ctl.activityTypeSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.activityTypeSelect", ctl);
			ctl.getView().addDependent(ctl.activityTypeSelect);
			ctl.employeeNumberSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.employeeNumberSelect", ctl);
			ctl.getView().addDependent(ctl.employeeNumberSelect);

			sap.ui.getCore().byId("Starttime").setMinutesStep(5);
			sap.ui.getCore().byId("Endtime").setMinutesStep(5);

			/* Local model for confirmations */
			ctl.initUserInputModelBinding();

			ctl.getRouter("TimeAndMaterialEntry").attachRoutePatternMatched(ctl.onRouteMatched, ctl);
			/* Array for component changes */
			ctl.oComponentBuffer = {};
		},

		/**
		 * RoutePatternMatched event handler
		 * @param{sap.ui.base.Event} oEvent router pattern matched event object
		 */
		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");
			if (sName === "TimeAndMaterialEntry"){
				ctl.isRestrictedToTechnician = !ctl.getEmployeeData().isAreaManager;
				ctl.loadOrders("",oEvent);
				ctl.initUserInputModelBinding();
				ctl.unloadOrder();
			}

			/* Display management */
			ctl.getView().getModel("ViewModel").setProperty("/ConfirmationMassCopy", false);
			ctl.getView().byId("sorter").setSelectedKey("EnterDate");

			/* Attributes init */
			ctl.selectedConfTab = {};			
		},
		/**
		 * Not implemented
		 */
		onAfterRendering: function(){

		},
		/**
		 * Init binding for user input
		 */
		initUserInputModelBinding: function() {
			var oView = ctl.getView();
			oView.setModel(
					new JSONModel(),
					"CreateConfirmation"
			);
			if(!oView.getModel("ViewModel")){
				oView.setModel(
						new JSONModel(),
						"ViewModel"
				);
			}
			ctl.getView().getModel("ViewModel").setProperty("/HasChecklist", false);
		},

		/************************************************************************/
		/*   DATA LOADERS														*/
		/************************************************************************/
		/**
		 * Load orders
		 * @param {string} sSearchString: search string
		 * @param {sap.ui.base.Event} oEvent: event that triggered loading
		 */
		loadOrders: function(sSearchString, oEvent){
			var sEventId = oEvent.getId();
			var oEventSource = oEvent.getSource();
			var oView = ctl.getView();

			/* Filters definition */
			var aFilters = [];
			var oFilterPlanplant = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant());
			var oFilterComplete = new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, "");
			var oFilterInProcess = new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, "X");
			aFilters.push(oFilterPlanplant);
			aFilters.push(oFilterComplete);
			aFilters.push(oFilterInProcess);

			if(sSearchString){
				ctl.sSearchString = sSearchString;
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
			var oBindingInfo = oView.byId("orderList").getBindingInfo("items");
			oBindingInfo.path = "plant>/OrderHeaderSet";
			oBindingInfo.filters = aFilters;
			oBindingInfo.sorter  = new sap.ui.model.Sorter('EnterDate', true);
			ctl.getView().byId("orderList").bindAggregation("items", oBindingInfo);
			if (window.cordova){
				ctl.getView().byId("orderList").setGrowingThreshold(5000);
			}
			ctl.getView().byId("orderList").attachEventOnce("updateFinished", function() {
				if ("refresh" === sEventId && !$.isEmptyObject(oEventSource)){
					oEventSource.hide();
				}
			}, ctl);
		},
		/**
		 * Read single order data
		 * @param {string} sPath: order URI
		 */
		loadOrder: function(sPath){
			var oView = ctl.getView();
			ctl.sPathOrder = sPath;
			/* Check that checklist is assigned */
			ctl.getView().getModel("plant").read(ctl.sPathOrder, {
				urlParameters: {
					$expand: "OrderOperation,OrderOperation/OrderOperationCheckList"
				},
				success: function(oData){
					// Init
					ctl.getView().getModel("ViewModel").setProperty("/HasChecklist", false);
					for (var i in oData.OrderOperation.results) {
						if (oData.OrderOperation.results[i].OrderOperationCheckList.ChklstId != "00000") {
							ctl.getView().getModel("ViewModel").setProperty("/HasChecklist", true);
							return;
						}
					}
				},
				error: ctl.oDataCallbackFail
			})
			
			/* Activities table */
			var oBindingInfo = oView.byId("orderActivities").getBindingInfo("items");
			if (!ctl.InitoBindingInfo){
				ctl.InitoBindingInfo = $.extend(true, {}, oBindingInfo);
			}
			oBindingInfo.path = sPath+"/OrderOperation";
			oBindingInfo.filters = [];
			oBindingInfo.sorter = new sap.ui.model.Sorter('Activity', false);
			oView.byId("orderActivities").bindAggregation("items", oBindingInfo);
		},
		/**
		 * Init screen like no order were selected
		 */
		unloadOrder: function(){
			var oView = ctl.getView();
			ctl.sPathOrder = null;
			/* Activities table */
			if (ctl.InitoBindingInfo){
				var oBindingInfo = $.extend(true, {}, ctl.InitoBindingInfo);
				oView.byId("orderActivities").bindAggregation("items", oBindingInfo);
				ctl.selectActivityTab();
			}
			oView.byId("buttonSubmitClosure").setVisible(false);
		},
		/**
		 * Load order confirmations
		 * @param {string} sPath: order confirmations URI
		 */
		loadConfirmations: function(sPath){
			var oView = ctl.getView();
			ctl.sPathConfirmationCreate = sPath+"/OrderOperationConfirmation2";
			/* Activities table */
			var oBindingInfo = oView.byId("orderActivityConfirmations").getBindingInfo("items");
			oBindingInfo.path = sPath+"/OrderOperationConfirmation2";
			oBindingInfo.filters = [];
			var fGrouper = function(oContext) {
				var sType = oContext.getProperty("UserFullname") || ctl.getI18nValue("timeAndMaterialEntry.STTRA");
				return { key: sType, value: sType }
			};
			oBindingInfo.sorter = [  
			                       new sap.ui.model.Sorter("UserFullname", false, fGrouper),
			                       new sap.ui.model.Sorter("Workdate", false),
			                       new sap.ui.model.Sorter("Starttime", false)    
			                       ]  
			oView.byId("orderActivityConfirmations").bindAggregation("items", oBindingInfo);

			ctl.selectedConfTab = {};
			ctl.selectedConfCpt = 0;
			ctl.getView().getModel("ViewModel").setProperty("/ConfirmationMassCopy", false);
		},
		/**
		 * Load order components
		 * @param {string} sPath: order components URI
		 */
		loadComponents: function(Orderid, Activity){
			var oView = ctl.getView();

			/* Activities table */
			var oBindingInfo = oView.byId("orderActivityComponents").getBindingInfo("items");
			oBindingInfo.path = ctl.sPathOrder + "/OrderComponent";
			oBindingInfo.filters = [];
			oBindingInfo.filters.push(new sap.ui.model.Filter("Activity", sap.ui.model.FilterOperator.EQ, Activity));
			oBindingInfo.filters.push(new sap.ui.model.Filter("ItemCat", sap.ui.model.FilterOperator.EQ, 'L'));
			oBindingInfo.sorter = new sap.ui.model.Sorter('Material', false);
			oView.byId("orderActivityComponents").bindAggregation("items", oBindingInfo);
			ctl.oComponentBuffer = {};
		},
		/**
		 * Load activity types
		 * @param {string} sPath: activity types URI
		 */
		loadActtype: function(sPath){
			var oView = ctl.getView();
			var oModel = oView.getModel();

			oModel.read(sPath,{
				success: function(oData){
					var oLocalModel = oView.getModel("ViewModel");
					var oInputModel = oView.getModel("CreateConfirmation");

					// Enable/Disable screen elements
					oLocalModel.setProperty("/Interne", oData.Interne);
					oLocalModel.setProperty("/Externe", oData.Externe);
					if(oData.Externe == ""){
						ctl.internalConfirmationDisplay();
					}
					else{
						ctl.externalConfirmationDisplay();
					}

					// Manage screen Model
					oInputModel.setProperty("/Acttype", oData.Acttype);
					oInputModel.setProperty("/CoArea", oData.CoArea);
					oInputModel.setProperty("/ActtypeName", oData.Name);

				},
				error: ctl.oDataCallbackFail
			})
		},

		/************************************************************************/
		/*   DATA WRITTERS														*/
		/************************************************************************/
		/**
		 * Delete a confirmation
		 * @param {sap.ui.base.Event} oEvent: click on confirmation delete button
		 */
		submitConfirmationDelete: function(oEvent){
			var oModel = ctl.getView().getModel();
			var oModelWork = ctl.getView().getModel("plant");

			// Set URL
			var sPath = oEvent.getSource().getParent().getBindingContextPath();

			oModelWork.remove( sPath, {
				success: function(oData, oResponse) {
					var message = ctl.getI18nValue("timeAndMaterialEntry.create.orderConfirmation.deleteOk");
					sap.m.MessageToast.show(message);
					ctl.addMessage(message, sap.ui.core.MessageType.Success);

					// Fragment reset
					ctl.initCreateOrderOperationConfirmationFragment();
				},
				error: ctl.oDataCallbackFail
			})

		},
		/**
		 * Submit a confirmation from dialog form
		 * @param {sap.ui.base.Event} oEvent: click on confirmation submit button
		 */
		submitConfirmation: function(oEvent){
			if(ctl._checkCreateConfirmationInput()) {
				var oModel = ctl.getView().getModel();
				var oModelWork = ctl.getView().getModel("plant");
				var oModelLocal = ctl.getView().getModel("ViewModel");
				var oModelInput = ctl.getView().getModel("CreateConfirmation");

				if(sap.ui.getCore().byId("Quantity").getEnabled() == true){
					// In case of external activity, we can create several confirmations
					var cpt = oModelLocal.getProperty("/Quantity");
				} else {
					// In case of internal, only one
					var cpt = 1;
				}

				// Reference to order/Activity
				oModelInput.setProperty("/Orderid", ctl.Orderid);
				oModelInput.setProperty("/Activity", ctl.Activity);
				//if (sap.ui.getCore().byId("OtCompType").getItemByKey(oModelInput.getProperty("/OtCompType"))){
					//oModelInput.setProperty("/OtCompTypeText", sap.ui.getCore().byId("OtCompType").getItemByKey(oModelInput.getProperty("/OtCompType")).getText());
				//} else {
					//oModelInput.setProperty("/OtCompTypeText", "");
				//}
				// Time conversion
				oModelInput.setProperty("/Workdate", Formatter.JSDateTimeToEDMDate(oModelLocal.getProperty("/Wordate")));
				oModelInput.setProperty("/Starttime", Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Starttime")));
				if(oModelLocal.getProperty("/Endtime")){
					oModelInput.setProperty("/Endtime", Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Endtime")));
					//oModelInput.setProperty("/Status", "20");
				} else {
					oModelInput.setProperty("/Endtime", Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Starttime")));
					//oModelInput.setProperty("/Status", "10");
				}
				var oConfirmationData = $.extend(true, {}, oModelInput.getData());
				delete oConfirmationData.OtCompType;
				delete oConfirmationData.CoArea;
				delete oConfirmationData.ActtypeName;

				var fFunction = oModelLocal.getProperty("/ValidateConfirmationFunction");
				fFunction(oConfirmationData, cpt);
			}
		},
		/**
		 * Save a new confirmation in the backend
		 * @param{JSON} oConfirmationData: confirmation data
		 * @param{number} cpt: number of iterations
		 */
		createConfirmation: function(oConfirmationData, cpt){
			ctl._checkConfirmationNoCollision(oConfirmationData, cpt,
					function(oConfirmationData, cpt){
				var oModelWork = ctl.getView().getModel("plant");
				oModelWork.create( ctl.sPathConfirmationCreate, oConfirmationData, {
					success: function(oData, oResponse) {
						if (cpt == 1){ // Last confirmation
							var message = ctl.getI18nValue("timeAndMaterialEntry.create.orderConfirmation.createOk");
							sap.m.MessageToast.show(message);
							ctl.addMessage(message, sap.ui.core.MessageType.Success);

							// Fragment reset
							ctl.initCreateOrderOperationConfirmationFragment();
						}else{
							ctl.createConfirmation(oConfirmationData, cpt - 1);
						}
					},
					error: ctl.oDataCallbackFail
				});
			});
		},
		/**
		 * Update confirmation
		 * @param{JSON} oConfirmationData: confirmation data
		 */
		updateConfirmation: function(oConfirmationData){
			ctl._checkConfirmationNoCollision(oConfirmationData, 1,
					function(oConfirmationData, cpt){
				var oModelWork = ctl.getView().getModel("plant");
				oModelWork.update( ctl.sPathConfirmationUpdate, oConfirmationData, {
					merge: true,
					success: function(oData, oResponse) {
						var message = ctl.getI18nValue("timeAndMaterialEntry.create.orderConfirmation.updateOk");
						sap.m.MessageToast.show(message);
						ctl.addMessage(message, sap.ui.core.MessageType.Success);

						// Fragment reset
						ctl.initCreateOrderOperationConfirmationFragment();
					},
					error: ctl.oDataCallbackFail
				})
			})
		},
		/**
		 * Copy selected confirmations
		 * @param {sap.ui.base.Event} oEvent: click on confirmation mass copy button
		 */
		confirmationMassCopy: function(oEvent){
			// Read employee data
			ctl.getView().getModel().read(oEvent.oSource.getBindingContextPath(),{
				success: function(oDataEmployee){
					// Loop over selected table line
					ctl.employeeNumberSelect.setBusy(true);
					ctl.submitMassCopy(oDataEmployee);
				},
				error: ctl.oDataCallbackFail
			})
		},
		/**
		 * Save confirmations after mass copy
		 * @param {json} oDataEmployee: employee data for new confirmations
		 */
		submitMassCopy: function(oDataEmployee){
			$.each(ctl.selectedConfTab, function(sProperty, oValue){
				// If the line is still selected
				if(oValue.selected){
					// Read original confirmation data
					ctl.getView().getModel("plant").read(sProperty,{
						success: function(oDataConfirmation){
							var oDataConfirmationCreate = {};
							// Replace employee with the new one and create the new confirmation
							//oDataConfirmationCreate.CoArea = oDataConfirmation.CoArea;
							oDataConfirmationCreate.Acttype = oDataConfirmation.Acttype;
							//oDataConfirmationCreate.ActtypeName = oDataConfirmation.ActtypeName;
							//oDataConfirmationCreate.FinConf = oDataConfirmation.FinConf;
							//oDataConfirmationCreate.OtCompType = oDataConfirmation.OtCompType;
							//oDataConfirmationCreate.OtCompTypeText = oDataConfirmation.OtCompTypeText;
							oDataConfirmationCreate.Text = oDataConfirmation.Text;

							oDataConfirmationCreate.Employeenumber = oDataEmployee.Employeenumber;
							oDataConfirmationCreate.UserFullname   = oDataEmployee.UserFullname;
							// Replace employee with the new one and create the new confirmation
							//oDataConfirmationCreate.Status = "20";
							// Modify date/time format
							oDataConfirmationCreate.Workdate  = Formatter.JSDateTimeToEDMDate(oDataConfirmation.Workdate);
							oDataConfirmationCreate.Starttime = Formatter.JSDateTimeToEDMTime(Formatter.EDMTimeToJSObject(oDataConfirmation.Starttime));
							oDataConfirmationCreate.Endtime   = Formatter.JSDateTimeToEDMTime(Formatter.EDMTimeToJSObject(oDataConfirmation.Endtime));
							// Call creation method
							ctl.createConfirmation(oDataConfirmationCreate, 1);
							delete ctl.selectedConfTab[sProperty];
							if (!$.isEmptyObject(ctl.selectedConfTab)){
								ctl.submitMassCopy(oDataEmployee);
							}else{
								ctl.submitMassCopyFinish();
							}
						},
						error: ctl.oDataCallbackFail
					})
					return false;	
				}else{
					delete ctl.selectedConfTab[sProperty];
				}
			})

			if ($.isEmptyObject(ctl.selectedConfTab)){
				ctl.submitMassCopyFinish();
			}
		},
		/**
		 * Init controller elements after mass copy
		 */
		submitMassCopyFinish: function(){
			ctl.employeeNumberSelect.setBusy(false);
			ctl.employeeNumberSelect.close();
			ctl.selectedConfTab = {};
			ctl.selectedConfCpt = 0;
			ctl.getView().getModel("ViewModel").setProperty("/ConfirmationMassCopy", false);
		},
		/**
		 * Define an end date for a draft confirmation
		 * @param {sap.ui.base.Event} oEvent: click on close confirmation button
		 */
		submitClosure: function(oEvent){
			var oModel = ctl.getView().getModel();
			var oModelWork = ctl.getView().getModel("plant");
			var oModelSubmit = {};
			var dialog = new sap.m.Dialog({
				title: ctl.getResourceBundle().getText('timeAndMaterialEntry.create.orderClosure.Confirm'),
				type: 'Message',
				content: [
				          new sap.m.Label({
				        	  required:true, 
				        	  labelFor:"submitTecoRefdate", 
				        	  text: ctl.getResourceBundle().getText('oData.OrderHeader.TecoRefdate')
				          }),
				          new sap.m.DateTimePicker('submitTecoRefdate', {
				        	  // type: 	"DateTime",
				        	  width:	"50%",
				        	  valueFormat: "yyyy-MM-ddTHH:mm:ss",
				        	  displayFormat: "short",
				        	  change: function(oEvent) {
				        		  var sText = oEvent.getParameter('value');
				        		  var parent = oEvent.getSource().getParent();

				        		  parent.getBeginButton().setEnabled(sText.length > 0);
				        	  },
				          }),
				          new sap.m.RadioButtonGroup('radReportType', {
				        	  columns: 2,
				        	  visible: ctl.getView().getModel("ViewModel").getProperty("/HasChecklist"),
				        	  buttons: [
				        	            new sap.m.RadioButton({
				        	            	text: ctl.getResourceBundle().getText('workOrder.report.option.preventive')
				        	            }),
				        	            new sap.m.RadioButton({
				        	            	text: ctl.getResourceBundle().getText('workOrder.report.option.diligence')
				        	            }).addStyleClass("sapUiNoMarginEnd")
				        	            ]
				          }),
				          new sap.m.FlexBox({
				        	  alignItems: sap.m.FlexAlignItems.Center,
				        	  justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				        	  visible: ctl.getView().getModel("ViewModel").getProperty("/HasChecklist"),
				        	  items:[
				        	         new sap.m.CheckBox('checkComments', {
				        	        	 text: ctl.getResourceBundle().getText('workOrder.report.option.comments')
				        	         }),
				        	         new sap.m.CheckBox('checkPictures', {
				        	        	 text: ctl.getResourceBundle().getText('workOrder.report.option.pictures')
				        	         })
				        	         ]
				          }),
				          new sap.m.FlexBox({
				        	  alignItems: sap.m.FlexAlignItems.Center,
				        	  justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				        	  visible: ctl.getView().getModel("ViewModel").getProperty("/HasChecklist"),
				        	  items:[
				        	         new sap.m.Label({
				        	        	 required:false, 
				        	        	 labelFor:"selectLanguage", 
				        	        	 text: ctl.getResourceBundle().getText('workOrder.report.option.language')
				        	         }).addStyleClass("sapUiSmallMarginBegin"),
				        	         new sap.m.Select('selectLanguage', {
				        	        	 selectedKey: 'E',
				        	        	 items: [
				        	        	         new sap.ui.core.Item({
				        	        	        	 text: ctl.getResourceBundle().getText('workOrder.report.option.language.en'),
				        	        	        	 key: 'E'
				        	        	         }),
				        	        	         new sap.ui.core.Item({
				        	        	        	 text: ctl.getResourceBundle().getText('workOrder.report.option.language.fr'),
				        	        	        	 key: 'F'
				        	        	         })
				        	        	         ]
				        	         })
				        	         ]
				          })
				          ],

				          beginButton: new sap.m.Button({
				        	  text: ctl.getResourceBundle().getText('timeAndMaterialEntry.button.closure'),
				        	  enabled: false,
				        	  press: function () {
				        		  oModelSubmit.TecoRefdate = sap.ui.getCore().byId('submitTecoRefdate').getValue();
				        		  oModelSubmit.Complete = 'X';
				        		  oModelSubmit.Spras = sap.ui.getCore().byId('selectLanguage').getSelectedKey();
				        		  if (sap.ui.getCore().byId('radReportType').getSelectedIndex() == 0) {
				        		  	oModelSubmit.Preventive = 'X';
				        		  } else {
				        		  	oModelSubmit.Preventive = ' ';
				        		  }
				        		  if (sap.ui.getCore().byId('checkComments').getSelected()) {
									oModelSubmit.Comments = 'X';
				        		  } else {
				        		  	oModelSubmit.Comments = ' ';
				        		  }
				        		  if (sap.ui.getCore().byId('checkPictures').getSelected()) {
									oModelSubmit.Pictures = 'X';
				        		  } else {
				        		  	oModelSubmit.Pictures = ' ';
				        		  }
				        		  oModelWork.update(ctl.sPathOrder, oModelSubmit,{
				        			  merge: true,
				        			  success: function(oData){
				        				  var message = ctl.getI18nValue("timeAndMaterialEntry.create.orderClosure.Ok");
				        				  sap.m.MessageToast.show(message);
				        				  ctl.addMessage(message, sap.ui.core.MessageType.Success);
				        				  oModelWork.refresh();
				        				  ctl.initUserInputModelBinding();
				        				  ctl.unloadOrder();
				        			  },
				        			  error: ctl.oDataCallbackFail
				        		  });
				        		  dialog.close();
				        	  }
				          }),
				          endButton: new sap.m.Button({
				        	  text: ctl.getResourceBundle().getText('timeAndMaterialEntry.button.cancel'),
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
		 * Add components to confirmation
		 */
		submitComponentConfirmation: function(){

			var oModel = ctl.getView().getModel("plant");
			$.each(ctl.oComponentBuffer, function(sPath, oValue){
				var oComponentConfirmation = $.extend(true, {}, oValue.oData);
				var oComponentConfirmationZero = $.extend(true, {}, oValue.oData);
				oComponentConfirmationZero.WithdQuanDelta = "0";
				delete oComponentConfirmationZero.WithdQuan;
				delete oComponentConfirmationZero.Withdrawn;
				if (oComponentConfirmation.WithdQuanDelta != "0"){
					oModel.update(sPath, oComponentConfirmation,{
						merge: true,
						success: function(oData){
							var message = ctl.getI18nValue("timeAndMaterialEntry.create.orderConfirmation.createOk");
							sap.m.MessageToast.show(message);
							ctl.addMessage(message, sap.ui.core.MessageType.Success);
							delete ctl.oComponentBuffer[sPath];
							oModel.update(sPath, oComponentConfirmationZero,{
								merge: true,
								success: function(oData){

								},
								error: ctl.oDataCallbackFail
							})
						},
						error: ctl.oDataCallbackFail
					})
				}

			});


		},

		/************************************************************************/
		/*   ACTION HANDLERS													*/
		/************************************************************************/
		/**
		 * Triggered when user clicks on an order
		 * @param {sap.ui.base.Event} oEvent: click on order
		 */
		handleOrderPress: function(oEvent){
			ctl.selectActivityTab();
			ctl.loadOrder(oEvent.getSource().getBindingContextPath());
		},
		/**
		 * Triggered when user pulls list downward
		 * @param {sap.ui.base.Event} oEvent: refresh call
		 */
		handleRefresh: function(oEvent){
			ctl.loadOrders(ctl.sSearchString, oEvent);
		},
		/**
		 * Triggered when user types into search field
		 * @param {sap.ui.base.Event} oEvent: typing into search bar
		 */
		handleSearch: function(oEvent){
			if(oEvent.sId == "liveChange"){
				ctl.loadOrders(oEvent.getParameter("newValue"),oEvent);
			}
			else if(oEvent.sId == "search"){
				ctl.loadOrders(oEvent.getParameter("query"),oEvent);
			}
		},
		/**
		 * Triggered when user changes sorting
		 * @param {sap.ui.base.Event} oEvent: click on new sorting option
		 */
		handleSorting: function(oEvent) {
			var sortPath = oEvent.getParameter("selectedItem").getKey();
			var desc = "Priority" !== sortPath;
			var sorter = new sap.ui.model.Sorter(sortPath, desc);
			var binding = ctl.getView().byId("orderList").getBinding("items");
			binding.sort(sorter);
		},
		/**
		 * TimeDate Check
		 */
		handleTimeDateChange: function (oEvent) {
			var oDTP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");

			if (bValid) {
				oDTP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDTP.setDateValue();
				oDTP.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		/**
		 * Triggered when user clicks on an activity
		 * @param {sap.ui.base.Event} oEvent: click on activity
		 */
		handleActivityPress: function(oEvent){
			ctl.selectActivityConfirmationTab();
			ctl.loadConfirmations(oEvent.getSource().getBindingContextPath());

			ctl.sActivityPath = oEvent.getSource().getBindingContextPath();

			ctl.getView().getModel("plant").read(oEvent.getSource().getBindingContextPath(),{
				success: function(oData){
					ctl.Orderid = oData.Orderid;
					ctl.Activity = oData.Activity;
					ctl.loadComponents(ctl.Orderid, ctl.Activity);
				}
			})
		},
		/**
		 * Triggered when user clicks on a tab icon
		 * @param {sap.ui.base.Event} oEvent: click on icon
		 */
		handleIconTabBarSelect: function(oEvent){
			var oView = ctl.getView();
			if (oEvent.getParameter("key") == "orderActivityComponent"){
				oView.byId("buttonSubmitComponentConfirmation").setVisible(true);
				oView.byId("buttonSubmitClosure").setVisible(false);
			} else {
				oView.byId("buttonSubmitComponentConfirmation").setVisible(false);
				if (!ctl.isRestrictedToTechnician){
					oView.byId("buttonSubmitClosure").setVisible(true);
				}
			}
		},
		/**
		 * Triggered when user clicks on create confirmation button
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleCreateConfirmation: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragment();
		},
		/**
		 * Triggered when user clicks on edit confirmation button
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleEditConfirmations: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragmentForEdit(oEvent.getSource().getParent().getBindingContextPath());
		},
		/**
		 * Triggered when user clicks on copy confirmation button
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleCopyConfirmations: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragmentForCopy(oEvent.getSource().getParent().getParent().getBindingContextPath());
		},
		/**
		 * Triggered when user clicks on close confirmation button
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleEndConfirmations: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragmentForEnding(oEvent.getSource().getParent().getParent().getBindingContextPath());
		},
		/**
		 * Triggered when user types into activity type search help dialog
		 * @param {sap.ui.base.Event} oEvent: typing in search field
		 */
		handleSearchActtype: function(oEvent){
			ctl.searchActtype(oEvent.getParameter("value"));
		},
		/**
		 * Triggered when user types into employee search help dialog
		 * @param {sap.ui.base.Event} oEvent: typing in search field
		 */
		handleSearchEmployeenumber: function(oEvent){
			var sPlanPlant = ctl.getView().getModel("ViewModel").getProperty("/Planplant");
			ctl.searchEmployeenumber(sPlanPlant, oEvent.getSource().getValue());
		},
		/**
		 * Triggered when user changes workcenter into employee search help dialog
		 * @param {sap.ui.base.Event} oEvent: typing in search field
		 */
		handlePlanplantSelectChange: function(oEvent){
			ctl.getView().getModel("ViewModel").setProperty("/SearchEmployeeNumber", "")
			ctl.searchEmployeenumber(oEvent.getSource().getProperty("selectedKey"), "");
		},
		/**
		 * Triggered when user click on final confirmation checkbox
		 * @param {sap.ui.base.Event} oEvent: click on the cehck box
		 */
		handleFinConfSelect: function(oEvent) {
			if (oEvent.getParameter("selected")) {
				ctl.getView().getModel("CreateConfirmation").setProperty("/FinConf", "X");
			} else {
				ctl.getView().getModel("CreateConfirmation").setProperty("/FinConf", "");
			}
		},
		/**
		 * Triggered when user clicks on "-" for quantity
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleDecrementWithdQuanDelta: function(oEvent){
			var oView = ctl.getView();
			var oModel = oView.getModel("plant");
			var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var iValue = oModel.getProperty(sPath + "/WithdQuanDelta");
			if (!isNaN(parseInt(iValue)) && (iValue > 0)){
				iValue--;
			} else {
				iValue = 0;
			}
			if(oModel.sChangeKey) {                   
				oModel.sChangeKey = undefined;                   
			}
			oModel.setProperty(sPath + "/WithdQuanDelta", iValue.toString());

			ctl.bufferWithdQuanDeltaChange(sPath, iValue.toString());
		},
		/**
		 * Triggered when user manually changes consumed quantity
		 * @param {sap.ui.base.Event} oEvent: change input value
		 */
		handleChangeWithdQuanDelta: function(oEvent){
			var oModel = ctl.getView().getModel("plant");
			var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var iValue = oModel.getProperty(sPath + "/WithdQuanDelta");
			if (isNaN(parseInt(iValue)) || (iValue < 0)){
				iValue = 0;
			} else {
				iValue = oEvent.getSource().getProperty("value");
			}

			if(oModel.sChangeKey) {                   
				oModel.sChangeKey = undefined;                   
			}
			oModel.setProperty(sPath + "/WithdQuanDelta", iValue.toString());

			ctl.bufferWithdQuanDeltaChange(sPath, iValue.toString());
		},
		/**
		 * Triggered when user clicks on "+" for quantity
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleIncrementWithdQuanDelta: function(oEvent){
			var oView = ctl.getView();
			var oModel = oView.getModel("plant");
			var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var iValue = oModel.getProperty(sPath + "/WithdQuanDelta");
			if (!isNaN(parseInt(iValue))) {
				iValue++;
			} else {
				iValue = 1;
			}

			if(oModel.sChangeKey) {              
				oModel.sChangeKey = undefined;                   
			}			
			oModel.setProperty(sPath + "/WithdQuanDelta", iValue.toString());

			ctl.bufferWithdQuanDeltaChange(sPath, iValue.toString());
		},
		/**
		 * Triggered when user clicks on withdrawn checkbox
		 * @param {sap.ui.base.Event} oEvent: click on checkbox
		 */
		handleWithdrawnSelect: function(oEvent){
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			ctl.bufferWithdrawnChange(sPath, oEvent.getSource().getProperty("selected"));
		},
		/**
		 * Triggered when user clicks on submit button
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleSubmitComponentConfirmation: function(oEvent){
			ctl.submitComponentConfirmation();
		},
		/**
		 * Display dialog with comment when user clicks on a confirmation
		 * @param {sap.ui.base.Event} oEvent: click on confirmation line
		 */
		handleConfirmationPress: function(oEvent){
			var dialog = new sap.m.Dialog({
				title: ctl.getI18nValue("oData.OrderOperationConfirmation.Text"),
				content: new sap.m.Text({text:oEvent.getSource().getBindingContext("plant").getProperty("Text")}),
				beginButton: new sap.m.Button({
					text: ctl.getI18nValue("common.frag.button.close"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			//to get access to the global model
			this.getView().addDependent(dialog);
			dialog.open();
		},
		/**
		 * Triggered when user clicks on checkbox on a confirmation line
		 * @param {sap.ui.base.Event} oEvent: click on checkbox
		 */
		handleConfirmationSelect: function(oEvent){
			if (oEvent.getParameter("selected")) {
				ctl.selectedConfCpt++;
				ctl.selectedConfTab[oEvent.getSource().getParent().getBindingContextPath()] = {selected: true};
			} else {
				ctl.selectedConfCpt--;
				ctl.selectedConfTab[oEvent.getSource().getParent().getBindingContextPath()] = {selected: false};
			}

			if(ctl.selectedConfCpt <= 0){
				ctl.getView().getModel("ViewModel").setProperty("/ConfirmationMassCopy", false);
			} else {
				ctl.getView().getModel("ViewModel").setProperty("/ConfirmationMassCopy", true);
			}
		},
		/**
		 * Triggered when user clicks on "Copy confirmations" button
		 * @param {sap.ui.base.Event} oEvent: click on button
		 */
		handleConfirmationMassCopy: function(oEvent){
			ctl.searchEmployeenumber(ctl.getPlanPlant(), "");

			/* Initialize select for WorkCenters with current workcenter */
			ctl.getView().getModel("ViewModel").setProperty("/Planplant", ctl.getPlanPlant());

			ctl.getView().getModel("ViewModel").setProperty("/EmployeeNumberCallback", ctl.confirmationMassCopy);

			ctl.employeeNumberSelect.open();			
		},

		/************************************************************************/
		/*   DIALOG MANAGEMENT													*/
		/************************************************************************/
		/**
		 * Open activity type search help dialog
		 */
		openActivityTypeSelect: function(){    		    		
			ctl.searchActtype("");
			ctl.activityTypeSelect.setMultiSelect(false);
			ctl.activityTypeSelect.open();
		},
		/**
		 * Open employee number search help dialog
		 */
		openEmployeenumberSelect: function(){
			ctl.searchEmployeenumber(ctl.getPlanPlant(), "");
			ctl.getView().getModel("ViewModel").setProperty("/Planplant", ctl.getPlanPlant());
			ctl.getView().getModel("ViewModel").setProperty("/EmployeeNumberCallback", ctl.handleEmployeePress);
			ctl.employeeNumberSelect.open();
		},
		/**
		 * Close create confirmation dialog
		 * @param {sap.ui.base.Event} oEvent: click on close button
		 */
		closeCreateConfirmationDialog: function(oEvent){
			ctl.initUserInputModelBinding();
			ctl.closeDialog(oEvent);
		},
		/**
		 * Close any dialog
		 * @param {sap.ui.base.Event} oEvent: click on close button
		 */
		closeDialog: function(oEvent) {
			oEvent.getSource().getParent().close();
		},

		/************************************************************************/
		/*   DISPLAYED ELEMENTS MANAGEMENT										*/
		/************************************************************************/
		/**
		 * Manage screen when activity tab is selected
		 */
		selectActivityTab: function(){
			var oView = ctl.getView();

			ctl.oView.byId("iconTabBar").setSelectedKey("orderActivity");

			var aFilters = ctl.oView.byId("iconTabBar").getItems();
			aFilters[1].setEnabled(false);
			aFilters[2].setEnabled(false);

			oView.byId("buttonSubmitComponentConfirmation").setVisible(false);
			if (!ctl.isRestrictedToTechnician){
				oView.byId("buttonSubmitClosure").setVisible(true);
			}
		},
		/**
		 * Manage screen when confirmation tab is selected
		 */
		selectActivityConfirmationTab: function(){
			var oView = ctl.getView();

			ctl.oView.byId("iconTabBar").setSelectedKey("orderActivityConfirmation");

			var aFilters = ctl.oView.byId("iconTabBar").getItems();
			aFilters[1].setEnabled(true);
			aFilters[2].setEnabled(true);

			if (!ctl.isRestrictedToTechnician){
				oView.byId("buttonSubmitClosure").setVisible(true);
			}
			oView.byId("buttonSubmitComponentConfirmation").setVisible(false);
		},
		/**
		 * Init create order confirmation dialog and model
		 */
		initCreateOrderOperationConfirmationFragment: function(){
			ctl.initUserInputModelBinding();
			ctl.sPathConfirmationUpdate = null;
			var oLocalModel = ctl.getView().getModel("ViewModel");

			sap.ui.getCore().byId("Employeenumber").setEnabled(false);
			sap.ui.getCore().byId("Quantity").setEnabled(false);
			sap.ui.getCore().byId("OtCompType").setEnabled(false);
			sap.ui.getCore().byId("FinConf").setSelected(false);
			sap.ui.getCore().byId("Workdate").setEnabled(true);
			sap.ui.getCore().byId("Acttype").setEnabled(true);

			ctl.OrderOperationConfirmationFragmentForEdit = false;
			ctl.OrderOperationConfirmationFragmentForCopy = false;	
			// Date
			oLocalModel.setProperty("/Workdate", Formatter.getDateAtMidnight());

			// Times
			oLocalModel.setProperty("/Starttime", new Date());
			oLocalModel.setProperty("/Endtime",   null);

			// By default
			ctl.getView().getModel("ViewModel").setProperty("/ValidateConfirmationFunction", ctl.createConfirmation);
		},
		/**
		 * Init edit order confirmation dialog and model
		 * @param {string} sPath: confirmation URI
		 */
		initCreateOrderOperationConfirmationFragmentForEdit: function(sPath){
			ctl.initCreateOrderOperationConfirmationFragment();
			ctl.sPathConfirmationUpdate = sPath;
			ctl.getView().getModel("ViewModel").setProperty("/ValidateConfirmationFunction", ctl.updateConfirmation);

			// Getting models
			var oView = ctl.getView();
			var oWorkModel = oView.getModel("plant");
			var oInputModel = oView.getModel("CreateConfirmation");
			var oLocalModel = oView.getModel("ViewModel");

			// can't modify Employee Number and Workdate
			sap.ui.getCore().byId("Employeenumber").setEnabled(false);
			sap.ui.getCore().byId("Workdate").setEnabled(false);
			sap.ui.getCore().byId("Acttype").setEnabled(false);

			ctl.OrderOperationConfirmationFragmentForEdit = true;			
			// Loading of confirmation's values
			oWorkModel.read(sPath,{
				success: function(oData){

					// Employee number
					oInputModel.setProperty("/Employeenumber", oData.Employeenumber);
					oInputModel.setProperty("/UserFullname", oData.UserFullname);	

					// Acttype
					var sPathActtype = "/ActTypeSet(CoArea='"+oData.CoArea+"',Acttype='"+oData.Acttype+"')";
					ctl.loadActtype(sPathActtype);

					// Date
					oLocalModel.setProperty("/Workdate", Formatter.EDMDateToJSObject(oData.Workdate));

					// Times
					oLocalModel.setProperty("/Starttime", Formatter.EDMTimeToJSObject(oData.Starttime));
					if (oData.Starttime.ms != oData.Endtime.ms){
						oLocalModel.setProperty("/Endtime",   Formatter.EDMTimeToJSObject(oData.Endtime));
					}

					// Finale
					//oInputModel.setProperty("/FinConf", oData.FinConf);

					// Compensation mode
					//oInputModel.setProperty("/OtCompType", oData.OtCompType);

					// Commentaire
					oInputModel.setProperty("/Text", oData.Text);

				}
			})
		},
		/**
		 * Init order confirmation dialog and model for copy
		 * @param {string} sPath: confirmation to copy URI
		 */
		initCreateOrderOperationConfirmationFragmentForCopy: function(sPath){
			ctl.initCreateOrderOperationConfirmationFragment();

			// Getting models
			var oView = ctl.getView();
			var oWorkModel = oView.getModel("plant");
			var oInputModel = oView.getModel("CreateConfirmation");
			var oLocalModel = oView.getModel("ViewModel");

			ctl.OrderOperationConfirmationFragmentForCopy = true;	
			// Loading of confirmation's values
			oWorkModel.read(sPath,{
				success: function(oData){
					// Acttype
					var sPathActtype = "/ActTypeSet(CoArea='"+oData.CoArea+"',Acttype='"+oData.Acttype+"')";
					ctl.loadActtype(sPathActtype);

					// Date
					oLocalModel.setProperty("/Workdate", Formatter.EDMDateToJSObject(oData.Workdate));

					// Times
					oLocalModel.setProperty("/Starttime", Formatter.EDMTimeToJSObject(oData.Starttime));
					oLocalModel.setProperty("/Endtime",   Formatter.EDMTimeToJSObject(oData.Endtime));

					// Finale
					oInputModel.setProperty("/FinConf", oData.FinConf);

					// Compensation mode
					//oInputModel.setProperty("/OtCompType", oData.OtCompType);

					// Commentaire
					oInputModel.setProperty("/Text", oData.Text);

					// Opening of Employee number search help
					if (oData.UserFullname){
						ctl.openEmployeenumberSelect();
					}

				}
			})

		},
		/**
		 * Init order confirmation dialog and model for ending
		 * @param {string} sPath: confirmation to close URI
		 */
		initCreateOrderOperationConfirmationFragmentForEnding: function(sPath){
			ctl.initCreateOrderOperationConfirmationFragmentForEdit(sPath);
			ctl.sPathConfirmationUpdate = sPath;
			ctl.getView().getModel("ViewModel").setProperty("/ValidateConfirmationFunction", ctl.updateConfirmation);

			// Getting models
			var oView = ctl.getView();
			var oWorkModel = oView.getModel("plant");
			var oInputModel = oView.getModel("CreateConfirmation");
			var oLocalModel = oView.getModel("ViewModel");

			// Loading of confirmation's values
			oWorkModel.read(sPath,{
				success: function(oData){

					// Employee number
					oInputModel.setProperty("/Employeenumber", oData.Employeenumber);
					oInputModel.setProperty("/UserFullname", oData.UserFullname);

					// Acttype
					var sPathActtype = "/ActTypeSet(CoArea='"+oData.CoArea+"',Acttype='"+oData.Acttype+"')";
					ctl.loadActtype(sPathActtype);

					// Date
					oLocalModel.setProperty("/Workdate", Formatter.EDMDateToJSObject(oData.Workdate));

					// Times
					oLocalModel.setProperty("/Starttime", Formatter.EDMTimeToJSObject(oData.Starttime));
					oLocalModel.setProperty("/Endtime",   new Date());

					// Finale
					//oInputModel.setProperty("/FinConf", oData.FinConf);

					// Compensation mode
					//oInputModel.setProperty("/OtCompType", oData.OtCompType);

					// Commentaire
					oInputModel.setProperty("/Text", oData.Text);

				}
			})
		},
		/**
		 * Manage screen when creating an internal confirmation
		 */
		internalConfirmationDisplay: function(){
			var oView = ctl.getView();
			var oInputModel = oView.getModel("CreateConfirmation");
			var oLocalModel = oView.getModel("ViewModel");
			oLocalModel.setProperty("/Quantity","");

			if (ctl.OrderOperationConfirmationFragmentForEdit === false){
				sap.ui.getCore().byId("Employeenumber").setEnabled(true);
				// Last Employee number used
				if (!oInputModel.getProperty("/Employeenumber") && ctl.getOwnerComponent().getModel("app").getProperty('/lastSelectedEmployee')){
					ctl.assignEmployee(ctl.getOwnerComponent().getModel("app").getProperty('/lastSelectedEmployee'));
				}
			}
			sap.ui.getCore().byId("Quantity").setEnabled(false);
			sap.ui.getCore().byId("OtCompType").setEnabled(true);
			if (ctl.OrderOperationConfirmationFragmentForCopy === false){
				sap.ui.getCore().byId("OtCompType").setSelectedKey("1");
			}
		},
		/**
		 * Manage screen when creating an external confirmation
		 */
		externalConfirmationDisplay: function(){
			var oView = ctl.getView();
			var oLocalModel = oView.getModel("CreateConfirmation");
			oLocalModel.setProperty("/Employeenumber","");
			oLocalModel.setProperty("/UserFullname","");
			oLocalModel.setProperty("/Acttype","");
			oLocalModel.setProperty("/ActtypeName","");

			if (ctl.OrderOperationConfirmationFragmentForEdit === false){	
				sap.ui.getCore().byId("Employeenumber").setEnabled(false);
			}
			sap.ui.getCore().byId("Quantity").setEnabled(true);
			sap.ui.getCore().byId("OtCompType").setEnabled(false);
			sap.ui.getCore().byId("OtCompType").setSelectedKey(" ");

		},

		/************************************************************************/
		/*   SEARCH HELP														*/
		/************************************************************************/
		/**
		 * Search for activity types
		 * @param {string} sFilterValue: search string
		 */
		searchActtype: function(sFilterValue){
			var oView = ctl.getView();

			/* Deletion of existing items */
			ctl.activityTypeSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			if (sFilterValue != "") {
				/* Only if search field is not empty */
				var oNameFilter = new sap.ui.model.Filter(
						"Name",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				var oActTypeFilter = new sap.ui.model.Filter(
						"Acttype",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oNameFilter);
					aFiltersDetail.push(oActTypeFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oActTypeFilter);
				}
			}
			if (window.cordova){
				ctl.activityTypeSelect.setGrowingThreshold(100);
			}
			/* Search and bind data */
			ctl.activityTypeSelect.bindAggregation("items", {
				path: "/ActTypeSet",
				template: new sap.m.StandardListItem({
					title: "{Name}",
					description: "{Acttype}"
				}),
				filters: aFilters,
				sorter : new sap.ui.model.Sorter('Acttype', true)
			});

		},
		/**
		 * Triggered when user selects an activity type from search help
		 * @param {sap.ui.base.Event} oEvent: click on an activity type
		 */
		validActtype: function(oEvent){
			var aSelectedActtype = oEvent.getParameter("selectedContexts")
			if (aSelectedActtype.length) {
				var oView = ctl.getView();
				aSelectedActtype.map(function(oSelectedActtype) {
					ctl.loadActtype(oSelectedActtype.getPath());
				})
			}
		},
		/**
		 * Search for employee number
		 * @param {string} sPlanPlant : employee's planplant
		 * @param {string} sFilterValue: search string
		 */
		searchEmployeenumber: function(sPlanPlant, sFilterValue){
			var aFilters = [];

			var oPlanPlantFilter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, sPlanPlant);
			if (sFilterValue && sFilterValue != "") {
				/* Only if search field is not empty */
				var oUserFullnameFilter = new sap.ui.model.Filter(
						"UserFullname",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				var oEmployeenumberFilter = new sap.ui.model.Filter(
						"Employeenumber",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oUserFullnameFilter);
					aFiltersDetail.push(oEmployeenumberFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oUserFullnameFilter);
				}
			}			
			aFilters.push(oPlanPlantFilter);

			var oBindingInfo = sap.ui.getCore().byId("employeeNumberTable").getBindingInfo("items");
			oBindingInfo.filters = aFilters;
			sap.ui.getCore().byId("employeeNumberTable").bindAggregation("items", oBindingInfo);
		},
		/**
		 * Triggered when user selects an employee number from search help
		 * @param {sap.ui.base.Event} oEvent: click on an employee number
		 */
		validEmployeenumber: function(oEvent){
			var fFunction = ctl.getView().getModel("ViewModel").getProperty("/EmployeeNumberCallback");

			fFunction(oEvent);			
		},
		/**
		 * Triggered when user selects an employee number from search help
		 * @param {sap.ui.base.Event} oEvent: click on an employee number
		 */
		handleEmployeePress: function(oEvent){
			ctl.assignEmployee(oEvent.oSource.getBindingContextPath());
			ctl.employeeNumberSelect.close();
		},
		/**
		 * assign Employee from Path
		 * @param sPath: Path of the employee
		 */
		assignEmployee: function(sPath){
			ctl.getView().getModel().read(sPath,{
				success: function(oData){
					ctl.getView().getModel("CreateConfirmation").setProperty("/Employeenumber", oData.Employeenumber);
					ctl.getView().getModel("CreateConfirmation").setProperty("/UserFullname", oData.UserFullname);
					// Keep Employee Number
					ctl.getOwnerComponent().getModel("app").setProperty('/lastSelectedEmployee', sPath);
				}
			})
		},

		/************************************************************************/
		/*   TREATMENTS															*/
		/************************************************************************/
		/**
		 * Keep modifications made to withdrawn components into a JSON object 
		 * @param   sPath: path of data record
		 * @param   iValue: withdrawn value
		 */
		bufferWithdQuanDeltaChange: function(sPath, iValue){
			// Check if record exists
			if (ctl.oComponentBuffer[sPath]){
				// Yes, we gonna take old values and change them
				ctl.oComponentBuffer[sPath].oData.WithdQuan	   = (parseInt(ctl.oComponentBuffer[sPath].oData.WithdQuan) + parseInt(iValue) - parseInt(ctl.oComponentBuffer[sPath].oData.WithdQuanDelta)).toString();
				ctl.oComponentBuffer[sPath].oData.WithdQuanDelta = iValue;
			} else {
				// No, we have to read model for WitdhQuan
				var oModel = ctl.getView().getModel("plant");

				// Read the original data
				oModel.read(sPath,{
					success: function(oData){

						var oValue = {
								// Record URL
								sPath: sPath,
								oData: {
									// Quantity used
									"WithdQuanDelta": iValue,
									// Total quantity used
									"WithdQuan"		: (parseInt(oData.WithdQuan)+parseInt(iValue)).toString(),
									// Reservation closed ?
									"Withdrawn"		: " "
								}
						}

						// Buffer in JSObject with key = path
						ctl.oComponentBuffer[sPath] = oValue;
					}
				})
			}

		},
		/**
		 * Keep modifications made to withdrawn components into a JSON object 
		 * @param   {string}  sPath: path of data record
		 * @param	{boolean} bSelected: final confirmation?
		 */
		bufferWithdrawnChange: function(sPath, bSelected){
			if (bSelected == true){
				var sWithdrawn = "X";
			} else {
				var sWithdrawn = " ";
			}

			// Check if record exists
			if (ctl.oComponentBuffer[sPath]){
				// Yes, we gonna take old values and change them
				ctl.oComponentBuffer[sPath].oData.Withdrawn = sWithdrawn;
			} else {
				// No, we have to read model for WitdhQuan
				var oModel = ctl.getView().getModel("plant");

				// Read the original data
				oModel.read(sPath,{
					success: function(oData){

						var oValue = {
								// Record URL
								sPath: sPath,
								oData: {
									// Quantity used
									"WithdQuanDelta": "0",
									// Total quantity used
									"WithdQuan"		: (parseInt(oData.WithdQuan)).toString(),
									// Reservation closed ?
									"Withdrawn"		: sWithdrawn
								}
						}

						// Buffer in JSObject with key = path
						ctl.oComponentBuffer[sPath] = oValue;
					}
				})
			}
		},

		/************************************************************************/
		/*   INPUT VERIFICATION													*/
		/************************************************************************/
		/**
		 * Check that required fields in the confirmation creation's form are supplied
		 * @param   none
		 * @returns {boolean} true if form is complete, false otherwise
		 */
		_checkCreateConfirmationInput: function(){
			var oView = ctl.getView();
			var oModelLocal = oView.getModel("ViewModel");

			var aInputs = [
			               sap.ui.getCore().byId("Acttype"),
			               sap.ui.getCore().byId("Employeenumber"),
			               sap.ui.getCore().byId("Quantity"),
			               sap.ui.getCore().byId("Workdate"),
			               sap.ui.getCore().byId("Starttime")
			               ];

			// Start and stop not allow external and only for current date
			if ((oView.getModel("ViewModel").getProperty("/Externe") == "X") ||
					(oView.getModel("ViewModel").getProperty("/Workdate").getTime() != Formatter.getDateAtMidnight().getTime())){
				aInputs.push(sap.ui.getCore().byId("Endtime"));
			}

			/* Check if we have some input that are required and empty */
			var incompleteInput = false;
			jQuery.each(aInputs, function(i, oInput) {
				if (oInput.getValue() === "" && oInput.getEnabled() == true) {
					oInput.setValueState(sap.ui.core.ValueState.Error);
					incompleteInput = true;
				} else {
					oInput.setValueState(sap.ui.core.ValueState.None);
				}
			});

			if ( ( oModelLocal.getProperty("/Endtime") ) &&
					( ( Formatter.XSTimeToEDMTime(Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Starttime"))) && Formatter.XSTimeToEDMTime(Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Starttime"))).ms ) >=
						( Formatter.XSTimeToEDMTime(Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Endtime"))) && Formatter.XSTimeToEDMTime(Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Endtime"))).ms) )
			){
				sap.ui.getCore().byId("Endtime").setValueState(sap.ui.core.ValueState.Error);
				incompleteInput = true;
			}

			/* Check if we had required input not completed */
			if (incompleteInput == true) {
				sap.m.MessageToast.show(ctl.getI18nValue("createNotification.message.enterRequiredField"), {
					duration: 4000
				});
				return false;
			}

			return true;
		},

		/**
		 * Check that confirmation creation is not in collision with another one
		 * @param{JSON} oConfirmationData: confirmation data
		 * @param{JSON} cpt: number conf to create
		 * @param{JSON} fSuccess: function to launch in case no collision
		 */
		_checkConfirmationNoCollision: function (oConfirmationData, cpt, fSuccess){
			var oModelWork = ctl.getView().getModel("plant");

			// Filter for selecting Confirmation
			var aFilters = new Array();

			var ofilterEmployeenumber = new sap.ui.model.Filter({  
				path: "Employeenumber",  
				operator: sap.ui.model.FilterOperator.EQ,  
				value1: oConfirmationData.Employeenumber
			}); 
			var ofilterWorkdate = new sap.ui.model.Filter({  
				path: "Workdate",  
				operator: sap.ui.model.FilterOperator.EQ,  
				value1: Formatter.XSDateToJSObject(oConfirmationData.Workdate)
			}); 

			aFilters.push(ofilterEmployeenumber);
			aFilters.push(ofilterWorkdate);

			var sStarttime = Formatter.XSTimeToEDMTime(oConfirmationData.Starttime).ms; 
			var sEndtime = Formatter.XSTimeToEDMTime(oConfirmationData.Endtime).ms; 

			// Start and stop
			if (sStarttime === sEndtime){
				sEndtime = 86399000; // 1 day
			}

			if (oConfirmationData.Employeenumber){ // Check collision only with Employee Number
				oModelWork.read("/OrderConfirmationSet", {  
					filters: aFilters,  
					success: function(oData, response){
						var message = null;
						for (var tabix in oData.results){
							var confirmation = oData.results[tabix];
							if (window.cordova) {
								var sPath = confirmation.__metadata.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
							} else {
								var sPath = confirmation.__metadata.uri.substring(confirmation.__metadata.uri.lastIndexOf("/"));
							}
							// no check in update
							if ( sPath === ctl.sPathConfirmationUpdate){
								continue;
							}
							// Start and go
							if ( confirmation.Starttime.ms === confirmation.Endtime.ms ){
								confirmation.Endtime.ms = 86399000;
							}

							if ( ( confirmation.Starttime.ms < sStarttime && sStarttime< confirmation.Endtime.ms ) ||
									( confirmation.Starttime.ms < sEndtime && sEndtime < confirmation.Endtime.ms ) ||
									( confirmation.Starttime.ms > sStarttime && sEndtime > confirmation.Endtime.ms )){
								// Collision detected
								message = ctl.getResourceBundle().getText("timeAndMaterialEntry.collision", 
										[oConfirmationData.UserFullname, Formatter.removeLeadingZeros(ctl.Orderid), 
										 Formatter.DateTimeToDateString(oConfirmationData.Workdate), 
										 Formatter.EDMTimeToTimeString(oConfirmationData.Starttime), Formatter.EDMTimeToTimeString(oConfirmationData.Endtime),
										 Formatter.removeLeadingZeros(confirmation.Orderid), 
										 Formatter.EDMTimeToTimeString(confirmation.Starttime), Formatter.EDMTimeToTimeString(confirmation.Endtime)
										 ]);
								sap.m.MessageToast.show(message);
								ctl.addMessage(message, sap.ui.core.MessageType.Error);
								break;
							}
						}
						if (message === null){
							fSuccess(oConfirmationData, cpt);
						}
					},
					error: ctl.oDataCallbackFail
				});
			} else {
				fSuccess(oConfirmationData, cpt);
			}
		},
		/************************************************************************/
		/*   FORMATTERS															*/
		/************************************************************************/
		/**
		 * Define if component need storage location
		 * @param{string} Item Categorie
		 * @returns{boolean} true if component need storage location
		 */
		confirmationComponentNeedStorageLocation: function(ItemCat){
			return (ItemCat === 'L');
		},
		/**
		 * Define if component confirmation is correct
		 * @param{string} Item Categorie
		 * @param{string} Storage Location
		 * @returns{boolean} true if confirmation is correct
		 */
		confirmationComponentIsNotInError: function(ItemCat, StgeLoc){
			return !ctl.confirmationComponentIsInError(ItemCat, StgeLoc);
		},
		/**
		 * Define if component confirmation is not correct
		 * @param{string} Item Categorie
		 * @param{string} Storage Location
		 * @returns{boolean} true if confirmation is not correct
		 */
		confirmationComponentIsInError: function(ItemCat, StgeLoc){
			if (ctl.confirmationComponentNeedStorageLocation(ItemCat)){
				if (Formatter.formatFlag(StgeLoc)) {
					return false;
				} else {
					return true;
				}
			} else{
				return false;
			}
		},
		/**
		 * Define if component confirmation is possible
		 * @param{checkbox} Withdrawn
		 * @param{string} Item Categorie
		 * @param{string} Storage Location
		 * @returns{boolean} true if confirmation is possible
		 */
		confirmationComponentIsPossible: function(Withdrawn, ItemCat, StgeLoc){
			if (Formatter.formatFlag(Withdrawn)){
				return false;
			} else {
				return !ctl.confirmationComponentIsInError(ItemCat, StgeLoc);
			}
		},
		/**
		 * Define if component confirmation is not possible
		 * @param{checkbox} Withdrawn
		 * @param{string} Item Categorie
		 * @param{string} Storage Location
		 * @returns{boolean} true if confirmation is possible
		 */
		confirmationComponentIsNotPossible: function(Withdrawn, ItemCat, StgeLoc){
			return !ctl.confirmationComponentIsPossible(Withdrawn, ItemCat, StgeLoc);
		},
		/**
		 * Define if confirmation is editable depending on status
		 * @param{string} status: confirmation status
		 * @returns{boolean}
		 */
		confirmationIsChangeable: function(status){
			return ( status == '10' || status == '20' );
		},
		/**
		 * Define if it is possible to copy confirmation
		 * @param{string} status: confirmation status
		 * @param{string} name: technician name
		 * @returns{boolean}
		 */
		confirmationIsCopyable: function(status, name){
			if(ctl.confirmationIsNotDraft(status) == true && name !=""){
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Define if confirmation is a draft depending on status
		 * @param{string} status: confirmation status 
		 * @returns{boolean}
		 */
		confirmationIsDraft: function(status){
			return ( status == '10');
		},
		/**
		 * Opposite result of function confirmationIsDraft
		 * @param{string} status: confirmation status 
		 * @returns{boolean}
		 */
		confirmationIsNotDraft: function(status){
			return !ctl.confirmationIsDraft(status);
		},
		/**
		 * Define if confirmation can be edited depending on status and technician
		 * @param{string} status: confirmation status
		 * @param{string} name: technician name 
		 * @returns{boolean}
		 */
		confirmationIsEditable: function(status, name){
			if(ctl.confirmationIsChangeable(status) == true && name !=""){
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Calculate remaining quantity of parts
		 * @param{number} base: available quantity 
		 * @param{number} withd: withdrawn quantity
		 * @returns{number}
		 */
		calcRemQuantity: function(base, withd){
			return base - withd;
		},
		/**
		 * Format end time of the confirmation
		 * @param{edmTime} time: confirmation end time
		 * @param{status} status: confirmation status
		 * @returns{string}
		 */
		formatConfirmationEndtime: function(time, status){
			if(status == "10"){
				return "";
			} else {
				return ctl.formatToTimeString(time);
			}
		},
		/**
		 * Format window title with order id
		 * @param{string} value: order id 
		 * @returns{string}
		 */
		formatOrderIdDetail: function(value){
			if(value !== "" && value != null){
				return ctl.getI18nValue("oData.OrderHeader.Orderid")+" "+ctl.formatRemoveLeadingZeros(value);
			}
			else{
				return ctl.getI18nValue("myConfirmation.title.noOrderSelected");
			}
		},
		/**
		 * remove leading zeros from SAP identifier
		 * @param{string} value: SAP identifier
		 * @returns{string}
		 */
		formatRemoveLeadingZeros: function(value){
			return Formatter.removeLeadingZeros(value);
		},
		/**
		 *	Define a state that can be interpreted by DOM attributes
		 * @param   {string}value: state value in backend
		 * @returns {string}       state value for frontend
		 */
		formatState: function(value){
			return Formatter.formatState(value);
		},
		/**
		 * Transform SAP status into boolean
		 * @param{string} value: in process SAP flag
		 * @returns{boolean}
		 */
		formatInProcess: function(value){
			return Formatter.formatFlag(value);
		},
		/**
		 * Format flag value so it can be interpreted by DOM attributes
		 * @param   {string}value: flag value in backend
		 * @returns {boolean}      true if flag is true
		 */
		formatFlag: function(value){
			return Formatter.formatFlag(value);
		},
		/**
		 *	Format flag with NOT operator value so it can be interpreted by DOM attributes
		 * @param   {string}value: flag value in backend
		 * @returns {boolean}      true if flag is false
		 */
		formatNotFlag: function(value){
			return !Formatter.formatFlag(value);
		},
		/**
		 * Convert datetime object to string
		 * @param{object} value: datetime object
		 * @returns{string}
		 */
		formatToDateString: function(value){
			return Formatter.DateTimeToDateString(value);
		},
		/**
		 *	Format EDMTime to a time string
		 * @param   {EDMTime}value: time value in the backend
		 * @returns {string}        time value as a string
		 */
		formatToTimeString: function(value){
			return Formatter.EDMTimeToTimeString(value);
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