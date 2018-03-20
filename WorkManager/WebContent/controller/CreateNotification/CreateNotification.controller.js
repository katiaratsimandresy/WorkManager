/** @module Create Notification */

sap.ui.define([
               'sap/ui/model/json/JSONModel',
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               "com/kalydia/edfen/workmanager/model/models"
               ], function(JSONModel, BaseController, UIComponent, Formatter, models) {
	"use strict";
	var ctl = null;

	return BaseController.extend("com.kalydia.edfen.workmanager.controller.CreateNotification.CreateNotification", {

		/**
		 * Triggered on controller initialisation.
		 * Call XML fragments, register to events
		 */
		onInit: function() {

			ctl = this;
			ctl.setAppBusy(true);

			ctl._ItemNumber = 0;

			ctl.functionalLocationSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.CreateNotification.fragment.functionalLocationSelect", ctl);
			ctl.getView().addDependent(ctl.functionalLocationSelect);
			ctl.equipmentSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.equipmentSelect", ctl);
			ctl.getView().addDependent(ctl.equipmentSelect);
			ctl.damageGroupSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.damageGroupSelect", ctl);
			ctl.getView().addDependent(ctl.damageGroupSelect);
			ctl.damageCodeSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.damageCodeSelect", ctl);
			ctl.getView().addDependent(ctl.damageCodeSelect);
			ctl.sparePart = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.sparePart", ctl);
			ctl.getView().addDependent(ctl.sparePart);
			ctl.initUserInputModelBinding();

			//sap.ui.getCore().byId("StrmlfnDate").setMinutesStep(5);

			sap.ui.getCore().byId("funcLocationTable").attachUpdateFinished(function(evt) {
				/* Trigger when functional locations' loading is over */
				/* If research has no result we consider item is selected */
				/* Hence we close the selection popup */
				ctl.setAppBusy(false);
				var tab = evt.oSource;
				if (tab.getItems().length == 0) {
					if (ctl.selectedFuncLocTableCells != null) {
						var view = ctl.getView();
						var model = view.getModel("plant");
						view.getModel("CreateNotification").setProperty("/FunctLoc", ctl.selectedFuncLocTableCells[1].getText());
						view.getModel("CreateNotification").setProperty("/Funcldescr", ctl.selectedFuncLocTableCells[2].getText());
						view.byId("FunctLoc").setValueState(sap.ui.core.ValueState.None);
						view.getModel("CreateNotification").setProperty("/Equipment", null);
						view.getModel("CreateNotification").setProperty("/Equidescr", null);
						view.getModel("CreateNotification").setProperty("/NotifItem", null);
						model.read("/FuncLocSet('" + ctl.selectedFuncLocTableCells[1].getText() + "')",{
							success: function(oData, oResponse) {
								if (oData.Equitype && oData.Equitype != ''){
									ctl.Equitype = oData.Equitype;
								} else {
									ctl.Equitype = 'ALL';
								}
							},
							error: ctl.oDataCallbackFail
						});
						ctl.selectedFuncLocTableCells = null;
						ctl.functionalLocationSelect.close();
					}
				}
			});
			ctl.getRouter("CreateNotification").attachRoutePatternMatched(ctl.onRouteMatched, ctl);
			ctl.setAppBusy(false);

		},
		/**
		 * RoutePatternMatched event handler
		 * @param{sap.ui.base.Event} oEvent router pattern matched event object
		 */
		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");
			if (sName === "CreateNotification"){
				if (ctl.getPlanPlant() != ctl.getView().getModel("CreateNotification").getProperty("/Planplant")){
					ctl.initUserInputModelBinding();
					ctl.removeAllPics();
				}
			}
		},
		/************************************************************************/
		/*    MODEL BINDING FOR USER INPUT                                      */
		/************************************************************************/
		/**
		 * Init models for the view
		 */
		initUserInputModelBinding: function() {
			var view = ctl.getView();
			view.setModel(
					new JSONModel(),
					"CreateNotification"
			);
			// Add fields for offline
			view.byId("Notiftype").setSelectedKey('TDL');
			view.byId("Priority").setSelectedKey('1');
			view.getModel("CreateNotification").setProperty("/NotifNo", (Math.floor(Math.random() * 999999999) + 999000000000).toString());
			view.getModel("CreateNotification").setProperty("/Planplant", ctl.getPlanPlant());
			view.getModel("CreateNotification").setProperty("/CreatedBy", ctl.getEmployeeData().UserName);
			view.getModel("CreateNotification").setProperty("/Complete", " ");
			view.getModel("CreateNotification").setProperty("/InProcess", " ");
			ctl._ItemNumber = 1;
			ctl.Equitype = "";
			ctl.selectedFuncLocTableCells = null;
		},
		/**
		 * Define text for selected notification type in model used for creation
		 * @param{sap.ui.base.Event} oEvent select option for notification type value change
		 */
		handleNotifType: function(oEvent){
			var select = oEvent.getSource();
			select.getModel("CreateNotification").setProperty("/NotiftypeText", select.getSelectedItem().getText());
		},

		/************************************************************************/
		/*    FUNCTIONAL LOCATION                                               */
		/************************************************************************/

		/**
		 * Opening of functional location search.
		 * @param{sap.ui.base.Event} oEvent: triggering event (click on search help)
		 */
		openFunctionalLocationSelect: function(oEvent) {
			var parent = "";
			ctl.functionalLocationSelect.open();
			ctl.searchFunctionalLocation(ctl.getPlanPlant(), parent)
		},
		/**
		 * Handle action of selecting a functional location. Go deeper in the structure
		 * @param{sap.ui.base.Event} val: triggering event (click on a line)
		 */
		handleFunctionalLocationPress: function(val) {
			/* Handle action when a functional location is pressed */
			try {
				ctl.selectedFuncLocTableCells = val.oSource.getCells();
				var funcloc = val.oSource.getCells()[1].getText();
				ctl.searchFunctionalLocation(ctl.getPlanPlant(), funcloc)

			} catch (err) {
				console.error(err);
			}
		},
		/**
		 * Handle action of selecting a functional location. Last node selection
		 * @param{sap.ui.base.Event} val: triggering event (click on line)
		 */
		validFunctionalLocation: function(val) {
			var view = ctl.getView();
			var model = view.getModel("plant");
			view.getModel("CreateNotification").setProperty("/FunctLoc", val.oSource.oParent.getCells()[1].getText());
			view.getModel("CreateNotification").setProperty("/Funcldescr", val.oSource.oParent.getCells()[2].getText());
			view.byId("FunctLoc").setValueState(sap.ui.core.ValueState.None);
			view.getModel("CreateNotification").setProperty("/Equipment", null);
			view.getModel("CreateNotification").setProperty("/Equidescr", null);
			view.getModel("CreateNotification").setProperty("/NotifItem", null);
			model.read("/FuncLocSet('" + val.oSource.oParent.getCells()[1].getText() + "')",{
				success: function(oData, oResponse) {
					if (oData.Equitype && oData.Equitype != ''){
						ctl.Equitype = oData.Equitype;
					} else {
						ctl.Equitype = 'ALL';
					}
				},
				error: ctl.oDataCallbackFail
			});
			ctl.selectedFuncLocTableCells = null;
			ctl.functionalLocationSelect.close();
		},
		/**
		 * Functional location search
		 * @param{string} planplant: planplant
		 * @param{string} parent: 	  Superior functional location
		 */
		searchFunctionalLocation: function (planplant, parent) {
			/* Research of function functional locations for matchcode, into list */

			/* Deletion of existing items */
			sap.ui.getCore().byId("funcLocationTable").unbindItems();

			/* Filters' definition */
			var aFilters = [];
			var oFilterPlanPlant = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, planplant);
			var oFilterSupFuncLoc = new sap.ui.model.Filter("Supfloc", sap.ui.model.FilterOperator.EQ, parent);
			if (!window.cordova) {
				aFilters.push(oFilterPlanPlant);
			}
			aFilters.push(oFilterSupFuncLoc);

			/* Search and bind data */
			sap.ui.getCore().byId("funcLocationTable").bindItems({
				path: "plant>/FuncLocSet",
				template: new sap.m.ColumnListItem("funcLocationTableListItem", {
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
					        		return ctl.validFunctionalLocation(evt)
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
				sorter : new sap.ui.model.Sorter('Funcloc', false)
			});

		},


		/************************************************************************/
		/*    EQUIPMENT                                                         */
		/************************************************************************/
		/**
		 * Open Equipment search help
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
		 * Handle search bar typing in equipment search help
		 * @param{sap.ui.base.Event} oEvent: triggering event (typing)
		 */
		handleSearchEquipment: function(oEvent) {
			ctl.searchEquipment(oEvent.getParameter("value"))
		},
		/**
		 * Search equipment corresponding to typed value
		 * @param{string} filterValue: value used to search for equipment
		 */
		searchEquipment: function(filterValue) {
			var view = ctl.getView();

			/* Deletion of existing items */
			ctl.equipmentSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oFilterPlanPlant = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant());
			var oFuncLocFilter = new sap.ui.model.Filter("Funcloc", sap.ui.model.FilterOperator.StartsWith, view.byId("FunctLoc").getValue());
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
					aFilters.push(oEquipmentFilter);
				}
			}
			aFilters.push(oFilterPlanPlant);
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
				filters: aFilters,
				sorter : new sap.ui.model.Sorter("Equipment", false)
			});
		},
		/**
		 * Handle action of selecting an equipment
		 * @param{sap.ui.base.Event} oEvent: triggering event (click on line)
		 */
		validEquipment: function(oEvent) {
			var aSelectedEquipments = oEvent.getParameter("selectedContexts");
			if (aSelectedEquipments.length) {
				var view = ctl.getView();
				aSelectedEquipments.map(function(oSelectedEquipment) {
					view.getModel("CreateNotification").setProperty("/Equipment", oSelectedEquipment.getObject().Equipment);
					view.getModel("CreateNotification").setProperty("/Equidescr", oSelectedEquipment.getObject().Descript.replace(/[^\w\s]/g, '-'));
				})
			}
		},

		/************************************************************************/
		/*    BREAKDOWN                                                         */
		/************************************************************************/
		/**
		 * Handle action of selecting/deselecting Breakdown checkbox
		 * @param{sap.ui.base.Event} oEvent: triggering event (click on checkbox)
		 */
		handleBreakdownSelect: function(oEvent) {
			if (oEvent.getParameter("selected")) {
				ctl.getView().getModel("CreateNotification").setProperty("/Breakdown", "X");
			} else {
				ctl.getView().getModel("CreateNotification").setProperty("/Breakdown", "");
			}
		},

		/************************************************************************/
		/*    DAMAGE GROUP/CODE                                                 */
		/************************************************************************/
		/**
		 * Open damage group search help fragment
		 */
		openDamageGroupSelect: function() {
			if ((typeof ctl.Equitype != "undefined") && (ctl.Equitype != "")){
				ctl.searchDamageGroup("");
				ctl.damageGroupSelect.setMultiSelect(false);
				ctl.damageGroupSelect.open();
			} else {
				sap.m.MessageToast.show(ctl.getI18nValue("createNotification.message.selectFunctLoc"));
			}
		},
		/**
		 * Handle search bar typing in damage group search help
		 * @param{sap.ui.base.Event} oEvent: triggering event (typing)
		 */
		handleSearchDamageGroup: function(oEvent) {
			ctl.searchDamageGroup(oEvent.getParameter("value"));
		},
		/**
		 * Search for damage group
		 * @param{string} filterValue: value used to search for damage group
		 */
		searchDamageGroup: function(filterValue) {

			var view = ctl.getView();

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
				sorter : [ new sap.ui.model.Sorter("Pos", false),
				           new sap.ui.model.Sorter("CodeGroup", false)]
			});
		},
		/**
		 * Handle action of selecting a damage group
		 * @param{sap.ui.base.Event} oEvent: triggering event (click on line)
		 */
		validDamageGroup: function(oEvent) {
			var view = ctl.getView();

			var aSelectedDamageGroups = oEvent.getParameter("selectedContexts");
			if (aSelectedDamageGroups.length) {
				aSelectedDamageGroups.map(function(oSelectedDamageGroup) {
					var aItems = view.getModel("CreateNotification").getProperty("/NotifItem") || [];
					if (aItems.length) {
						var oldGroup = aItems[0]['DCodegrp'];
						aItems[0]['DCodegrp'] = oSelectedDamageGroup.getObject().CodeGroup;
						aItems[0]['StxtGrpcd'] = oSelectedDamageGroup.getObject().ShortText;
					} else {
						var line = {
								NotifNo: view.getModel("CreateNotification").getProperty("/NotifNo"),
								ItemKey: '0001',
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

					view.getModel("CreateNotification").setProperty("/NotifItem", aItems);
				})
			}

		},
		/**
		 * Open damage code search help fragment
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
		 * Handle search bar typing in damage code search help
		 * @param{sap.ui.base.Event} oEvent: triggering event (typing)
		 */
		handleSearchDamageCode: function(oEvent) {
			ctl.searchDamageCode(oEvent.getParameter("value"))
		},
		/**
		 * Search for damage code
		 * @param{string} filterValue: value used to search for damage code
		 */
		searchDamageCode: function(filterValue) {
			var view = ctl.getView();

			/* Deletion of existing items */
			ctl.damageCodeSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oPlanPlantFilter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, ctl.getPlanPlant());
			var oEquitypeFilter = new sap.ui.model.Filter("Equitype", sap.ui.model.FilterOperator.EQ, ctl.Equitype);
			var oDamageGroupFilter = new sap.ui.model.Filter("CodeGroup", sap.ui.model.FilterOperator.EQ, this.byId("DCodegrp").getValue());

			aFilters.push(oPlanPlantFilter);
			aFilters.push(oEquitypeFilter);
			aFilters.push(oDamageGroupFilter);

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
					aFiltersDetail.push(oDescriptFilter);
					aFiltersDetail.push(oDamageCodeFilter);
					var oMainFilter = new sap.ui.model.Filter({
						filters: aFiltersDetail,
						and: false
					})
					aFilters.push(oMainFilter);
				} else {
					aFilters.push(oDamageCodeFilter);
				}
			}			

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
		 * Handle action of selecting a damage code
		 * @param{sap.ui.base.Event} oEvent: triggering event (click on line)
		 */
		validDamageCode: function(oEvent) {
			var aSelectedDamageCodes = oEvent.getParameter("selectedContexts");
			if (aSelectedDamageCodes.length) {
				var view = ctl.getView();
				aSelectedDamageCodes.map(function(oSelectedDamageCode) {
					var aItems = view.getModel("CreateNotification").getProperty("/NotifItem") || [];
					if (aItems.length) {
						aItems[0]['DCode'] = oSelectedDamageCode.getObject().Code;
						aItems[0]['TxtProbcd'] = oSelectedDamageCode.getObject().ShortText;
					} else {
						var line = {
								ItemKey: '0001',
								Planplant: ctl.getPlanPlant(),
								DCode: oSelectedDamageCode.getObject().Code,
								TxtProbcd: oSelectedDamageCode.getObject().ShortText
						}
						aItems.push(line);
					}
					view.getModel("CreateNotification").setProperty("/NotifItem", aItems);
				})
			}
		},

		/************************************************************************/
		/*   PICTURES                                                           */
		/************************************************************************/
		/**
		 * Handle action of clicking on "Take picture" button
		 * @param{sap.ui.base.Event} evt: triggering event (click on the button)
		 */
		capture: function(evt) {
			ctl.takePicture(evt, ctl._addPicture);
		},
		/**
		 * Handle action of clicking on "Open gallery" button
		 * @param{sap.ui.base.Event} evt: triggering event (click on the button)
		 */
		library: function(evt) {
			ctl.getPictureFromGallery(evt, ctl._addPicture);
		},
		/**
		 * Handle action of clicking on "Remove pictures" button
		 * It will make all pictures for the notification disappear
		 * @param{sap.ui.base.Event} evt: triggering event (click on the button)
		 */
		removeAllPics: function(evt) {
			ctl.getView().byId("library").setEnabled(true);
			ctl.getView().byId("camera").setEnabled(true);
			if (ctl.imageData) {
				ctl.imageData = [];
			}
			ctl.getView().byId("uploadCollection").removeAllItems();
		},
		/**
		 * Add a picture to the notification within the view
		 * @param{blob} 		imageData: raw image data
		 * @param{sap.m.Image}	image: Image object to be displayed
		 */
		_addPicture: function(imageData, image) {
			if (!ctl.imageData) {
				ctl.imageData = [];
			}

			ctl.imageData.push(imageData);

			ctl.getView().byId("uploadCollection").addItem(image);
			if (ctl.getView().byId("uploadCollection").getItems().length >= 2) {
				ctl.getView().byId("library").setEnabled(false);
				ctl.getView().byId("camera").setEnabled(false);
			}
		},

		/************************************************************************/
		/*    SPARE PARTS                                                       */
		/************************************************************************/
		/**
		 * Open spart part search help
		 */
		openSparePart: function() {
			ctl.searchSpareItem("");
			ctl.sparePart.setMultiSelect(true)
			ctl.sparePart.open();
		},
		/**
		 * Handle action of typing in spare part search help bar
		 * @param{sap.ui.base.Event} oEvent: triggering event (typing)
		 */
		handleSearchSpareItem: function(oEvent) {
			ctl.searchSpareItem(oEvent.getParameter("value"))
		},
		/**
		 * Search for spare part using filter value from spare part search help
		 * @param{string} filterValue: value used for research
		 */
		searchSpareItem: function(filterValue) {

			/* Deletion of existing items */
			ctl.sparePart.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			if (filterValue != "") {
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
				aFiltersDetail.push(oMatlDescFilter);
				aFiltersDetail.push(oMaterialIdFilter);
				aFiltersDetail.push(oRefTurbinierFilter);
				if (window.cordova) {
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
		 * Handle action of selecting a spare part
		 * @param{sap.ui.base.Event} oEvent: triggering event (click on line)
		 */
		validSparePart: function(oEvent) {
			var aSelectedSpareParts = oEvent.getParameter("selectedContexts")
			if (aSelectedSpareParts.length) {
				aSelectedSpareParts.map(function(oSelectedSparePart) {
					ctl.addSparePart(oSelectedSparePart.getObject().MaterialId, oSelectedSparePart.getObject().MatlDesc, 1)
				})
			}
		},
		/**
		 * Add a spare part in the spare part table
		 * @param{string} Material: Material number
		 * @param{string} MatlDesc: Material description
		 * @param{number} RequirementQuantity: Quantity required for the spare part
		 */
		addSparePart: function(Material, MatlDesc, RequirementQuantity) {
			var view = ctl.getView();
			var aComponents = view.getModel("CreateNotification").getProperty("/NotifComponent") || [];

			var line = {
					NotifNo: view.getModel("CreateNotification").getProperty("/NotifNo"),
					Material: Material,
					MatlDesc: MatlDesc.replace(/[^\w\s]/g, '-'),
					RequirementQuantity: RequirementQuantity.toString(),
					ItemNumber: Formatter.addLeadingZero(ctl._ItemNumber.toString(), 4),
					Planplant: ctl.getPlanPlant()
			}
			aComponents.push(line);
			ctl._ItemNumber++;

			view.getModel("CreateNotification").setProperty("/NotifComponent", aComponents);
		},
		/**
		 * Check wether actual value for the spare part is valid
		 * @param{number} currentValue: Actual requirement quantity for the spare part
		 * @param{string} path: Spare part URI
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
		 * Handle action of changing spare part required quantity
		 * @param{sap.ui.base.Event} evt: triggering event (direct field input)
		 */
		handleSparePartValueChange: function(evt) {
			var view = ctl.getView();
			var oModel = view.getModel("CreateNotification");
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			oModel.setProperty(path + "/RequirementQuantity", ctl.checkSparePartValue(value, path));
		},
		/**
		 * Handle action of incrementing spare part required quantity
		 * @param{sap.ui.base.Event} evt: triggering event (click on + button)
		 */
		incrementSparePart: function(evt) {
			var view = ctl.getView();
			var oModel = view.getModel("CreateNotification");
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			if (!isNaN(parseInt(value))) {
				value++;
			} else {
				value = 1;
			}
			oModel.setProperty(path + "/RequirementQuantity", ctl.checkSparePartValue(value, path));
		},
		/**
		 * Handle action of reducing spare part required quantity
		 * @param{sap.ui.base.Event} evt: triggering event (click on - button)
		 */
		decrementSparePart: function(evt) {
			var view = ctl.getView();
			var oModel = view.getModel("CreateNotification");
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			if (!isNaN(parseInt(value))) {
				value--;
			} else {
				value = 0;
			}
			var newValue = ctl.checkSparePartValue(value, path);
			if (newValue !== null){
				// when newValue is null, the spare spart has been removed
				oModel.setProperty(path + "/RequirementQuantity", newValue);				
			}			
		},
		/**
		 * Handle action of clicking on delete spare part button
		 * @param{sap.ui.base.Event} evt: triggering event (click on bin)
		 */
		deleteSparePart: function(evt) {
			ctl.removeSparePart(evt.oSource.getParent().getBindingContextPath());
		},
		/**
		 * Remove spare part from the notification
		 * @param{string} path: Spare part URI
		 */
		removeSparePart: function(path) {
			var view = ctl.getView();
			var oModel = view.getModel("CreateNotification");
			var aSplit = path.split("/");
			var aItems = oModel.getProperty("/NotifComponent");
			aItems.splice(aSplit[2], 1);
			oModel.setProperty("/NotifComponent", aItems);
		},
		/**
		 * Handle action of clicking on "Scan barcode" button
		 * @param{sap.ui.base.Event} evt: triggering event (click on button)
		 */
		scanBarcode: function(evt) {
			ctl._callBarcodeScanner(evt,
					// result is a JSON with 3 attributes
					// text: value of the barcode
					// format: format of the barcode (only if the scanner has been used)
					// cancelled: boolean that indicate cancellation
					function(result) {
				var model = ctl.getView().getModel();
				var material = Formatter.addLeadingZero(result.text, 18);
				model.read("/MaterialSet('" + material + "')",{
					success: function(oData, oResponse) {
						ctl.addSparePart(oData.MaterialId, oData.MatlDesc, 1);
					},
					error: ctl.oDataCallbackFail
				});
			});
		},

		/************************************************************************/
		/*   SUBMIT                                                             */
		/************************************************************************/
		/**
		 * Call notification creation in the backend
		 */
		submitNotification: function() {
			if (ctl._checkInput(false)) {
				var oModelWork = ctl.getView().getModel("plant");
				var oModelInput = ctl.getView().getModel("CreateNotification");
				// Add value
				oModelInput.setProperty("/NotiftypeText", ctl.getView().byId("Notiftype").getSelectedItem().getText().replace(/[^\w\s]/g, '-'));
				oModelInput.setProperty("/PriorityText", ctl.getView().byId("Priority").getSelectedItem().getText().replace(/[^\w\s]/g, '-'));
				var oNotifData = oModelInput.getData();

				var oNotifHeader = $.extend(true, {}, oModelInput.getData());
				delete oNotifHeader.NotifComponent;
				delete oNotifHeader.NotifItem;
				delete oNotifHeader.NotifAttach;
				oNotifHeader.DesstDate = Formatter.JSDateTimeToEDMDateTime(new Date());
				oNotifHeader.DesendDate = Formatter.JSDateTimeToEDMDateTime(new Date());

				ctl.setAppBusy(true);

				var sPath = "/NotifHeaderSet";
				oModelWork.create( sPath, oNotifHeader, {
					success: function(oData, oResponse) {
						if (window.cordova){
							var sPath = oResponse.data.__metadata.uri.replace(kalydia.oData.stores[ctl.getPlanPlant()].serviceUri,"");
						}else{
							var sPath = "/NotifHeaderSet('" + oData.NotifNo + "')";
						}
						// NotifItem
						if (oNotifData.NotifItem){
							var sPathCreate = sPath + "/NotifItem";
							$.each(oNotifData.NotifItem, function(Item) {
								oModelWork.create( sPathCreate, oNotifData.NotifItem[Item],{
									success: function(oData, oResponse) {
									},
									error: ctl.oDataCallbackFail
								})
							});
						}
						// Component
						if (oNotifData.NotifComponent){
							var sPathCreate = sPath + "/NotifComponent";
							ctl.submitComponent(sPathCreate, oNotifData.NotifComponent, oNotifData.NotifComponent.length-1);
						}
						// Image
						if (ctl.imageData){
							if (window.cordova){
								var sPathCreate = kalydia.oData.stores[ctl.getPlanPlant()].serviceUri + sPath + "/NotifAttach";
							}else{
								var sPathCreate = kalydia.logon.ApplicationContext.applicationEndpointURL + sPath + "/NotifAttach";
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
						}
						var message = ctl.getResourceBundle().getText("createNotification.message.createOk", [ctl.formatRemoveLeadingZeros(oData.NotifNo)]);
						sap.m.MessageToast.show(message);
						ctl.addMessage(message, sap.ui.core.MessageType.Success);
						ctl.initUserInputModelBinding();
						ctl.removeAllPics();
					},
					error: ctl.oDataCallbackFail
				}
				);

				ctl.setAppBusy(false);
			}
		},
		/**
		 * Call component creation for the notification in the backend
		 * @param{string} sPathCreate: Component URI for the new notification
		 * @param{array}  NotifComponent: array of components to be created
		 * @param{number} Component: count of remaining components to be created
		 */
		submitComponent: function(sPathCreate, NotifComponent, Component){
			var oModelWork = ctl.getView().getModel("plant");
			oModelWork.create( sPathCreate, NotifComponent[Component],{
				success: function(oData, oResponse) {
					if (Component != 0){
						var comp = Component - 1;
						ctl.submitComponent(sPathCreate, NotifComponent, comp);
					}
				},
				error: ctl.oDataCallbackFail
			})
		},
		/**
		 * Checks if all required input have been filled
		 * @param{boolean} reset: Action is to reset form?
		 * @returns{boolean} True if form is complete, False otherwise
		 */
		_checkInput: function(reset) {
			var oView = ctl.getView();
			var aInputs = [
			               oView.byId("ShortText"),
			               oView.byId("FunctLoc"),
			               oView.byId("StrmlfnDate")
			               ];

			/* Check if we have some input that are required and empty */
			var incompleteInput = false;
			jQuery.each(aInputs, function(i, oInput) {
				if (oInput.getValue() === "" && !reset) {
					oInput.setValueState(sap.ui.core.ValueState.Error);
					incompleteInput = true;
				} else {
					oInput.setValueState(sap.ui.core.ValueState.None);
				}
			});

			/* Check if we had required input not completed */
			if (incompleteInput == true) {
				sap.m.MessageToast.show(ctl.getI18nValue("createNotification.message.enterRequiredField"), {
					duration: 4000
				});
				return false;
			}

			if (!reset){
				if (oView.byId("DCodegrp").getValue() !== "" && oView.byId("DCode").getValue() === "") {
					oView.byId("DCode").setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show(ctl.getI18nValue("createNotification.message.selectDamageCode"), {
						duration: 4000
					});
					return false;
				}
				return true;
			}
		},

		/************************************************************************/
		/*   OTHER METHODS                                                      */
		/************************************************************************/
		/**
		 * Reset all input data (model, pictures)
		 */
		handlePressCancel: function() {
			var dialog = new sap.m.Dialog({
				title: ctl.getResourceBundle().getText('commun.screen.clear'),
				showHeader: false,
				type: 'Standard',
				content: new sap.m.Text({ text: ctl.getResourceBundle().getText('commun.screen.clear') }),
				buttons: [new sap.m.Button({
					text: ctl.getResourceBundle().getText('commun.screen.clear'),
					press: function () {
						ctl.initUserInputModelBinding();
						ctl.removeAllPics();
						ctl._checkInput(true);
						dialog.close();
					}
				}),
				new sap.m.Button({
					text: ctl.getResourceBundle().getText('common.frag.button.cancel'),
					press: function () {
						dialog.close();
					}
				})
				],
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
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
		 * Close dialogs
		 * @param{sap.ui.base.Event} evt: triggering event (click on cancel / after line selection)
		 */
		closeDialog: function(evt) {
			evt.oSource.oParent.close();
		},
		/**
		 * Navigate to similar notification view
		 */
		navToSimilarNotification: function() {
			/* Navigate to similar notification screen */
			var oModel = ctl.getView().getModel("CreateNotification");

			/* If no functional location is provided */
			if (!oModel.getProperty("/FunctLoc")) {
				sap.m.MessageToast.show(this.getI18nValue("createNotification.message.selectFunctionalLocation"));
				return;
			}

			/* Call of the other view */
			UIComponent.getRouterFor(ctl).navTo("SimilarNotification", {
				FunctLoc: oModel.getProperty("/FunctLoc")
			});
		},

		/************************************************************************/
		/*   FORMATTERS                                                         */
		/************************************************************************/
		/**
		 * Format SAP flag to a boolean
		 * @param{string} value: Flag value
		 * @returns{boolean}
		 */
		formatFlag: function(value){
			return Formatter.formatFlag(value);
		},
		/**
		 * Remove leading zeros from SAP identifiers
		 * @param{string} value: Identifier
		 * @returns{string}
		 */
		formatRemoveLeadingZeros: function(value) {
			return Formatter.removeLeadingZeros(value);
		},
		/**
		 * Concatenate Material number and reference for spare part search help
		 * @param{string} Material: Material number
		 * @param{string} RefTurbinier: Reference
		 * @returns{string}
		 */
		formatSparePartSearchDescription: function(Material, RefTurbinier) {
			Material = ctl.formatRemoveLeadingZeros(Material);
			if (RefTurbinier === "") {
				return Material;
			} else {
				return Material + " - " + RefTurbinier;
			}
		}

	});

});
