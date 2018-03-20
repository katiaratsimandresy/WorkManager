/** @module Base controller */

sap.ui.define([
               "sap/ui/core/mvc/Controller",
               'sap/ui/model/Filter',
               'sap/m/MessageBox',
               'com/kalydia/edfen/workmanager/util/Formatter',
               'sap/ui/core/routing/History',
               'com/kalydia/edfen/workmanager/scripts/network',
               'com/kalydia/edfen/workmanager/scripts/oData'
               ], function(Controller, Filter, MessageBox, Formatter, History, NetWorkController, ODataController) {
	"use strict";
	var oControl;
	return Controller.extend("com.kalydia.edf_en.workmanager.controller.BaseController", {

		constructor: function() {
			oControl = this;
			oControl.formatter = Formatter;
		},
		/**
		 * Triggered after view rendering.
		 */
		onAfterRendering: function() {
			$("#splash-screen").remove();
		},
		/**
		 * Triggered when exiting view
		 */
		onExit: function() {
			if (oControl._oDialog) {
				oControl._oDialog.destroy();
			}
			if (oControl._oBarcodeDialog) {
				oControl._oBarcodeDialog.destroy();
			}
			if (oControl._oSelectedPlanPlantsDialog) {
				oControl._oSelectedPlanPlantsDialog.destroy();
			}
			if (oControl._oEnlarge) {
				oControl._oEnlarge.destroy();
			}
		},

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for navigation back
		 * @public
		 */
		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return oControl.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getI18nValue: function(sKey) {
			return oControl.getView().getModel("i18n").getProperty(sKey);
		},

		/**
		 * Set application's busy indicator.
		 * @param {sap.ui.model.type.Boolean} bBusy switch
		 * @public
		 */
		setAppBusy: function(bBusy) {
			oControl.getOwnerComponent().getModel("app").setProperty("/busy", bBusy);
		},

		/**
		 * Set application's loaded indicator.
		 * @param {sap.ui.model.type.Boolean} bLoading switch
		 * @public
		 */
		setAppLoaded: function(bLoaded) {
			oControl.getOwnerComponent().getModel("app").setProperty("/loaded", bLoaded);
		},

		/**
		 * Set application's connect indicator.
		 * @param {sap.ui.model.type.Boolean} bConnect switch
		 * @public
		 */
		setAppConnect: function(bConnect) {
			console.log("set app connect::" + bConnect);
			if (bConnect) {
				oControl.getOwnerComponent().getModel("app").setProperty("/connected", true);
				oControl.getOwnerComponent().getModel("app").setProperty("/connectIcon", "connected");
			} else {
				oControl.getOwnerComponent().getModel("app").setProperty("/connected", false);
				oControl.getOwnerComponent().getModel("app").setProperty("/connectIcon", "disconnected");
			}
		},

		/**
		 * Set application's sync indicator.
		 * @param {sap.ui.model.type.Boolean} bSyncUpload switch uploading
		 * @param {sap.ui.model.type.Boolean} bSyncDownload switch downloading
		 * @param {sap.ui.model.type.Boolean} bSyncSuccess switch no error
		 * @public
		 */
		setAppSync: function(bSyncUpload, bSyncDownload, bSyncSuccess) {
			if (bSyncUpload) {
//				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "upload-to-cloud");
			} else if (bSyncDownload) {
//				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "download-from-cloud");
			} else if (bSyncSuccess) {
//				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "cloud");
			} else {
				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "tag-cloud-chart");
			}
		},

		setAppSyncProgress: function(oProgressStatus){
			if (oProgressStatus.fileSize > 0){
				console.log ("bytesSent : ", oProgressStatus.bytesSent);
				console.log ("bytesRecv : ", oProgressStatus.bytesRecv);
				console.log ("fileSize : ", oProgressStatus.fileSize);
			}
			switch (oProgressStatus.progressState) {
			case sap.OfflineStore.ProgressState.STORE_DOWNLOADING:
				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "download-from-cloud");
				break;
			case sap.OfflineStore.ProgressState.REFRESH:
				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "download-from-cloud");
				break;
			case sap.OfflineStore.ProgressState.FLUSH_REQUEST_QUEUE:
				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "upload-to-cloud");
				break;
			case sap.OfflineStore.ProgressState.DONE:
				oControl.getOwnerComponent().getModel("app").setProperty("/syncIcon", "cloud");
				break;
			}
		},

		/**
		 * Set application's error indicator.
		 * @param {sap.ui.model.type.Boolean} bSyncUpload switch is synchronizing
		 * @public
		 */
		setAppError: function(bError) {
			if (bError) {
				oControl.getOwnerComponent().getModel("app").setProperty("/errorIcon", "message-error");
			} else {
				oControl.getOwnerComponent().getModel("app").setProperty("/errorIcon", "message-success");
			}
		},

		// Log
		/**
		 * Add Message to log
		 * @param {string} sMessage Message
		 * @param {sap.ui.core.MessageType} oType Message type
		 * @param {string} sMessage Description
		 * @public
		 */
		addMessage: function(sMessage, oType, sDescription, sTarget) {
			var Message = Formatter.DateTimeToTimeString(Date()) + " - " + sMessage;
			sap.ui.getCore().getMessageManager().addMessages(
					new sap.ui.core.message.Message({
						message: Message,
						type: oType,
						description: sDescription,
						target: sTarget,
						processor: oControl.getOwnerComponent().oMessageProcessor
					}));
		},

		/**
		 * get MessagePopover object
		 * @returns {sap.ui.base.EventProvider}
		 */
		getMessagePopover: function() {
			return oControl.getOwnerComponent().oMessagePopover;
		},

		/**
		 * generic handler for display message log
		 * @returns {sap.ui.base.EventProvider}
		 */
		handleMessagePress: function(oEvent) {
			oEvent.getSource().addDependent(oControl.getMessagePopover());
			oControl.getMessagePopover().toggle(oEvent.getSource());
		},
		/**
		 * get Selected PlanPlant
		 * **/
		getPlanPlant: function() {
			return oControl.getOwnerComponent().getModel("app").getProperty("/SelectedPlanPlant");
		},
		/**
		 * get Selected PlanPlants
		 * **/
		getSelectedPlanPlants: function() {
			return oControl.getOwnerComponent().getModel("app").getProperty("/SelectedPlanPlants");
		},
		getEmployeeData: function() {
			return oControl.getOwnerComponent().getModel("app").getProperty("/EmployeeData");
		},
		/**
		 * set Selected PlanPlant
		 * **/
		setSelectedPlanPlant: function(sPlanPlant) {
			console.log("set selected planplant " + sPlanPlant);
			oControl.getOwnerComponent().getModel("app").setProperty("/SelectedPlanPlant", sPlanPlant);
			if (window.cordova) {
				// Define current workcenter in device memroy so it can be loaded when application starts
				sap.Logon.set(function(){}, function(){}, 'currentPlanPlant', sPlanPlant);	
			}

		},
		/**
		 * set Selected Work Centers
		 * **/
		setSelectedPlanPlants: function(aPlanPlants) {
			oControl.getOwnerComponent().getModel("app").setProperty("/SelectedPlanPlants", aPlanPlants);
			if(window.cordova) {
				sap.Logon.set(function(){}, function(){}, 'selectedPlanPlants', JSON.stringify(aPlanPlants));	
			}
		},

		/*******
		 *  Start PLANT SELECTION MANAGEMENT
		 * *****/

		/**
		 * Open PlanPlant Selection Dialog
		 */
		openPlanPlantSelection: function(callback) {
			var oModel = oControl.getOwnerComponent().getModel();
			if (!oModel){
				oControl.getOwnerComponent().createGeneralModel();
				oModel = oControl.getOwnerComponent().getModel();
			}
			if (!oControl._oDialog) {
				oControl._oDialog = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.PlanPlantSelection", oControl);
			}

			if ('function' === typeof callback) {
				// callback = LoadingController.startApp
				oControl._oDialog.callback = callback;
			}

			oControl.getView().addDependent(oControl._oDialog);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", oControl.getView(), oControl._oDialog);

			// Open dialog
			oControl._oDialog.open();

			// Remove splash screen
			$("#splash-screen").remove();
		},
		/**
		 * Returns whether a planplant has been selected or not
		 * @param   {string}  value: planplant to test
		 * @returns {boolean} 
		 */
		_isPlanPlantSelected: function(value) {
			return (-1 !== $.inArray(value, oControl.getSelectedPlanPlants()));
		},
		/**
		 * Returns whether a workcenter is active or not
		 * @param   {string}  value: workcenter to test
		 * @returns {boolean} 
		 */
		_isPlanPlantActive: function(value) {
			return (value === oControl.getPlanPlant());
		},
		/**
		 * Factory for planplant list item
		 * @param {string} sId: line ID
		 * @param {sap.ui.model.Context} oContext: context
		 * @returns {sap.m.ColumnListItem} 
		 */
		_planplantListFactory: function(sId, oContext) {
			var oUIControl = null;
			var bActive = oControl._isPlanPlantActive(oContext.getProperty('Planplant'));

			oUIControl = new sap.m.ColumnListItem(sId, {
				selected: bSelected,
				cells: [
				        new sap.m.Switch({
				        	state: bActive
				        }),
				        new sap.m.Text({
				        	text: '{Planplant}'
				        }),
				        new sap.m.Text({
				        	text: '{PlantName}'
				        })
				        ]
			});
			return oUIControl;
		},

		/**
		 * Handle the search event of the PlanPlant Selection Dialog
		 * **/
		handlePlanPlantSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Planplant", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		/**
		 * Handle the close and confirm events of the PlanPlant Selection Dialog
		 *
		 * **/
		handlePlantPlantClose: function(oEvent) {
			// All list items
			var aItems = oEvent.oSource.getItems();
			if ($.isEmptyObject(aItems)) {
				// Something's wrong, no planplant at all in the list, Logout
				kalydia.logon.logout();
			}
			
			// Clicked list item
			var oSelectedItem = oEvent.getParameter("selectedItem");
			// aCells is the array containing the cells of the Clicked planplant line
			var aCells = $.isEmptyObject(oSelectedItem) ? [] : oSelectedItem.getCells();
			// First cell contains the switch indicating if the planplant is selected or not
			var bSelectedState = $.isEmptyObject(aCells) ? false : aCells[0].getState();
			if (!$.isEmptyObject(oSelectedItem) && !bSelectedState) {
				// Planplant has been clicked but is not selected
				oControl.openPlanPlantSelection(null);
			} else if ($.isEmptyObject(oSelectedItem)) {
				// If nothing has been clicked (cancel button click)
				oControl.setPlanPlantSelection([]);
			} else {
				var aSelection = [];
				oControl.oSelectedPlanPlant = oSelectedItem.getBindingContext().getObject().Planplant;
				// Loop over every item in the planplant list
				aItems.forEach(function(oItem) {
					aCells = oItem.getCells();
					var bActive = aCells && aCells.length > 0 ? aCells[0].getState() : false;
					var oContext = oItem.getBindingContext();
					// If switch is in position "On"
					if (bActive) {
						aSelection.push(oContext.getObject().Planplant);
					}
				});
				oControl.setPlanPlantSelection(aSelection);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/**
		 * Check the planplant selection and populate values in storage or model
		 * **/
		setPlanPlantSelection: function(aSelection) {
			if (aSelection.length == 0 && $.isEmptyObject(oControl.getPlanPlant())) {
				// No selection done and no workcenter selected
				MessageBox.show(
						oControl.getI18nValue("planplant.ErrorNoSelection"), {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: oControl.getI18nValue("planplant.ErrorSelectionTile"),
							actions: sap.m.MessageBox.Action.OK,
							onClose: $.isEmptyObject(oControl._oDialog._oTable.getItems()) && window.cordova ? $.proxy(oControl.openPlanPlantSelection, oControl) : $.proxy(oControl.openPlanPlantSelection, oControl),
									styleClass: "",
									initialFocus: null,
									textDirection: sap.ui.core.TextDirection.Inherit
						});
			} else if (aSelection.length == 0 && !$.isEmptyObject(oControl.getPlanPlant())) {
				// No selection but a planplant has been selected
				// Happened when the user open the planplant selection from shell and 
				// cancel without changing planplant
				return;
			} else {
				if (aSelection.length > oControl.getOwnerComponent().getModel("app").getProperty("/MaxPlanPlant")) {
					// There is too many planplant selected
					MessageBox.show(
							oControl.getResourceBundle().getText("planplant.ErrorSelectionExceed", [oControl.getOwnerComponent().getModel("app").getProperty("/MaxPlanPlant")]), {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: oControl.getI18nValue("planplant.ErrorSelectionTile"),
								actions: sap.m.MessageBox.Action.OK,
								onClose: $.proxy(oControl.openPlanPlantSelection, oControl),
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
				} else {
					oControl.setSelectedPlanPlant(oControl.oSelectedPlanPlant);
					oControl.setSelectedPlanPlants(aSelection);
					
					sap.m.MessageToast.show(oControl.getResourceBundle().getText("planplant.SelectionMessage", [oControl.getPlanPlant()]));
					oControl.startApp(aSelection);
				}
			}
		},
		/**
		 * Start application after planplant selection.
		 * @param {string} sPlanPlant: selected planplant
		 */
		startApp: function(aPlanPlant) {
			console.log("startApp");

			if (window.cordova) {
				oControl.iBusy = 0;
				oControl.setAppBusy(true);
				oControl.setAppLoaded(false);

				// create General Store
				sap.m.MessageToast.show(oControl.getI18nValue("loading.OpenGeneralStore"));
				ODataController.openStore("General", null, function() {
					sap.m.MessageToast.show(oControl.getI18nValue("loading.GeneralStoreLoaded"));

					var aDeferred = [];

					if (aPlanPlant.length > 0) {
						// Create Deferred functions to open the planplant store
						$.each(aPlanPlant, function(index, planplant) {
							oControl.iBusy++;
							aDeferred.push(ODataController.openStore(planplant, planplant, function() {
								sap.m.MessageToast.show(oControl.getResourceBundle().getText("loading.PlanPlantStoreLoaded", [planplant]));
								console.log("success opening " + planplant + " store loading controller");
								oControl.iBusy--;
								if(oControl.iBusy == 0) {
									oControl.displayHome();
//									oControl.setAppBusy(false);
//									oControl.setAppLoaded(true);
								}
							}, function(error) {
								console.log("error opening " + planplant + " store loading controller");
								oControl.onErrorOpenStore(error);
							}, oControl.setAppSyncProgress
							, 0 === index
							, oControl));
						});
						// Launch deferred
						console.log("--- Start open plant stores ---");
						$.when.apply($, aDeferred);
					} else {
						// Ne devrait jamais se produire
					}
				}, function(error) {
					console.error("error openGeneralStore loading controller");
					oControl.onErrorOpenStore(error);
				}, oControl.setAppSyncProgress, true)


			} else {
				// Case no cordova
				oControl.retrieveUserData();
				oControl.displayHome();
			}
		},
		/**
		 * Load user data and store the in App model.
		 */
		retrieveUserData: function() {
			var oModel = oControl.getOwnerComponent().getModel();
			// retrieve user data
			var request = oModel.read("/EmployeeSet?$filter=UserName%20eq%20%27"+oControl.getOwnerComponent().getModel("app").getProperty("/Logon/applicationContext/registrationContext/user")+"%27", {
				success: function(oData, response) {
					// retrieve Employee Data
					var oEmployeeData = $.isEmptyObject(oData) || $.isEmptyObject(oData.results) ? null : oData.results[0];
					if (!$.isEmptyObject(oEmployeeData)) {
						oEmployeeData.username = $.isEmptyObject(oEmployeeData.PersonNo) ? oEmployeeData.UserFullname : oEmployeeData.UserFullname; //+ " ( " + oEmployeeData.PersonNo + " )";
						oEmployeeData.isAreaManager = $.isEmptyObject(oEmployeeData.AreaManager) ? false : 'X' === oEmployeeData.AreaManager;
						oEmployeeData.isTechnician = $.isEmptyObject(oEmployeeData.Technician) ? false : 'X' === oEmployeeData.Technician;
						// Retrieve TimeSheet Counter
						oControl.getOwnerComponent().getModel("app").setProperty("/EmployeeData", oEmployeeData);
					} else {
						MessageBox.show(
								oControl.getI18nValue("loading.ErrorUserData"), {
									icon: MessageBox.Icon.WARNING,
									title: oControl.getI18nValue("loading.ErrorTitle"),
									actions: MessageBox.Action.OK,
									onClose: null,
									styleClass: "",
									initialFocus: null,
									textDirection: sap.ui.core.TextDirection.Inherit
								});
					}
					oControl.getRouter().navTo("appHome");
				},
				error: function(oError) {
					if (sap.Logger) {
						sap.Logger.error("Error Read User Info::" + oError);
					}
				}
			}
			);
		},
		/**
		 * Display error.
		 * @param {json} error: error data
		 */
		onErrorOpenStore: function(error) {
			var oError = JSON.parse(error);
			var aError = [];

			aError.push(oControl.getI18nValue("loading.ErrorCode") + ": " + oError.errorCode);
			aError.push(oControl.getI18nValue("loading.ErrorMessage") + ": " + oError.errorMessage);
			aError.push(oControl.getI18nValue("loading.ErrorDomain") + ": " + oError.errorDomain);
			MessageBox.show(
					aError.join('\n'), {
						icon: MessageBox.Icon.ERROR,
						title: oControl.getI18nValue("loading.ErrorTitle"),
						actions: MessageBox.Action.OK,
						onClose: kalydia.logon.logout,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});

		},
		/**
		 * Prepare application and display home view.
		 */
		displayHome: function() {
			console.log("Go Home");
			oControl.getOwnerComponent().createGeneralModel();
			oControl.retrieveUserData();
			oControl.getOwnerComponent().createPlanPlantModel(oControl.getPlanPlant());
			oControl.setAppBusy(false);
			oControl.setAppLoaded(true);
			oControl.updateTilesCounters();
			if (NetWorkController.isOnline()) {
				oControl.launchPeriodicRefresh();
			}
		},
		/**
		 * Change planplant selection
		 * @param {string} sName: not used
		 * @param {string} sEvent: not used
		 * @param {data}
		 */
		changePlanPlantSelection: function(sName, sEvent, data) {
			var aPlanPlants = oControl.getSelectedPlanPlants();
			var aStoreToDelete = [];
			var aNewStores = [];
			oControl.changePlanPlantSelectionProcessed = true;
			// check plant stores
			if (!$.isEmptyObject(kalydia.oData.stores)) {
				$.each(kalydia.oData.stores, function(index, value) {
					if ("General" !== index) {
						if (!oControl._isPlanPlantSelected(index)) {
							//plant store exist but not selected anymore
							// Close and clean store
							console.log("Close and clean store " + index);
							if (window.cordova) {
								aStoreToDelete.push(index);	
							}
						} else {
							// remove from list of work centers to create
							aPlanPlants.splice($.inArray(index, aPlanPlants), 1);
						}
					}
				});
			}
			// check selected plants
			if (!$.isEmptyObject(aPlanPlants)) {
				$.each(aPlanPlants, function(index, value) {
					if ($.isEmptyObject(kalydia.oData.stores[value]) && !$.isEmptyObject(kalydia.oData.stores)) {
						console.log("store " + value + " does not exist ==> create and open it");
						if (window.cordova) {
							aNewStores.push(value);	
						}
					}
				});
			}
			
			if (window.cordova) {
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("base", "processchangePlanPlantSelection", {
					deleteStore: aStoreToDelete,
					newStore: aNewStores,
					isActivePlanPlantChanged: data.isActivePlanPlantChanged
				});	
			} else {
				if (data.isActivePlanPlantChanged) {
					// set the work center model
					console.log("New active work center " + oControl.getPlanPlant());
					oControl.updateErrorIndicator();
					oControl.updateTilesCounters();
				}	
			}
		},
		/**
		 * Update tiles counters on homepage
		 */
		updateTilesCounters: function() {
			// Retrieve TimeSheet Counter
			var oModel = oControl.getOwnerComponent().getModel("plant");
			var oEmployeeData = oControl.getOwnerComponent().getModel("app").getProperty("/EmployeeData");
			var aTileModel = this.getOwnerComponent().getModel("mainTiles").getProperty('/TileCollection');
			console.log("update tiles counters");

			if (!$.isEmptyObject(aTileModel)) {
				$.each(aTileModel, function(index, tileModel) {
					if (tileModel.number) {
						oControl.getOwnerComponent().getModel("mainTiles").setProperty('/TileCollection/' + index + '/number', "--");
						var request = null;
						switch (tileModel.target) {
						case 'NotificationList':
							request = "/NotifHeaderSet/$count/?$filter=Planplant%20eq%20%27" + oControl.getPlanPlant() + "%27%20and%20InProcess%20eq%20%27%20%27%20and%20Complete%20eq%20%27%20%27";
							break;
						case 'PrepareWorkOrder':
							request = "/OrderHeaderSet/$count/?$filter=Planplant%20eq%20%27" + oControl.getPlanPlant() + "%27%20and%20InProcess%20eq%20%27%20%27%20and%20Complete%20eq%20%27%20%27%20and%20(%20OrderType%20eq%20%27ENS1%27or%20OrderType%20eq%20%27ENS2%27%20)";
							break;
						case 'MyWorkOrders':
							request = "/OrderHeaderSet/$count/?$filter=Planplant%20eq%20%27" + oControl.getPlanPlant() + "%27%20and%20InProcess%20eq%20%27X%27%20and%20Complete%20eq%20%27%20%27";
							break;
						case 'TimeAndMaterialEntry':
							request = "/OrderHeaderSet/$count/?$filter=Planplant%20eq%20%27" + oControl.getPlanPlant() + "%27%20and%20InProcess%20eq%20%27X%27%20and%20Complete%20eq%20%27%20%27";
							break;
						default:
							console.error('no request defined to compute counter for target ' + tileModel.target);
						break;
						}

						if (!$.isEmptyObject(request) && !$.isEmptyObject(oModel)) {
							oModel.read(request, {
								success: function(oData, response) {
									var iCount = response.body || "";
									oControl.getOwnerComponent().getModel("mainTiles").setProperty('/TileCollection/' + index + '/number', iCount);
								},
								error: function(oError) {
									if (sap.Logger) {
										sap.Logger.error("Error Counter for target " + tileModel.target + "::" + oError);
									}
								}
							});
						}
					}
				});
			}
		},
		/**
		 * Update of the error indicator depending on presence of error in local storage
		 */
		updateErrorIndicator: function() {
			if (!window.cordova) return;
			
			// Retrieve TimeSheet Counter
			var oModel = oControl.getOwnerComponent().getModel("plant");

			oModel.read("/ErrorArchive/$count", {
				success: function(oData, response) {
					var iCount = response.body || 0;
					if (iCount == 0){
						oControl.setAppError(false);
					}else{
						oControl.setAppError(true);
					}
				},
				error: function(oError) {

				}
			});
		},
		/**
		 * Process planplant modification
		 * @param {string} sName: not used
		 * @param {string} sEvent: not used
		 * @param {data}   data: workcenter data
		 */
		processchangePlanPlantSelection: function(sName, sEvent, data) {
			console.log('processChangeCenterSelection');
			console.log(data);
			oControl.setAppBusy(true);
			var oEventBus = sap.ui.getCore().getEventBus();
			if ($.isEmptyObject(data.deleteStore) && $.isEmptyObject(data.newStore)) {
				oControl.updateErrorIndicator();
				oControl.updateTilesCounters();
				oControl.setAppBusy(false);
			}

			if (data.deleteStore.length > 0) {
				console.log('delete Store ' + data.deleteStore[0]);
				sap.m.MessageToast.show(oControl.getResourceBundle().getText("planplant.CloseStore", [data.deleteStore[0]]));
				kalydia.oData.closeStore(data.deleteStore[0], function() {
					kalydia.oData.removeStoreFromSession(data.deleteStore[0], function() {
						// remove first element
						data.deleteStore.shift();
						oControl.processchangePlanPlantSelection("base", "processPlanChangePlantSelection", {
							deleteStore: data.deleteStore,
							newStore: data.newStore,
							isActivePlanPlantChanged: data.isActivePlanPlantChanged
						});
					}, function() {
						// error clear
						console.log('Error Clear Store ' + data.deleteStore[0]);
					});
				}, function() {
					// error close
					console.log('Error Close Store ' + data.deleteStore[0]);
				});
			} else if (data.newStore.length > 0) {
				console.log('create Store ' + data.newStore[0]);
				// check existing plant stores
				var iPlanPlantStore = 0;
				var isPlanPlant1 = false;
				var isPlanPlant2 = false;
				$.each(kalydia.oData.stores, function(index, value) {
					if ("General" !== index) {
						iPlanPlantStore++;
						isPlanPlant1 = (-1 !== kalydia.oData.stores[index].serviceRoot.indexOf(".planplant1"));
						isPlanPlant2 = (-1 !== kalydia.oData.stores[index].serviceRoot.indexOf(".planplant2"));
					}
				});

				if (iPlanPlantStore < 2) {
					sap.m.MessageToast.show(oControl.getResourceBundle().getText("planplant.OpenStore", [data.newStore[0]]));
					kalydia.oData.openStore(data.newStore[0], data.newStore[0], function() {
						sap.m.MessageToast.show(oControl.getResourceBundle().getText("loading.PlanPlantStoreLoaded", [data.newStore[0]]));
						console.log("success opening " + data.newStore[0] + " store base controller");
						// remove first element
						data.newStore.shift();
						oControl.processchangePlanPlantSelection("base", "processPlanChangePlantSelection", {
							deleteStore: data.deleteStore,
							newStore: data.newStore,
							isActivePlanPlantChanged: data.isActivePlanPlantChanged
						});
					}, function(error) {
						console.error("error opening " + data.newStore[0] + " store loading controller");
						var oError = JSON.parse(error);
						var aError = [];
						aError.push(oControl.getI18nValue("loading.ErrorCode") + ": " + oError.errorCode);
						aError.push(oControl.getI18nValue("loading.ErrorMessage") + ": " + oError.errorMessage);
						aError.push(oControl.getI18nValue("loading.ErrorDomain") + ": " + oError.errorDomain);
						MessageBox.show(
								aError.join('\n'), {
									icon: MessageBox.Icon.ERROR,
									title: oControl.getI18nValue("loading.ErrorTitle"),
									actions: MessageBox.Action.OK,
									onClose: null,
									styleClass: "",
									initialFocus: null,
									textDirection: sap.ui.core.TextDirection.Inherit
								});
					}, oControl.setAppSyncProgress
					, !isPlanPlant1);
				} else {
					// Error
					console.error("There are already 2 plant stores");
				}

			} else if (data.isActivePlanPlantChanged) {
				// set the plant model
				console.log("New active plant " + oControl.getPlanPlant());
				oControl.getOwnerComponent().createPlanPlantModel(oControl.getPlanPlant());
				oControl.updateErrorIndicator();
				oControl.updateTilesCounters();
			}
		},
		/**
		 * Convert binary to blob
		 * @param {binary} b64Data: data to be converted
		 * @param {string} contentType: type of data
		 * @param {number} sliceSize: package size
		 */
		b64toBlob: function(b64Data, contentType, sliceSize) {
			contentType = contentType || '';
			sliceSize = sliceSize || 512;

			var byteCharacters = atob(b64Data);
			var byteArrays = [];

			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);

				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}

				var byteArray = new Uint8Array(byteNumbers);

				byteArrays.push(byteArray);
			}

			var blob = new Blob(byteArrays, {type: contentType});
			return blob;
		},
		/*******
		 *  Start CAMERA MANAGEMENT
		 * *****/
		/**
		 * Call camera api
		 * @param {sap.ui.base.Event} evt: event that call camera
		 * @param {number} iType: call type
		 * @param {number} iQuality: image quality
		 * @param {function} callback: callback when success
		 * @param {function} errorCallback: callback when error
		 */
		_callCamera: function(evt, iType, iQuality, callback, errorCallback) {
			/***
			 * navigator.camera.PictureSourceType.PHOTOLIBRARY = 0
			 * navigator.camera.PictureSourceType.CAMERA = 1
			 * navigator.camera.PictureSourceType.SAVEDPHOTOALBUM = 2
			 * **/

			var oCamera = navigator.camera;
			if (oCamera) {
				oCamera.getPicture(
						function(imageData) {
							if ('function' === typeof callback) {
								callback(oControl.b64toBlob(imageData, 'image/jpeg'), new sap.m.Image({
									src: "data:image/jpeg;base64," + imageData,
									width: "100px",
									height: "75px",
									press: oControl._enlargeImage
								}).addStyleClass("sapUiTinyMargin"));
							}
						},
						function(message) {
							if ('function' === typeof errorCallback) {
								errorCallback(message);
							} else {
								MessageBox.show(
										message, {
											icon: sap.m.MessageBox.Icon.ERROR,
											title: oControl.getI18nValue("cameraFail"),
											actions: sap.m.MessageBox.Action.OK,
											onClose: null,
											styleClass: "",
											initialFocus: null,
											textDirection: sap.ui.core.TextDirection.Inherit
										});
							}
						}, {
							quality: iQuality,
							targetWidth: 2592,
							targetHeight: 1944,
							sourceType: iType,
							destinationType: oCamera.DestinationType.DATA_URL, // NATIVE_URI,
							cameraDirection: oCamera.Direction.BACK,
							saveToPhotoAlbum: false
						}
				);
			} else {
				evt.oSource.setEnabled(false);
				sap.m.MessageToast.show(oControl.getI18nValue("noCamera"));
			}
		},
		/**
		 * Enlarge image
		 * @param {sap.ui.base.Event} oEvent: event that triggered the function
		 */
		_enlargeImage: function(oEvent) {
			if (!oControl._oEnlarge) {
				oControl._oEnlarge = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.ImageOverlay", oControl);
			}
			oControl.getView().addDependent(oControl._oEnlarge);
			oControl._oEnlarge.getContent()[0].setSrc(oEvent.oSource.getSrc());
			oControl._oEnlarge.setContentWidth("99%");
			oControl._oEnlarge.setContentHeight("99%");
			oControl._oEnlarge.open();
		},
		/**
		 * Close image preview
		 * @param {sap.ui.base.Event} oEvent: event that triggered the function
		 */
		_closeImageOverlay: function(oEvent) {
			oEvent.oSource.oParent.close();
		},
		/**
		 * Take picture
		 * @param {sap.ui.base.Event} evt: event that triggered the function
		 * @param {function} callback: callback when success
		 * @param {function} errorCallback: callback when error
		 */
		takePicture: function(evt, callback, errorCallback) {
			oControl._callCamera(evt, 1, 50, callback, errorCallback);
		},
		/**
		 * Get a picture from the device gallery
		 * @param {sap.ui.base.Event} evt: event that triggered the function
		 * @param {function} callback: callback when success
		 * @param {function} errorCallback: callback when error
		 */
		getPictureFromGallery: function(evt, callback, errorCallback) {
			oControl._callCamera(evt, 2, 50, callback, errorCallback);
//			var oFileUploader = evt.getSource();
//			var file = oFileUploader.getDomRef('fu').files[0];
//			var image;
//			if ((!file) && ('function' === typeof errorCallback)) {
//			var message = "Code Error : No file";
//			errorCallback(message);
//			return;
//			}
//			var reader = new FileReader();
//			reader.onload = function(f) {
//			image = new sap.m.Image({
//			src: f.target.result,
//			width: "100px",
//			height: "75px",
//			press: oControl._enlargeImage
//			}).addStyleClass("sapUiTinyMargin");
//			if ('function' === typeof callback) {
//			callback(file, image);
//			}
//			}
//			reader.readAsDataURL(file);

		},

		/**
		 * overwrite these functions with success and error callback in the view controller
		 * **/
		capture: function(evt) {
			oControl.takePicture(evt);
		},

		/**
		 * overwrite these functions with success and error callback in the view controller
		 * **/
		library: function(evt) {
			oControl.getPictureFromGallery(evt);
		},

		/*******
		 *  Start BARCODE SCANNER MANAGEMENT
		 * *****/
		/**
		 * Use barcode scanner
		 * @param {sap.ui.base.Event} evt: event that triggered the function
		 * @param {function} callback: callback when success
		 * @param {function} errorCallback: callback when error
		 */
		_callBarcodeScanner: function(evt, callback, errorCallback) {
			try {
				var oScanner = cordova.plugins.barcodeScanner;
				oScanner.scan(
						//oControl._showBarcodeDialog(evt, callback);
						function(result) {
							console.log('Barcode result: ' + result.text + ', Format: ' + result.format + ', Cancelled: ' + result.cancelled);
							if (result.cancelled === 'false' || !result.cancelled) {
								result.cancelled = false;
								sap.m.MessageToast.show(oControl.getI18nValue("barcode.Read") + " " + result.text);
								callback(result);
							}
						},
						function(message) {
							console.log('Barcode scanning failed:' + message);
							sap.m.MessageToast.show(message);
							oControl.addMessage(oControl.getI18nValue("barcode"), sap.ui.core.MessageType.Error, message);
							if ('function' === typeof errorCallback) {
								errorCallback(message);
							}
						});
			} catch (error) {
				console.error(error);
				oControl._showBarcodeDialog(evt, callback);
			}
		},
		/**
		 * Save the barcode that has been read
		 * @param {sap.ui.base.Event} evt: event that triggered the function
		 */
		_saveBarcode: function(evt) {
			var oModel = oControl._oBarcodeDialog.getModel();
			var sBarcode = oModel.getProperty("/barcode");
			sap.m.MessageToast.show(oControl.getI18nValue("barcode.Read") + " " + sBarcode);

			if ('function' === typeof oControl._oBarcodeDialog.callback) {
				oControl._oBarcodeDialog.callback({
					text: sBarcode,
					cancelled: false
				});
			}
			oControl._oBarcodeDialog.close();
		},
		/**
		 * Cancel barcode capture
		 * @param {sap.ui.base.Event} evt: event that triggered the function
		 */
		_cancelBarcode: function(evt) {
			var oParent = evt.oSource.getParent();
			if ('function' === typeof oControl._oBarcodeDialog.callback) {
				oControl._oBarcodeDialog.callback({
					text: null,
					cancelled: true
				});
			}
			oControl._oBarcodeDialog.close();
		},
		/**
		 * Open barcode reading window
		 * @param {sap.ui.base.Event} evt: event that triggered the function
		 * @param {function} callback: callback when success
		 */
		_showBarcodeDialog: function(evt, callback) {
			var oModel = new sap.ui.model.json.JSONModel();
			if (!oControl._oBarcodeDialog) {
				oControl._oBarcodeDialog = new sap.m.Dialog({
					title: oControl.getI18nValue("barcode"),
					buttons: [
					          new sap.m.Button({
					        	  text: oControl.getI18nValue("barcode.Save"),
					        	  tap: [oControl._saveBarcode, oControl]
					          }),
					          new sap.m.Button({
					        	  text: oControl.getI18nValue("barcode.Cancel"),
					        	  tap: [oControl._cancelBarcode, oControl]

					          })
					          ]
				}).addStyleClass("sapUiContentPadding");

				oControl._oBarcodeDialog.addContent(new sap.m.Input({
					maxLength: 20,
					width: '100%',
					value: "{/barcode}"
				}));
				oControl._oBarcodeDialog.addContent(new sap.m.Text({
					text: oControl.getI18nValue("barcode.noScanner")
				}));
			}
			oControl._oBarcodeDialog.setModel(oModel);
			oControl._oBarcodeDialog.callback = callback;
			oControl._oBarcodeDialog.open();
		},

		/**
		 * overwrite these functions with success and error callback in the view controller
		 * **/
		scanBarcode: function(evt) {
			oControl._callBarcodeScanner(evt);
		},
		/**
		 * Generic callback when error in request
		 * @param {json} oError: Error data
		 */
		oDataCallbackFail: function(oError) {
			if (typeof ctl !== 'undefined') {
				var that = ctl;
			} else if (typeof oControl !== 'undefined') {
				var that = oControl;
			}
			if (oError.message){
				if (oError.message.errorDomain) {
					var message = oError.message.errorMessage;
					that.addMessage(oError.message.errorDomain, sap.ui.core.MessageType.Error, message);
				} else if (oError.response.body) {
					try {
						var oJson = JSON.parse(oError.response.body);
						var message = oJson.error.message.value;
					} catch (e){
						var message = oError.response.body;
					}
					that.addMessage(oError.message, sap.ui.core.MessageType.Error, message);
				} else {
					var message = oError.statusCode + " " + oError.statusText;
					that.addMessage(oError.message, sap.ui.core.MessageType.Error, message);
				} 
			}else {
				var message = JSON.parse(oError.response.body).error.message.value;
				that.addMessage(message, sap.ui.core.MessageType.Error);
			}

			sap.m.MessageToast.show(message);
			that.setAppBusy(false);

		},
		/**
		 * Refresh data stores
		 */
		refreshStores: function() {
			sap.m.MessageToast.show(oControl.getI18nValue("synchronization.start"));
			oControl.setAppSync(false,true,true);
			kalydia.oData.refreshAllStores(
					function(storename) {
						var lastRefresh = new Date();
						var lastRefreshString = Formatter.DateTimeToString(lastRefresh);
						if (oControl.getPlanPlant() == storename){
							oControl.setAppSync(false,false,true);
							oControl.getOwnerComponent().getModel("app").setProperty('/lastSynchronization', lastRefreshString);
							oControl.updateErrorIndicator();
							oControl.updateTilesCounters();
						}
					},
					function (storename, oError) {
						oControl.setAppSync(false,false,false);
						oControl.updateErrorIndicator();
						oControl.addMessage(oError.errorDomain, sap.ui.core.MessageType.Error, oError.errorMessage);
					},
					oControl.setAppSyncProgress);
		},
		/**
		 * Refresh stores on a periodic basis
		 */
		launchPeriodicRefresh: function() {
			// start periodic refresh each 15 min
			oControl.refreshStores();
			if (window.cordova) {
				oControl.stopPeriodicRefresh();
				kalydia.oData.refreshTask = setInterval(
						oControl.refreshStores
						, 900000);
			}
		},
		/**
		 * Stop periodic refresh of data stores
		 */
		stopPeriodicRefresh: function() {
			if (window.cordova && kalydia.oData.refreshTask) {
				clearInterval(kalydia.oData.refreshTask);
				delete kalydia.oData.refreshTask;
			}
		}
		/** New Methods here **/
	});
});
