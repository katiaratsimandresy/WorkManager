/** @module Notification List */

sap.ui.define([
               'com/kalydia/edfen/workmanager/controller/BaseController',
               'sap/ui/core/UIComponent',
               'com/kalydia/edfen/workmanager/util/Formatter',
               'sap/m/MessagePopover',
               'sap/m/MessagePopoverItem',
               'com/kalydia/edfen/workmanager/model/models'
               ], function(BaseController, UIComponent, Formatter, MessagePopover, MessagePopoverItem, models) {
	"use strict";
	var oControl;
	return BaseController.extend("com.kalydia.edfen.workmanager.controller.NotificationList.NotificationList", {

		/**
		 * Triggered on controller initialisation.
		 * Call XML fragments, register to events
		 */
		onInit: function() {
			oControl = this;
			oControl.oItemBindingPath = null;
			oControl.isRestrictedToTechnician = true;
			oControl._ItemNumber = 0;
			oControl._delta = {
					deleted: {
						NotifComponent: []
					}
			};

			oControl.getRouter("NotificationList").attachRoutePatternMatched(oControl.onRouteMatched, oControl);
			oControl.getView().byId("list").attachUpdateFinished(function(oEvent){
				// Select first element
				oControl.selectFirstItem();

				if(oEvent.oSource.getItems().length == 0 && oControl.here === true){
					// If there is no element in the list, go back to homepage
					UIComponent.getRouterFor(oControl).navTo("appHome");
				}
			});
		},

		/**
		 * Triggered when quiting the view.
		 * Destroy XML fragments
		 */
		onExit: function() {
			if (!oControl._functionalLocationSelect) {
				oControl._functionalLocationSelect.destroy();
			}
			if (!oControl.equipmentSelect) {
				oControl.equipmentSelect.destroy();
			}
			if (!oControl.damageGroupSelect) {
				oControl.damageGroupSelect.destroy();
			}
			if (!oControl.damageCodeSelect) {
				oControl.damageCodeSelect.destroy();
			}
			if (!oControl.sparePart) {
				oControl.sparePart.destroy();
			}
		},
		/**
		 * RoutePatternMatched event handler
		 * @param{sap.ui.base.Event} oEvent router pattern matched event object
		 */
		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");
			if (sName === "NotificationList"){
				oControl.isRestrictedToTechnician = !oControl.getEmployeeData().isAreaManager;

				oControl.setApproveButton(!oControl.isRestrictedToTechnician);
				oControl.setRejectButton(!oControl.isRestrictedToTechnician);

				oControl.disableEditMode();

				// reset counters
				oControl._ItemNumber = 1;
				oControl._delta = {
						deleted: {
							NotifComponent: []
						}
				};

				// reset screen
				oControl.getView().byId("detailNotification").setModel(new sap.ui.model.json.JSONModel(), "Notification");

				oControl.updateListBinding(oEvent);
				oControl.here = true;
			} else {
				oControl.here = false;
			}
		},

		/************************************************************************/
		/*    General Event Handlers                                            */
		/************************************************************************/

		/**
		 * Event handler for master page sort event
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		handleSorting: function(oEvent) {
			var sortPath = oEvent.getParameter("selectedItem").getKey();
			var desc = "Priority" !== sortPath;
			var sorter = new sap.ui.model.Sorter(sortPath, desc);
			var binding = oControl.getView().byId("list").getBinding("items");
			binding.sort(sorter);
		},

		/**
		 * Event handler for master page search event
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		handleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oList = oControl.getView().byId("list");
			var oBinding = oList.getBinding("items");
			var aFilters = [];

			var oNotifNoFilter = new sap.ui.model.Filter("NotifNo", sap.ui.model.FilterOperator.Contains, sValue);
			var oFunctLocFilter = new sap.ui.model.Filter(
					"FunctLoc", 
					sap.ui.model.FilterOperator.Contains, 
					sValue
			);
			var oShortTextFilter = new sap.ui.model.Filter(
					"ShortText", 
					sap.ui.model.FilterOperator.Contains, 
					sValue
			);
			if(window.cordova){
				var aFiltersDetail = [];    				
				aFiltersDetail.push(oNotifNoFilter);
				aFiltersDetail.push(oFunctLocFilter);
				aFiltersDetail.push(oShortTextFilter);					
				var oMainFilter = new sap.ui.model.Filter({
					filters: aFiltersDetail,
					and: false
				})
				aFilters.push(oMainFilter);
			}
			else{
				aFilters.push(oNotifNoFilter);
			}
			oBinding.filter(aFilters);
		},

		/**
		 * Event handler for master page search event
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		handleRefresh: function(oEvent) {
			oControl.updateListBinding(oEvent);
		},
		/**
		 * Event handler for Review event
		 * @param {sap.ui.base.Event} oEvent event
		 */
		Review: function(oEvent) {
			oControl.setEditSpareParts(true);
			var oModel = oControl.getDetailModel();
			var aComponents = $.isEmptyObject(oModel) ? [] : oModel.getProperty("/NotifComponent");

			oControl._ItemNumber = 1;
			if (!$.isEmptyObject(aComponents)) {
				$.each(aComponents, function(key, element) {
					var iItemNumber = parseInt(element.ItemNumber);
					if (iItemNumber >= oControl._ItemNumber) {
						oControl._ItemNumber = iItemNumber;
					}
				});
				oControl._ItemNumber++;
			}

			oControl._delta = {
					deleted: {
						NotifComponent: []
					}
			};


			oControl.setEditNotifHeader(true);

			oControl.setReviewButton(false);
			oControl.setSaveButton(true);
		},

		/**
		 * Event handler for approve notification button
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		Approve: function(oEvent) {
			if (oControl.getDetailModel().getData().NotifNo) {
				var dialog = new sap.m.Dialog({
					title: oControl.getResourceBundle().getText('NotificationList.button.Approve'),
					type: 'Standard',
					content: new sap.m.Text({ text: oControl.getResourceBundle().getText('NotificationList.create.order.Select') }),
					buttons: [new sap.m.Button({
						text: oControl.getResourceBundle().getText('NotificationList.create.order.ENS1'),
						press: function () {
							oControl.checkDetailModelChange("/OrderType", "ENS1");
							oControl.getDetailModel().setProperty("/OrderType", "ENS1");
							oControl.checkDetailModelChange("/InProcess", "X");
							oControl.getDetailModel().setProperty("/InProcess", "X");
							oControl.Save(oEvent);
							dialog.close();
						}
					}),
					new sap.m.Button({
						text: oControl.getResourceBundle().getText('NotificationList.create.order.ENS2'),
						press: function () {
							oControl.checkDetailModelChange("/OrderType", "ENS2");
							oControl.getDetailModel().setProperty("/OrderType", "ENS2");
							oControl.checkDetailModelChange("/InProcess", "X");
							oControl.getDetailModel().setProperty("/InProcess", "X");
							oControl.Save(oEvent);
							dialog.close();
						}
					}),
					new sap.m.Button({
						text: oControl.getResourceBundle().getText('NotificationList.create.order.cancel'),
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
			}
		},

		/**
		 * Event handler for reject notification button
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		Reject: function(oEvent) {
			if (oControl.getDetailModel().getData().NotifNo) {
				oControl.checkDetailModelChange("/Complete", "X");
				oControl.getDetailModel().setProperty("/Complete", "X");
				oControl.Save(oEvent);
			}
		},

		/**
		 * Event handler for Save event
		 * @param {sap.ui.base.Event} oEvent event
		 */
		Save: function(oEvent) {
			oControl.setAppBusy(true);
			var oModelWork = oControl.getView().getModel("plant");

			var oModelInput = oControl.getDetailModel();

			// to avoid resend complete text
			if (!oModelInput.getData().NotifdesctextNew){
				oControl.checkDetailModelChange("/NotifdesctextNew", "");
			}

			var objData = $.extend(true, {}, oModelInput.getData());

			// Retrieve header data
			var oNotifHeader = objData;
			var oNotifComponent = objData.NotifComponent;
			var oNotifItem = objData.NotifItem;
			var oNotifAttach = objData.NotifAttach;
			oNotifComponent = null;
			oNotifItem = null;
			oNotifAttach = null;

			delete oNotifHeader.NotifComponent;
			delete oNotifHeader.NotifItem;
			delete oNotifHeader.NotifAttach;
			delete oNotifHeader.NotifNo;
			// Fix due to wrong format retrieved by oDataModel class
			oNotifHeader.MntcallNo = isNaN(parseInt(oNotifHeader.MntcallNo)) ? 0 : parseInt(oNotifHeader.MntcallNo);
			// Notifdesctext should send only the new text
			// Note: Actually Notifdesctext cannot be modified so put blank
			oNotifHeader.Notifdesctext = oNotifHeader.NotifdesctextNew;
			delete oNotifHeader.NotifdesctextNew;
			// Get Header Changes
			var deltaHeader = oControl._delta.NotifHeaderData;
			if (!$.isEmptyObject(deltaHeader)) {
				deltaHeader.Notifdesctext = deltaHeader.NotifdesctextNew;
				delete deltaHeader.NotifdesctextNew;
			}
			// Get NotifItem Changes
			oNotifItem = oControl._delta.NotifItem;
			// Get NotifComponent Changes
			oNotifComponent = oControl._delta.NotifComponent;
			// Update NotifHeaderSet
			if (true === oControl._delta.NotifHeader) {
				deltaHeader.DesstDate = Formatter.JSDateTimeToEDMDateTime(new Date());
				deltaHeader.DesendDate = Formatter.JSDateTimeToEDMDateTime(new Date());
				oModelWork.update(
						oControl.oItemBindingPath,
						deltaHeader, {
							merge: true,
							success: function(oData, oResponse) {
							},
							error: oControl.oDataCallbackFail
						}
				);
			}

			/**********************************************************************************************
			 *                 UPDATE NOTIF ITEM
			 * ********************************************************************************************/

			// Update NotifItem
			if (!$.isEmptyObject(oNotifItem)) {
				var data = oNotifItem[0];
				if (data.ItemKey) {
					// UPDATE
					var sPath = (window.cordova) ?
							data.__metadata.uri.replace(kalydia.oData.stores[oControl.getPlanPlant()].serviceUri, "") :
								"/" + data.__metadata.uri.split('/').pop();
							oModelWork.update(
									sPath,
									data, {
										merge: true,
										success: function(oData, oResponse) {
										},
										error: oControl.oDataCallbackFail
									}
							);
				} else {
					// CREATE
					// add mandatory fields
					data.NotifNo = objData.NotifNo;
					data.ItemKey = "0001";
					data.ItemSortNo = "0001";
					oModelWork.create(
							oControl.oItemBindingPath + "/NotifItem",
							data, {
								success: function(oData, oResponse) {
								},
								error: oControl.oDataCallbackFail
							}
					);
				}
			}

			/**********************************************************************************************
			 *                 UPDATE SPARE PARTS
			 * ********************************************************************************************/
			// Delete Spare Parts
			if (!$.isEmptyObject(oControl._delta.deleted.NotifComponent)) {
				$.each(oControl._delta.deleted.NotifComponent, function(index, value) {
					var data = value[0];
					var sPath = (window.cordova) ?
							data.__metadata.uri.replace(kalydia.oData.stores[oControl.getPlanPlant()].serviceUri, "") :
								"/" + data.__metadata.uri.split('/').pop();
							oModelWork.remove(sPath, {
								success: function(oData, oResponse) {
								},
								error: oControl.oDataCallbackFail
							});
				});
			}
			// Updates And New Spare Parts
			if (!$.isEmptyObject(oNotifComponent)) {
				var updates = [];
				var news = [];
				$.each(oNotifComponent, function(index, value) {
					if (value.isNew) {
						news.push({
							ItemNumber: value.ItemNumber,
							Material: value.Material,
							MatlDesc: value.MatlDesc.replace(/[^\w\s]/g, '-'),
							NotifNo: value.NotifNo,
							RequirementQuantity: value.RequirementQuantity
						});
					} else {
						updates.push({
							__metadata: value.__metadata,
							ItemNumber: value.ItemNumber,
							Material: value.Material,
							MatlDesc: value.MatlDesc.replace(/[^\w\s]/g, '-'),
							NotifDate: value.NotifDate,
							NotifNo: value.NotifNo,
							RequirementQuantity: value.RequirementQuantity,
							RequirementQuantityUnit: value.RequirementQuantityUnit,
							Planplant: value.Planplant
						});
					}
				});

				// add new spare parts
				if (!$.isEmptyObject(news)) {
					$.each(news, function(index, value) {
						oModelWork.create(
								oControl.oItemBindingPath + "/NotifComponent",
								value, {
									success: function(oData, oResponse) {
									},
									error: oControl.oDataCallbackFail
								}
						);
					});
				}

				// update existing spare parts
				if (!$.isEmptyObject(updates)) {
					$.each(updates, function(index, value) {
						var sPath = (window.cordova) ?
								value.__metadata.uri.replace(kalydia.oData.stores[oControl.getPlanPlant()].serviceUri, "") :
									"/" + value.__metadata.uri.split('/').pop();
								oModelWork.update(
										sPath,
										value, {
											merge: true,
											success: function(oData, oResponse) {
											},
											error: oControl.oDataCallbackFail
										}
								);
					});
				}
			}
			// Message
			var message = oControl.getResourceBundle().getText(oControl.getI18nValue("NotificationList.message.update"), [oControl.formatRemoveLeadingZeros(oModelInput.getData().NotifNo)]);
			sap.m.MessageToast.show(message);
			oControl.addMessage(message, sap.ui.core.MessageType.Success);

			oControl.disableEditMode();
			oControl.setReviewButton(true);
			// reset counters
			oControl._delta = {
					deleted: {
						NotifComponent: []
					}
			};

			oControl.setAppBusy(false);
		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onSelect: function(oEvent) {
			var sContainer = oControl.getView().byId("containerNotification");
			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			oControl.disableEditMode();
			oControl.updateDetailElementsBindings(oItem);
		},

		/**
		 * Event handler for the similar notification button
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		navToSimilarNotification: function() {
			/* Navigate to similar notification screen */
			var oModel = oControl.getDetailModel();

			/* If no functional location is provided */
			if (!oModel.getProperty("/FunctLoc")) {
				sap.m.MessageToast.show(oControl.getI18nValue("createNotification.message.selectFunctionalLocation"));
				return;
			}

			/* Call of the other view */
			UIComponent.getRouterFor(oControl).navTo("SimilarNotification", {
				FunctLoc: oModel.getProperty("/FunctLoc")
			});
		},

		/************************************************************************/
		/*    Helper Functions                                                  */
		/************************************************************************/
		/**
		 * Set screen element so we can't modify inputs
		 */
		disableEditMode: function() {
			oControl.setReviewButton(false);
			oControl.setSaveButton(false);
			// reset editable parts
			oControl.setEditSpareParts(false);
			oControl.setEditNotifHeader(false);
		},

		/**
		 * Helper Function to update the list binding info
		 * @param {sap.ui.base.Event} oEvent the event
		 * **/
		updateListBinding: function(oEvent) {
			var oList = oControl.getView().byId("list");
			var oBindingInfo = oList.getBindingInfo("items");
			var sEventId = oEvent.getId();
			var oEventSource = oEvent.oSource;
			// reset all filters
			oBindingInfo.filters = [];
			// update filters
			oBindingInfo.filters.push(new sap.ui.model.Filter("InProcess", sap.ui.model.FilterOperator.EQ, ' '));
			oBindingInfo.filters.push(new sap.ui.model.Filter("Complete", sap.ui.model.FilterOperator.EQ, ' '));
			oBindingInfo.filters.push(new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, oControl.getPlanPlant()));
			if (window.cordova) {
				oList.setGrowingThreshold(5000);
			}
			oList.bindAggregation("items", oBindingInfo);

			oList.attachEventOnce("updateFinished", function() {
				if ("refresh" === sEventId && !$.isEmptyObject(oEventSource)) {
					oEventSource.hide();
				}
			}, oControl);

		},

		/**
		 * Helper Function to select the first item
		 */
		selectFirstItem: function() {
			var oList = oControl.getView().byId("list");
			var aItems = oList.getItems();

			if (aItems.length) {
				oList.setSelectedItem(aItems[0], true);
				oControl.updateDetailElementsBindings(aItems[0]);
			}
		},

		/**
		 * Helper Function to enable review spare parts
		 * @param {boolean} bEditable visibility and enability of the component
		 * **/
		setEditSpareParts: function(bEditable) {
			var oView = oControl.getView();
			var spareParts = [
			                  oView.byId('addSparePartNotification'),
			                  oView.byId('barcodeNotification'),
			                  oView.byId('decrementSparePartColumnNotification'),
			                  oView.byId('incrementSparePartColumnNotification'),
			                  oView.byId('deleteSparePartColumnNotification')
			                  ];

			$.each(spareParts, function(index, element) {
				if (element.setEnabled) {
					element.setEnabled(bEditable);
				}
				if (element.setVisible) {
					element.setVisible(bEditable);
				}
			});
			oView.byId('RequirementQuantityNotificationDisplay').setVisible(!bEditable);
			oView.byId('RequirementQuantityNotificationInput').setVisible(bEditable);
		},

		/**
		 * Helper Function to enable review header information
		 * @param {boolean} bEditable visibility and enability of the component
		 * **/
		setEditNotifHeader: function(bEditable) {
			var oView = oControl.getView();

			var arElements = [
			                  oView.byId('ShortTextNotification'),
			                  oView.byId('functLocationNotification'),
			                  oView.byId('equipmentNotification'),
			                  oView.byId('breakdownNotification'),
			                  oView.byId('DCodegrpNotification'),
			                  oView.byId('DCodeNotification'),
			                  oView.byId('LabelNotifdesctextNotificationNew'),
			                  oView.byId('NotifdesctextNotificationNew'),
			                  ];

			$.each(arElements, function(index, element) {
				if (element.setEditable) {
					element.setEditable(bEditable);
				}
			});

			oView.byId('LabelNotifdesctextNotificationNew').setVisible(bEditable);
			oView.byId('NotifdesctextNotificationNew').setVisible(bEditable);
			oView.byId('priorityNotification').setEnabled(bEditable);
		},

		/**
		 * Helper Function to enable approve button
		 * @param {boolean} bEditable   visibility of the component
		 * **/
		setApproveButton: function(bVisible) {
			oControl.getView().byId('approveNotification').setVisible(bVisible);
		},

		/**
		 * Helper Function to enable reject button
		 * @param {boolean} bEditable   visibility of the component
		 * **/
		setRejectButton: function(bVisible) {
			oControl.getView().byId('rejectNotification').setVisible(bVisible);
		},

		/**
		 * Helper Function to enable review button
		 * @param {boolean} bEditable   visibility of the component
		 * **/
		setReviewButton: function(bVisible) {
			oControl.getView().byId('reviewNotification').setVisible(bVisible);
			oControl.getView().byId('approveNotification').setEnabled(bVisible);
		},

		/**
		 * Helper Function to enable save button
		 * @param {boolean} bEditable   visibility of the component
		 * **/
		setSaveButton: function(bVisible) {
			oControl.getView().byId('saveNotification').setVisible(bVisible)
		},

		/**
		 * Helper function to bind Elements
		 * @param {string} the selected item
		 * **/
		updateDetailElementsBindings: function(oItem) {
			var oDetail = oControl.getView().byId("detailNotification");
			var oModel = oControl.getOwnerComponent().getModel("plant");
			var oJsonData = {};
			oControl.oItemBindingPath = oItem.getBindingContextPath();
			oControl.setReviewButton(false);

			oControl.updateUploadCollection(null);
			var sPath = oControl.oItemBindingPath;
			oModel.read(sPath, {
				success: function(oData, response) {
					oModel.read("/FuncLocSet('" + oData.FunctLoc + "')",{
						success: function(oData, oResponse) {
							if (oData.Equitype && oData.Equitype != ''){
								oControl.Equitype = oData.Equitype;
							} else {
								oControl.Equitype = 'ALL';
							}
						},
						error: oControl.oDataCallbackFail
					});
					$.each(oData, function(index, value) {
						if ("__metadata" !== index) {
							if (value && value.__deferred) {
								if (window.cordova) {
									sPath = value.__deferred.uri.replace(kalydia.oData.stores[oControl.getPlanPlant()].serviceUri, "");
								} else {
									sPath = oControl.oItemBindingPath + value.__deferred.uri.substring(value.__deferred.uri.lastIndexOf("/"));
								}
								oModel.read(sPath, {
									success: function(oData, response) {
										if ("NotifAttach" === index && !$.isEmptyObject(oData.results)) {
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
											// update upload collection
											oControl.updateUploadCollection(oJsonData.NotifAttach);
										} else {
											oJsonData[index] = oData.results;
										}

										if (oJsonData[index] && oJsonData[index].__metadata) {
											delete oJsonData[index].__metadata;
										}
										if (oJsonData[index] && oJsonData[index].__proto__) {
											delete oJsonData[index].__proto__;
										}
										// if the model already exists, update the corresponding property
										if (oDetail.getModel("Notification")) {
											oDetail.getModel("Notification").setProperty("/" + index, oJsonData[index]);
										}
									},
									error: oControl.oDataCallbackFail
								});
							} else {
								oJsonData[index] = value;
							}
						}
					});
					oDetail.setModel(new sap.ui.model.json.JSONModel(oJsonData), "Notification");
					oControl.setReviewButton(true);
				},
				error: oControl.oDataCallbackFail
			});
		},

		/**
		 * Helper Function to update upload collection
		 * @param {array} aAttach   array of attachment
		 * **/
		updateUploadCollection: function(aAttach) {
			var oHbox = oControl.getView().byId('uploadCollectionNotification');
			if (!$.isEmptyObject(aAttach)) {
				// remove all items
				oHbox.removeAllItems();
				$.each(aAttach, function(index, imageData) {
					oHbox.addItem(new sap.m.Image({
						press: oControl._enlargeImage,
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

		/**
		 * Helper function to get the detail model
		 * **/
		getDetailModel: function() {
			var oDetail = oControl.getView().byId("detailNotification");
			return oDetail.getModel('Notification');
		},

		/**
		 * Helper function to check the detail model changes
		 * for Header
		 * **/
		checkDetailModelChange: function(sProperty, newValue, bForce) {
			var oldValue = oControl.getDetailModel().getProperty(sProperty);
			var skey = sProperty.substr(1);
			if (!oControl._delta.NotifHeader) {
				oControl._delta.NotifHeaderData = {}
			}
			if (!oControl._delta.NotifHeader) {
				oControl._delta.NotifHeader = ( (oldValue !== newValue) || bForce );
			}
			if ('object' === typeof newValue) {
				oControl._delta[skey] = newValue;
			} else {
				oControl._delta.NotifHeaderData[skey] = newValue;
			}
		},

		/************************************************************************/
		/*    SHORT TEXT                                                        */
		/************************************************************************/
		/**
		 * Function triggered after short text modification
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		handleShortTextModification: function(oEvent) {
			oControl.checkDetailModelChange("/ShortText", oEvent.getParameter("value"));
		},
		/************************************************************************/
		/*    TEXT                                                              */
		/************************************************************************/
		/**
		 * Function triggered after notification description text modification
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		handleNotifdesctextModification: function(oEvent) {
			oControl.checkDetailModelChange("/NotifdesctextNew", oEvent.getParameter("value"));
		},
		/************************************************************************/
		/*    PRIORITY                                                          */
		/************************************************************************/
		/**
		 * Function triggered after notification priority has been changed
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		handlePriorityChange: function(oEvent) {
			oControl.checkDetailModelChange("/Priority", oEvent.getSource().getSelectedKey(), true);
			oControl.checkDetailModelChange("/PriorityText", oEvent.getSource().getSelectedItem().getText().replace(/[^\w\s]/g, '-'), true);
		},
		/************************************************************************/
		/*    FUNCTIONAL LOCATION                                               */
		/************************************************************************/

		/**
		 * Opening of functional location search.
		 * @param   none
		 * @public
		 * @returns none
		 */
		openFunctionalLocationSelect: function() {
			var parent = "";
			if (!oControl._functionalLocationSelect) {
				oControl._functionalLocationSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.NotificationList.fragment.functionalLocationSelect", oControl);
				oControl.getView().addDependent(oControl._functionalLocationSelect);
				sap.ui.getCore().byId("funcLocationTableNotificationList").attachUpdateFinished(function(evt) {
					/* Trigger when functional locations' loading is over */
					/* If research has no result we consider item is selected */
					/* Hence we close the selection popup */
					var tab = evt.oSource;
					if (tab.getItems().length == 0) {
						if (oControl.selectedFuncLocTableCells != null) {
							oControl.checkDetailModelChange("/FunctLoc", oControl.selectedFuncLocTableCells[1].getText());
							oControl.getDetailModel().setProperty("/FunctLoc", oControl.selectedFuncLocTableCells[1].getText());
							oControl.getDetailModel().setProperty("/Funcldescr", oControl.selectedFuncLocTableCells[2].getText());
							oControl.checkDetailModelChange("/Equipment", "");
							oControl.getDetailModel().setProperty("/Equipment", "");
							oControl.getDetailModel().setProperty("/Equidescr", "");
							oControl._functionalLocationSelect.close();
						}
					}
				});
			}
			oControl._functionalLocationSelect.open();
			oControl.searchFunctionalLocation(oControl.getPlanPlant(), parent)
		},

		/**
		 * Generic function to close a dialog
		 * @param {sap.ui.base.Event} evt: the event, containing dialog info
		 */
		closeDialog: function(evt) {
			evt.oSource.oParent.close();
		},
		/**
		 * Helper Function to update the list binding info
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		handleFunctionalLocationPress: function(val) {
			/* Handle action when a functional location is pressed */
			try {
				oControl.selectedFuncLocTableCells = val.oSource.getCells();
				var funcloc = val.oSource.getCells()[1].getText();
				oControl.searchFunctionalLocation(oControl.getPlanPlant(), funcloc);
			} catch (err) {
				console.error(err);
			}
		},
		/**
		 * Select a functional location from search help dialog
		 * @param {sap.ui.base.Event} val the event
		 */
		validFunctionalLocation: function(val) {
			var oModel = oControl.getDetailModel();
			oControl.checkDetailModelChange("/FunctLoc", val.oSource.oParent.getCells()[1].getText());
			oModel.setProperty("/FunctLoc", val.oSource.oParent.getCells()[1].getText());
			oModel.setProperty("/Funcldescr", val.oSource.oParent.getCells()[2].getText());
			oControl.checkDetailModelChange("/Equipment", "");
			oModel.setProperty("/Equipment", "");
			oModel.setProperty("/Equidescr", "");
			oControl._functionalLocationSelect.close();
		},
		/**
		 * Search for children functional locations
		 * @param {string} workcenter: the workcenter
		 * @param {string} parent: superior functional location
		 */
		searchFunctionalLocation: function(workcenter, parent) {
			/* Research of function functional locations for matchcode, into list */
			/* Deletion of existing items */
			sap.ui.getCore().byId("funcLocationTableNotificationList").unbindItems();

			/* Filters' definition */
			var aFilters = [];
			var oFilterWorkCenter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, oControl.getPlanPlant());
			var oFilterSupFuncLoc = new sap.ui.model.Filter("Supfloc", sap.ui.model.FilterOperator.EQ, parent);
			if (!window.cordova) {
				aFilters.push(oFilterWorkCenter);
			}
			aFilters.push(oFilterSupFuncLoc);

			/* Search and bind data */
			sap.ui.getCore().byId("funcLocationTableNotificationList").bindItems({
				path: "plant>/FuncLocSet",
				template: new sap.m.ColumnListItem("funcLocationTableListItemNotificationList", {
					type: "Navigation",
					press: function(evt) {
						return oControl.handleFunctionalLocationPress(evt)
					},
					cells: [
					        new sap.m.Button({
					        	text: oControl.getI18nValue("createNotification.frag.button.select"),
					        	textDirection: "LTR",
					        	enabled: "{= ${plant>Category} !== '1'}",
					        	press: function(evt) {
					        		return oControl.validFunctionalLocation(evt)
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

		/************************************************************************/
		/*    EQUIPMENT                                                         */
		/************************************************************************/
		/**
		 * Open equipment search help dialog
		 */
		openEquipmentSelect: function() {
			if ("" == oControl.getView().byId("functLocationNotification").getValue()) {
				sap.m.MessageToast.show(oControl.getI18nValue("createNotification.message.selectFunctionalLocation"));
				return;
			}

			if (!oControl.equipmentSelect) {
				oControl.equipmentSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.equipmentSelect", oControl);
			}

			oControl.getView().addDependent(oControl.equipmentSelect);

			oControl.searchEquipment("");
			oControl.equipmentSelect.setMultiSelect(false)
			oControl.equipmentSelect.open();

		},
		/**
		 * Handle event of a user typing in search bar
		 * @param {sap.ui.base.Event} oEvent: user typing in search bar
		 */
		handleSearchEquipment: function(oEvent) {
			oControl.searchEquipment(oEvent.getParameter("value"));
		},
		/**
		 * Function that search for equipment
		 * @param {string} filterValue: value used to search equipment
		 */
		searchEquipment: function(filterValue) {
			var view = oControl.getView();

			/* Deletion of existing items */
			oControl.equipmentSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oFilterWorkCenter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, oControl.getPlanPlant());
			var oFuncLocFilter = new sap.ui.model.Filter("Funcloc", sap.ui.model.FilterOperator.StartsWith, view.byId("functLocationNotification").getValue())
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
			aFilters.push(oFilterWorkCenter);
			aFilters.push(oFuncLocFilter);

			/* Search and bind data */
			oControl.equipmentSelect.bindAggregation("items", {
				path: "plant>/EquiSet",
				template: new sap.m.StandardListItem({
					title: "{plant>Descript}",
					description: {
						parts: ['plant>Equipment'],
						formatter: oControl.formatRemoveLeadingZeros
					}
				}),
				filters: aFilters,
				sorter : new sap.ui.model.Sorter("Equipment", false)
			});
		},
		/**
		 * Function triggered when the user selects an equipment from the list
		 * @param {sap.ui.base.Event} oEvent: click on equipment
		 */
		validEquipment: function(oEvent) {
			var aSelectedEquipments = oEvent.getParameter("selectedContexts");
			if (aSelectedEquipments.length) {
				aSelectedEquipments.map(function(oSelectedEquipment) {
					oControl.checkDetailModelChange("/Equipment", oSelectedEquipment.getObject().Equipment);
					oControl.getDetailModel().setProperty("/Equipment", oSelectedEquipment.getObject().Equipment);
					oControl.getDetailModel().setProperty("/Equidescr", oSelectedEquipment.getObject().Descript);
				})
			}
		},

		/************************************************************************/
		/*    BREAKDOWN                                                         */
		/************************************************************************/
		/**
		 * Function triggered when the user clicks on breakdown checkbox
		 * @param {sap.ui.base.Event} oEvent: click on breakdown checkbox
		 */
		handleBreakdownSelect: function(oEvent) {
			if (oEvent.getParameter("selected")) {
				oControl.checkDetailModelChange("/Breakdown", "X");
				oControl.getDetailModel().setProperty("/Breakdown", "X");
			} else {
				oControl.checkDetailModelChange("/Breakdown", " ");
				oControl.getDetailModel().setProperty("/Breakdown", " ");
			}
		},

		/************************************************************************/
		/*    DAMAGE GROUP/CODE                                                 */
		/************************************************************************/
		/**
		 * Open damage group search help
		 */
		openDamageGroupSelect: function() {
			if (!oControl.damageGroupSelect) {
				oControl.damageGroupSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.damageGroupSelect", oControl);
			}

			oControl.getView().addDependent(oControl.damageGroupSelect);

			oControl.searchDamageGroup("");
			oControl.damageGroupSelect.setMultiSelect(false)
			oControl.damageGroupSelect.open();
		},
		/**
		 * Handle event of user typing in the search bar
		 * @param {sap.ui.base.Event} oEvent: search bar typing
		 */
		handleSearchDamageGroup: function(oEvent) {
			oControl.searchDamageGroup(oEvent.getParameter("value"));
		},
		/**
		 * Search for damage group
		 * @param {string} filterValue: filter value used in the search
		 */
		searchDamageGroup: function(filterValue) {
			var view = oControl.getView();

			/* Deletion of existing items */
			oControl.damageGroupSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oPlanPlantFilter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, oControl.getPlanPlant());
			var oEquitypeFilter = new sap.ui.model.Filter("Equitype", sap.ui.model.FilterOperator.EQ, oControl.Equitype)

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
			oControl.damageGroupSelect.bindAggregation("items", {
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
		 * Function triggered when user selects a damage group from the list
		 * @param {sap.ui.base.Event} oEvent: click on an element
		 */
		validDamageGroup: function(oEvent) {
			var view = oControl.getView();

			var aSelectedDamageGroups = oEvent.getParameter("selectedContexts");
			if (aSelectedDamageGroups.length) {
				aSelectedDamageGroups.map(function(oSelectedDamageGroup) {
					var aItems = oControl.getDetailModel().getProperty("/NotifItem") || [];
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
					oControl.checkDetailModelChange("/NotifItem", aItems);
					oControl.getDetailModel().setProperty("/NotifItem", aItems);
				})
			}

		},
		/**
		 * Open damage code search help
		 */
		openDamageCodeSelect: function() {

			if (!oControl.damageCodeSelect) {
				oControl.damageCodeSelect = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.damageCodeSelect", oControl);
			}

			if (oControl.getView().byId("DCodegrpNotification").getValue()) {
				oControl.getView().addDependent(oControl.damageCodeSelect);
				oControl.searchDamageCode("");
				oControl.damageCodeSelect.setMultiSelect(false)
				oControl.damageCodeSelect.open();
			} else {
				sap.m.MessageToast.show(oControl.getI18nValue("createNotification.frag.message.selectDamageCode"));
			}
		},
		/**
		 * Handle event of user typing in the search bar
		 * @param {sap.ui.base.Event} oEvent: search bar typing
		 */
		handleSearchDamageCode: function(oEvent) {
			oControl.searchDamageCode(oEvent.getParameter("value"))
		},
		/**
		 * Search for damage code
		 * @param {string} filterValue: filter value used in the search
		 */
		searchDamageCode: function(filterValue) {
			var view = oControl.getView();

			/* Deletion of existing items */
			oControl.damageCodeSelect.unbindAggregation("items");

			/* Filters' definition */
			var aFilters = [];
			var oPlanPlantFilter = new sap.ui.model.Filter("Planplant", sap.ui.model.FilterOperator.EQ, oControl.getPlanPlant());
			var oEquitypeFilter = new sap.ui.model.Filter("Equitype", sap.ui.model.FilterOperator.EQ, oControl.Equitype);
			var oDamageGroupFilter = new sap.ui.model.Filter("CodeGroup", sap.ui.model.FilterOperator.EQ, this.byId("DCodegrpNotification").getValue());

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

			/* Search and bind data */
			oControl.damageCodeSelect.bindAggregation("items", {
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
		 * Function triggered when user selects a damage code from the list
		 * @param {sap.ui.base.Event} oEvent: click on an element
		 */
		validDamageCode: function(oEvent) {
			var aSelectedDamageCodes = oEvent.getParameter("selectedContexts");
			if (aSelectedDamageCodes.length) {
				var view = oControl.getView();
				aSelectedDamageCodes.map(function(oSelectedDamageCode) {
					var aItems = oControl.getDetailModel().getProperty("/NotifItem") || [];
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
					oControl.checkDetailModelChange("/NotifItem", aItems);
					oControl.getDetailModel().setProperty("/NotifItem", aItems);
				})
			}
		},

		/************************************************************************/
		/*    SPARE PARTS                                                       */
		/************************************************************************/
		/**
		 * Open spare parts search help
		 */
		openSparePart: function() {
			if (!oControl.sparePart) {
				oControl.sparePart = sap.ui.xmlfragment("com.kalydia.edfen.workmanager.view.Common.sparePart", oControl);
				oControl.getView().addDependent(oControl.sparePart);
			}
			oControl.searchSpareItem("");
			oControl.sparePart.setMultiSelect(true)
			oControl.sparePart.open();
		},
		/**
		 * Handle event of user typing in the search bar
		 * @param {sap.ui.base.Event} oEvent: search bar typing
		 */
		handleSearchSpareItem: function(oEvent) {
			oControl.searchSpareItem(oEvent.getParameter("value"))
		},
		/**
		 * Search for spare parts
		 * @param {string} filterValue: filter value used in the search
		 */
		searchSpareItem: function(filterValue) {
			/* Deletion of existing items */
			oControl.sparePart.unbindAggregation("items");

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
				aFiltersDetail.push(oMatlDescFilter);
				aFiltersDetail.push(oMaterialIdFilter);
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
			oControl.sparePart.bindAggregation("items", {
				path: "/MaterialSet",
				template: new sap.m.StandardListItem({
					title: "{MatlDesc}",
					description: {
						parts: ['MaterialId', 'RefTurbinier'],
						formatter: oControl.formatSparePartSearchDescription
					}
				}),
				filters: aFilters,
				sorter: new sap.ui.model.Sorter('MaterialId', false)
			});

		},
		/**
		 * Function triggered when user selects a spare part from the list
		 * @param {sap.ui.base.Event} oEvent: click on an element
		 */
		validSparePart: function(oEvent) {
			var aSelectedSpareParts = oEvent.getParameter("selectedContexts")
			if (aSelectedSpareParts.length) {
				aSelectedSpareParts.map(
						function(oSelectedSparePart) {
							oControl.addSparePart(oSelectedSparePart.getObject().MaterialId, oSelectedSparePart.getObject().MatlDesc, 1)
						});
			}
		},
		/**
		 * Add a spare part in dedicated part
		 * @param {string} MaterialId: material id
		 * @param {string} MatlDesc: material description
		 * @param {number} RequirementQuantity: quantity required for the spare part
		 */
		addSparePart: function(MaterialId, MatlDesc, RequirementQuantity) {
			var aComponents = oControl.getDetailModel().getProperty("/NotifComponent") || [];

			var line = {
					NotifNo: oControl.getDetailModel().getProperty("/NotifNo"),
					Material: MaterialId,
					MatlDesc: MatlDesc.replace(/[^\w\s]/g, '-'),
					RequirementQuantity: RequirementQuantity.toString(),
					ItemNumber: Formatter.addLeadingZero(oControl._ItemNumber.toString(), 4),
					isNew: true
			};
			aComponents.push(line);
			oControl._ItemNumber++;
			oControl.checkDetailModelChange("/NotifComponent", aComponents);
			oControl.getDetailModel().setProperty("/NotifComponent", aComponents);
		},
		/**
		 * Check that spare part requirement quantity is consistent (> 0)
		 * @param {number} currentValue: current requirement quantity
		 * @param {path}   path: spare part path within the model
		 */
		checkSparePartValue: function(currentValue, path) {
			var value = currentValue;
			if (isNaN(parseInt(value))) {
				value = "";
				return value.toString();
			} else if (value == 0) {
				oControl.removeSparePart(path);
				return null;
			} else {
				return value.toString();
			}
		},
		/**
		 * Function triggered when user changes the required quantity for a spare part
		 * @param {sap.ui.base.Event} evt: spare part requirement quantity modification
		 */
		handleSparePartValueChange: function(evt) {
			var view = oControl.getView();
			var oModel = oControl.getDetailModel();
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			oModel.setProperty(path + "/RequirementQuantity", oControl.checkSparePartValue(value, path));
		},
		/**
		 * Add 1 unit to spare part required quantity
		 * @param {sap.ui.base.Event} evt: click on "+" button
		 */
		incrementSparePart: function(evt) {
			var view = oControl.getView();
			var oModel = oControl.getDetailModel();
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			if (!isNaN(parseInt(value))) {
				value++;
			} else {
				value = 1;
			}
			oModel.setProperty(path + "/RequirementQuantity", oControl.checkSparePartValue(value, path));

			var aComponents = oControl.getDetailModel().getProperty("/NotifComponent") || [];
			oControl.checkDetailModelChange("/NotifComponent", aComponents);
			oControl.getDetailModel().setProperty("/NotifComponent", aComponents);
		},
		/**
		 * Remove 1 unit from spare part required quantity
		 * @param {sap.ui.base.Event} evt: click on "-" button
		 */
		decrementSparePart: function(evt) {
			var view = oControl.getView();
			var oModel = oControl.getDetailModel();
			var path = evt.oSource.getParent().getBindingContextPath();
			var value = oModel.getProperty(path + "/RequirementQuantity");
			if (!isNaN(parseInt(value))) {
				value--;
			} else {
				value = 0;
			}

			var newValue = oControl.checkSparePartValue(value, path);
			if (newValue !== null) {
				// when newValue is null, the spare spart has been removed
				oModel.setProperty(path + "/RequirementQuantity", newValue);
			}

			var aComponents = oControl.getDetailModel().getProperty("/NotifComponent") || [];
			oControl.checkDetailModelChange("/NotifComponent", aComponents);
			oControl.getDetailModel().setProperty("/NotifComponent", aComponents);
		},
		/**
		 * Function triggered when user clicks on "recycle bin" button on a spare part line
		 * @param {sap.ui.base.Event} evt: click on "recycle bin" button
		 */
		deleteSparePart: function(evt) {
			oControl.removeSparePart(evt.oSource.getParent().getBindingContextPath());
		},
		/**
		 * Remove designated spare part from the model
		 * @param {string} path: spare part's path within the model
		 */
		removeSparePart: function(path) {
			var view = oControl.getView();
			var oModel = oControl.getDetailModel();
			var aSplit = path.split("/");
			var aItems = oModel.getProperty("/NotifComponent");
			oControl._delta.deleted.NotifComponent.push(aItems.splice(aSplit[2], 1));
			oModel.setProperty("/NotifComponent", aItems);
		},

		/**
		 * Event handler for the barcode scanner
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		scanBarcode: function(evt) {
			oControl._callBarcodeScanner(evt,
					function(result) {
				// result is a JSON with 3 attributes
				// text: value of the barcode
				// format: format of the barcode (only if the scanner has been used)
				// cancelled: boolean that indicate cancellation


				var model = oControl.getView().getModel();
				var material = Formatter.addLeadingZero(result.text, 18);
				model.read(
						"/MaterialSet('" + material + "')", {

							success: function(oData, oResponse) {
								oControl.addSparePart(oData.MaterialId, oData.MatlDesc, 1);
							},
							error: oControl.oDataCallbackFail
						});
			});
		},

		/**
		 * Formatters
		 * **/
		/**
		 * Removes leading zeros from a string
		 * @param {string} value: value to be modified
		 * @returns {string} Input string without the leading zeros
		 */
		formatRemoveLeadingZeros: function(value) {
			return Formatter.removeLeadingZeros(value);
		},
		/**
		 * Transcodes SAP status into SAPUI5 graphical status
		 * @param {string} value: status to be converted
		 * @returns {string} Status which will be interpreted by SAP UI5 to provide graphical information
		 */
		formatState: function(value) {
			switch (value) {
			case "1":
				return ("Error");
				break;
			case "2":
				return ("Warning");
				break;
			case "3":
				return ("Success");
				break;
			case "4":
				return ("None");
				break;
			default:
				return ("None");
			break;
			}
		},
		/**
		 * Transforms a SAP flag into a boolean
		 * @param {string} value: SAP flag
		 * @returns {boolean} Flag as a boolean
		 */
		formatFlag: function(value){
			return Formatter.formatFlag(value);
		},
		/**
		 * Transforms JS date time into a human readable date
		 * @param {edm.DateTime} value: JS datetime
		 * @returns {string} Human readable date time
		 */
		formatDateTime: function(value) {
			return Formatter.EDMDateTimeToFullString(value);
		},
		/**
		 * Transforms JS date into a human readable date
		 * @param {edm.DateTime} value: JS datetime
		 * @returns {string} Human readable date
		 */
		formatDate: function(value) {
			return Formatter.DateTimeToDateString(value);
		},
		/**
		 * Concatenate material informations for spare part search help label
		 * @param {string} Material: Material number
		 * @param {string} RefTurbinier: Material reference for user
		 * @returns {string} Material informations
		 */
		formatSparePartSearchDescription: function(Material, RefTurbinier) {
			Material = oControl.formatRemoveLeadingZeros(Material);
			if ("" === RefTurbinier) {
				return Material;
			} else {
				return Material + " - " + RefTurbinier;
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
