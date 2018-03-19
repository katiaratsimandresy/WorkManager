/** @module My Work Orders - Detail */

sap.ui.define([
               'sap/ui/model/json/JSONModel',
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               'com/kalydia/edfen/workmanager/model/models',
               'sap/ui/core/routing/History'
               ], function(JSONModel, BaseController, UIComponent, Formatter, models, History) {
	"use strict";
	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.MyWorkOrders.MyWorkOrdersDetail", {
		/**
		 * Init controller: call fragments, attach routing event, init models
		 */
		onInit: function() {
			ctl = this;
			ctl.Formatter = Formatter;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(ctl);
			oRouter.getRoute("MyWorkOrdersDetail").attachPatternMatched(ctl._onObjectMatched, ctl);

			/* FRAGMENTS */
			// SEARCH HELP FOR FUNCTIONNAL LOCATION
			ctl.functionalLocationSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.functionalLocationSelect", ctl);
			ctl.getView().addDependent(ctl.functionalLocationSelect);
			// SEARCH HELP FOR EQUIPMENT
			ctl.equipmentSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.equipmentSelect", ctl);
			ctl.getView().addDependent(ctl.equipmentSelect);
			// SEARCH HELP FOR DAMAGE GROUP
			ctl.damageGroupSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.damageGroupSelect", ctl);
			ctl.getView().addDependent(ctl.damageGroupSelect);
			// SEARCH HELP FROM DAMAGE CODE
			ctl.damageCodeSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.damageCodeSelect", ctl);
			ctl.getView().addDependent(ctl.damageCodeSelect);
			// SEARCH HELP TO SELECT EMPLOYEE USING WORKCENTER
			ctl.employeeNumberByWorkCenterSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.employeeNumberByWorkCenterSelect", ctl);
			ctl.getView().addDependent(ctl.employeeNumberByWorkCenterSelect);
			// SEARCH HELP FOR CHECKLIST
			ctl.checklistSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.checklistSelect", ctl);
			ctl.getView().addDependent(ctl.checklistSelect);
			// SEARCH HELP FOR ACTIVITY TYPE
			ctl.activityTypeSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.activityTypeSelect", ctl);
			ctl.getView().addDependent(ctl.activityTypeSelect);
			// MODAL TO ADD CALIBRATED TOOL TO CHECKLIST
			ctl.addCaliTool = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.addCaliTool", ctl);
			ctl.getView().addDependent(ctl.addCaliTool);
			// MODAL TO MANAGE CHECKLIST TASK
			ctl.manageChecklistTask = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.checklistTask", ctl);
			ctl.getView().addDependent(ctl.manageChecklistTask);
			// MODAL TO CREATE ORDER OPERATION ASSIGNMENT
			ctl.createOrderOperationAssignment = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.createOrderOperationAssignment", ctl);
			ctl.getView().addDependent(ctl.createOrderOperationAssignment);
			// MODAL TO CREATE NOTIFICATION
			ctl.createNotificationDemand = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.createNotificationFromTaskDemand", ctl);
			ctl.getView().addDependent(ctl.createNotificationDemand);
			// MODAL TO CREATE ORDER CONFIRMATION
			ctl.createOrderOperationConfirmation = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.createOrderOperationConfirmation", ctl);
			ctl.getView().addDependent(ctl.createOrderOperationConfirmation);
			// MODAL TO SEND EMAIL
			ctl.sendMailFromOrder = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.MyWorkOrders.fragment.sendMailFromOrder", ctl);
			ctl.getView().addDependent(ctl.sendMailFromOrder);

			sap.ui.getCore().byId("StartTimeAssignmentMyWorkOrders").setMinutesStep(15);		
			sap.ui.getCore().byId("EndTimeAssignmentMyWorkOrders").setMinutesStep(15);		

			sap.ui.getCore().byId("StarttimeMyWorkOrders").setMinutesStep(5);
			sap.ui.getCore().byId("EndtimeMyWorkOrders").setMinutesStep(5);

			sap.ui.getCore().byId("funcLocationTableMyWorkOrders").attachUpdateFinished(function(evt) {
				/* Trigger when functional locations' loading is over */
				/* If research has no result we consider item is selected */
				/* Hence we close the selection popup */
				ctl.setAppBusy(false);
				var tab = evt.oSource;
				if (tab.getItems().length == 0) {
					if (ctl.selectedFuncLocTableCells != null) {
						ctl.validFunctionalLocation(ctl.selectedFuncLocTableCells[1].getText(),
									                ctl.selectedFuncLocTableCells[2].getText())
					}
				}
			});

			/* Input models */
			ctl.initModels();

			/* Array for component changes */
			ctl.oComponentBuffer = {};
		},

		/**
		 * 
		 * @param{sap.ui.base.Event} oEvent:
		 */
		initModels: function(){
			var oView = ctl.getView();
			// Model to send data to backend
			oView.setModel(
					new JSONModel(),
					"InputModel"
			);

			ctl.initViewModel();
			ctl.initTaskModel();

		},
		/**
		 * Init view model
		 */
		initViewModel: function(){
			var oView = ctl.getView();
			// Model for the view, only once
			if(!oView.getModel("ViewModel")){
				oView.setModel(
						new JSONModel(),
						"ViewModel"
				);
			};

			ctl.getView().getModel("ViewModel").setProperty("/StatusKo", "KO");
			ctl.getView().getModel("ViewModel").setProperty("/StatusOk", "OK");
			ctl.getView().getModel("ViewModel").setProperty("/StatusNa", "NA");
			ctl.getView().getModel("ViewModel").setProperty("/DisplayFindings", false);

		},
		/**
		 * Init model for checklist task management
		 */
		initTaskModel: function(){
			var oView = ctl.getView();
			oView.setModel(
					new JSONModel(),
					"TaskModel"
			);
		},
		/**
		 * Handler for click on back arrow
		 */
		handleNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("MyWorkOrders");
			}
		},

		/**
		 * Treatments to be executed after routing to the view
		 * @param   oEvent: routing event
		 */
		_onObjectMatched: function(oEvent){
			/* Input models */
			ctl.initModels();
			// We go on the first tab
			var sName = oEvent.getParameter("name");
			if (sName === "MyWorkOrdersDetail"){
				ctl.oView.byId("mainIconTabBar").setSelectedKey("Info");
				ctl.getView().byId("buttonSubmit").setVisible(true);

				ctl.sOrderPath = "/OrderHeaderSet("+oEvent.getParameter("arguments").Orderid+")";

				ctl.disableEditMode();
				ctl.readInfo();

				/* Attributes init */
				ctl.selectedConfTab = {};

				/* Display management */
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				ctl.getView().getModel("ViewModel").setProperty("/ActivitySelected", false);
				ctl.getView().getModel("ViewModel").setProperty("/ChecklistAssigned", false);
				ctl.getView().getModel("ViewModel").setProperty("/ChecklistExists", false);
				ctl.getView().getModel("ViewModel").setProperty("/ConfirmationMassCopy", false);
			}
		},

		/************************************************************************/
		/*   ELEMENTS LOADING													*/
		/************************************************************************/
		/**
		 * Order data reading
		 */
		readInfo: function(){
			ctl.removeAllPics();
			ctl.removeOrderPicture = false;
			ctl._delta = {
					deleted: {
						OrderComponent: []
					}
			};
			/* Info tab, order detail */
			var oInfoForm = ctl.getView().byId("InfoOrderForm");
			var oInfoNotificationForm = ctl.getView().byId("InfoNotificationForm");
			var oModel = ctl.getOwnerComponent().getModel("plant");
			oModel.refresh();
			var oJsonData = {};
			var sPath = ctl.sOrderPath;

			oInfoForm.setModel(new sap.ui.model.json.JSONModel(), "InfoOrderForm");
			oInfoNotificationForm.setModel(new sap.ui.model.json.JSONModel(), "InfoNotificationForm");
			ctl.setAppBusy(true);
			oModel.read(sPath,{
				success: function(oData, response){
					ctl.getView().getModel("ViewModel").setProperty("/Orderid", oData.Orderid);
					ctl.sOrderid = oData.Orderid;
					ctl.checkChecklistExists();
					ctl.getView().getModel("InputModel").setProperty("/Textheader", oData.Textheader);
					oModel.read("/FuncLocSet('" + oData.FunctLoc + "')",{
					    success: function (oData, oResponse) {
                            // Storage Default
					        ctl.StgeLocDefault = oData.StgeLocDefault;
					        ctl.PlantDefault = oData.PlantDefault;
                            // EquiType
							if (oData.Equitype && oData.Equitype != ''){
								ctl.Equitype = oData.Equitype;
							} else {
								ctl.Equitype = 'ALL';
							}
						},
						error: ctl.oDataCallbackFail
					});
					$.each(oData, function(index, value) {
						if ("__metadata" !== index) {
							if (( index === "OrderAttach" || index === "NotifHeader" || index === "OrderComponent")  
									&& value && value.__deferred) {
								if (window.cordova) {
									sPath = value.__deferred.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
								} else {
									sPath = ctl.sOrderPath + value.__deferred.uri.substring(value.__deferred.uri.lastIndexOf("/"));
								}
								oModel.read(sPath, {
									success: function(oData, response) {
										if ("OrderAttach" === index && !$.isEmptyObject(oData.results)) {
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
											oJsonData[index] = arAttachment;
											// update upload collection WO level
											ctl.updateUploadCollection("uploadCollectionMyWorkOrder", oJsonData.OrderAttach);
										} else {
											oJsonData[index] = oData.results;
										}
										if ("NotifHeader" === index && !$.isEmptyObject(oData.results)){
											var oHeader = $.isEmptyObject(oData.results) ? null : oData.results[0];
											oInfoNotificationForm.setModel(new sap.ui.model.json.JSONModel(oHeader), "InfoNotificationForm");
											if (!$.isEmptyObject(oHeader)){
												if (oHeader.NotifAttach && oHeader.NotifAttach.__deferred){
													if (window.cordova) {
														sPath = oHeader.NotifAttach.__deferred.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
													} else {
														sPath = oHeader.__metadata.uri.substring(oHeader.__metadata.uri.lastIndexOf("/")) + oHeader.NotifAttach.__deferred.uri.substring(oHeader.NotifAttach.__deferred.uri.lastIndexOf("/"));
													}
													oModel.read(sPath,{
														success: function(oData, response){
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
															oHeader["NotifAttach"] = arAttachment;
															// update upload collection Notification level
															ctl.updateUploadCollection("notificationPictureCollection", arAttachment);

														},
														error: ctl.oDataCallbackFail
													});
												}

												if (oHeader.NotifItem && oHeader.NotifItem.__deferred){
													if (window.cordova) {
														sPath = oHeader.NotifItem.__deferred.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
													} else {
														sPath = oHeader.__metadata.uri.substring(oHeader.__metadata.uri.lastIndexOf("/")) + oHeader.NotifItem.__deferred.uri.substring(oHeader.NotifAttach.__deferred.uri.lastIndexOf("/"));
													}
													oModel.read(sPath,{
														success: function(oData, response){
															oHeader["NotifItem"] = oData.results;															
															// if the model already exists, update the corresponding property
															if (oInfoNotificationForm.getModel("InfoNotificationForm")) {
																oInfoNotificationForm.getModel("InfoNotificationForm").setProperty("/NotifItem", oData.results);
															}
														},
														error: ctl.oDataCallbackFail
													});													
												}
											}
										}

										if (oJsonData[index] && oJsonData[index].__metadata) {
											delete oJsonData[index].__metadata;
										}
										if (oJsonData[index] && oJsonData[index].__proto__) {
											delete oJsonData[index].__proto__;
										}
										// if the model already exists, update the corresponding property
										if (oInfoForm.getModel("InfoOrderForm")) {
											// For components, we have to find available quantity in storage location
											if(index == "OrderComponent"){
												$.each(oJsonData[index], function(i, oValue){
													ctl.readAvailableQuantity(oValue, "/OrderComponent/"+i);
												})
											}

											oInfoForm.getModel("InfoOrderForm").setProperty("/" + index, oJsonData[index]);
										}
									},
									error: ctl.oDataCallbackFail
								});
							} else {
								oJsonData[index] = value;
								// if the model already exists, update the corresponding property
								if (oInfoForm.getModel("InfoOrderForm")) {
									oInfoForm.getModel("InfoOrderForm").setProperty("/" + index, oJsonData[index]);
								}
							}
						}
					});					
					oInfoForm.setModel(new sap.ui.model.json.JSONModel(oJsonData), "InfoOrderForm");
					if(ctl.getEmployeeData().isAreaManager){
						ctl.managerDisplay();
					} else {
						ctl.technicianDisplay();
					}
					ctl.setAppBusy(false);
				}
			});

			/* Info Tab, order table */
			var oBindingInfo = ctl.getView().byId("InfoOperationTable").getBindingInfo("items");
			oBindingInfo.model = "plant";
			oBindingInfo.path = ctl.sOrderPath+"/OrderOperation";
			oBindingInfo.filters = [];
			oBindingInfo.sorter = new sap.ui.model.Sorter('Activity', false);
			oBindingInfo.templateShareable = true;
			ctl.getView().byId("InfoOperationTable").bindAggregation("items", oBindingInfo);
			var oBindingInfoActivityMyWorkOrders = ctl.getView().byId("ActivityMyWorkOrders").getBindingInfo("items");
			oBindingInfoActivityMyWorkOrders.model = "plant";
			oBindingInfoActivityMyWorkOrders.path = ctl.sOrderPath+"/OrderOperation";
			oBindingInfoActivityMyWorkOrders.filters = [];
			oBindingInfoActivityMyWorkOrders.sorter = new sap.ui.model.Sorter('Activity', false);
			oBindingInfoActivityMyWorkOrders.templateShareable = true;
			ctl.getView().byId("ActivityMyWorkOrders").bindAggregation("items", oBindingInfoActivityMyWorkOrders);

		},
		/**
		 * Read available quantity for a material for a specific storage location
		 * @param{sap.ui.model.odata} oData: Material data
		 * @param{string}			  sPath: Material URI within the model
		 */
		readAvailableQuantity: function(oData, sPath){
			// We read the Material Availability Set to retrieve how many parts are available
			if (oData.StgeLoc && oData.StgeLoc != "" ){
				// Filters
				var aFilters = [
				                new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, oData.Material),
				                new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oData.Plant),
				                new sap.ui.model.Filter("StgeLoc", sap.ui.model.FilterOperator.EQ, oData.StgeLoc)
				                ]

				// Query
				ctl.getView().getModel().read("/MaterialAvailabilitySet",{
					filters: aFilters,
					success: function(oData){
						// Query was made with primary key, so if we have a result it is unique
						if(oData.results[0]){
							var oModel = ctl.getDetailModel();
							oModel.setProperty(sPath+"/Labst", oData.results[0].Labst);
						}
					},
					error: ctl.oDataCallbackFail
				})
			}
		},
		/**
		 * Read history data for the same location as the selected order
		 */
		readHistory: function(){
			const cSeparator = "-";
			const cDays = 180;
			var sFunctLoc = ctl.getView().byId("FunctLoc").getProperty("value");

			/* Split of functional location's different levels */
			var aLevels = sFunctLoc.split(cSeparator);

			/* Building of selection key */
			if(aLevels.length > 1){
				/* We only use 2 first levels */
				var sFuncLocSearchKey = aLevels[0]+cSeparator+aLevels[1];
			}
			else{
				var sFuncLocSearchKey = aLevels[0];
			}

			/* Search for functional location's orders */

			/* Sorters definition */
			var oDateSorter =  new sap.ui.model.Sorter({
				path: "EnterDate", 
				descending: true
			});

			/* Filters' definition */
			var aFilters = [];
			var oFilterWorkCenter = new sap.ui.model.Filter("MnWkCtr", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant());
			var oFilterFuncLoc = new sap.ui.model.Filter("FunctLoc", sap.ui.model.FilterOperator.StartsWith, sFuncLocSearchKey);
			aFilters.push(oFilterWorkCenter); 
			aFilters.push(oFilterFuncLoc);
			// Date
			var oDate = new Date();
			// Subtract 180 days
			oDate.setTime(oDate.getTime() - cDays*24*3600*1000);
			var oFilterDate = new sap.ui.model.Filter("Refdate", sap.ui.model.FilterOperator.GE, oDate);
			aFilters.push(oFilterDate); 

			var oBindingInfo = ctl.getView().byId("historyOrderTable").getBindingInfo("items");
			oBindingInfo.model = "plant";
			oBindingInfo.path = "/OrderHeaderSet";
			oBindingInfo.filters = aFilters;
			oBindingInfo.sorter  = oDateSorter;
			ctl.getView().byId("historyOrderTable").bindAggregation("items", oBindingInfo);
		},
		/**
		 * Read attached documents
		 */
		readDocuments: function(){
			var oDocument = {};
			oDocument.aOrderDocument = [];

			if(!window.cordova){
				var oFile = {
						Mimetype: "application/pdf",
						Title: "Google",
						UrlLink: "http://www.google.fr"
				}

				oDocument.aOrderDocument.push(oFile);
			} else {
				// Read encrypted storage
				Windows.Storage.ApplicationData.current.localFolder.getFileAsync("WODocuments.data", Windows.Storage.CreationCollisionOption.FailIfExists).then(function (File) {
					return Windows.Storage.FileIO.readTextAsync(File, JSON.stringify(oDocsJSON));
				}, function (error) {
					ctl.oDataCallbackFail(error);
				}).then(function (data) {
					if (data.length > 0) {
						oDocsJSON = JSON.parse(data);
						oDocument.aOrderDocument = oDocsJSON[ctl.sOrderPath];
					}
				});
			}

			ctl.getView().setModel(new JSONModel(oDocument),"DocumentModel");
		},
		/**
		 * Read order's activities data
		 */
		readActivities: function(){
			var oBindingInfo = ctl.getView().byId("OrderOperationTable").getBindingInfo("items");
			oBindingInfo.model = "plant";
			oBindingInfo.path = ctl.sOrderPath+"/OrderOperation";
			oBindingInfo.filters = [];
			oBindingInfo.sorter = new sap.ui.model.Sorter('Activity', false);
			oBindingInfo.parameters = {};
			//oBindingInfo.parameters.expand = "OrderOperationCheckList/OrderOperationCheckListTask";
			oBindingInfo.parameters.expand = "OrderOperationCheckList";
			oBindingInfo.templateShareable = true;
			ctl.getView().byId("OrderOperationTable").bindAggregation("items", oBindingInfo);
			ctl.checkChecklistExists();
		},
		/**
		 * Read order's people assignments
		 */
		readPeopleAssignment: function(){
			var oBindingInfo = ctl.getView().byId("PeopleAssignmentTable").getBindingInfo("items");
			oBindingInfo.model = "plant";
			oBindingInfo.path = ctl.sActivityPath+"/OrderOperationAssignment";
			oBindingInfo.filters = [];
			var fGrouperPeople = function(oContext) {
				var sType = oContext.getProperty("Fullname") || ctl.getI18nValue("timeAndMaterialEntry.STTRA");
				return { key: sType, value: sType }
			};
			oBindingInfo.sorter = [ new sap.ui.model.Sorter('Employeenumber', false, fGrouperPeople),
			                        new sap.ui.model.Sorter('StartDate', false) ];
			oBindingInfo.templateShareable = true;
			ctl.getView().byId("PeopleAssignmentTable").bindAggregation("items", oBindingInfo);
		},
		/**
		 * Read order's checklist data
		 */
		readCheckList: function(){
			ctl.setChecklistFilterText();

			ctl.getView().getModel("plant").read(ctl.sActivityPath+"/OrderOperationCheckList",{
				success: function (oData){
					var sUriChecklist = oData.__metadata.uri;
					var sUriDocument  = oData.OrderOperationCheckListDocument.__deferred.uri;
					var sUriTool      = oData.OrderOperationCheckListTool.__deferred.uri;
					var sUriPart      = oData.OrderOperationCheckListPart.__deferred.uri;
					var sUriCaliTool  = oData.OrderOperationCheckListCaliTool.__deferred.uri;
					var sUriTask      = oData.OrderOperationCheckListTask.__deferred.uri;
					ctl.CheckListAttachment = {};
					ctl.CheckListAttachmentByte = {};

					if (window.cordova) {
						ctl.sCheckListPath = sUriChecklist.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
					} else {
						ctl.sCheckListPath =  sUriChecklist.substring(sUriChecklist.lastIndexOf("/"));
					}

					/* Documents */
					var oBindingInfo = ctl.getView().byId("orderActivityChecklistDocumentsList").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.templateShareable = true;
					oBindingInfo.sorter = new sap.ui.model.Sorter("Reference", false);
					if (window.cordova) {
						oBindingInfo.path = sUriDocument.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
					} else {
						oBindingInfo.path =  sUriChecklist.substring(sUriChecklist.lastIndexOf("/"))+"/OrderOperationCheckListDocument";
					}
					oBindingInfo.filters = [];
					ctl.getView().byId("orderActivityChecklistDocumentsList").bindAggregation("items", oBindingInfo);

					/* Tools */
					var oBindingInfo = ctl.getView().byId("orderActivityChecklistToolTable").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.templateShareable = true;
					oBindingInfo.sorter = new sap.ui.model.Sorter("ToolId", false);
					if (window.cordova) {
						oBindingInfo.path = sUriTool.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
					} else {
						oBindingInfo.path =  sUriChecklist.substring(sUriChecklist.lastIndexOf("/"))+"/OrderOperationCheckListTool";
					}
					oBindingInfo.filters = [];
					ctl.getView().byId("orderActivityChecklistToolTable").bindAggregation("items", oBindingInfo);

					/* Parts */
					var oBindingInfo = ctl.getView().byId("orderActivityChecklistPartTable").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.templateShareable = true;
					oBindingInfo.sorter = new sap.ui.model.Sorter("PartId", false);
					if (window.cordova) {
						oBindingInfo.path = sUriPart.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
					} else {
						oBindingInfo.path =  sUriChecklist.substring(sUriChecklist.lastIndexOf("/"))+"/OrderOperationCheckListPart";
					}
					oBindingInfo.filters = [];
					ctl.getView().byId("orderActivityChecklistPartTable").bindAggregation("items", oBindingInfo);

					/* Cali Tools */
					var oBindingInfo = ctl.getView().byId("orderActivityChecklistCaliToolTable").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.templateShareable = true;
					oBindingInfo.sorter = new sap.ui.model.Sorter("ToolcalId", false);
					if (window.cordova) {
						oBindingInfo.path = sUriCaliTool.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
					} else {
						oBindingInfo.path =  sUriChecklist.substring(sUriChecklist.lastIndexOf("/"))+"/OrderOperationCheckListCaliTool";
					}
					oBindingInfo.filters = [];
					ctl.getView().byId("orderActivityChecklistCaliToolTable").bindAggregation("items", oBindingInfo);

					/* Checklist percentage */
					ctl.checkListPercentageLoad();

					/* Preventive checklist structure */
					ctl.getView().getModel("plant").read(ctl.sCheckListPath+"/OrderOperationCheckListTask",{
						success: ctl.generatePreventiveCheckListStructure,
						error: ctl.oDataCallbackFail
					})
					var oBindingInfo = ctl.getView().byId("orderActivityChecklistTaskList").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.templateShareable = true;
					oBindingInfo.sorter = new sap.ui.model.Sorter("TaskId", false);
					oBindingInfo.parameters = { expand : "OrderOperationCheckListMesure" };
					if (window.cordova) {
						oBindingInfo.path = sUriTask.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
					} else {
						oBindingInfo.path =  sUriChecklist.substring(sUriChecklist.lastIndexOf("/"))+"/OrderOperationCheckListTask";
					}
					// Fake filter
					oBindingInfo.filters = [new sap.ui.model.Filter("ChklstLoc2", sap.ui.model.FilterOperator.EQ, "XXX")];
					ctl.getView().byId("orderActivityChecklistTaskList").bindAggregation("items", oBindingInfo);

					/* Findings */
					// Comments
					ctl.getView().getModel("InputModel").setProperty("/FindingComment", oData.Comment)
					ctl.pictureCheckList(oData, function (){
						ctl.getView().byId("CheckListFindingForm").bindElement({
							path: ctl.sCheckListPath,
							model: "plant"
						});
					});

				},
				error: ctl.oDataCallbackFail
			})

		},
		/**
		 * Read order's confirmations
		 */
		readConfirmations: function(){
			var oView = ctl.getView();
			ctl.sPathConfirmationCreate = ctl.sActivityPath+"/OrderOperationConfirmation";
			/* Activities table */
			var oBindingInfo = oView.byId("orderActivityConfirmations").getBindingInfo("items");
			oBindingInfo.model = "plant";
			oBindingInfo.path = ctl.sPathConfirmationCreate;
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
		 * Read order's components
		 */
		readComponents: function(){
			var oView = ctl.getView();
			ctl.sPathComponent = ctl.sActivityPath+"/OrderComponent";

			/* Activities table */
			var oBindingInfo = oView.byId("orderActivityComponents").getBindingInfo("items");
			oBindingInfo.model = "plant";
			oBindingInfo.path = ctl.sOrderPath + "/OrderComponent";
			oBindingInfo.filters = [ new sap.ui.model.Filter("Activity", sap.ui.model.FilterOperator.EQ, ctl.Activity),
			                         new sap.ui.model.Filter("ItemCat", sap.ui.model.FilterOperator.EQ, 'L') ];
			oBindingInfo.sorter = new sap.ui.model.Sorter('Material', false);
			oView.byId("orderActivityComponents").bindAggregation("items", oBindingInfo);
			ctl.oComponentBuffer = {};
		},
		/**
		 * Read order's summary
		 */
		readSummary: function(){

			/* Order detail */
			ctl.getView().byId("SummaryOrderForm").bindElement({
				path: ctl.sOrderPath,
				model: "plant"
			});

			/* Activities */ 
			var oBindingInfo = ctl.getView().byId("SummaryTimeTable").getBindingInfo("items");
			oBindingInfo.model = "plant";
			oBindingInfo.path = ctl.sOrderPath+"/OrderOperation";
			oBindingInfo.parameters = { expand : "OrderOperationAssignment" };
			oBindingInfo.filters = [];
			oBindingInfo.sorter = new sap.ui.model.Sorter('Activity', false);
			ctl.getView().byId("SummaryTimeTable").bindAggregation("items", oBindingInfo);

			ctl.getView().getModel("plant").read(ctl.sOrderPath,{
				success: function(oData){
					var oOrderidFilter = new sap.ui.model.Filter("Orderid", sap.ui.model.FilterOperator.EQ,oData.Orderid);

					/* Confirmations */
					var oBindingInfo = ctl.getView().byId("SummaryConfirmationTable").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.path = "/OrderOperationConfirmationSet";
					oBindingInfo.filters = [];
					oBindingInfo.filters.push(oOrderidFilter);

					var fGrouper = function(oContext) {
						var sType = oContext.getProperty("UserFullname") || ctl.getI18nValue("timeAndMaterialEntry.STTRA");
						return { key: sType, value: sType }
					};
					oBindingInfo.sorter = [  
					                       new sap.ui.model.Sorter("UserFullname", false, fGrouper),
					                       new sap.ui.model.Sorter("Workdate", false),
					                       new sap.ui.model.Sorter("Starttime", false),
					                       new sap.ui.model.Sorter('Activity', false)					                       
					                       ];
					ctl.getView().byId("SummaryConfirmationTable").bindAggregation("items", oBindingInfo);

					/* Components */
					var oBindingInfo = ctl.getView().byId("SummaryComponentsTable").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.path = "/OrderComponentSet";
					oBindingInfo.filters = [];
					oBindingInfo.filters.push(oOrderidFilter);
					oBindingInfo.sorter = new sap.ui.model.Sorter('Activity', false);
					ctl.getView().byId("SummaryComponentsTable").bindAggregation("items", oBindingInfo);

					/* Checklist */
					ctl.getView().getModel("plant").read("/OrderOperationCheckListSet",{
						urlParameters:  {"$expand": 'OrderOperationCheckListTask'},
						filters: 		[oOrderidFilter],
						sorters:		[new sap.ui.model.Sorter('Activity', false)],
						success: function(oData){
							var oChklstSummary = {};
							oChklstSummary.aCheckList = [];

							$.each(oData.results, function(index, oValue){
								ctl.getCheckListTaskPercentage(oValue.OrderOperationCheckListTask.results);

								var oCheckList = {
										Activity: 	 oValue.Activity,
										ChklstId: 	 oValue.ChklstId,
										Titre: 		 oValue.Titre,
										Percent: 	 ctl.oChecklistPercentage.percent,
										QuickInfo: 	 ctl.getResourceBundle().getText("workOrderDetails.checklist.progress.title", [ctl.oChecklistPercentage.incomplete, ctl.oChecklistPercentage.total]),
										OKPercent: 	 ctl.oChecklistPercentage.percentOk,
										OKQuickInfo: ctl.getResourceBundle().getText("workOrderDetails.checklist.progress.ok.title", [ctl.oChecklistPercentage.ok, ctl.oChecklistPercentage.total]),
										KOPercent: 	 ctl.oChecklistPercentage.percentKo,
										KOQuickInfo: ctl.getResourceBundle().getText("workOrderDetails.checklist.progress.ko.title", [ctl.oChecklistPercentage.ko, ctl.oChecklistPercentage.total]),
										CheckListComplete: ctl.oChecklistPercentage.complete,
										CheckListIncomplete: ctl.oChecklistPercentage.incomplete,
										CheckListNA: ctl.oChecklistPercentage.na,
										CheckListOK: ctl.oChecklistPercentage.ok,
										CheckListKO: ctl.oChecklistPercentage.ko,
										CheckListTotal: ctl.oChecklistPercentage.total,
										CheckListSuperTotal: ctl.oChecklistPercentage.supertotal
								}

								oChklstSummary.aCheckList.push(oCheckList);
							})
							ctl.getView().setModel(new JSONModel(oChklstSummary),"SummaryModel");
						},
						error: ctl.oDataCallbackFail
					})
				}
			})

		},
		/**
		 * Read activity type for confirmations
		 * @param{string} sPath: Activity URI
		 */
		readActtype: function(sPath){
			var oView = ctl.getView();
			var oModel = oView.getModel();

			oModel.read(sPath,{
				success: function(oData){
					var oLocalModel = oView.getModel("ViewModel");
					var oInputModel = oView.getModel("InputModel");

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
		/**
		 * Read data from checklist task
		 */
		readChecklistTask: function(){
			var oWorkModel = ctl.getView().getModel("plant");
			var oViewModel = ctl.getView().getModel("ViewModel");
			oWorkModel.read(ctl.sCheckListTaskPath,{
				success: function(oData){
					// Fill model for task data
					ctl.fillTaskModel(oData);
					// Fill measure table
					var oBindingInfo = sap.ui.getCore().byId("TaskMeasureTable").getBindingInfo("items");
					oBindingInfo.model = "plant";
					oBindingInfo.path = ctl.sCheckListTaskPath+"/OrderOperationCheckListMesure";
					oBindingInfo.sorter = new sap.ui.model.Sorter('MeasureId', false);
					oBindingInfo.templateShareable = true;
					sap.ui.getCore().byId("TaskMeasureTable").bindAggregation("items", oBindingInfo);
				}
			});
		},		
		/**
		 * Fill task model with task data
		 * @param Object
		 */
		fillTaskModel: function(oData){
			// Init model for task display
			ctl.initTaskModel();
			var oTaskModel = ctl.getView().getModel("TaskModel");

			// Fill model from oData
			for(var prop in oData){
				oTaskModel.setProperty("/"+prop, oData[prop]);
			}

		},
		/**
		 * Check that minimum  one checklist is assigned to one activity
		 */
		checkChecklistExists: function(){
			var oModel = ctl.getView().getModel("plant");
			var sPath = "/OrderOperationCheckListSet/$count/?$filter=Orderid%20eq%20%27"+ctl.sOrderid+"%27%20and%20ChklstId%20eq%20%2700000%27";
			oModel.read(sPath, {
				success: function(oData, response){
					var sCount = response.body || "";
					try{
						var iCount = parseInt(sCount);
						if (iCount == 0) {
							ctl.getView().getModel("ViewModel").setProperty("/ChecklistExists", true);
						} else {
							ctl.getView().getModel("ViewModel").setProperty("/ChecklistExists", false);
						}
					} catch (e){
						ctl.getView().getModel("ViewModel").setProperty("/ChecklistExists", false);
					}
				}	
			});
		},
		/************************************************************************/
		/*   SEND MAIL                                                          */
		/************************************************************************/
		/**
		 * Handle click on "Send email" button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (click)
		 */
		handleMailButton: function(oEvent) {
			var oModel = ctl.getView().setModel(
					new JSONModel({
						Orderid: ctl.getDetailModel().getProperty("/Orderid"),
						Startdate: new Date(),
						Recipient: "PURCH_TEAM"
					}),
					"SendMailModel"
			);
			ctl.sendMailFromOrder.open();
		},
		/**
		 * Handle send email action
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (click on send in modal window)
		 */
		handleSendMailFromOrder: function(oEvent) {
			ctl.sendMailFromOrder.close();
			ctl.submitSendMail();
		},

		/************************************************************************/
		/*    SPARE PARTS                                                       */
		/************************************************************************/
		/**
		 * Open storage location search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		openLocation: function(oEvent) {
			ctl.oComponentLine = oEvent.getSource().getParent().getBindingContext("InfoOrderForm").getProperty()

			ctl.location = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.storageLocation", ctl);
			oEvent.getSource().getParent().addDependent(ctl.location);

			ctl.searchLocationItem("", ctl.oComponentLine.Material, ctl.oComponentLine.Plant);
			ctl.location.setMultiSelect(false);
			ctl.location.open();
		},
		/**
		 * Handle search bar in functional location modal modification
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (user typing)
		 */
		handleSearchLocationItem: function(oEvent) {
			ctl.searchLocationItem(oEvent.getParameter("value"), ctl.oComponentLine.Material, ctl.oComponentLine.Plant)
		},
		/**
		 * Search for item in storage location
		 * @param{string} filterValue: filter for search
		 * @param{string} Material: Material Id
		 * @param{string} Plant: Plant
		 */
		searchLocationItem: function(filterValue, Material, Plant) {
			/* Deletion of existing items */
			ctl.location.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var fMaterial = new sap.ui.model.Filter(
					"Material",
					sap.ui.model.FilterOperator.EQ,
					Material
			);
			aFilters.push(fMaterial);
			var fPlant = new sap.ui.model.Filter(
					"Plant",
					sap.ui.model.FilterOperator.EQ,
					Plant
			);
			aFilters.push(fPlant);

			if (filterValue !== "") {
				/* Only if search field is not empty */
				var StgeLoc = new sap.ui.model.Filter(
						"StgeLoc",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var Lgobe = new sap.ui.model.Filter(
						"Lgobe",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var aFiltersDetail = [];
				aFiltersDetail.push(StgeLoc);
				if (window.cordova) {
					aFiltersDetail.push(Lgobe);
				}
				var oMainFilter = new sap.ui.model.Filter({
					filters: aFiltersDetail,
					and: false
				})
				aFilters.push(oMainFilter);
			}

			/* Search and bind data */
			ctl.location.bindAggregation("items", {
				path: "/MaterialAvailabilitySet",
				template: new sap.m.StandardListItem({
					title: "{StgeLoc}",
					description: {
						parts: ['Labst', 'BaseUom', 'Lgobe'],
						formatter: ctl.formatLocationSearchDescription
					}
				}),
				filters: aFilters,
				sorter: new sap.ui.model.Sorter('StgeLoc', false)
			});

		},
		/**
		 * Format Storage Location description
		 * @param{number} Labst: Quantity
		 * @param{string} BaseUom: Unit of measure
		 * @param{string} Lgobe: Storage location 
		 * @returns{string}
		 */
		formatLocationSearchDescription: function(Labst, BaseUom, Lgobe) {
			return Labst + " - " + BaseUom + " / " + Lgobe;
		},
		/**
		 * Handle Storage Location selection
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function (click on line)
		 */
		validLocation: function(oEvent) {
			var oModel = ctl.getDetailModel();
			var path = oEvent.getSource().getParent().getBindingContext('InfoOrderForm').getPath();
			var stgeloc;
			var labst;
			var aSelectedLocation = oEvent.getParameter("selectedContexts")
			if (aSelectedLocation.length) {
				aSelectedLocation.map(
						function(oSelectedLocation) {
							stgeloc = oSelectedLocation.getObject().StgeLoc;
							labst   = oSelectedLocation.getObject().Labst;
						}
				);

				oModel.setProperty(path + "/StgeLoc", stgeloc);
				oModel.setProperty(path + "/Labst", labst);

				var aComponents = ctl.getDetailModel().getProperty("/OrderComponent") || [];
				ctl.checkDetailModelChange("/OrderComponent", aComponents);
				ctl.getDetailModel().setProperty("/OrderComponent", aComponents);

			}

			ctl.location.destroy();
			delete ctl.location;
		},
		/**
		 * Handle Activity selection
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validActivity: function(oEvent) {
			var oModel = ctl.getDetailModel();
			var path = oEvent.getSource().getParent().getBindingContext('InfoOrderForm').getPath();
			var selectedActivity = oEvent.getParameter("selectedItem").getKey();

			oModel.setProperty(path + "/Activity", selectedActivity);

			var aComponents = ctl.getDetailModel().getProperty("/OrderComponent") || [];
			ctl.checkDetailModelChange("/OrderComponent", aComponents);
			ctl.getDetailModel().setProperty("/OrderComponent", aComponents);
		},
		/**
		 * Open spare part search help
		 */
		openSparePart: function() {
			if (!ctl.sparePart) {
				ctl.sparePart = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.sparePart", ctl);
				ctl.getView().addDependent(ctl.sparePart);
			}
			ctl.searchSpareItem("");
			ctl.sparePart.setMultiSelect(true)
			ctl.sparePart.open();
		},
		/**
		 * Handle search bar modification
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchSpareItem: function(oEvent) {
			ctl.searchSpareItem(oEvent.getParameter("value"))
		},
		/**
		 * Search for spare part
		 * @param{string} filterValue: filter value for search
		 */
		searchSpareItem: function(filterValue) {
			/* Deletion of existing items */
			ctl.sparePart.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			if (filterValue !== "") {
				/* Only if search field is not empty */
				var oMaterialIdFilter = new sap.ui.model.Filter(
						"MaterialId",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var oMatlDescFilter = new sap.ui.model.Filter(
						"MatlDesc",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var oRefTurbinierFilter = new sap.ui.model.Filter(
						"RefTurbinier",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var aFiltersDetail = [];
				aFiltersDetail.push(oMaterialIdFilter);
				aFiltersDetail.push(oMatlDescFilter);
				if (window.cordova) {
					aFiltersDetail.push(oRefTurbinierFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
				} else {
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: true
					})
				}
				aFilters.push(oMainFilter);
			}

			/* Search and bind data */
			ctl.sparePart.bindAggregation("items", {
				path: "/MaterialSet",
				template: new sap.m.StandardListItem({
					title: "{MatlDesc}",
					description: {
						parts: ['MaterialId', 'RefTurbinier'],
						formatter: ctl.formatSparePartSearchDescription
					}
				}),
				filters: aFilters,
				sorter: new sap.ui.model.Sorter('MaterialId', false)
			});

		},
		/**
		 * Format spare part description for search help
		 * @param{string} Material: Material ID
		 * @param{string} RefTurbinier: Reference
		 * @returns{string}
		 */
		formatSparePartSearchDescription: function(Material, RefTurbinier) {
			Material = ctl.formatRemoveLeadingZeros(Material);
			if ("" === RefTurbinier) {
				return Material;
			} else {
				return Material + " - " + RefTurbinier;
			}
		},
		/**
		 * Handle spare part selection
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validSparePart: function(oEvent) {
			var aSelectedSpareParts = oEvent.getParameter("selectedContexts")
			if (aSelectedSpareParts.length) {
				aSelectedSpareParts.map(
						function(oSelectedSparePart) {
							ctl.addSparePart(oSelectedSparePart.getObject().MaterialId, oSelectedSparePart.getObject().MatlDesc, 
									Formatter.formatFlag(oSelectedSparePart.getObject().StorageLocation), 1)
						});
			}
		},
		/**
		 * Add a spare part to the order
		 * @param{string} MaterialId: Material Id
		 * @param{string} MatlDesc: Material description
		 * @param{boolean} Storage: Need Storage
		 * @param{number} RequirementQuantity: Quantity required
		 */
		addSparePart: function(MaterialId, MatlDesc, Storage, RequirementQuantity) {
			var aComponents = ctl.getDetailModel().getProperty("/OrderComponent") || [];
			var line = {
					Orderid: ctl.getDetailModel().getProperty("/Orderid"),
					Material: MaterialId,
					MatlDesc: MatlDesc.replace(/[^\w\s]/g, '-'),
					Plant: ctl.getDetailModel().getProperty("/Plant"),
					RequirementQuantity: RequirementQuantity.toString(),
					ItemNumber: Formatter.addLeadingZero(ctl._ItemNumber.toString(), 4),
					ItemCat : (Storage)? 'L': '',
							isNew: true
			};
			ctl._ItemNumber++;

			// Check if sotrage location is allowed
			if (Storage){
				ctl.getView().getModel().read("/MaterialAvailabilitySet(Material='" + MaterialId 
						+ "',Plant='" + ctl.PlantDefault
						+ "',StgeLoc='" + ctl.StgeLocDefault + "')", {
					success: function(oData){
                        line.Plant = ctl.PlantDefault
						line.StgeLoc = ctl.StgeLocDefault;
						line.Labst = oData.Labst;
						aComponents.push(line);
						ctl.checkDetailModelChange("/OrderComponent", aComponents);
						ctl.getDetailModel().setProperty("/OrderComponent", aComponents);
					},
					error: function(oError){
						aComponents.push(line);
						ctl.checkDetailModelChange("/OrderComponent", aComponents);
						ctl.getDetailModel().setProperty("/OrderComponent", aComponents);
					}
				})	
			} else {
				aComponents.push(line);
				ctl._ItemNumber++;
				ctl.checkDetailModelChange("/OrderComponent", aComponents);
				ctl.getDetailModel().setProperty("/OrderComponent", aComponents);
			}
		},
		/**
		 * Check that spare part quantity is valid
		 * @param{number} currentValue: actual quantity
		 * @param{string} path: spare part URI
		 * @returns{null|string}
		 */
		checkSparePartValue: function(currentValue, path) {
			var value = currentValue;
			if (isNaN(parseInt(value))) {
				value = "";
				return value.toString();
			} else if (value == 0) {
				ctl.removeSparePart(path);
				return null;
			} else {
				return value.toString();
			}
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
		 * Handle spare part quantity modification by direct input
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		handleSparePartValueChange: function(evt) {
			var view = ctl.getView();
			var oModel = ctl.getDetailModel();
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			oModel.setProperty(path + "/RequirementQuantity", ctl.checkSparePartValue(value, path));
		},
		/**
		 * Handle spare quantity increase of 1 unit
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		incrementSparePart: function(evt) {
			var view = ctl.getView();
			var oModel = ctl.getDetailModel();
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			if (!isNaN(parseInt(value))) {
				value++;
			} else {
				value = 1;
			}
			oModel.setProperty(path + "/RequirementQuantity", ctl.checkSparePartValue(value, path));

			var aComponents = ctl.getDetailModel().getProperty("/OrderComponent") || [];
			ctl.checkDetailModelChange("/OrderComponent", aComponents);
			ctl.getDetailModel().setProperty("/OrderComponent", aComponents);
		},
		/**
		 * Handle spare part quantity decrease of 1 unit
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		decrementSparePart: function(evt) {
			var view = ctl.getView();
			var oModel = ctl.getDetailModel();
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			if (!isNaN(parseInt(value))) {
				value--;
			} else {
				value = 0;
			}

			var newValue = ctl.checkSparePartValue(value, path);
			if (newValue !== null) {
				// when newValue is null, the spare spart has been removed
				oModel.setProperty(path + "/RequirementQuantity", newValue);
			}

			var aComponents = ctl.getDetailModel().getProperty("/OrderComponent") || [];
			ctl.checkDetailModelChange("/OrderComponent", aComponents);
			ctl.getDetailModel().setProperty("/OrderComponent", aComponents);
		},
		/**
		 * Handle spare part deletion
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		deleteSparePart: function(evt) {
			ctl.removeSparePart(evt.oSource.getParent().getBindingContextPath());
		},
		/**
		 * Remove spare part form the order
		 * @param{string} path: order URI
		 */
		removeSparePart: function(path) {
			var view = ctl.getView();
			var oModel = ctl.getDetailModel();
			var aSplit = path.split("/");
			var aItems = oModel.getProperty("/OrderComponent");
			var oItem = aItems.splice(aSplit[2], 1);
			if (!oItem[0].isNew){
				ctl._delta.deleted.OrderComponent.push(oItem);	
			}
			oModel.setProperty("/OrderComponent", aItems);
		},
		/**
		 * Helper function to check the detail model changes
		 * for Header
		 * @param{string} sProperty: model property name
		 * @param{string|object} newValue: new value for the property
		 * @param{boolean} bForce: true to force delta to be declared
		 * **/
		checkDetailModelChange: function(sProperty, newValue, bForce) {
			var oldValue = ctl.getDetailModel().getProperty(sProperty);
			var skey = sProperty.substr(1);
			if (!ctl._delta.OrderHeader) {
				ctl._delta.OrderHeaderData = {}
			}
			if (!ctl._delta.OrderHeader) {
				ctl._delta.OrderHeader = ( (oldValue !== newValue) || bForce );
			}
			if ('object' === typeof newValue) {
				ctl._delta[skey] = newValue;
			} else {
				ctl._delta.OrderHeaderData[skey] = newValue;
			}
		},
		/**
		 * Event handler for the barcode scanner
		 * @param {sap.ui.base.Event} evt: the event
		 */
		scanBarcode: function(evt) {
			ctl._callBarcodeScanner(evt,
					function(result) {
				// result is a JSON with 3 attributes
				// text: value of the barcode
				// format: format of the barcode (only if the scanner has been used)
				// cancelled: boolean that indicate cancellation


				var model = ctl.getView().getModel();
				var material = Formatter.addLeadingZero(result.text, 18);
				model.read(
						"/MaterialSet('" + material + "')", {
							success: function(oData, oResponse) {
								ctl.addSparePart(oData.MaterialId, oData.MatlDesc, Formatter.formatFlag(oData.StorageLocation), 1);
							},
							error: ctl.oDataCallbackFail
						});
			});
		},

		/************************************************************************/
		/*   CHECKLIST															*/
		/************************************************************************/

		changeChecklistTaskStatus: function(sStatus, bPressed, sOldStatus, bRefresh){

			switch(sStatus){

			// Click on OK button
			case "OK":
				// check if button is now pressed or not
				if(bPressed){
					// It is, which means we will set status empty
					// Decrement count of OK status
					ctl.oChecklistPercentage.ok--;
					// Set new status
					ctl.submitCheckListTaskStatus(ctl.sCheckListTaskPath, "  ", bRefresh);
				} else {
					// It is not, which means we will set status OK
					// Increment OK count
					ctl.oChecklistPercentage.ok++;
					// If previous status was KO, decrement counter
					if(sOldStatus == "KO")ctl.oChecklistPercentage.ko--;
					// If previous status was NA, decrement counter
					if(sOldStatus == "NA")ctl.oChecklistPercentage.na--;
					// Set new status
					ctl.submitCheckListTaskStatus(ctl.sCheckListTaskPath, "OK", bRefresh);
				}
				break;

			case "KO":
				if(bPressed){
					ctl.oChecklistPercentage.ko--;
					ctl.submitCheckListTaskStatus(ctl.sCheckListTaskPath, "  ", bRefresh);
				} else {
					if(sOldStatus == "OK")ctl.oChecklistPercentage.ok--;
					ctl.oChecklistPercentage.ko++;
					if(sOldStatus == "NA")ctl.oChecklistPercentage.na--;
					ctl.submitCheckListTaskStatus(ctl.sCheckListTaskPath, "KO", bRefresh);
					ctl.createNotificationDemand.open();
				}
				break;

			case "NA":
				if(bPressed){
					ctl.oChecklistPercentage.na--;
					ctl.submitCheckListTaskStatus(ctl.sCheckListTaskPath, "  ", bRefresh);
				} else {
					if(sOldStatus == "OK")ctl.oChecklistPercentage.ok--;
					if(sOldStatus == "KO")ctl.oChecklistPercentage.ko--;
					ctl.oChecklistPercentage.na++;
					ctl.submitCheckListTaskStatus(ctl.sCheckListTaskPath, "NA", bRefresh);
				}
				break;

			}
		},

		/************************************************************************/
		/*   SUBMITS															*/
		/************************************************************************/
		/**
		 * Send an email
		 */
		submitSendMail: function(){
			var oModel = ctl.getView().getModel("SendMailModel");
			var oModelWork = ctl.getView().getModel("plant");
			var sendMailEntry = $.extend(true, {}, oModel.getData());

			sendMailEntry.Startdate = Formatter.JSDateTimeToEDMDateTime(sendMailEntry.Startdate);

			oModelWork.create(
					"/OrderRecoveryMailSet",
					sendMailEntry, {
						success: function(oData, oResponse) {
							var message = ctl.getResourceBundle().getText("workOrderDetails.message.SendMailOk");
							sap.m.MessageToast.show(message);
							ctl.addMessage(message, sap.ui.core.MessageType.Success);
						},
						error: ctl.oDataCallbackFail
					});
		},
		/**
		 * Release an order
		 */
		submitOrderRelease: function(){
			//check storage fill
			var InfoOrderForm = ctl.getView().byId("InfoOrderForm");
			var oModel = InfoOrderForm.getModel("InfoOrderForm");

			/* Check if we have some input that are required and empty */
			var incompleteInput = false;
			jQuery.each(oModel.getData().OrderComponent, function(i, oInput) {
				if ((!oInput.StgeLoc || oInput.StgeLoc === "") && (oInput.ItemCat === 'L')) {
					incompleteInput = true;
				}
			});

			/* Check if we had required input not completed */
			if (incompleteInput == true) {
				sap.m.MessageToast.show(ctl.getI18nValue("workOrderDetails.message.enterStgeLoc"), {
					duration: 4000
				});
			} else {
				ctl.checkDetailModelChange("/InProcess", "X");
				ctl.getDetailModel().setProperty("/InProcess", "X");
				ctl.submitOrderInfo();
			}
		},
		/**
		 * Save order info modifications
		 */
		submitOrderInfo: function(){
			ctl.setAppBusy(true);
			var oModelWork = ctl.getView().getModel("plant");
			var oModelInput = ctl.getView().getModel("InputModel");
			var objData = $.extend(true, {}, oModelInput.getData());
			if (ctl._delta){
				var deltaHeader = ctl._delta.OrderHeaderData;
				var oOrderComponent = ctl._delta.OrderComponent;
			}
			if (!deltaHeader){
				var deltaHeader = {};
			} 
			if (!oOrderComponent){
				var oOrderComponent = [];
			}

			if (!$.isEmptyObject(objData.ShortText)){
				deltaHeader.ShortText = objData.ShortText;
			}
			if (!$.isEmptyObject(objData.FunctLoc)){
				deltaHeader.FunctLoc = objData.FunctLoc;
				deltaHeader.Funcldescr = objData.Funcldescr;
			}
			if (!$.isEmptyObject(objData.Equipment)){
				deltaHeader.Equipment = objData.Equipment;
				deltaHeader.Equidescr = objData.Equidescr;
			}
			if (!$.isEmptyObject(objData.Textheader)){
				deltaHeader.Textheader = objData.Textheader;
			}
			if (!$.isEmptyObject(objData.InProcess)){
				deltaHeader.InProcess = objData.InProcess;
			}
			if (!$.isEmptyObject(objData.Priority)){
				deltaHeader.Priority = objData.Priority;
				deltaHeader.PriorityText = objData.PriorityText.replace(/[^\w\s]/g, '-');
			}

			/*           UPDATE ORDER HEADER                                                  */
			if (!$.isEmptyObject(deltaHeader)){
				oModelWork.update(
						ctl.sOrderPath,
						deltaHeader, {
							merge: true,
							success: function(oData, oResponse) {
							},
							error: ctl.oDataCallbackFail
						});
			}
			/**********************************************************************************************
			 *                 UPDATE SPARE PARTS
			 * ********************************************************************************************/
			// Delete Spare Parts
			if (!$.isEmptyObject(ctl._delta.deleted.OrderComponent)) {
				$.each(ctl._delta.deleted.OrderComponent, function(index, value) {
					var data = value[0];
					var sPath = (window.cordova) ?
							data.__metadata.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "") :
								"/" + data.__metadata.uri.split('/').pop();
							oModelWork.remove(sPath, {
								eTag: data.__metadata.etag,
								success: function(oData, oResponse) {
								},
								error: ctl.oDataCallbackFail
							});
				});
			}
			// Updates And New Spare Parts
			if (!$.isEmptyObject(oOrderComponent)) {
				var updates = [];
				var news = [];
				$.each(oOrderComponent, function(index, value) {
					if (value.isNew) {
						news.push({
							ItemNumber: value.ItemNumber,
							Material: value.Material,
							MatlDesc: value.MatlDesc.replace(/[^\w\s]/g, '-'),
							RequirementQuantity: value.RequirementQuantity,
							Plant: value.Plant,
							Activity: value.Activity,
							StgeLoc: value.StgeLoc,
							ItemCat: value.ItemCat,
							WithdQuan: "0",
							WithdQuanDelta: "0"
						});
					} else {
						updates.push({
							__metadata: value.__metadata,
							ItemNumber: value.ItemNumber,
							Material: value.Material,
							MatlDesc: value.MatlDesc.replace(/[^\w\s]/g, '-'),
							RequirementQuantity: value.RequirementQuantity,
							RequirementQuantityUnit: value.RequirementQuantityUnit,
							Plant: value.Plant,
							Activity: value.Activity,
							StgeLoc: value.StgeLoc
						});
					}
				});

				// add new spare parts
				if (!$.isEmptyObject(news)) {
					$.each(news, function(index, value) {
						oModelWork.create(
								ctl.sOrderPath + "/OrderComponent",
								value, {
									success: function(oData, oResponse) {
										$.each(oOrderComponent, function(index, valuet) {
											if ( valuet.isNew && 
													valuet.ItemNumber === value.ItemNumber &&
													valuet.Material === value.Material) {
												valuet.__metadata = oData.__metadata;
												valuet.isNew = false;
											}
										});
									},
									error: ctl.oDataCallbackFail
								}
						);
					});
				}

				// update existing spare parts
				if (!$.isEmptyObject(updates)) {
					$.each(updates, function(index, value) {
						var sPath = (window.cordova) ?
								value.__metadata.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "") :
									"/" + value.__metadata.uri.split('/').pop();
								var oValue = $.extend(true, {}, value);
								delete oValue.__metadata;
								oModelWork.update(
										sPath,
										oValue, {
											merge: true,
											eTag: value.__metadata.etag,
											success: function(oData, oResponse) {
												value.__metadata.etag = oResponse.headers.etag;
												$.each(oOrderComponent, function(index, valuet) {
													if ( valuet.isNew && 
															valuet.ItemNumber === value.ItemNumber &&
															valuet.Material === value.Material) {
														valuet.__metadata = oData.__metadata;
													}
												});
											},
											error: ctl.oDataCallbackFail
										}
								);
					});
				}
			}

			/*           UPDATE NOTIF ITEM                                                  */
			if (!$.isEmptyObject(objData.NotifItem)){
				var view = ctl.getView(),
				oForm = view.byId("InfoNotificationForm"),
				oModel = oForm.getModel("InfoNotificationForm"),
				oNotifData = oModel.getData(),
				sItemPath = oNotifData.__metadata.uri.substring(oNotifData.__metadata.uri.lastIndexOf("/")),
				oItemData = $.isEmptyObject(objData.NotifItem) ? null : objData.NotifItem[0];

				if (!$.isEmptyObject(oItemData)){
					if (oItemData.ItemKey){
						var sItemPath = (window.cordova) ?
								oItemData.__metadata.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "") :
									"/" + oItemData.__metadata.uri.split('/').pop();
								oModelWork.update(
										sItemPath,
										oItemData, {
											merge: true,
											success: function(oData, oResponse) {
											},
											error: ctl.oDataCallbackFail
										}
								);						
					} else {
						// add mandatory fields
						oItemData.NotifNo = oNotifData.NotifNo;
						oItemData.ItemKey = "0001";
						oItemData.ItemSortNo = "0001";
						oModelWork.create(
								sItemPath + "/NotifItem",
								oItemData, {
									success: function(oData, oResponse) {
									},
									error: ctl.oDataCallbackFail
								}
						);						
					}
				}

			}
			// Image
			ctl.submitOrderPicture();

			// reset counters
			ctl._delta = {
					deleted: {
						NotifComponent: []
					}
			};
			ctl.disableEditMode();
			ctl.setReviewButton(true);
			ctl.setSendMailButton(true);

			ctl.setAppBusy(false);
			if (deltaHeader.InProcess){
				ctl.handleNavBack();
			}
		},
		/**
		 * Save order pictures
		 */
		submitOrderPicture: function(){
			ctl.getView().getModel("plant").read(ctl.sOrderPath+"/OrderAttach",{
				success: function(oData, response){
					if (!$.isEmptyObject(oData.results) && ctl.removeOrderPicture) {
						var attachData = oData.results[0];
						// delete Image
						ctl.getView().getModel("plant").remove(attachData.__metadata.edit_media.replace("/$value", "").substring(attachData.__metadata.edit_media.replace("/$value", "").lastIndexOf("/")),{
							success : ctl.submitOrderPicture,
							error: ctl.oDataCallbackFail,
							eTag: attachData.__metadata.etag
						})
					}else{
						ctl.removeOrderPicture = false;
						if (ctl.imageData){
							if (window.cordova){
								var sPathCreate = kalydia.oData.stores[ctl.getPlanPlant()].serviceUri + ctl.sOrderPath + "/OrderAttach";
							}else{
								var sPathCreate = kalydia.logon.ApplicationContext.applicationEndpointURL + ctl.sOrderPath + "/OrderAttach";
							}

							$.each(ctl.imageData, function(index, imageData){
								var currentDate = new Date();
								var currentTime = currentDate.getTime();

								var xhr = new XMLHttpRequest();
								xhr.open("POST", sPathCreate, true);
								xhr.setRequestHeader("Accept", "application/json");
								xhr.setRequestHeader("Content-Type", "image/jpeg");
								xhr.setRequestHeader("slug", currentTime + "_" + index + ".jpg");
//								xhr.setRequestHeader("X-SMP-APPCID", com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.applicationConnectionId);
								xhr.onreadystatechange = function() {
									if (xhr.readyState === 4) {
										if (xhr.status === 201) {
											var data = JSON.parse(xhr.responseText);
											console.log("Media created." + "Src: " + data.d.__metadata.media_src);
										} else {
											ctl.addMessage("OfflineStoreError", sap.ui.core.MessageType.Error, "Request failed! Status: " + xhr.status);
											console.error("Request failed! Status: " + xhr.status);
										}
									}
								}                                                    
								xhr.send(imageData);

							});
							ctl.imageData = [];
						}
					}
				},
				error: ctl.oDataCallbackFail
			})

		},
		/**
		 * Assign a checklist to an order activity
		 * @param{JSON} oData: checklist assignment data
		 */
		submitChecklistAssignment: function(oData){
			var sPath = ctl.sActivityPathForChecklist.replace("OrderOperation", "OrderOperationCheckList");
			ctl.getView().getModel("plant").update(sPath, oData,{
				success: function(){
					var message = ctl.getI18nValue("workOrderDetails.checklist.assignment.createOk");
					sap.m.MessageToast.show(message);
					ctl.addMessage(message, sap.ui.core.MessageType.Success);
					ctl.readActivities();
					ctl.getView().getModel("ViewModel").setProperty("/ChecklistAssigned", true);
					ctl.checkChecklistExists();
				},
				error: ctl.oDataCallbackFail,
				merge: true
			})

		},
		/**
		 * Create a people assignment
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		submitAssignment: function(oEvent){
			if(ctl._checkCreateAssignmentInput()){

				var oModelWork = ctl.getView().getModel("plant");
				var oModelInput = ctl.getView().getModel("InputModel");

				var oAssignmentData = $.extend(true, {}, oModelInput.getData());
				oAssignmentData.StartDate = Formatter.XSDateToJSObject(oAssignmentData.StartDate + oAssignmentData.StartTime);
				oAssignmentData.EndDate = Formatter.XSDateToJSObject(oAssignmentData.EndDate + oAssignmentData.EndTime);
				delete oAssignmentData.StartTime;
				delete oAssignmentData.EndTime;
				var sPath = ctl.sActivityPath+"/OrderOperationAssignment";
				oModelWork.create( sPath, oAssignmentData, {
					success: function(oData){
						ctl.createOrderOperationAssignment.close();
					},
					error: ctl.oDataCallbackFail
				})
			}
		},
		/**
		 * Save calibrated tool measure value
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		submitCaliTool: function(oEvent){
			if(ctl._checkAddCaliToolInput()){
				var oModel = ctl.getView().getModel();

				var sToolId = sap.ui.getCore().byId("CaliTool").getProperty("value");

				var oModelWork = ctl.getView().getModel("plant");
				var oModelInput = ctl.getView().getModel("InputModel");

				oModelInput.setProperty("/ToolcalDesc", sToolId);

				var oCaliToolData = $.extend(true, {}, oModelInput.getData());
				// oCaliToolData.ToolcalDate = Formatter.JSDateTimeToEDMDateTime(oCaliToolData.ToolcalDate);

				var sPath = ctl.sCheckListPath+"/OrderOperationCheckListCaliTool";
				oModelWork.create( sPath, oCaliToolData, {
					success: function(oData){
						ctl.addCaliTool.close();
					},
					error: ctl.oDataCallbackFail
				});
			}
		},
		/**
		 * Save checklist task status
		 * @param{string} sPath: checklist task URI
		 * @param{string} sStatus: status
		 * @param{string} bRefresh: refresh List
		 */
		submitCheckListTaskStatus: function(sPath, sStatus, bRefresh){			

			var oCurrentDateTime = new Date();

			ctl.getView().getModel("plant").update(sPath, {
				Statut: sStatus,
				PerformedAt: Formatter.JSDateTimeToEDMDateTime(oCurrentDateTime)
			},
			{
				success: function(oData){
					ctl.checkListPercentageDisplay();
					if (ctl.taskStatus != "") {
						ctl.filterCheckListTasks();
					} else if (bRefresh){
						ctl.getView().getModel("plant").refresh();
					}
				},
				error: ctl.oDataCallbackFail,
				merge: true
			})

			ctl.getView().getModel("TaskModel").setProperty("/Statut", sStatus);
		},
		/**
		 * Save checklist task measure
		 * @param{string} sPath: Measure URI
		 * @param{number} iValue: Measure value
		 */
		submitCheckListTaskMeasure: function(sPath, iValue){
			ctl.getView().getModel("plant").update(sPath, {
				MeasureValue: iValue
			},
			{
				success: ctl.updateChecklistTaskMeasStatus,
				error: ctl.oDataCallbackFail,
				merge: true
			})
		},
		/**
		 * Read measures from checklist task 
		 */
		updateChecklistTaskMeasStatus: function(){
			var oWorkModel = ctl.getView().getModel("plant");
			var oViewModel = ctl.getView().getModel("ViewModel");
			oWorkModel.read(ctl.sCheckListTaskPath+"/OrderOperationCheckListMesure",{
				success: function(oData){
					// By default, we consider that it's good
					var iMeasStatus = "3";
					$.each(oData.results, function(index, oValue){
						if((parseFloat(oValue.MeasThesMin) != 0 && parseFloat(oValue.MeasureValue) < parseFloat(oValue.MeasThesMin)) 
								|| (parseFloat(oValue.MeasThesMax) != 0 && parseFloat(oValue.MeasureValue) > parseFloat(oValue.MeasThesMax))){
							if(iMeasStatus != "1") {
								// At least one is wrong
								iMeasStatus = "2";
							}
						}
						if(oValue.MeasureValue == "" || parseFloat(oValue.MeasureValue) == 0){
							// Not all measures are complete
							iMeasStatus = "1";
						}
					});
					ctl.submitCheckListTaskMeasStatus(ctl.sCheckListTaskPath, iMeasStatus);
				}
			});
		},
		/**
		 * Save checklist task measure status
		 * @param{string} sPath: Measure URI
		 * @param{number} iValue: Measure status
		 */
		submitCheckListTaskMeasStatus: function(sPath, iValue){
			ctl.getView().getModel("plant").update(sPath, {
				MeasStatus: iValue
			},
			{
				error: ctl.oDataCallbackFail,
				merge: true
			});

			ctl.getView().getModel("TaskModel").setProperty("/MeasStatus", iValue);
		},
		/**
		 * Save checklist task comment
		 * @param{string} sPath: checklist task URI
		 * @param{string} sValue: comment
		 */
		submitCheckListTaskComment: function(sPath, sValue){
			ctl.getView().getModel("plant").update(sPath, {
				Comment: sValue
			},
			{
				error: ctl.oDataCallbackFail,
				merge: true
			});

			ctl.getView().getModel("TaskModel").setProperty("/Comment", sValue);
		},
		/**
		 * Save picture for checklist task
		 * @param{blob} imageData: image raw data
		 * @param{sap.m.Image} image: image UI element
		 */
		submitTaskPicture: function(imageData, image) {
			if (imageData){
				if (window.cordova){
					var sPathCreate = kalydia.oData.stores[ctl.getPlanPlant()].serviceUri + ctl.sCheckListTaskPath + "/OrderOperationCheckListTaskAttach";
				}else{
					var sPathCreate = kalydia.logon.ApplicationContext.applicationEndpointURL + ctl.sCheckListTaskPath + "/OrderOperationCheckListTaskAttach";
				}

				ctl.deleteTaskPicture (function(){
					var index = 1;
					var currentDate = new Date();
					var currentTime = currentDate.getTime();

					var xhr = new XMLHttpRequest();
					xhr.open("POST", sPathCreate, true);
					xhr.setRequestHeader("Accept", "application/json");
					xhr.setRequestHeader("Content-Type", "image/jpeg");
					xhr.setRequestHeader("slug", currentTime + "_" + index + ".jpg");
					xhr.onreadystatechange = function() {
						if (xhr.readyState === 4) {
							if (xhr.status === 201) {
								var data = JSON.parse(xhr.responseText);
								console.log("Media created." + "Src: " + data.d.__metadata.media_src);
								ctl.CheckListAttachment[ctl.sCheckListTaskPath] = data.d.__metadata.media_src;
								xhr = new XMLHttpRequest();
								xhr.open("GET", ctl.CheckListAttachment[ctl.sCheckListTaskPath], true);
								xhr.responseType = "arraybuffer";
								xhr.onreadystatechange = function() {
									if (xhr.readyState === 4) {
										if (xhr.status === 200) {
											ctl.readChecklistTask();
											console.log(xhr);
										} else {
											ctl.addMessage("OfflineStoreError", sap.ui.core.MessageType.Error, "Request failed! Status: " + xhr.status);
											console.error("Request failed! Status: " + xhr.status);
										}
									}
								}
								xhr.onload = function (oEvent) {
									var arrayBuffer = xhr.response;
									if (arrayBuffer) {
										ctl.CheckListAttachmentByte[ctl.sCheckListTaskPath] = new Uint8Array(arrayBuffer);
									}
								};

								xhr.send(null);
							} else {
								ctl.addMessage("OfflineStoreError", sap.ui.core.MessageType.Error, "Request failed! Status: " + xhr.status);
								console.error("Request failed! Status: " + xhr.status);
							}
						}
					}                                                    
					xhr.send(imageData);
				})

			}

		},
		/**
		 * Save picture for checklist task finding
		 * @param{blob} imageData: image raw data
		 * @param{sap.m.Image} image: image UI element
		 */
		submitFindingPicture: function(imageData, image) {
			if (imageData){
				if (window.cordova){
					var sPathCreate = kalydia.oData.stores[ctl.getPlanPlant()].serviceUri + ctl.sCheckListPath + "/OrderOperationCheckListAttach";
				}else{
					var sPathCreate = kalydia.logon.ApplicationContext.applicationEndpointURL + ctl.sCheckListPath + "/OrderOperationCheckListAttach";
				}

				ctl.deleteFindingPicture (function(){
					var index = 1;
					var currentDate = new Date();
					var currentTime = currentDate.getTime();

					var xhr = new XMLHttpRequest();
					xhr.open("POST", sPathCreate, true);
					xhr.setRequestHeader("Accept", "application/json");
					xhr.setRequestHeader("Content-Type", "image/jpeg");
					xhr.setRequestHeader("slug", currentTime + "_" + index + ".jpg");
					xhr.onreadystatechange = function() {
						if (xhr.readyState === 4) {
							if (xhr.status === 201) {
								var data = JSON.parse(xhr.responseText);
								console.log("Media created." + "Src: " + data.d.__metadata.media_src);
								ctl.CheckListAttachment[ctl.sCheckListPath] = data.d.__metadata.media_src;
								xhr = new XMLHttpRequest();
								xhr.open("GET", ctl.CheckListAttachment[ctl.sCheckListPath], true);
								xhr.responseType = "arraybuffer";
								xhr.onreadystatechange = function() {
									if (xhr.readyState === 4) {
										if (xhr.status === 200) {
											console.log(xhr);
										} else {
											ctl.addMessage("OfflineStoreError", sap.ui.core.MessageType.Error, "Request failed! Status: " + xhr.status);
											console.error("Request failed! Status: " + xhr.status);
										}
									}
								}
								xhr.onload = function (oEvent) {
									var arrayBuffer = xhr.response;
									if (arrayBuffer) {
										ctl.CheckListAttachmentByte[ctl.sCheckListPath] = new Uint8Array(arrayBuffer);
									}
								};

								xhr.send(null);
								ctl.getView().byId("findingPicture").setSrc(data.d.__metadata.media_src);
							} else {
								ctl.addMessage("OfflineStoreError", sap.ui.core.MessageType.Error, "Request failed! Status: " + xhr.status);
								console.error("Request failed! Status: " + xhr.status);
							}
						}
					}                                                    
					xhr.send(imageData);
				})
			}

		},
		/**
		 * Save checklist task finding
		 */
		submitCheckListFinding: function(){
			var sValue = ctl.getView().getModel("InputModel").getProperty("/FindingComment");
			ctl.getView().getModel("plant").update(ctl.sCheckListPath, {
				Comment: sValue
			},
			{
				success: function(){
					ctl.initModels();
					ctl.getView().getModel("InputModel").setProperty("/FindingComment", sValue)
				},
				error: ctl.oDataCallbackFail,
				merge: true
			})
		},
		/**
		 * Create a notification
		 * @param{string} sAttachPath: attachement's URI
		 */
		submitNotification: function(sAttachPath, fCallback){
			// Read notif type text
			ctl.getView().getModel().read("/NotifTypeSet(Notiftype='"+ctl.oNotifData.Notiftype+"')",{
				success: function(oData){
					ctl.oNotifData.NotiftypeText = oData.Description;

					// Create notification
					ctl.getView().getModel("plant").create("/NotifHeaderSet", ctl.oNotifData, {
						success: function(oData, oResponse){
							if (window.cordova){
								var sPath = oResponse.data.__metadata.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri,"");
							}else{
								var sPath = "/NotifHeaderSet('" + oData.NotifNo + "')";
							}
							
							// Notification created flag
							fCallback();

							// Image
							if (ctl.CheckListAttachmentByte[sAttachPath]){
								if (window.cordova){
									var sPathCreate = kalydia.oData.stores[ctl.getPlanPlant()].serviceUri + sPath + "/NotifAttach";
								}else{
									var sPathCreate = kalydia.logon.ApplicationContext.applicationEndpointURL + sPath + "/NotifAttach";
								}

								var currentDate = new Date();
								var currentTime = currentDate.getTime();

								var xhr = new XMLHttpRequest();
								xhr.open("POST", sPathCreate, true);
								xhr.setRequestHeader("Accept", "application/json");
								xhr.setRequestHeader("Content-Type", "image/jpeg");
								xhr.setRequestHeader("slug", currentTime + "_1.jpg");
//								xhr.setRequestHeader("X-SMP-APPCID", com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext.applicationConnectionId);
								xhr.onreadystatechange = function() {
									if (xhr.readyState === 4) {
										if (xhr.status === 201) {
											var data = JSON.parse(xhr.responseText);
											console.log("Media created." + "Src: " + data.d.__metadata.media_src);
										} else {
											ctl.addMessage("OfflineStoreError", sap.ui.core.MessageType.Error, "Request failed! Status: " + xhr.status);
											console.error("Request failed! Status: " + xhr.status);
										}
									}
								}

								var byteArrays = [];
								byteArrays.push(ctl.CheckListAttachmentByte[sAttachPath]);
								var blob = new Blob(byteArrays, {type: 'image/jpeg'});
								xhr.send(blob);

							};

							var message = ctl.getResourceBundle().getText("createNotification.message.createOk", [ctl.formatRemoveLeadingZeros(oData.NotifNo)]);
							sap.m.MessageToast.show(message);
							ctl.addMessage(message, sap.ui.core.MessageType.Success);
						},
						error: ctl.oDataCallbackFail
					})

				},
				error: ctl.oDataCallbackFail
			})
		},
		/**
		 * Delete confirmation in backend
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		submitConfirmationDelete: function(oEvent){
			var oModel = ctl.getView().getModel();
			var oModelWork = ctl.getView().getModel("plant");

			// Set URL
			var sPath = oEvent.oSource.getParent().getBindingContextPath();

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
		 * Handle click on "Create confirmation" button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		submitConfirmation: function(oEvent){
			if(ctl._checkCreateConfirmationInput()) {
				var oModel = ctl.getView().getModel();
				var oModelWork = ctl.getView().getModel("plant");
				var oModelLocal = ctl.getView().getModel("ViewModel");
				var oModelInput = ctl.getView().getModel("InputModel");

				if(sap.ui.getCore().byId("QuantityMyWorkOrders").getEnabled() == true){
					// In case of external activity, we can create several confirmations
					var cpt = oModelLocal.getProperty("/Quantity");
				} else {
					// In case of internal, only one
					var cpt = 1;
				}

				// Reference to order/Activity
				oModelInput.setProperty("/Orderid", ctl.Orderid);
				oModelInput.setProperty("/Activity", ctl.Activity);

				if (sap.ui.getCore().byId("OtCompTypeMyWorkOrders").getItemByKey(oModelInput.getProperty("/OtCompType"))){
					oModelInput.setProperty("/OtCompTypeText", sap.ui.getCore().byId("OtCompTypeMyWorkOrders").getItemByKey(oModelInput.getProperty("/OtCompType")).getText());
				} else {
					oModelInput.setProperty("/OtCompTypeText", "");
				}
				// Time conversion
				oModelInput.setProperty("/Workdate", Formatter.JSDateTimeToEDMDate(oModelLocal.getProperty("/Workdate")));
				oModelInput.setProperty("/Starttime", Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Starttime")));
				if(oModelLocal.getProperty("/Endtime")){
					oModelInput.setProperty("/Endtime", Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Endtime")));
					oModelInput.setProperty("/Status", "20");
				} else {
					oModelInput.setProperty("/Endtime", Formatter.JSDateTimeToEDMTime(oModelLocal.getProperty("/Starttime")));
					oModelInput.setProperty("/Status", "10");
				}
				var oConfirmationData = $.extend(true, {}, oModelInput.getData());

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
		 * Handle Mass copy of a confirmation click
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		confirmationMassCopy: function(oEvent){
			// Read employee data
			ctl.getView().getModel().read(oEvent.oSource.getBindingContextPath(),{
				success: function(oDataEmployee){
					// Loop over selected table line
					ctl.employeeNumberByWorkCenterSelect.setBusy(true);
					ctl.submitMassCopy(oDataEmployee);
				},
				error: ctl.oDataCallbackFail
			})
		},
		/**
		 * Mass copy of a confirmation in the backend
		 * @param{JSON} oDataEmployee: employee data
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
							oDataConfirmationCreate.CoArea = oDataConfirmation.CoArea;
							oDataConfirmationCreate.Acttype = oDataConfirmation.Acttype;
							oDataConfirmationCreate.ActtypeName = oDataConfirmation.ActtypeName;
							oDataConfirmationCreate.FinConf = oDataConfirmation.FinConf;
							oDataConfirmationCreate.OtCompType = oDataConfirmation.OtCompType;
							oDataConfirmationCreate.OtCompTypeText = oDataConfirmation.OtCompTypeText;
							oDataConfirmationCreate.Text = oDataConfirmation.Text;

							oDataConfirmationCreate.Employeenumber = oDataEmployee.PersonNo;
							oDataConfirmationCreate.UserFullname   = oDataEmployee.UserFullname;
							// Replace employee with the new one and create the new confirmation
							oDataConfirmationCreate.Status = "20";
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
		 * After mass copy is finished
		 */
		submitMassCopyFinish: function(){
			ctl.employeeNumberByWorkCenterSelect.setBusy(false);
			ctl.employeeNumberByWorkCenterSelect.close();
			ctl.selectedConfTab = {};
			ctl.selectedConfCpt = 0;
			ctl.getView().getModel("ViewModel").setProperty("/ConfirmationMassCopy", false);
		},
		/**
		 * Save components' confirmation
		 * @param{sap.ui.base.Event} oEvent:
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
		/*   DELETE	/ REMOVE													*/
		/************************************************************************/
		/**
		 * Unassign expert from activity
		 * @param{string} sPath: Assignment URI
		 */
		removeExpert: function(sPath){
			ctl.getView().getModel("plant").remove(sPath,{
				error: ctl.oDataCallbackFail
			});
		},
		/**
		 * Unassign checklist from activity
		 * @param{string} sPath: checklist URI
		 */
		removeChecklist: function(sPath){
			ctl.getView().getModel("plant").read(sPath,{
				success: function(oData){
					if (window.cordova) {
						var sPath = oData.__metadata.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
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
						success: ctl.readActivities,
						error: ctl.oDataCallbackFail
					});
				},
				error: ctl.oDataCallbackFail
			});
		},
		/**
		 * Delete calibrated tool from checklist task
		 * @param{string} sPath: calibrated tool URI
		 */
		removeCaliTool: function(sPath){
			ctl.getView().getModel("plant").remove(sPath,{
				error: ctl.oDataCallbackFail
			});
		},
		/**
		 * Delete picture from checklist task
		 * @param{function} callback: function to be called after execution is finished
		 */
		deleteTaskPicture: function(callback){
			if (!callback){
				callback = null;
			}
			ctl.getView().getModel("plant").read(ctl.sCheckListTaskPath+"/OrderOperationCheckListTaskAttach",{
				success: function(oData){
					if (!$.isEmptyObject(oData.results)){
						var attachData = oData.results[0];
						var sPathRoot = attachData.__metadata.edit_media.replace("/$value", "").substring(attachData.__metadata.edit_media.replace("/$value", "").lastIndexOf("/"));
						delete ctl.CheckListAttachment[ctl.sCheckListTaskPath];
						delete ctl.CheckListAttachmentByte[ctl.sCheckListTaskPath];
						ctl.getView().getModel("plant").remove(sPathRoot,{
							success: callback,
							error: ctl.oDataCallbackFail,
							eTag: attachData.__metadata.etag
						})		
					}else{
						if (callback){
							callback();
						}
					}
				},
				error: ctl.oDataCallbackFail
			})
		},
		/**
		 * Delete picture from checklist task findings
		 * @param{function} callback: function to be called after execution is finished
		 */
		deleteFindingPicture: function(callback){
			if (!callback){
				callback = function(){
					ctl.getView().byId("findingPicture").setSrc("");
				};
			}
			ctl.getView().getModel("plant").read(ctl.sCheckListPath+"/OrderOperationCheckListAttach",{
				success: function(oData){
					if (!$.isEmptyObject(oData.results)){
						var attachData = oData.results[0];
						delete ctl.CheckListAttachment[ctl.sCheckListPath];
						delete ctl.CheckListAttachmentByte[ctl.sCheckListPath];
						ctl.getView().getModel("plant").remove(attachData.__metadata.edit_media.replace("/$value", "").substring(attachData.__metadata.edit_media.replace("/$value", "").lastIndexOf("/")),{
							success: callback,
							error: ctl.oDataCallbackFail,
							eTag: attachData.__metadata.etag
						})		
					}else{
						if (callback){
							callback();
						}
					}
				},
				error: ctl.oDataCallbackFail
			})
			if (!callback){
				callback();
			}
		},

		/************************************************************************/
		/*   ACTIONS HANDLERS													*/
		/************************************************************************/
		/**
		 * Handle tab selection
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleMainIconTabBarSelect: function(oEvent){
			switch (oEvent.getParameter("key")){
			case "Info":
				ctl.readInfo();
				ctl.disableEditMode();
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "History":
				ctl.readHistory();
				ctl.setReviewButton(false);
				ctl.setSendMailButton(false);
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "Documents":
				ctl.readDocuments();
				ctl.setReviewButton(false);
				ctl.setSendMailButton(false);
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "Activities":
				ctl.readActivities();
				ctl.setReviewButton(false);
				ctl.setSendMailButton(false);
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "People":
				ctl.readPeopleAssignment();
				ctl.setReviewButton(false);
				ctl.setSendMailButton(false);
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "Checklist":
				ctl.readCheckList();
				ctl.setReviewButton(false);
				ctl.setSendMailButton(false);
				ctl.oView.byId("checkListMainIconTabBar").setSelectedKey("orderActivityChecklistDocuments");
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "Confirmations":
				ctl.setReviewButton(false);
				ctl.setSendMailButton(false);
				ctl.oView.byId("confirmationIconTabBar").setSelectedKey("orderActivityConfirmation");
				ctl.getView().byId("buttonSubmit").setVisible(true);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				ctl.readConfirmations();
				ctl.readComponents();
				break;
			case "Report":
				ctl.readSummary();
				ctl.setReviewButton(false);
				ctl.setSendMailButton(false);
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			}
		},
		/**
		 * Handle tab selection in checklist
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListMainIconTabBarSelect: function(oEvent){
			switch (oEvent.getParameter("key")){
			case "orderActivityChecklistDocuments":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "orderActivityChecklistTools":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "orderActivityChecklistParts":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "orderActivityChecklistCaliTool":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				break;
			case "orderActivityChecklistChecklist":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				ctl.taskStatus = "";
				ctl.filterCheckListTasks();
				break;
			case "orderActivityChecklistFindings":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(true);
				break;
			case "Incomplete":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				ctl.taskStatus = "  ";
				ctl.filterCheckListTasks();
				break;
			case "OK":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				ctl.taskStatus = "OK";
				ctl.filterCheckListTasks();
				break;
			case "KO":
				ctl.getView().byId("buttonSubmit").setVisible(false);
				ctl.getView().byId("buttonCreateNotification").setVisible(false);
				ctl.taskStatus = "KO";
				ctl.filterCheckListTasks();
				break;
			}
		},
		/**
		 * Switch from edit to display mode
		 */
		disableEditMode: function() {
			ctl.setReviewButton(false);
			ctl.setSaveButton(false);
			// reset editable parts
			ctl.setEditSpareParts(false);
			ctl.setEditOrderHeader(false);
		},

		/**
		 * Helper Function to enable Send Mail button
		 * @param {boolean} bEditable   visibility of the component
		 * **/
		setSendMailButton: function(bVisible) {
			ctl.getView().byId('sendMail').setVisible(bVisible)
		},

		/**
		 * Helper Function to enable review button
		 * @param {boolean} bEditable   visibility of the component
		 * **/
		setReviewButton: function(bVisible) {
			ctl.getView().byId('reviewOrder').setVisible(bVisible)
		},

		/**
		 * Helper Function to enable save button
		 * @param {boolean} bEditable   visibility of the component
		 * **/
		setSaveButton: function(bVisible) {
			ctl.getView().byId('buttonSubmit').setVisible(bVisible)
		},

		/**
		 * Helper Function to enable review spare parts and picture button
		 * @param {boolean} bEditable visibility and enability of the component
		 * **/
		setEditSpareParts: function(bEditable) {
			var oView = ctl.getView();
			var spareParts = [
			                  oView.byId('addSparePartOrder'),
			                  oView.byId('barcodeOrder'),
			                  oView.byId('decrementSparePartColumnOrder'),
			                  oView.byId('incrementSparePartColumnOrder'),
			                  oView.byId('deleteSparePartColumnOrder'),
			                  oView.byId('removePics'),
			                  oView.byId('camera'),
			                  oView.byId('library'),
			                  ];

			$.each(spareParts, function(index, element) {
				if (element.setEnabled) {
					element.setEnabled(bEditable);
				}
				if (element.setVisible) {
					element.setVisible(bEditable);
				}
			});
			oView.byId('RequirementQuantityOrderDisplay').setVisible(!bEditable);
			oView.byId('RequirementQuantityOrderInput').setVisible(bEditable);
			oView.byId('ActivityDisplay').setVisible(!bEditable);
			oView.byId('ActivityInput').setVisible(bEditable);
			oView.byId('StgeLocDisplay').setVisible(!bEditable);
			oView.byId('StgeLocInput').setVisible(bEditable);
			oView.byId('sparePartQuantityValidation').setVisible(!bEditable);

			if (ctl.getView().byId("uploadCollectionMyWorkOrder").getItems().length >= 2) {
				ctl.getView().byId("library").setEnabled(false);
				ctl.getView().byId("camera").setEnabled(false);
			}
		},

		/**
		 * Helper Function to enable review header information
		 * @param {boolean} bEditable visibility and enability of the component
		 * **/
		setEditOrderHeader: function(bEditable) {
			var oView = ctl.getView();

			var arElements = [oView.byId('ShortText'),
			                  oView.byId('FunctLoc'),
			                  oView.byId('Equipment'),
			                  oView.byId('Priority'),
			                  oView.byId('TextheaderNew'),
			                  ];

			if (!bEditable || oView.byId('NotifNo').getText().length){
				arElements.push(oView.byId('DCodegrp'));
				arElements.push(oView.byId('DCode'));
			}

			$.each(arElements, function(index, element) {
				if (element.setEditable) {
					element.setEditable(bEditable);
				}
				if (element.setEnabled){
					element.setEnabled(bEditable);
				}
			});

		},
		/**
		 * Handle functional location selection
		 * @param{sap.ui.base.Event} val: event that triggered the function
		 */
		handleFunctionalLocationPress: function(val) {
			/* Handle action when a functional location is pressed */
			try {
				ctl.selectedFuncLocTableCells = val.oSource.getCells();
				var funcloc = val.oSource.getCells()[1].getText();

				ctl.searchFunctionalLocation(ctl.getPlanPlant(), funcloc)

			} catch (err) {
				console.log(err);
			}
		},
		/**
		 * Handle research for equipement in search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchEquipment: function(oEvent) {
			ctl.searchEquipment(oEvent.getParameter("value"))
		},
		/**
		 * Handle research for damage group in search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchDamageGroup: function(oEvent) {
			ctl.searchDamageGroup(oEvent.getParameter("value"));
		},
		/**
		 * Handle research for damage code in search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchDamageCode: function(oEvent) {
			ctl.searchDamageCode(oEvent.getParameter("value"))
		},
		/**
		 * Handle click on order history tab
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleHistoryOrderPress: function(oEvent){ 
			var aSplit = oEvent.getSource().getBindingContextPath().split("(");
			aSplit = aSplit[1].split(")");
			/* Call of the other view */
			UIComponent.getRouterFor(ctl).navTo("MyWorkOrdersDetail", {
				Orderid: aSplit[0]
			});
		},
		/**
		 * Handle click on "Add document" button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleAddOrderDocument: function(oEvent){
			if(window.cordova){ 

				// Create the picker object and set options 
				var openPicker = new Windows.Storage.Pickers.FileOpenPicker(); 
				openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list; 
				openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary; 
				openPicker.fileTypeFilter.replaceAll(["*"]); 

				// Open the picker for the user to pick a file 
				openPicker.pickSingleFileAsync().then(function (oFile) {
					var aDocsJSON = ctl.getView().getModel("DocumentModel").getProperty("/aOrderDocument");
					var aFiles = [];
					aFiles.push(oFile);
					// If a file has been selected
					if (aFiles.length > 0) { 
						// Application now has read/write access to the picked file(s) 
						for (var i = 0; i < aFiles.length; i++) {
							var oFile = {
									Mimetype: aFiles[i].displayType,
									Title:    aFiles[i].name,
									UrlLink:  aFiles[i].path
							}
							aDocsJSON.push(oFile);
							oDocsJSON[ctl.sOrderPath] = aDocsJSON;
							Windows.Storage.ApplicationData.current.localFolder.getFolderAsync("orderDocuments").then(function (IStorageFolder) {
								aFiles[i].copyAsync(IStorageFolder, aFiles[i].name, Windows.Storage.NameCollisionOption.replaceExisting)
							})
							Windows.Storage.ApplicationData.current.localFolder.getFileAsync("WODocuments.data", Windows.Storage.CreationCollisionOption.FailIfExists).then(function (File) {
								return Windows.Storage.FileIO.writeTextAsync(File, JSON.stringify(oDocsJSON));
							}, function (error) {
								ctl.oDataCallbackFail(error);
							})

						} 

					} else { 
						// The picker was dismissed with no selected file 
						WinJS.log && WinJS.log("Operation cancelled.", "sample", "status"); 
					} 

					ctl.readDocuments();

				})
			}
		},
		/**
		 * Handle document press
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleOrderDocumentPress: function(oEvent){
			ctl.openUrl(ctl.getView().getModel("DocumentModel").getProperty(oEvent.getSource().getBindingContextPath()+"/UrlLink"));
			debugger
		},
		/**
		 * Handle document link press
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleOrderDocumentLinkPress: function(oEvent){
			ctl.openUrl(oEvent.getSource().getProperty("target"));
		},
		/**
		 * Handle click on "Delete document" button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleRemoveOrderDocument: function(oEvent){
			if(window.cordova){
				var oItem = oEvent.getSource().getParent();
				oItem.getParent().removeItem(oItem);

				var oModel = ctl.getView().getModel("DocumentModel");
				Windows.Storage.ApplicationData.current.localFolder.getFileAsync("WODocuments.data", Windows.Storage.CreationCollisionOption.FailIfExists).then(function (File) {
					return Windows.Storage.FileIO.writeTextAsync(File, JSON.stringify(oModel.getJSON()));
				}, function (error) {
					ctl.oDataCallbackFail(error);
				})
			}
		},		
		/**
		 * Handle activity press
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleActivityPress: function(oEvent){
			// Set enable for tabs
			ctl.getView().getModel("ViewModel").setProperty("/ActivitySelected", true);

			// Select people tab
			ctl.oView.byId("mainIconTabBar").setSelectedKey("People");

			// Define Path for activity
			ctl.sActivityPath = oEvent.getSource().getBindingContextPath();
			ctl.readPeopleAssignment();
			ctl.getView().getModel("plant").read(ctl.sActivityPath,{
				success: function(oData){
					ctl.Orderid = oData.Orderid;
					ctl.Activity = oData.Activity;
				}
			})

			// Read if there is a checklist
			ctl.getView().getModel("plant").read(ctl.sActivityPath+"/OrderOperationCheckList",{
				success: function (oData){
					if(oData.CreatedOn){
						ctl.getView().getModel("ViewModel").setProperty("/ChecklistAssigned", true);
					} else {
						ctl.getView().getModel("ViewModel").setProperty("/ChecklistAssigned", false);
					}
				}
			});
		},
		/**
		 * Handle search help for employees openning and determine which function to execute
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleEmployeeNumberByWorkCenterPress: function(oEvent){
			var fFunction = ctl.getView().getModel("ViewModel").getProperty("/EmployeeNumberByWorkCenterCallback");

			fFunction(oEvent);
		},
		/**
		 * Handle unassign checklist button click
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleUnassignChecklist: function(oEvent){
			ctl.getView().getModel("ViewModel").setProperty("/ChecklistAssigned", false);
			ctl.removeChecklist(oEvent.getSource().getParent().getParent().getBindingContextPath()+"/OrderOperationCheckList");
		},
		/**
		 * Handle "Assign expert" button click
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleAssignExpert: function(oEvent){
			ctl.createOrderOperationAssignment.open();
			ctl.initCreateOrderOperationAssignmentFragment();
		},
		/**
		 * Handle employee research by work center
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchEmployeenumberByWorkCenter: function(oEvent){
			var sPlanPlant = ctl.getView().getModel("ViewModel").getProperty("/Planplant");
			ctl.searchEmployeenumberByWorkCenter(sPlanPlant, oEvent.getSource().getValue());
		},
		/**
		 * Handle workcenter modification in search help for employees by workcenter modal
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handlePlanplantSelectChange: function(oEvent){
			ctl.getView().getModel("ViewModel").setProperty("/SearchEmployeeNumberByWorkCenter", "")
			ctl.searchEmployeenumberByWorkCenter(oEvent.getSource().getProperty("selectedKey"), "");
		},
		/**
		 * Handle click on employee in search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleExpertEmployeePress: function(oEvent){
			ctl.getView().getModel().read(oEvent.oSource.getBindingContextPath(),{
				success: function(oData){
					ctl.getView().getModel("InputModel").setProperty("/Employeenumber", oData.PersonNo);
					ctl.getView().getModel("InputModel").setProperty("/Fullname", oData.UserFullname);
					ctl.employeeNumberByWorkCenterSelect.close();
				}
			})
		},
		/**
		 * Handle employee unassignment
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleUnassignExpert: function(oEvent){
			ctl.removeExpert(oEvent.getSource().getParent().getBindingContextPath());
		},
		/**
		 * Handle research for checklist in search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchChecklist: function(oEvent){
			ctl.searchChecklist(oEvent.getParameter("value"));
		},
		/**
		 * Handle click on checklist document tab
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleChecklistDocumentPress: function(oEvent){
			ctl.openUrl(oEvent.getSource().getProperty("target"));
		},
		/**
		 * Handle click on "Add cali tool" button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleAddCaliTool: function(oEvent){
			ctl.addCaliTool.open();
			ctl.initAddCaliToolFragment();
		},
		/**
		 * Handle click on "Scan cali tool" button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleScanCaliTool: function(oEvent){
			ctl.handleAddCaliTool(oEvent);
			ctl._callBarcodeScanner(oEvent,
					// result is a JSON with 3 attributes
					// text: value of the barcode
					// format: format of the barcode (only if the scanner has been used)
					// int ref code: calibrated tool internal reference
					function(result) {
				var tScanValues = result.text.split(";");
				ctl.getView().getModel("InputModel").setProperty("/ToolcalIntRef", tScanValues[0]);
				ctl.getView().getModel("InputModel").setProperty("/ToolcalDesc", tScanValues[1]);
				// ctl.getView().getModel("InputModel").setProperty("/ToolcalDate", new Date(tScanValues[2]));
				ctl.getView().getModel("InputModel").setProperty("/ToolcalSn", tScanValues[2]);

			});
		},
		/**
		 * Handle click on "Delete cali tool" button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleDeleteCaliTool: function(oEvent){
			ctl.removeCaliTool(oEvent.getSource().getParent().getBindingContextPath());
		},
		/**
		 * Handle click on the level of checklist structure
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListSelect: function(oEvent){
			var oModelLocal = ctl.getView().getModel("ViewModel");
			var oBindingInfo = ctl.getView().byId("CheckListLevel").getBindingInfo("items");
			var sPath = "/aChklstLoc2"; 
			var sFilter = oEvent.getSource().getProperty("text");

			if (sFilter == ctl.getI18nValue("oData.Checklist.All")){
				ctl.checkListFilter2 = "";
				delete ctl.checkListFilterKey2;
				ctl.checkListFilter3 = "";
				delete ctl.checkListFilterKey3;
				ctl.checkListFilter4 = "";
				delete ctl.checkListFilterKey4;
				oBindingInfo.path = sPath;
				ctl.getView().byId("CheckListLevel").bindAggregation("items", oBindingInfo);
				oModelLocal.setProperty("/bChklstLoc",false);
			} else if (sFilter == ctl.checkListFilter2){
				ctl.checkListFilter3 = "";
				delete ctl.checkListFilterKey3;
				ctl.checkListFilter4 = "";
				delete ctl.checkListFilterKey4;
				sPath = sPath + "/" + ctl.checkListFilterKey2 + "/" + "aChklstLoc3";
				oBindingInfo.path = sPath;
				ctl.getView().byId("CheckListLevel").bindAggregation("items", oBindingInfo);
				oModelLocal.setProperty("/bChklstLoc",false);
			} else if  (sFilter == ctl.checkListFilter3){
				ctl.checkListFilter4 = "";
				delete ctl.checkListFilterKey4;
				oModelLocal.setProperty("/bChklstLoc",false);
			}

			ctl.setChecklistFilterText();
			ctl.filterCheckListTasks();
		},
		/**
		 * Handle click on the level of checklist structure
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListLevelSelect: function(oEvent){
			var oModelLocal = ctl.getView().getModel("ViewModel");
			var oBindingInfo = ctl.getView().byId("CheckListLevel").getBindingInfo("items");
			var sPath = "/aChklstLoc2"; 

			if(oEvent.getSource().getExpanded() == true){
				if (!ctl.checkListFilter2 || ctl.checkListFilter2 == ""){
					ctl.checkListFilter2 = oEvent.getParameter("item").getProperty("text");
					ctl.checkListFilterKey2 = oEvent.getParameter("key");
					sPath = sPath + "/" + oEvent.getParameter("key") + "/" + "aChklstLoc3";
					oBindingInfo.path = sPath;
					ctl.getView().byId("CheckListLevel").bindAggregation("items", oBindingInfo);
					oModelLocal.setProperty("/bChklstLoc",false);
				} else if (!ctl.checkListFilter3 || ctl.checkListFilter3 == ""){
					ctl.checkListFilter3 = oEvent.getParameter("item").getProperty("text");
					ctl.checkListFilterKey3 = oEvent.getParameter("key");
					sPath = sPath + "/" + ctl.checkListFilterKey2 + "/" + "aChklstLoc3"
					+ "/" + oEvent.getParameter("key") + "/" + "aChklstLoc4";
					oBindingInfo.path = sPath;
					ctl.getView().byId("CheckListLevel").bindAggregation("items", oBindingInfo);
					oModelLocal.setProperty("/bChklstLoc",false);
				} else {
					ctl.checkListFilter4 = oEvent.getParameter("item").getProperty("text");
					ctl.checkListFilterKey4 = oEvent.getParameter("key");
				}

			} else {
				if (ctl.checkListFilter4 || ctl.checkListFilter4 != ""){
					ctl.checkListFilter4 = "";
					delete ctl.checkListFilterKey4;
				} else if (!ctl.checkListFilter3 || ctl.checkListFilter3 == ""){
					ctl.checkListFilter3 = "";
					delete ctl.checkListFilterKey3;
					sPath = sPath + "/" + ctl.checkListFilterKey2 + "/" + "aChklstLoc3";
					oBindingInfo.path = sPath;
					ctl.getView().byId("CheckListLevel").bindAggregation("items", oBindingInfo);
					oModelLocal.setProperty("/bChklstLoc",false);
				} else {
					ctl.checkListFilter2 = "";
					delete ctl.checkListFilterKey2;
					oBindingInfo.path = sPath;
					ctl.getView().byId("CheckListLevel").bindAggregation("items", oBindingInfo);
					oModelLocal.setProperty("/bChklstLoc",false);
				}
			}

			ctl.setChecklistFilterText();
			ctl.filterCheckListTasks();
		},
		/**
		 * Handle click on the level 2 of checklist structure
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListLevel2Select: function(oEvent){
			if(oEvent.getSource().getExpanded() == true){
				ctl.checkListFilter2 = oEvent.getParameter("key");
			} else {
				ctl.checkListFilter2 = "";
			}

			var oModelLocal = ctl.getView().getModel("ViewModel");
			oModelLocal.setProperty("/bChklstLoc3",false);
			oModelLocal.setProperty("/bChklstLoc4",false);
			ctl.checkListFilter3 = "";
			ctl.checkListFilter4 = "";

			ctl.setChecklistFilterText();
			ctl.filterCheckListTasks();
		},
		/**
		 * Handle click on the level 3 of checklist structure
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListLevel3Select: function(oEvent){
			if(oEvent.getSource().getExpanded() == true){
				ctl.checkListFilter3 = oEvent.getParameter("key");
			} else {
				ctl.checkListFilter3 = "";
			}

			var oModelLocal = ctl.getView().getModel("ViewModel");
			oModelLocal.setProperty("/bChklstLoc4",false);
			ctl.checkListFilter4 = "";

			ctl.setChecklistFilterText();
			ctl.filterCheckListTasks();
		},
		/**
		 * Handle click on the level 4 of checklist structure
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListLevel4Select: function(oEvent){
			if(oEvent.getSource().getExpanded() == true){
				ctl.checkListFilter4 = oEvent.getParameter("key");
			} else {
				ctl.checkListFilter4 = "";
			}

			ctl.setChecklistFilterText();
			ctl.filterCheckListTasks();
		},
		/**
		 * Not implemented
		 * @param{sap.ui.base.Event} oEvent:
		 */	
		handlePanelExpand: function(oEvent){
			//Not implemented
		},
		/**
		 * Handle click on button to open checklist task detail
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleOpenTask: function(oEvent){
			// Checklist task URI
			ctl.sCheckListTaskPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
			ctl.openTask();
		},
		/**
		 * Handle click on "KO" status for a checklist task from the list
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListTaskKo: function(oEvent){
			var oButton = oEvent.getSource();
			ctl.sCheckListTaskPath = oButton.getParent().getParent().getParent().getBindingContextPath();
			var bPressed = oEvent.oSource.getProperty("pressed");
			var sOldStatus = oEvent.getSource().data("currentStatus");
			ctl.changeChecklistTaskStatus("KO", bPressed, sOldStatus, false);
		},
		/**
		 * Handle click on "OK" status on a checklist task from the list
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListTaskOk: function(oEvent){
			var oButton = oEvent.getSource();
			ctl.sCheckListTaskPath = oButton.getParent().getParent().getParent().getBindingContextPath();
			var bPressed = oEvent.oSource.getProperty("pressed");
			var sOldStatus = oEvent.getSource().data("currentStatus");
			ctl.changeChecklistTaskStatus("OK", bPressed, sOldStatus, false);
		},
		/**
		 * Handle click on "NA" status on a checklist task from the list
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListTaskNa: function(oEvent){
			var oButton = oEvent.getSource();
			ctl.sCheckListTaskPath = oButton.getParent().getParent().getParent().getBindingContextPath();
			var bPressed = oEvent.oSource.getProperty("pressed");
			var sOldStatus = oEvent.getSource().data("currentStatus");
			ctl.changeChecklistTaskStatus("NA", bPressed, sOldStatus, false);
		},
		/**
		 * Handle click on "KO" status for a checklist task from modal
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListTaskKoDialog: function(oEvent){
			// Check that comment is not empty
			if(ctl.getView().getModel("TaskModel").getProperty("/Comment") == ""){
				sap.m.MessageToast.show(ctl.getI18nValue("workOrderDetails.checklist.message.comment"));
				return;
			}
			var oButton = oEvent.getSource();
			var bPressed = oEvent.oSource.getProperty("pressed");
			var sOldStatus = oEvent.getSource().data("currentStatus");
			ctl.changeChecklistTaskStatus("KO", bPressed, sOldStatus, true);
			ctl.closeDialog(oEvent);
		},
		/**
		 * Handle click on "OK" status on a checklist task from modal
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListTaskOkDialog: function(oEvent){
			var oButton = oEvent.getSource();
			var bPressed = oEvent.oSource.getProperty("pressed");
			var sOldStatus = oEvent.getSource().data("currentStatus");
			ctl.changeChecklistTaskStatus("OK", bPressed, sOldStatus, true);
			ctl.closeDialog(oEvent);
		},
		/**
		 * Handle click on "NA" status on a checklist task from modal
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListTaskNaDialog: function(oEvent){
			var oButton = oEvent.getSource();
			var bPressed = oEvent.oSource.getProperty("pressed");
			var sOldStatus = oEvent.getSource().data("currentStatus");
			ctl.changeChecklistTaskStatus("NA", bPressed, sOldStatus, true);
			ctl.closeDialog(oEvent);
		},
		/**
		 * Handle click on a checklist task instruction
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCheckListTaskInstructionPress: function(oEvent){
			ctl.openUrl(oEvent.getSource().getProperty("target"));
		},
		/**
		 * Handle modification of a checklist task measure
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleMeasureChange: function(oEvent){
			var sPath  = oEvent.getSource().getParent().getBindingContextPath();
			var sValue = oEvent.oSource.getProperty("value");
			sValue = sValue.replace(",", ".");
			ctl.submitCheckListTaskMeasure(sPath, sValue);
		},
		/**
		 * Handle modification of a checklist task comment
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleTaskCommentChange: function(oEvent){
			var sPath  = ctl.sCheckListTaskPath;
			var sValue = oEvent.oSource.getProperty("value");
			ctl.submitCheckListTaskComment(sPath, sValue);
		},
		/**
		 * Handle click on "Take picture" for a checklist task
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleTaskCapture: function(oEvent){
			ctl.takePicture(oEvent, ctl.submitTaskPicture);
		},
		/**
		 * Handle click on "Picture library" for a checklit task
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleTaskLibrary: function(oEvent){
			ctl.getPictureFromGallery(oEvent, ctl.submitTaskPicture);
		},
		/**
		 * Handle click on "Remove picture" on a checklist task
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleTaskRemovePict: function(oEvent){
			ctl.deleteTaskPicture();
		},
		/**
		 * Handle click on "Take picture" for checklist task's findings
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleFindingCapture: function(oEvent){
			ctl.takePicture(oEvent, ctl.submitFindingPicture);
		},
		/**
		 * Handle click on "Picture library" for checklist task's findings
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleFindingLibrary: function(oEvent){
			ctl.getPictureFromGallery(oEvent, ctl.submitFindingPicture);
		},
		/**
		 * Handle click on "Remove picture" for checklist task's findings
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleFindingRemovePict: function(oEvent){
			ctl.deleteFindingPicture();
		},
		/**
		 * Open form to create a confirmation
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCreateConfirmation: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragment();
		},
		/**
		 * Open form to edit a confirmation
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleEditConfirmations: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragmentForEdit(oEvent.getSource().getParent().getBindingContextPath());
		},
		/**
		 * Open form and fill it to cipy a confirmation
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCopyConfirmations: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragmentForCopy(oEvent.getSource().getParent().getParent().getBindingContextPath());
		},
		/**
		 * Open form with confirmation draft and actual time as ending time
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleEndConfirmations: function(oEvent){
			ctl.createOrderOperationConfirmation.open();
			ctl.initCreateOrderOperationConfirmationFragmentForEnding(oEvent.getSource().getParent().getParent().getBindingContextPath());
		},
		/**
		 * Handle search bar modification for activity type search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSearchActtype: function(oEvent){
			ctl.searchActtype(oEvent.getParameter("value"));
		},
		/**
		 * Handle search bar modification for employee number search help
		 * @param{sap.ui.base.Event} oEvent:
		 */
		handleSearchEmployeenumber: function(oEvent){
			ctl.searchEmployeenumber(oEvent.getParameter("value"));
		},
		/**
		 * Handle click on final confirmation checkbox
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleFinConfSelect: function(oEvent) {
			if (oEvent.getParameter("selected")) {
				ctl.getView().getModel("InputModel").setProperty("/FinConf", "X");
			} else {
				ctl.getView().getModel("InputModel").setProperty("/FinConf", "");
			}
		},
		/**
		 * Handle click on "-" button for withdrawn quantity
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleDecrementWithdQuanDelta: function(oEvent){
			var oView = ctl.getView();
			var oModel = oView.getModel("plant");
			var sPath = oEvent.oSource.getParent().getParent().getBindingContextPath();
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
		 * Handle direct input in withdrawn quantity
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleChangeWithdQuanDelta: function(oEvent){
			var oModel = ctl.getView().getModel("plant");
			var sPath = oEvent.oSource.getParent().getParent().getBindingContextPath();
			var iValue = oModel.getProperty(sPath + "/WithdQuanDelta");
			if (isNaN(parseInt(iValue)) || (iValue < 0)){
				iValue = 0;
			} else {
				iValue = oEvent.oSource.getProperty("value");
			}

			if(oModel.sChangeKey) {                   
				oModel.sChangeKey = undefined;                   
			}
			oModel.setProperty(sPath + "/WithdQuanDelta", iValue.toString());

			ctl.bufferWithdQuanDeltaChange(sPath, iValue.toString());
		},
		/**
		 * handle click on "+" button for withdrawn quantity
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleIncrementWithdQuanDelta: function(oEvent){
			var oView = ctl.getView();
			var oModel = oView.getModel("plant");
			var sPath = oEvent.oSource.getParent().getParent().getBindingContextPath();
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
		 * Not used
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleWithdrawnSelect: function(oEvent){
			var sPath = oEvent.oSource.getParent().getBindingContextPath();
			ctl.bufferWithdrawnChange(sPath, oEvent.oSource.getProperty("selected"));
		},
		/**
		 * Handle click on submit button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSubmitButton: function(oEvent){
			switch (ctl.oView.byId("mainIconTabBar").getSelectedKey()){
			case "Info":
				ctl.handleSubmitOrderInfo(oEvent);
				break;
			case "Confirmations":
				ctl.handleSubmitComponentConfirmation(oEvent);
				break; 
			default: 
				return;
			}
		},
		/**
		 * handle click on Release button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleReleaseButton: function(oEvent){
			ctl.submitOrderRelease();
		},

		/**
		 * Get model for order detail data
		 * @returns{sap.ui.model.JSONModel}
		 */
		getDetailModel: function() {
			var oDetail = ctl.getView().byId("InfoOrderForm");
			return oDetail.getModel('InfoOrderForm');
		},

		/**
		 * Event handler for Review event
		 * @param {sap.ui.base.Event} oEvent event
		 */
		handleReviewButton: function(oEvent) {
			ctl.setEditSpareParts(true);
			var oModel = ctl.getDetailModel();
			var aComponents = $.isEmptyObject(oModel) ? [] : oModel.getProperty("/OrderComponent");

			ctl._ItemNumber = 1;
			if (!$.isEmptyObject(aComponents)) {
				$.each(aComponents, function(key, element) {
					var iItemNumber = parseInt(element.ItemNumber);
					if (iItemNumber >= ctl._ItemNumber) {
						ctl._ItemNumber = iItemNumber;
					}
				});
				ctl._ItemNumber++;
			}

			ctl._delta = {
					deleted: {
						OrderComponent: []
					}
			};


			ctl.setEditOrderHeader(true);

			ctl.setReviewButton(false);
			ctl.setSendMailButton(false);
			ctl.setSaveButton(true);
		},
		/**
		 * Handle click on submit button to save order info
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSubmitOrderInfo: function(oEvent){
			ctl.submitOrderInfo();
		},
		/**
		 * Handle click on submit confirmation button
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleSubmitComponentConfirmation: function(oEvent){
			ctl.submitComponentConfirmation();
		},
		/**
		 * Handle press on a confirmation to open dialog with comment
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
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
		 * Handle confirmation selection with checkbox
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
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
		 * handle click on "Mass copy" button: opens a dialog with copy parameters
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleConfirmationMassCopy: function(oEvent){
			ctl.searchEmployeenumberByWorkCenter(ctl.getPlanPlant(), "");

			/* Initialize select for WorkCenters with current workcenter */
			ctl.getView().getModel("ViewModel").setProperty("/Planplant", ctl.getPlanPlant());

			ctl.getView().getModel("ViewModel").setProperty("/EmployeeNumberByWorkCenterCallback", ctl.confirmationMassCopy);

			ctl.employeeNumberByWorkCenterSelect.open();			
		},
		/**
		 * Handle click on button "Create notification from findings"
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCreateNotificationFromFinding: function(oEvent){
			ctl.createNotificationFromFinding();
		},
		/**
		 * Handle answer Yes when user is asked to create a notification from a KO checklist task
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleCreateNotificationFromTask: function(oEvent){
			ctl.createNotificationFromTask();
		},

		/************************************************************************/
		/*   SEARCH HELP														*/
		/************************************************************************/
		/**
		 * Search for a functional location using superior node and workcenter
		 * @param{string} workcenter: Work center
		 * @param{string} parent: parent node in functional location hierarchy
		 */
		searchFunctionalLocation: function (workcenter, parent) {
			/* Research of function functional locations for matchcode, into list */

			/* Deletion of existing items */
			sap.ui.getCore().byId("funcLocationTableMyWorkOrders").unbindItems();

			/* Filters' definition */
			var aFilters = [];
			var oFilterWorkCenter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, workcenter);
			var oFilterSupFuncLoc = new sap.ui.model.Filter("Supfloc", sap.ui.model.FilterOperator.EQ, parent);
			if (!window.cordova) {
				aFilters.push(oFilterWorkCenter);
			}
			aFilters.push(oFilterSupFuncLoc);

			/* Search and bind data */
			sap.ui.getCore().byId("funcLocationTableMyWorkOrders").bindItems({
				path: "plant>/FuncLocSet",
				template: new sap.m.ColumnListItem("funcLocationTableListItemMyWorkOrders", {
					type: "Navigation",
					press: function(evt) {
						return ctl.handleFunctionalLocationPress(evt)
					},
					cells: [
					        new sap.m.Button({
					        	text: ctl.getI18nValue("createNotification.frag.button.select"),
					        	textDirection: "LTR",
					        	enabled: "{= ${plant>Category} !== '1'}",
					        	press: function(evt) {
					        		return ctl.validFunctionalLocation(evt.getSource().getParent().getCells()[1].getText(),
									                                   evt.getSource().getParent().getCells()[2].getText())
					        	}
					        }),
					        new sap.m.ObjectIdentifier({
					        	text: "{plant>Funcloc}"
					        }),
					        new sap.m.ObjectIdentifier({
					        	text: "{plant>Descript}"
					        })
					        ]
				}),
				length : 500,
				filters: aFilters,
				sorter : new sap.ui.model.Sorter("Funcloc", false)
			});

		},
		/**
		 * Copy selected functional location data within model
		 * @param{String} sId : Reference Equipment
		 * @param{String} SDesc : Description
		 */
		validFunctionalLocation: function(sId, sDesc) {
			var oView = ctl.getView(),
			oForm = oView.byId("InfoOrderForm");
			// Update screen
			oForm.getModel("InfoOrderForm").setProperty("/FunctLoc", sId);
			oForm.getModel("InfoOrderForm").setProperty("/Funcldescr", sDesc);
			oForm.getModel("InfoOrderForm").setProperty("/Equipment", "");
			oForm.getModel("InfoOrderForm").setProperty("/Equidescr", "");
			// Update model for input
			oView.getModel("InputModel").setProperty("/FunctLoc", sId);
			oView.getModel("InputModel").setProperty("/Funcldescr", sDesc);
			oView.getModel("InputModel").setProperty("/Equipment", "");
			oView.getModel("InputModel").setProperty("/Equidescr", "");
			ctl.getOwnerComponent().getModel("plant").read("/FuncLocSet('" + sId + "')", {
			    success: function (oData, oResponse) {
			        // Storage Default
			        ctl.StgeLocDefault = oData.StgeLocDefault;
			        ctl.PlantDefault = oData.PlantDefault;
			        // EquiType
			        if (oData.Equitype && oData.Equitype != '') {
			            ctl.Equitype = oData.Equitype;
			        } else {
			            ctl.Equitype = 'ALL';
			        }
			    },
			    error: ctl.oDataCallbackFail
			});
			ctl.functionalLocationSelect.close();
		},
		/**
		 * Copy selected equipment data within model
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validEquipment: function(oEvent) {
			var oView = ctl.getView(),
			oForm = oView.byId("InfoOrderForm");
			var aSelectedEquipments = oEvent.getParameter("selectedContexts");
			if (aSelectedEquipments.length) {
				aSelectedEquipments.map(function(oSelectedEquipment) {
					oForm.getModel("InfoOrderForm").setProperty("/Equipment", oSelectedEquipment.getObject().Equipment);
					oForm.getModel("InfoOrderForm").setProperty("/Equidescr", oSelectedEquipment.getObject().Descript.replace(/[^\w\s]/g, '-'));
					oView.getModel("InputModel").setProperty("/Equipment", oSelectedEquipment.getObject().Equipment);
					oView.getModel("InputModel").setProperty("/Equidescr", oSelectedEquipment.getObject().Descript.replace(/[^\w\s]/g, '-'));
				})
			}
		},
		/**
		 * Copy selected priority data within model
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validPriority: function(oEvent) {
			var oView = ctl.getView(),
			oForm = oView.byId("InfoOrderForm");
			oForm.getModel("InfoOrderForm").setProperty("/Priority", oEvent.getSource().getSelectedKey());
			oForm.getModel("InfoOrderForm").setProperty("/PriorityText", oEvent.getSource().getSelectedItem().getText().replace(/[^\w\s]/g, '-'));
			oView.getModel("InputModel").setProperty("/Priority", oEvent.getSource().getSelectedKey());
			oView.getModel("InputModel").setProperty("/PriorityText", oEvent.getSource().getSelectedItem().getText().replace(/[^\w\s]/g, '-'));
		},
		/**
		 * Copy order header text within model
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validTextheader: function(oEvent) {
			var oView = ctl.getView(),
			oForm = oView.byId("InfoOrderForm");
			oForm.getModel("InfoOrderForm").setProperty("/Textheader", oEvent.getSource().getValue());
			oView.getModel("InputModel").setProperty("/Textheader", oEvent.getSource().getValue());
		},
		/**
		 * Copy order header ShortText within model
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validShortTextheader: function(oEvent) {
			var oView = ctl.getView(),
			oForm = oView.byId("InfoOrderForm");
			oForm.getModel("InfoOrderForm").setProperty("/ShortText", oEvent.getSource().getValue());
			oView.getModel("InputModel").setProperty("/ShortText", oEvent.getSource().getValue());
		},
		/**
		 * Copy selected damage group data within model
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validDamageGroup: function(oEvent) {
			var view = ctl.getView(),
			oForm = view.byId("InfoNotificationForm"),
			oModel = oForm.getModel("InfoNotificationForm");

			var aSelectedDamageGroups = oEvent.getParameter("selectedContexts");
			if (aSelectedDamageGroups.length) {
				aSelectedDamageGroups.map(function(oSelectedDamageGroup) {
					var aItems = oModel.getProperty("/NotifItem") || [];
					if (aItems.length) {
						var oldGroup = aItems[0]['DCodegrp'];
						aItems[0]['DCodegrp'] = oSelectedDamageGroup.getObject().CodeGroup;
						aItems[0]['StxtGrpcd'] = oSelectedDamageGroup.getObject().ShortText;
					} else {
						var line = {
								DCodegrp: oSelectedDamageGroup.getObject().CodeGroup,
								StxtGrpcd: oSelectedDamageGroup.getObject().ShortText
						}
						aItems.push(line);
					}

					/* Check if value has changed */
					if (oldGroup != aItems[0]['DCodegrp']) {
						aItems[0]['DCode'] = "";
						aItems[0]['TxtProbcd'] = "";
					}
					view.getModel("InputModel").setProperty("/NotifItem", aItems);
					oModel.setProperty("/NotifItem", aItems);
				})
			}

		},
		/**
		 * Copy selected damage code data within model
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validDamageCode: function(oEvent) {
			var view = ctl.getView(),
			oForm = view.byId("InfoNotificationForm"),
			oModel = oForm.getModel("InfoNotificationForm");
			var aSelectedDamageCodes = oEvent.getParameter("selectedContexts");
			if (aSelectedDamageCodes.length) {
				aSelectedDamageCodes.map(function(oSelectedDamageCode) {
					var aItems = oModel.getProperty("/NotifItem") || [];
					if (aItems.length) {
						aItems[0]['DCode'] = oSelectedDamageCode.getObject().Code;
						aItems[0]['TxtProbcd'] = oSelectedDamageCode.getObject().ShortText;
					} else {
						var line = {
								DCode: oSelectedDamageCode.getObject().Code,
								TxtProbcd: oSelectedDamageCode.getObject().ShortText
						}
						aItems.push(line);
					}
					view.getModel("InputModel").setProperty("/NotifItem", aItems);
					oModel.setProperty("/NotifItem", aItems);
				})
			}
		},
		/**
		 * Search for equipment using search bar value
		 * @param{string} filterValue: filter text value
		 */
		searchEquipment: function(filterValue) {
			var oView = ctl.getView();

			/* Deletion of existing items */
			ctl.equipmentSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oFilterWorkCenter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant());
			var oFuncLocFilter = new sap.ui.model.Filter("Funcloc", sap.ui.model.FilterOperator.StartsWith, oView.byId("FunctLoc").getValue());
			if (filterValue != "") {
				/* Only if search field is not empty */
				var oDescriptFilter = new sap.ui.model.Filter(
						"Descript",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var oEquipmentFilter = new sap.ui.model.Filter(
						"Equipment",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oDescriptFilter);
					aFiltersDetail.push(oEquipmentFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oDescriptFilter);
				}
			}
			aFilters.push(oFilterWorkCenter);
			aFilters.push(oFuncLocFilter);

			/* Search and bind data */
			ctl.equipmentSelect.bindAggregation("items", {
				path: "plant>/EquiSet",
				template: new sap.m.StandardListItem({
					title: "{plant>Descript}",
					description: {
						parts: ['plant>Equipment'],
						formatter: ctl.formatRemoveLeadingZeros
					}
				}),
				filters: aFilters
			});
		},
		/**
		 * Search for damage group using search bar value
		 * @param{string} filterValue: filter text value
		 */
		searchDamageGroup: function(filterValue) {
			var oView = ctl.getView();

			/* Deletion of existing items */
			ctl.damageGroupSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oPlanPlantFilter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant());
			var oEquitypeFilter = new sap.ui.model.Filter("Equitype", sap.ui.model.FilterOperator.EQ, ctl.Equitype)

			aFilters.push(oPlanPlantFilter);
			aFilters.push(oEquitypeFilter);

			if (filterValue != "") {
				/* Only if search field is not empty */
				var oDescriptFilter = new sap.ui.model.Filter(
						"ShortText",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var oDamageGroupFilter = new sap.ui.model.Filter(
						"CodeGroup",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oDescriptFilter);
					aFiltersDetail.push(oDamageGroupFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oDamageGroupFilter);
				}
			}

			/* Search and bind data */
			ctl.damageGroupSelect.bindAggregation("items", {
				model: "plant",
				path: "/DamageGroupSet",
				template: new sap.m.StandardListItem({
					title: "{plant>ShortText}",
					description: "{plant>CodeGroup}"
				}),
				filters: aFilters,
				sorter : new sap.ui.model.Sorter("CodeGroup", false)
			});
		},
		/**
		 * Search for damage code using search bar value
		 * @param{string} filterValue: filter text value
		 */
		searchDamageCode: function(filterValue) {
			var oView = ctl.getView();

			/* Deletion of existing items */
			ctl.damageCodeSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oPlanPlantFilter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant());
			var oEquitypeFilter = new sap.ui.model.Filter("Equitype", sap.ui.model.FilterOperator.EQ, ctl.Equitype)
			aFilters.push(oPlanPlantFilter);
			aFilters.push(oEquitypeFilter);

			var oDamageGroupFilter = new sap.ui.model.Filter("CodeGroup", sap.ui.model.FilterOperator.EQ, this.byId("DCodegrp").getValue())
			if (filterValue != "") {
				/* Only if search field is not empty */
				var oDescriptFilter = new sap.ui.model.Filter(
						"ShortText",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				var oDamageCodeFilter = new sap.ui.model.Filter(
						"Code",
						sap.ui.model.FilterOperator.Contains,
						filterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oDescriptFilter)
					aFiltersDetail.push(oDamageCodeFilter)
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oDamageCodeFilter);
				}
			}
			aFilters.push(oDamageGroupFilter);

			/* Search and bind data */
			ctl.damageCodeSelect.bindAggregation("items", {
				model: "plant",
				path: "/DamageCodeSet",
				template: new sap.m.StandardListItem({
					title: "{plant>ShortText}",
					description: "{plant>Code}"
				}),
				filters: aFilters,
				sorter : new sap.ui.model.Sorter("Code", false)
			});
		},
		/**
		 * Search for employee number using search bar value and workcenter
		 * @param{string} sPlanPlant: workcenter
		 * @param{string} sFilterValue: filter text value
		 */
		searchEmployeenumberByWorkCenter: function(sPlanPlant, sFilterValue){
			var aFilters = [];

			var oPlanPlantFilter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, sPlanPlant);
			if (sFilterValue && sFilterValue != "") {
				/* Only if search field is not empty */
				var oUserFullnameFilter = new sap.ui.model.Filter(
						"UserFullname",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				var oPersonNoFilter = new sap.ui.model.Filter(
						"PersonNo",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oUserFullnameFilter);
					aFiltersDetail.push(oPersonNoFilter);
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

			var oBindingInfo = sap.ui.getCore().byId("employeeNumberByWorkCenterTable").getBindingInfo("items");
			oBindingInfo.filters = aFilters;
			sap.ui.getCore().byId("employeeNumberByWorkCenterTable").bindAggregation("items", oBindingInfo);
		},
		/**
		 * Search for checklist using search bar value
		 * @param{string} sFilterValue: filter text value
		 */
		searchChecklist: function(sFilterValue){
			var oView = ctl.getView();

			/* Funct Location */ 
			const cSeparator = "-"; 
			var sFunctLoc = ctl.getView().byId("FunctLoc").getProperty("value");

			/* Split of functional location's different levels */
			var aLevels = sFunctLoc.split(cSeparator);

			/* Building of selection key */
			var sFuncLocSearchKey = aLevels[0];

			/* Deletion of existing items */
			ctl.checklistSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oFunctLocFilter = new sap.ui.model.Filter("ChklstSiteId", sap.ui.model.FilterOperator.EQ, sFuncLocSearchKey);
			var oInactiveFilter = new sap.ui.model.Filter("Inactive", sap.ui.model.FilterOperator.EQ, " ");
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
			aFilters.push(oFunctLocFilter);
			aFilters.push(oInactiveFilter);
			if (window.cordova){
				ctl.checklistSelect.setGrowingThreshold(100);
			}

			var oBindingInfo = ctl.checklistSelect.getBindingInfo("items");
			oBindingInfo.filters = aFilters;
			oBindingInfo.sorter = new sap.ui.model.Sorter('ChklstId', true);
			ctl.checklistSelect.bindAggregation("items", oBindingInfo);

		},
		/**
		 * Assign checklist to activty
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
		/**
		 * Search for activity type using search bar value
		 * @param{string} sFilterValue: filter text value
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
		 * Read activity type data after selecting it
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		validActtype: function(oEvent){
			var aSelectedActtype = oEvent.getParameter("selectedContexts")
			if (aSelectedActtype.length) {
				var oView = ctl.getView();
				aSelectedActtype.map(function(oSelectedActtype) {
					ctl.readActtype(oSelectedActtype.getPath());
				})
			}
		},
		/**
		 * Search for employee number using search bar value
		 * @param{string} sFilterValue: filter text value
		 */
		searchEmployeenumber: function(sFilterValue){
			var oView = ctl.getView();

			/* Deletion of existing items */
			ctl.employeeNumberSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			if (sFilterValue != "") {
				/* Only if search field is not empty */
				var oUserFullnameFilter = new sap.ui.model.Filter(
						"UserFullname",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				var oPersonNoFilter = new sap.ui.model.Filter(
						"PersonNo",
						sap.ui.model.FilterOperator.Contains,
						sFilterValue
				);
				if (window.cordova) {
					var aFiltersDetail = [];
					aFiltersDetail.push(oUserFullnameFilter);
					aFiltersDetail.push(oPersonNoFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oUserFullnameFilter);
				}
			}

			/* Search and bind data */
			ctl.employeeNumberSelect.bindAggregation("items", {
				path: "/EmployeeSet",
				template: new sap.m.StandardListItem({
					title: "{UserFullname}",
					description: "{PersonNo}"
				}),
				filters: aFilters,
				sorter : new sap.ui.model.Sorter('UserFullname', false)
			});
		},
		/**
		 * Copy selected employee data within model to create time entry
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		handleTimesheetEmployeePress: function(oEvent){
			ctl.assignEmployee(oEvent.oSource.getBindingContextPath());
			ctl.employeeNumberByWorkCenterSelect.close();
		},
		/**
		 * assign Employee from Path
		 * @param sPath: Path of the employee
		 */
		assignEmployee: function(sPath){
			ctl.getView().getModel().read(sPath,{
				success: function(oData){
					ctl.getView().getModel("InputModel").setProperty("/Employeenumber", oData.PersonNo);
					ctl.getView().getModel("InputModel").setProperty("/UserFullname", oData.UserFullname);
					// Keep Employee Number
					ctl.getOwnerComponent().getModel("app").setProperty('/lastSelectedEmployee', sPath);
				}
			})
		},

		/************************************************************************/
		/*   DISPLAY MANAGEMENT													*/
		/************************************************************************/
		/**
		 * Set screen elements to be displayed for a manager
		 */
		managerDisplay: function(){
			if (ctl.getDetailModel().getData().InProcess != "X" &&
					ctl.getDetailModel().getData().Complete != "X" ){
				ctl.getView().byId("buttonRelease").setVisible(true);
			}else{
				ctl.getView().byId("buttonRelease").setVisible(false);
			}
			ctl.setReviewButton(true);
			ctl.setSendMailButton(true);
			ctl.getView().byId("buttonAssignExpert").setVisible(true);

			ctl.getView().getModel("ViewModel").setProperty("/Manager", "X");
		},
		/**
		 * Set screen elements to be displayed for a technician
		 */
		technicianDisplay: function(){
			ctl.getView().byId("buttonRelease").setVisible(false);
			ctl.setReviewButton(true);
			ctl.setSendMailButton(true);
			ctl.getView().byId("buttonAssignExpert").setVisible(false);

			ctl.getView().getModel("ViewModel").setProperty("/Manager", " ");
		},
		/**
		 * Get advancement percentage for checklist tasks
		 * @param{array} aCheckListTask: array of checklist tasks
		 * @returns{float}
		 */
		displayActivityCheckListProgress: function(aCheckListTask){
			if(aCheckListTask.length == 0){
				return 0;
			} else {
				ctl.getCheckListTaskPercentage(aCheckListTask);
				return ctl.oChecklistPercentage.percent;
			}
		},
		/**
		 * Get advancement text for checklist tasks
		 * @param{array} aCheckListTask: array of checklist tasks
		 * @returns{string}
		 */
		displayActivityCheckListQuickInfo: function(aCheckListTask){
			if (!aCheckListTask){
				return "";
			} else if (aCheckListTask && aCheckListTask.length == 0){
				return "";
			} else {
				ctl.getCheckListTaskPercentage(aCheckListTask);
				return ctl.getResourceBundle().getText("workOrderDetails.checklist.task.number", [ctl.oChecklistPercentage.total]);
			}
		},
		/**
		 * Read checklist completion data
		 */
		checkListPercentageLoad: function(){
			ctl.getView().getModel("plant").read(ctl.sCheckListPath+"/OrderOperationCheckListTask", {
				success: function(oData){
					ctl.getCheckListTaskPercentage(oData.results);
					ctl.checkListPercentageDisplay();
				}
			})
		},
		/**
		 * Display checklist advandement data
		 */
		checkListPercentageDisplay: function(){
			ctl.calcCheckListTaskPercentage();
			// Global
			ctl.getView().getModel("ViewModel").setProperty("/CheckListPercent",ctl.oChecklistPercentage.percent);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListQuickInfo",ctl.getResourceBundle().getText("workOrderDetails.checklist.progress.title"));
			// OK
			ctl.getView().getModel("ViewModel").setProperty("/CheckListOKPercent",ctl.oChecklistPercentage.percentOk);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListOKQuickInfo",ctl.getResourceBundle().getText("workOrderDetails.checklist.progress.ok.title"));
			// KO
			ctl.getView().getModel("ViewModel").setProperty("/CheckListKOPercent",ctl.oChecklistPercentage.percentKo);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListKOQuickInfo",ctl.getResourceBundle().getText("workOrderDetails.checklist.progress.ko.title"));

			ctl.getView().getModel("ViewModel").setProperty("/CheckListComplete", ctl.oChecklistPercentage.complete);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListIncomplete", ctl.oChecklistPercentage.incomplete);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListNA", ctl.oChecklistPercentage.na);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListOK", ctl.oChecklistPercentage.ok);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListKO", ctl.oChecklistPercentage.ko);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListTotal", ctl.oChecklistPercentage.total);
			ctl.getView().getModel("ViewModel").setProperty("/CheckListSuperTotal", ctl.oChecklistPercentage.supertotal);
		},

		/**
		 * Helper Function to update upload collection
		 * @param {array} aAttach   array of attachment
		 * **/
		updateUploadCollection: function(boxid, aAttach) {
			var oHbox = ctl.getView().byId(boxid);
			if (!$.isEmptyObject(aAttach)) {
				// remove all items
				oHbox.removeAllItems();
				$.each(aAttach, function(index, imageData) {
					oHbox.addItem(new sap.m.Image({
						press: ctl._enlargeImage,
						width: "100px",
						height: "75px",
						alt: imageData.ObjDescr,
						//src: "data:" + imageData.Mimetype +";base64," + imageData.src
						src: imageData.src
					}).addStyleClass("sapUiTinyMargin"));
				});
			} else {
				oHbox.removeAllItems();
			}
		},

		/************************************************************************/
		/*   FRAGMENT MANAGEMENT												*/
		/************************************************************************/
		/**
		 * Open functional location search help
		 */
		openFunctionalLocationSelect: function() {
			var parent = "";
			ctl.functionalLocationSelect.open();
			ctl.searchFunctionalLocation(ctl.getPlanPlant(), parent);
		},
		/**
		 * Open equipment search help
		 */
		openEquipmentSelect: function() {
			if (ctl.getView().byId("FunctLoc").getValue() == "") {
				sap.m.MessageToast.show(ctl.getI18nValue("createNotification.message.selectFunctionalLocation"));
				return;
			}

			ctl.searchEquipment("");
			ctl.equipmentSelect.setMultiSelect(false)
			ctl.equipmentSelect.open();

		},
		/**
		 * Open damage group search help
		 */
		openDamageGroupSelect: function() {
			ctl.searchDamageGroup("");
			ctl.damageGroupSelect.setMultiSelect(false);
			ctl.damageGroupSelect.open();
		},
		/**
		 * Open damage code search help
		 */
		openDamageCodeSelect: function() {
			if (ctl.getView().byId("DCodegrp").getValue()) {
				ctl.searchDamageCode("");
				ctl.damageCodeSelect.setMultiSelect(false)
				ctl.damageCodeSelect.open();
			} else {
				sap.m.MessageToast.show(ctl.getI18nValue("createNotification.message.selectDamageCode"));
			}
		},
		/**
		 * Init create order operation assignment fragment
		 */
		initCreateOrderOperationAssignmentFragment: function(){
			ctl.initModels();
			ctl.getView().getModel("InputModel").setProperty("/StartTime", "T08:00");
			ctl.getView().getModel("InputModel").setProperty("/EndTime", "T16:45");
		},
		/**
		 * Open employee number search help
		 */
		openEmployeenumberAssignmentSelect: function(){
			ctl.searchEmployeenumberByWorkCenter(ctl.getPlanPlant(), "");

			/* Initialize select for WorkCenters with current workcenter */
			ctl.getView().getModel("ViewModel").setProperty("/Planplant", ctl.getPlanPlant());

			/* Define what will be the callback function after selection */
			ctl.getView().getModel("ViewModel").setProperty("/EmployeeNumberByWorkCenterCallback", ctl.handleExpertEmployeePress);

			ctl.employeeNumberByWorkCenterSelect.open();
		},
		/**
		 * Init add calibrated tool fragment
		 */
		initAddCaliToolFragment: function(){
			ctl.initModels();
		},
		/**
		 * Init create order operation confirmation fragment
		 */
		initCreateOrderOperationConfirmationFragment: function(){
			ctl.sPathConfirmationUpdate = null;
			var oLocalModel = ctl.getView().getModel("ViewModel");

			ctl.initModels();

			sap.ui.getCore().byId("EmployeenumberMyWorkOrders").setEnabled(false);
			sap.ui.getCore().byId("QuantityMyWorkOrders").setEnabled(false);
			sap.ui.getCore().byId("OtCompTypeMyWorkOrders").setEnabled(false);
			sap.ui.getCore().byId("FinConfMyWorkOrders").setSelected(false);
			sap.ui.getCore().byId("WorkdateMyWorkOrders").setEnabled(true);
			sap.ui.getCore().byId("ActtypeMyWorkOrders").setEnabled(true);

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
		 * Init create order operation confirmation fragment in edit mode
		 */
		initCreateOrderOperationConfirmationFragmentForEdit: function(sPath){
			ctl.initCreateOrderOperationConfirmationFragment();
			ctl.sPathConfirmationUpdate = sPath;
			ctl.getView().getModel("ViewModel").setProperty("/ValidateConfirmationFunction", ctl.updateConfirmation);

			// Getting models
			var oView = ctl.getView();
			var oWorkModel = oView.getModel("plant");
			var oInputModel = oView.getModel("InputModel");
			var oLocalModel = oView.getModel("ViewModel");

			// can't modify Employee Number and Workdate
			sap.ui.getCore().byId("EmployeenumberMyWorkOrders").setEnabled(false);
			sap.ui.getCore().byId("WorkdateMyWorkOrders").setEnabled(false);
			sap.ui.getCore().byId("ActtypeMyWorkOrders").setEnabled(false);

			ctl.OrderOperationConfirmationFragmentForEdit = true;
			// Loading of confirmation's values
			oWorkModel.read(sPath,{
				success: function(oData){

					// Employee number
					oInputModel.setProperty("/Employeenumber", oData.Employeenumber);
					oInputModel.setProperty("/UserFullname", oData.UserFullname);

					// Acttype
					var sPathActtype = "/ActTypeSet(CoArea='"+oData.CoArea+"',Acttype='"+oData.Acttype+"')";
					ctl.readActtype(sPathActtype);

					// Date
					oLocalModel.setProperty("/Workdate", Formatter.EDMDateToJSObject(oData.Workdate));

					// Times
					oLocalModel.setProperty("/Starttime", Formatter.EDMTimeToJSObject(oData.Starttime));
					if (oData.Starttime.ms != oData.Endtime.ms){
						oLocalModel.setProperty("/Endtime",   Formatter.EDMTimeToJSObject(oData.Endtime));
					}

					// Finale
					oInputModel.setProperty("/FinConf", oData.FinConf);

					// Compensation mode
					oInputModel.setProperty("/OtCompType", oData.OtCompType);

					// Commentaire
					oInputModel.setProperty("/Text", oData.Text);

				}
			})
		},
		/**
		 * Init create order orperation confirmation by copy
		 * @param{string} sPath: Confirmation URI
		 */
		initCreateOrderOperationConfirmationFragmentForCopy: function(sPath){
			ctl.initCreateOrderOperationConfirmationFragment();

			// Getting models
			var oView = ctl.getView();
			var oWorkModel  = oView.getModel("plant");
			var oInputModel = oView.getModel("InputModel");
			var oLocalModel = oView.getModel("ViewModel");

			ctl.OrderOperationConfirmationFragmentForCopy = true;
			// Loading of confirmation's values
			oWorkModel.read(sPath,{
				success: function(oData){
					// Acttype
					var sPathActtype = "/ActTypeSet(CoArea='"+oData.CoArea+"',Acttype='"+oData.Acttype+"')";
					ctl.readActtype(sPathActtype);

					// Date
					oInputModel.setProperty("/Workdate", oData.Workdate);

					//Times
					oLocalModel.setProperty("/Starttime", Formatter.EDMTimeToJSObject(oData.Starttime));
					oLocalModel.setProperty("/Endtime",   Formatter.EDMTimeToJSObject(oData.Endtime));

					// Finale
					oInputModel.setProperty("/FinConf", oData.FinConf);

					// Compensation mode
					oInputModel.setProperty("/OtCompType", oData.OtCompType);

					// Commentaire
					oInputModel.setProperty("/Text", oData.Text);

					// Opening of Employee number search help
					ctl.openEmployeenumberSelect();
				}
			})

		},
		/**
		 * Init create order operation form to end draft
		 * @param{string} sPath: confirmation URI
		 */
		initCreateOrderOperationConfirmationFragmentForEnding: function(sPath){
			ctl.initCreateOrderOperationConfirmationFragmentForEdit(sPath);
			ctl.sPathConfirmationUpdate = sPath;
			ctl.getView().getModel("ViewModel").setProperty("/ValidateConfirmationFunction", ctl.updateConfirmation);

			// Getting models
			var oView = ctl.getView();
			var oWorkModel = oView.getModel("plant");
			var oInputModel = oView.getModel("InputModel");
			var oLocalModel = oView.getModel("ViewModel");

			// Loading of confirmation's values
			oWorkModel.read(sPath,{
				success: function(oData){

					// Employee number
					oInputModel.setProperty("/Employeenumber", oData.Employeenumber);
					oInputModel.setProperty("/UserFullname", oData.UserFullname);

					// Acttype
					var sPathActtype = "/ActTypeSet(CoArea='"+oData.CoArea+"',Acttype='"+oData.Acttype+"')";
					ctl.readActtype(sPathActtype);

					// Date
					oLocalModel.setProperty("/Workdate", Formatter.EDMDateToJSObject(oData.Workdate));

					// Times
					oLocalModel.setProperty("/Starttime", Formatter.EDMTimeToJSObject(oData.Starttime));
					oLocalModel.setProperty("/Endtime",   new Date());

					// Finale
					oInputModel.setProperty("/FinConf", oData.FinConf);

					// Compensation mode
					oInputModel.setProperty("/OtCompType", oData.OtCompType);

					// Commentaire
					oInputModel.setProperty("/Text", oData.Text);

				}
			})
		},
		/**
		 * Manage screen elements to create internal confirmation
		 */	
		internalConfirmationDisplay: function(){
			var oView = ctl.getView();
			var oInputModel = oView.getModel("InputModel");
			var oLocalModel = oView.getModel("ViewModel");
			oLocalModel.setProperty("/Quantity","");

			if (ctl.OrderOperationConfirmationFragmentForEdit === false){
				sap.ui.getCore().byId("EmployeenumberMyWorkOrders").setEnabled(true);
				// Last Employee number used
				if (!oInputModel.getProperty("/Employeenumber") && ctl.getOwnerComponent().getModel("app").getProperty('/lastSelectedEmployee')){
					ctl.assignEmployee(ctl.getOwnerComponent().getModel("app").getProperty('/lastSelectedEmployee'));
				}
			}
			sap.ui.getCore().byId("QuantityMyWorkOrders").setEnabled(false);
			sap.ui.getCore().byId("OtCompTypeMyWorkOrders").setEnabled(true);
			if (ctl.OrderOperationConfirmationFragmentForCopy === false){
				sap.ui.getCore().byId("OtCompTypeMyWorkOrders").setSelectedKey("1");
			}
		},
		/**
		 * Manage screen elements to create external confirmations
		 */
		externalConfirmationDisplay: function(){
			var oView = ctl.getView();
			var oLocalModel = oView.getModel("InputModel");
			oLocalModel.setProperty("/Employeenumber","");
			oLocalModel.setProperty("/UserFullname","");
			oLocalModel.setProperty("/Acttype","");
			oLocalModel.setProperty("/ActtypeName","");

			if (ctl.OrderOperationConfirmationFragmentForEdit === false){
				sap.ui.getCore().byId("EmployeenumberMyWorkOrders").setEnabled(false);	
			}
			sap.ui.getCore().byId("QuantityMyWorkOrders").setEnabled(true);
			sap.ui.getCore().byId("OtCompTypeMyWorkOrders").setEnabled(false);
			sap.ui.getCore().byId("OtCompTypeMyWorkOrders").setSelectedKey("");
		},
		/**
		 * Open search help for checklist
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		openChecklistSelect: function(oEvent){   
			// Define Path for activity
			ctl.sActivityPathForChecklist = oEvent.oSource.oParent.oParent.getBindingContextPath(); 		    		
			ctl.searchChecklist("");
			ctl.checklistSelect.setMultiSelect(false);
			ctl.checklistSelect.open();
		},
		/**
		 * Open search help for activity type
		 */
		openActivityTypeSelect: function(){    		    		
			ctl.searchActtype("");
			ctl.activityTypeSelect.setMultiSelect(false);
			ctl.activityTypeSelect.open();
		},
		/**
		 * Open search help for employee number
		 */
		openEmployeenumberSelect: function(){

			ctl.searchEmployeenumberByWorkCenter(ctl.getPlanPlant(), "");

			/* Initialize select for WorkCenters with current workcenter */
			ctl.getView().getModel("ViewModel").setProperty("/Planplant", ctl.getPlanPlant());

			/* Define what will be the callback function after selection */
			ctl.getView().getModel("ViewModel").setProperty("/EmployeeNumberByWorkCenterCallback", ctl.handleTimesheetEmployeePress);

			ctl.employeeNumberByWorkCenterSelect.open();

		},
		/**
		 * Open checklist task modal
		 */
		openTask: function(){

			// Getting models
			var oView = ctl.getView();
			// Load task data
			ctl.readChecklistTask();

			ctl.manageChecklistTask.open();	

		},
		/**
		 * Close calibration tool search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		closeAddCaliToolDialog: function(oEvent){
			ctl.initModels();
			ctl.closeDialog(oEvent);
		},
		/**
		 * Close create confirmation dialog
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		closeCreateConfirmationDialog: function(oEvent){
			ctl.initModels();
			ctl.closeDialog(oEvent);
		},
		/**
		 * Close create assignment search help
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		closeCreateAssignmentDialog: function(oEvent){
			ctl.initModels();
			ctl.closeDialog(oEvent);
		},
		/**
		 * Close dialog
		 * @param{sap.ui.base.Event} oEvent: event that triggered the function
		 */
		closeDialog: function(oEvent) {
			oEvent.oSource.oParent.close();
		},

		/************************************************************************/
		/*   PICTURES AND DOCUMENTS                                             */
		/************************************************************************/
		/**
		 * Handle click on "Take picture"
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		capture: function(evt) {
			ctl.takePicture(evt, ctl._addPicture);
		},
		/**
		 * Handle click on "Select picture" button
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		library: function(evt) {
			ctl.getPictureFromGallery(evt, ctl._addPicture);
		},
		/**
		 * Handle click on "Remove pictures" button
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		handleremoveAllPics:function(evt){
			ctl.removeOrderPicture = true;
			ctl.removeAllPics(evt);
		},
		/**
		 * Remove pictures from work order
		 * @param{sap.ui.base.Event} evt: event that triggered the function
		 */
		removeAllPics: function(evt) {
			ctl.getView().byId("library").setEnabled(true);
			ctl.getView().byId("camera").setEnabled(true);
			if (ctl.imageData) {
				ctl.imageData = [];
			}
			ctl.getView().byId("uploadCollectionMyWorkOrder").removeAllItems();
		},
		/**
		 * Add picture to work order
		 * @param{blob} imageData: Raw data for image
		 * @param{sap.m.Image} image: Image element
		 */
		_addPicture: function(imageData, image) {
			if (!ctl.imageData) {
				ctl.imageData = [];
			}

			ctl.imageData.push(imageData);

			ctl.getView().byId("uploadCollectionMyWorkOrder").addItem(image);
			if (ctl.getView().byId("uploadCollectionMyWorkOrder").getItems().length >= 2) {
				ctl.getView().byId("library").setEnabled(false);
				ctl.getView().byId("camera").setEnabled(false);
			}
		},

		/************************************************************************/
		/*   TREATMENTS															*/
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
		 * Calculate advancement percentage of checklist
		 */
		calcCheckListTaskPercentage: function(){

			ctl.oChecklistPercentage.total      = ctl.oChecklistPercentage.supertotal - ctl.oChecklistPercentage.na;
			ctl.oChecklistPercentage.complete   = ctl.oChecklistPercentage.ok + ctl.oChecklistPercentage.ko;
			ctl.oChecklistPercentage.percent    = ctl.oChecklistPercentage.complete * 100 / ctl.oChecklistPercentage.total;
			ctl.oChecklistPercentage.percentOk  = ctl.oChecklistPercentage.ok * 100 / ctl.oChecklistPercentage.total;
			ctl.oChecklistPercentage.percentKo  = ctl.oChecklistPercentage.ko * 100 / ctl.oChecklistPercentage.total;
			ctl.oChecklistPercentage.incomplete = ctl.oChecklistPercentage.total - ctl.oChecklistPercentage.complete;

		},
		/**
		 * Retrieve advancement percentage for tasks
		 * @param{array} aTasks: tasks array
		 */
		getCheckListTaskPercentage: function(aTasks){
			ctl.oChecklistPercentage = {};
			ctl.oChecklistPercentage.ok = 0;
			ctl.oChecklistPercentage.ko = 0; 
			ctl.oChecklistPercentage.na = 0; 
			ctl.oChecklistPercentage.supertotal = aTasks.length;
			$.each(aTasks, function(index, oValue){
				switch(oValue.Statut){
				case "OK":
					ctl.oChecklistPercentage.ok++;
					break;
				case "KO":
					ctl.oChecklistPercentage.ko++;
					break;
				case "NA":
					ctl.oChecklistPercentage.na++;
					break;
				}
			})

			ctl.calcCheckListTaskPercentage();

		},
		/**
		 * Reduce other status number when a checklist task status is selected
		 * @param{sap.m.Button} oButton: button that was clicked on
		 */
		decrementOtherStatus: function(oButton){
			$.each(oButton.getParent().mAggregations.contentRight, function(index, oValue){
				if(oValue.sId != oButton.sId && oValue.getProperty("pressed") == false){
					switch(oValue.getProperty("text")){
					case "KO", "NOK":
						ctl.oChecklistPercentage.ko--;
					break;
					case "OK":
						ctl.oChecklistPercentage.ok--;
						break;
					case "NA", "N/A":
						ctl.oChecklistPercentage.na--;
					break;
					}
				}
			})
		},
		/**
		 * Add picture to checklist
		 * @param{sap.ui.base.Event} oValue: not used
		 * @param{function} callback: callback function
		 */
		pictureCheckList: function (oValue, callback){
			/*PICTURE*/
			var Attach = oValue.OrderOperationCheckListTaskAttach || oValue.OrderOperationCheckListAttach;
			if (Attach && Attach.__deferred) {
				var sPath = null;
				if (window.cordova) {
					sPath = Attach.__deferred.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri, "");
				} else {
					sPath = Attach.__deferred.uri.substring(Attach.__deferred.uri.lastIndexOf("/"));
					var rest = Attach.__deferred.uri.replace(sPath, "");
					sPath = rest.substring(rest.lastIndexOf("/")) + sPath;
				}
				var sPathRoot = sPath.replace(sPath.substring(sPath.lastIndexOf('/')), "")
				ctl.getView().getModel("plant").read(sPath, {
					success: function(oData, response) {
						if (!$.isEmptyObject(oData.results)) {
							$.each(oData.results, function(key, attachData) {
								if (window.cordova) {
									ctl.CheckListAttachment[sPathRoot] = attachData.__metadata.media_src;
								} else {
									ctl.CheckListAttachment[sPathRoot] = attachData.__metadata.media_src.substring(attachData.__metadata.media_src.lastIndexOf("/"));
									var rest = attachData.__metadata.media_src.replace(ctl.CheckListAttachment[sPathRoot], "");
									ctl.CheckListAttachment[sPathRoot] = kalydia.logon.ApplicationContext.applicationEndpointURL + rest.substring(rest.lastIndexOf("/")) + ctl.CheckListAttachment[sPathRoot];
								}
								if (ctl.CheckListAttachment[sPathRoot]){
									var xhr = new XMLHttpRequest();
									xhr.open("GET", ctl.CheckListAttachment[sPathRoot], true);
									xhr.responseType = "arraybuffer";
									xhr.onreadystatechange = function() {
										if (xhr.readyState === 4) {
											if (xhr.status === 200) {
												console.log(xhr);
											} else {
												ctl.addMessage("OfflineStoreError", sap.ui.core.MessageType.Error, "Request failed! Status: " + xhr.status);
												console.error("Request failed! Status: " + xhr.status);
											}
										}
									}
									xhr.onload = function (oEvent) {
										var arrayBuffer = xhr.response;
										if (arrayBuffer) {
											ctl.CheckListAttachmentByte[sPathRoot] = new Uint8Array(arrayBuffer);
										}
									};

									xhr.send(null);
								}
							});
							if (callback){
								callback();
							}
						} else {
							ctl.CheckListAttachment[sPathRoot] = "";
						}

					},
					error: ctl.oDataCallbackFail
				});
			}
		},
		/**
		 * Generate checklist structure for display
		 * @param{JSON} oData:
		 */
		generatePreventiveCheckListStructure: function(oData){
			/* Filters initialisation */
			var oBindingInfo = ctl.getView().byId("CheckListLevel").getBindingInfo("items");
			oBindingInfo.path = "/aChklstLoc2";
			ctl.getView().byId("CheckListLevel").bindAggregation("items", oBindingInfo);

			var oModelLocal = ctl.getView().getModel("ViewModel");
			oModelLocal.setProperty("/bChklstLoc",false);
			oModelLocal.setProperty("/bChklstLoc2",false);
			oModelLocal.setProperty("/bChklstLoc3",false);
			oModelLocal.setProperty("/bChklstLoc4",false);

			ctl.checkListFilter2 = "";
			ctl.checkListFilter3 = "";
			ctl.checkListFilter4 = "";

			var oChklstLoc1 = {};
			oChklstLoc1.aChklstLoc2 = [];

			$.each(oData.results, function(index, oValue){
				/*PICTURE*/
				ctl.pictureCheckList(oValue);

				/* FILTER */
				if(oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2]){
					/* First level exists */
					if(oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2].aChklstLoc3[oValue.ChklstLoc3]){
						/* Second level exists */
						if(oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2].aChklstLoc3[oValue.ChklstLoc3].aChklstLoc4[oValue.ChklstLoc4]){
							/* Third level exists */
							oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2].aChklstLoc3[oValue.ChklstLoc3].aChklstLoc4[oValue.ChklstLoc4].iCount++;
						} else {
							/* Third level does not exist */
							var oChklstLoc4 = {};
							oChklstLoc4.sPath  = oValue.ChklstLoc4;
							oChklstLoc4.iCount = 1;
							oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2].aChklstLoc3[oValue.ChklstLoc3].aChklstLoc4[oValue.ChklstLoc4] = oChklstLoc4;
						}
						oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2].aChklstLoc3[oValue.ChklstLoc3].iCount++;

					} else {
						/* Second level does not exist */
						var oChklstLoc3 = {};
						var oChklstLoc4 = {};

						oChklstLoc4.sPath  = oValue.ChklstLoc4;
						oChklstLoc4.iCount = 1;

						oChklstLoc3.sPath  = oValue.ChklstLoc3;
						oChklstLoc3.iCount = 1;
						oChklstLoc3.aChklstLoc4 = [];
						oChklstLoc3.aChklstLoc4[oValue.ChklstLoc4] = oChklstLoc4;

						oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2].aChklstLoc3[oValue.ChklstLoc3] = oChklstLoc3;
					}

					oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2].iCount++;

				} else {
					/* First level does not exist, we create all levels */
					var oChklstLoc2 = {};
					var oChklstLoc3 = {};
					var oChklstLoc4 = {};

					oChklstLoc4.sPath = oValue.ChklstLoc4;
					oChklstLoc4.iCount = 1;

					oChklstLoc3.sPath = oValue.ChklstLoc3;
					oChklstLoc3.iCount = 1;
					oChklstLoc3.aChklstLoc4 = [];
					oChklstLoc3.aChklstLoc4[oValue.ChklstLoc4] = oChklstLoc4;

					oChklstLoc2.sPath = oValue.ChklstLoc2;
					oChklstLoc2.iCount = 1;
					oChklstLoc2.aChklstLoc3 = [];
					oChklstLoc2.aChklstLoc3[oValue.ChklstLoc3] = oChklstLoc3;

					oChklstLoc1.aChklstLoc2[oValue.ChklstLoc2] = oChklstLoc2;
				}
			})

			for(var loc2 in oChklstLoc1.aChklstLoc2) {
				for(var loc3 in oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3){
					for(var loc4 in oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3[loc3].aChklstLoc4){
						oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3[loc3].aChklstLoc4[loc4].sKey = oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3[loc3].aChklstLoc4.length;
						oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3[loc3].aChklstLoc4.push(oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3[loc3].aChklstLoc4[loc4])
					}
					oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3[loc3].sKey = oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3.length;
					oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3.push(oChklstLoc1.aChklstLoc2[loc2].aChklstLoc3[loc3]);
				}
				oChklstLoc1.aChklstLoc2[loc2].sKey = oChklstLoc1.aChklstLoc2.length;
				oChklstLoc1.aChklstLoc2.push(oChklstLoc1.aChklstLoc2[loc2]);
			}

			ctl.getView().setModel(new JSONModel(oChklstLoc1),"ChecklistTask");
			ctl.setChecklistFilterText();
			ctl.filterCheckListTasks();
		},
		/**
		 * Filter for checklist depending on segment selected
		 */
		filterCheckListTasks: function(){
			var aFilters = [];
			var oBindingInfo = ctl.getView().byId("orderActivityChecklistTaskList").getBindingInfo("items");

			if (ctl.checkListFilter2 && ctl.checkListFilter2 != ""){
				var oFilter2 = new sap.ui.model.Filter("ChklstLoc2", sap.ui.model.FilterOperator.EQ, ctl.checkListFilter2);
				aFilters.push(oFilter2);
			}

			/* We apply filter 3 */
			if (ctl.checkListFilter3 && ctl.checkListFilter3 != ""){
				var oFilter3 = new sap.ui.model.Filter("ChklstLoc3", sap.ui.model.FilterOperator.EQ, ctl.checkListFilter3);
				aFilters.push(oFilter3);
			}

			/* Same here */
			if (ctl.checkListFilter4 && ctl.checkListFilter4 != ""){
				var oFilter4 = new sap.ui.model.Filter("ChklstLoc4", sap.ui.model.FilterOperator.EQ, ctl.checkListFilter4);
				aFilters.push(oFilter4);
			}

			/* Filter on status */
			if (ctl.taskStatus && ctl.taskStatus != "") {
				var oFilter = new sap.ui.model.Filter("Statut", sap.ui.model.FilterOperator.EQ, ctl.taskStatus);
				aFilters.push(oFilter);
			}

			oBindingInfo.filters = aFilters;
			ctl.getView().byId("orderActivityChecklistTaskList").bindAggregation("items", oBindingInfo);

		},
		/**
		 * Creates a notification from checklist findings
		 */
		createNotificationFromFinding: function(){
			ctl.oNotifData = {};
			// Read order data
			ctl.getView().getModel("plant").read(ctl.sOrderPath,{
				success: function(oData){
					ctl.oNotifData.Notiftype  = "FPM";
					ctl.oNotifData.Priority   =  "4";
					ctl.oNotifData.FunctLoc   = oData.FunctLoc;
					ctl.oNotifData.Funcldescr = oData.Funcldescr;
					ctl.oNotifData.Equipment  = oData.Equipment;
					ctl.oNotifData.Equidescr  = oData.Equidescr;
					ctl.oNotifData.ShortText  = ctl.getResourceBundle().getText("workOrderDetails.finding.notification.title", [oData.FunctLoc]);
					ctl.oNotifData.NotifNo = (Math.floor(Math.random() * 999999999) + 999000000000).toString();
					ctl.oNotifData.Planplant = ctl.getPlanPlant();
					ctl.oNotifData.CreatedBy = ctl.getEmployeeData().UserName;
					ctl.oNotifData.Complete = " ";
					ctl.oNotifData.InProcess = " ";
					ctl.oNotifData.NotiftypeText = ctl.oNotifData.Notiftype;
					ctl.oNotifData.PriorityText = ctl.oNotifData.Priority.replace(/[^\w\s]/g, '-');

					// Read checklist data
					ctl.getView().getModel("plant").read(ctl.sCheckListPath,{
						success: function(oData){
							ctl.oNotifData.Notifdesctext = oData.Comment;
							ctl.oNotifData.Aufnr		  = oData.Orderid;
							ctl.oNotifData.Vornr		  = oData.Activity;
							ctl.submitNotification(ctl.sCheckListPath, ctl.setChecklistNotifCreated);
						},
						error: ctl.oDataCallbackFail
					})
				},
				error: ctl.oDataCallbackFail
			})
		},
		/**
		 * Creates a notification from a checklist task
		 */
		createNotificationFromTask: function(){
			ctl.oNotifData = {};
			// Read order data
			ctl.getView().getModel("plant").read(ctl.sOrderPath,{
				success: function(oData){
					ctl.oNotifData.Notiftype  = "FPM";
					ctl.oNotifData.Priority   =  "4";
					ctl.oNotifData.FunctLoc   = oData.FunctLoc;
					ctl.oNotifData.Funcldescr = oData.Funcldescr;
					ctl.oNotifData.Equipment  = oData.Equipment;
					ctl.oNotifData.Equidescr  = oData.Equidescr;
					ctl.oNotifData.NotifNo = (Math.floor(Math.random() * 999999999) + 999000000000).toString();
					ctl.oNotifData.Planplant = ctl.getPlanPlant();
					ctl.oNotifData.CreatedBy = ctl.getEmployeeData().UserName;
					ctl.oNotifData.Complete = " ";
					ctl.oNotifData.InProcess = " ";
					ctl.oNotifData.NotiftypeText = ctl.oNotifData.Notiftype;
					ctl.oNotifData.PriorityText = ctl.oNotifData.Priority.replace(/[^\w\s]/g, '-');

					// Read checklist task data
					ctl.getView().getModel("plant").read(ctl.sCheckListTaskPath,{
						success: function(oData){
							ctl.oNotifData.ShortText      = oData.ChklstLoc4 + oData.TaskId;
							ctl.oNotifData.Notifdesctext  = ctl.getResourceBundle().getText("oData.OrderOperationCheckListTask.TaskId")+": "+oData.TaskDescription;
							ctl.oNotifData.Notifdesctext +=	"\n"+oData.Comment;
							ctl.oNotifData.Aufnr		  = oData.Orderid;
							ctl.oNotifData.Vornr		  = oData.Activity;
							ctl.oNotifData.TaskId		  = oData.TaskId;

							// Read checklist task measures
							ctl.getView().getModel("plant").read(ctl.sCheckListTaskPath+"/OrderOperationCheckListMesure",{
								success: function(oData){
									$.each(oData.results, function(index, oValue){
										ctl.oNotifData.Notifdesctext +=	"\n"+oValue.MeasureDesc+": "+oValue.MeasureValue;
									})
									ctl.submitNotification(ctl.sCheckListTaskPath, ctl.setChecklistTaskNotifCreated);
									ctl.createNotificationDemand.close();
								},
								error: ctl.oDataCallbackFail
							})
						},
						error: ctl.oDataCallbackFail
					})
				},
				error: ctl.oDataCallbackFail
			})
		},
		
		/**
		 * Define number of notification created from the checklist 
		 */
		setChecklistNotifCreated: function() {
			ctl.getView().getModel("plant").update(ctl.sCheckListPath, 
				{
					NotifCreated: 'X'
				},
				{
					error: ctl.oDataCallbackFail,
					merge: true
				}
			)
		},
		
		/**
		 * Define flag value to indicate that a notification has been created
		 */
		setChecklistTaskNotifCreated: function() {
			ctl.getView().getModel("plant").update(ctl.sCheckListTaskPath, 
					{
						NotifCreated: 'X'
					},
					{
						error: ctl.oDataCallbackFail,
						merge: true
					}
				)
		},

		/**
		 * Keep modifications made to withdrawn components into a JSON object 
		 * @param   sPath: path of data record
		 * @param   iValue: withdrawm value
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
					},
					error: ctl.oDataCallbackFail
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
					},
					error: ctl.oDataCallbackFail
				})
			}
		},

		/************************************************************************/
		/*   INPUT VERIFICATION													*/
		/************************************************************************/
		/**
		 * Check that required fields in assignment creation's form are supplied 
		 * @returns {boolean} true if form is complete, false otherwise
		 */
		_checkCreateAssignmentInput: function(){
			var oView = ctl.getView();

			var aInputs = [
			               sap.ui.getCore().byId("EmployeenumberAssignmentMyWorkOrders"),
			               sap.ui.getCore().byId("StartDateAssignmentMyWorkOrders"),
			               sap.ui.getCore().byId("EndDateAssignmentMyWorkOrders")
			               ];

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

			/* Check if we had required input not completed */
			if (incompleteInput == true) {
				sap.m.MessageToast.show(ctl.getI18nValue("common.message.enterRequiredField"), {
					duration: 4000
				});
				return false;
			}

			return true;
		},

		/**
		 * Check that required fields in add cali tool form are supplied 
		 * @param   none
		 * @returns {boolean} true if form is complete, false otherwise
		 */
		_checkAddCaliToolInput: function(){
			var oView = ctl.getView();

			var aInputs = [
			               sap.ui.getCore().byId("SerialNumber"),
			               sap.ui.getCore().byId("IntRefCode")
			               ];

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

			/* Check if we had required input not completed */
			if (incompleteInput == true) {
				sap.m.MessageToast.show(ctl.getI18nValue("common.message.enterRequiredField"), {
					duration: 4000
				});
				return false;
			}

			return true;
		},

		/**
		 * Check that required fields in the confirmation creation's form are supplied
		 * @param   none
		 * @returns {boolean} true if form is complete, false otherwise
		 */
		_checkCreateConfirmationInput: function(){
			var oView = ctl.getView();
			var oModelLocal = oView.getModel("ViewModel");

			var aInputs = [
			               sap.ui.getCore().byId("ActtypeMyWorkOrders"),
			               sap.ui.getCore().byId("EmployeenumberMyWorkOrders"),
			               sap.ui.getCore().byId("QuantityMyWorkOrders"),
			               sap.ui.getCore().byId("WorkdateMyWorkOrders"),
			               sap.ui.getCore().byId("StarttimeMyWorkOrders")
			               ];

			// Start and stop not allow external and only for current date
			if ((oView.getModel("ViewModel").getProperty("/Externe") == "X") ||
					(oView.getModel("ViewModel").getProperty("/Workdate").getTime() != Formatter.getDateAtMidnight().getTime())){
				aInputs.push(sap.ui.getCore().byId("EndtimeMyWorkOrders"));
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
				sap.ui.getCore().byId("EndtimeMyWorkOrders").setValueState(sap.ui.core.ValueState.Error);
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
				oModelWork.read("/OrderOperationConfirmationSet", {  
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

							if ( ( confirmation.Starttime.ms < sStarttime && sStarttime < confirmation.Endtime.ms ) ||
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
		/*   LINKS																*/
		/************************************************************************/
		/**
		 * Open the given URL
		 * @param{string} sUrl: target URL
		 */
		openUrl: function(sUrl){
			sUrl = Formatter.sharepointUrlConverter(sUrl);

			//grab the file and return a promise
			if (window.cordova){
				windowsFolder.getFileAsync(sUrl)
				.then(function(file) {
					//launch the file - this command will let the OS use it's default PDF reader - win 8 app 'reader' works great.
					Windows.System.Launcher.launchFileAsync(file);
				},
				function(){
					var message = ctl.getResourceBundle().getText("documents.message.FileNotExist", [sUrl]);
					sap.m.MessageToast.show(message);
					ctl.addMessage(message, sap.ui.core.MessageType.Error);
				}); 
			}else{
				window.open(sUrl);
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
		 *Calculate delta time between 2 date objects  
		 * @param   start: start date
		 * @param   end: end date
		 * @returns time difference expressed in hours as a time string
		 */
		calcDuration: function(start, end){
			var delta = {
					ms: end.ms - start.ms,
					__edmType: "Edm.Time"
			}
			return ( ( end.ms - start.ms ) / 3600000 ).toFixed(2) + ' H';
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
		 * Define if checklist tab is enabled or disabled
		 * @param{boolean} activity: true if an activity is selected
		 * @param{boolean} checklist: true if checklist is assigned to the activity
		 * @returns{boolean}
		 */
		checklistTabState: function(activity, checklist){
			if(activity == true && checklist == true){
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Format required quantity comparing with avaiable
		 * @param{number} required: required quantity
		 * @param{number} available: avaiable quantity 
		 * @returns{ValueState}
		 */
		requirementQuantityValueState: function(required, available){
			if(parseInt(required) > parseInt(available)){
				return "Error";
			} else if (parseInt(required) == parseInt(available)) {
				return "Warning";
			} else {
				return "None";
			}
		},
		/**
		 * Define icon comparing required quantity with available
		 * @param{number} required: required quantity
		 * @param{number} available: available quantity 
		 * @returns{sap.ui.core.Icon}
		 */
		requirementQuantityIcon: function(required, available){
			if (isNaN(parseInt(available))){
				return "";
			} else if(parseInt(required) > parseInt(available)){
				return "sap-icon://status-error";
			} else if (parseInt(required) == parseInt(available)) {
				return "sap-icon://status-critical";
			} else {
				return "sap-icon://status-completed";
			}
		},
		/**
		 * Define icon color comparing required quantity with avaiable
		 * @param{number} required: required quantity
		 * @param{number} available: avaiable quantity 
		 * @returns{string}
		 */
		requirementQuantityIconColor: function(required, available){
			if (parseInt(required) > parseInt(available)){
				return "red";
			} else if (parseInt(required) == parseInt(available)) {
				return "yellow";
			} else {
				return "green";
			}
		},
		/**
		 * update CheckList Path Text and Breadcrumbs
		 */
		setChecklistFilterText: function(){
			var sText = "";
			var aPath = [];
			if(typeof ctl.checkListFilter2 == "undefined" || ctl.checkListFilter2 == ""){
				sText = ctl.getI18nValue("oData.Checklist.All");
				ctl.getView().getModel("ViewModel").setProperty("/ChecklistTaskFilter", ctl.getI18nValue("oData.Checklist.All"));
			} else {
				sText = ctl.checkListFilter2;
				aPath.push({"sPath":ctl.getI18nValue("oData.Checklist.All")});
				ctl.getView().getModel("ViewModel").setProperty("/ChecklistTaskFilter", ctl.checkListFilter2);
				if(typeof ctl.checkListFilter3 != "undefined" && ctl.checkListFilter3 != "") {
					sText = sText + " > " + ctl.checkListFilter3;
					aPath.push({"sPath":ctl.checkListFilter2});
					ctl.getView().getModel("ViewModel").setProperty("/ChecklistTaskFilter", ctl.checkListFilter3);
					if(typeof ctl.checkListFilter4 != "undefined" && ctl.checkListFilter4 != "") {
						sText = sText + " > " + ctl.checkListFilter4;
						aPath.push({"sPath":ctl.checkListFilter3});
						ctl.getView().getModel("ViewModel").setProperty("/ChecklistTaskFilter", ctl.checkListFilter4);

					}
				}
			}

			ctl.getView().getModel("ViewModel").setProperty("/ChecklistTaskFilterTextPath", sText);
			ctl.getView().getModel("ViewModel").setProperty("/ChecklistTaskFilterPath", aPath);
		},
		/**
		 * Define measure value state depnding on measure
		 * @param{number} measure: measured value
		 * @param{number} min: min value accepted
		 * @param{number} max: max value accepted
		 * @returns{ValueState}
		 */
		measureValueState: function(measure, min, max){
			if((parseInt(min) != 0 && parseInt(measure) < parseInt(min)) || (parseInt(max) != 0 && parseInt(measure) > parseInt(max))){
				return "Error";
			} else {
				return "None";
			}
		},
		/**
		 * Init progress bar value
		 * @param{string} value: value to be formatted
		 */
		initProgressBarValue: function(value){
			return Formatter.initProgressBarValue(value);
		},
		/**
		 * Gives number of unique people element in an array
		 * @param{array} value: array
		 * @returns{number}
		 */
		formatArrayCountNoOfPeople: function(value){
			var sBefore = "Employeenumber='";
			var sAfter = "',AssignmentKey=";
			var counts = {};
			for (var i = 0; i < value.length; i++) {
				var number = value[i].substring(value[i].indexOf(sBefore)+sBefore.length,value[i].indexOf(sAfter))
				counts[number] = 1 + (counts[number] || 0);
			}
			return Object.keys(counts).length;
		},
		/**
		 * Gives number of element in an array
		 * @param{array} value: array
		 * @returns{number}
		 */
		formatArrayCount: function(value){
			return Formatter.formatArrayCount(value);
		},
		/**
		 * remove leading zeros from SAP identifier
		 * @param{string} value: SAP identifier
		 * @returns{string}
		 */
		formatIntRemoveLeadingZeros: function(value){
			var iValue = parseInt(Formatter.removeLeadingZeros(value));
			if (isNaN(iValue)){
				return "";
			} else {
				return iValue;
			}
		},
		/**
		 * remove leading and trailing zeros from SAP identifier
		 * @param{string} value: SAP identifier
		 * @returns{string}
		 */
		formatNumberRemoveAllZeros: function(value){
			var iValue = parseFloat(Formatter.removeTrailingingZeros(value));
			if (isNaN(iValue)){
				return "";
			} else {
				return iValue;
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
		 * Convert date object to string
		 * @param{object} value: date object
		 * @returns{string}
		 */
		formatDateTimeToString: function(value){
			return Formatter.EDMDateTimeToString(value);
		},
		/**
		 * Convert datetime object to string
		 * @param{object} value: datetime object
		 * @returns{string}
		 */
		formatDateTimeToDateString: function(value){
			return Formatter.DateTimeToDateString(value);
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
		 *	Define a state that can be interpreted by DOM attributes
		 * @param   {string}value: state value in backend
		 * @returns {string}       state value for frontend
		 */
		formatState: function(value){
			return Formatter.formatState(value);
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
		 *	Tells if dependant entries exist for an object
		 * @param   {array}value: array of dependant entries
		 * @returns {boolean}     true if a dependant entry exists
		 */
		formatDependantExists: function(value){
			return Formatter.formatDependantExists(value);
		},
		/**
		 *	Tells if dependant entries exist for an object
		 * @param   {array}value: array of dependant entries
		 * @returns {boolean}     true if a dependant entry does not exist
		 */
		formatDependantNotExists: function(value){
			return !Formatter.formatDependantExists(value);
		},
		/**
		 *	Define icon depending on file type  
		 * @param   value: mime type of the file
		 * @returns icon! icon url for the file
		 */
		formatIconMimeType: function(value){
			return Formatter.formatIconMimeType(value);
		},
		/**
		 * Delete path before a filename 
		 * @param   value: absolute or relative path for a file
		 * @returns filename
		 */
		formatGetFileName: function(value){
			return Formatter.formatGetFileName(value);
		},
		/**
		 * Formatter to define pressed status of KO button of a checklist task 
		 * @param   value: checklist task's status
		 * @returns boolean. Value is reversed because we want the button to be not "pressed" if status is KO
		 */
		formatKOButton: function(value){
			if(value == "KO"){
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Formatter to enable or not KO button, depending on comment
		 * @param value: comment
		 * @param status: checklist task measures' status
		 */
		formatKOButtonEnabled: function(value, status){
			if(value && value.length > 0){
				return this.formatOKButtonEnabled(status);
			} else {
				return false;
			}
		},
		/**
		 * Formatter to define pressed status of OK button of a checklist task 
		 * @param   value: checklist task's status
		 * @returns boolean. Value is reversed because we want the button to be not "pressed" if status is OK
		 */		
		formatOKButton: function(value){
			if(value == "OK"){
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Formatter to enable or not OK button, depending on Measures status
		 * @param status: checklist task measures' status
		 */
		formatOKButtonEnabled: function(status){
			if(status == 1 || status == '1') {
				// Do not display, there is no measure
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Formatter to define pressed status of NA button of a checklist task
		 * @param   value: checklist task's status
		 * @returns boolean. Value is reversed because we want the button to be not "pressed" if status is NA
		 */
		formatNAButton: function(value){
			if(value == "NA"){
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Formatter to display or not checklist task's measure panel
		 * @param value: checklist task measures' status
		 */
		formatTaskMeasureVisible: function(value){
			if(value == 0 || value == '0') {
				// Do not display, there is no measure
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Formatter to define color of measure icon on task list
		 * @param value: checklist task measures' status
		 */
		formatMeasStatusColor: function(value){
			switch(value){
			case "2":
			case 2:
				return "Reject";
				break;
			case "3":
			case 3:
				return "Accept";
				break;
			default:
				return "Default";
			break;
			}
		},
		/**
		 * Formatter to define if input fields are enable 
		 * @param   value: checklist task's status
		 * @returns boolean.
		 */	
		formatFieldEnabled: function(value) {
			if(value == "OK" || value == "KO"){
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Formatter to define if dialog button are active
		 * @param{string} status: task status
		 * @param{string} button: button
		 */
		formatTaskDialogButtonType: function(sStatus, sButton){
			var bActive = false;
			if(sStatus == sButton){
				bActive = true;
			} else {
				return "Default";
			}

			switch (sButton){

			case "KO":
				return "Reject";
				break;

			case "OK":
				return "Accept";
				break;

			case "NA":
				return "Default";
				break;

			}
		},
		/**
		 * Color for activity tab icon
		 * @param {boolean} bValue: true if checklist is assigned to at least one activity
		 */
		formatActivityTabIconColor: function(bValue){
			if (bValue) {
				return sap.ui.core.IconColor.Default;
			} else {
				return sap.ui.core.IconColor.Negative;
			}
		},
		/**
		 * Gives URL of checklist attachment
		 * @param{object} value: attachment
		 * @returns{string}
		 */
		imageUrlForCheckListAttachment: function(value){
			if (value){
				return ctl.CheckListAttachment[value.uri.substring(value.uri.lastIndexOf("/"))];
			}
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