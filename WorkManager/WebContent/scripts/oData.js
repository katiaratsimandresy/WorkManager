jQuery.sap.declare("com.kalydia.edfen.workmanager.scripts.oData");
jQuery.sap.require("sap.m.MessageBox");

com.kalydia.edfen.workmanager.scripts.oData = {
		stores: {},
		generalStore: null,
		synchroDate: '',
		refreshTask: null,

		/**
		 * Create the store.
		 * The store will be available for offline access only after it is open successfully.
		 */
		createStore: function(planplant, isFirstPlanPlant) {
			var authCtx = com.kalydia.edfen.workmanager.scripts.logon.ApplicationContext;
			var authStr = "Basic " + btoa(authCtx.registrationContext.user + ":" + authCtx.registrationContext.password);
			var sCategory = $.isEmptyObject(planplant) ? ".general" : isFirstPlanPlant ? ".pp1" : ".pp2";
			var sServiceRoot = com.kalydia.edfen.workmanager.scripts.logon.AppId + sCategory;
			
			var properties = {
			        "name": authCtx.registrationContext.serverHost + '.' + planplant + sCategory,
					"host": authCtx.registrationContext.serverHost,
					"port": authCtx.registrationContext.serverPort,
					"https": authCtx.registrationContext.https,
					"serviceRoot": sServiceRoot,
					"customHeaders": {
						"Accept": "application/atom+xml,application/atomsvc+xml,application/xml",
						"Authorization": authStr,
						"X-SMP-APPCID": authCtx.applicationConnectionId,
						"accept-language": sap.ui.getCore().getConfiguration().getLanguage()
					},
					"definingRequests": kalydia.oData._defineRequest(planplant),
					"enableRepeatableRequests": true,
					"onrequesterror": kalydia.oData._onrequestError
			};
			
			// Check if the store is already opened
			for (var i in sap.OData.stores) {
				if (sap.OData.stores[i].name.indexOf(sCategory) !== -1) {
					// This store is currently opened, check if it is for the same PlanPlant (or the general store)
					if (sap.OData.stores[i].name == 'null.general') {
						// It is the same, nothing to do
						return sap.OData.stores[i];
					} else {						
						// It is not the same, close the store
						console.log("Removing store " + sap.OData.stores[i].name);
						kalydia.oData.oStoreToClear = null;
						kalydia.oData.oStoreToClear = sap.OData.stores[i];
						sap.OData.stores[i].close(
							function(){
								console.log("Store removed successfully");
							}, 
							function(){
								console.log("Error removing offline store");
							}
						);
					}
				}
			}	
			console.log("Creating store " + properties.name);
			return sap.OData.createOfflineStore(properties);	
		},

		/**
		 * Open the store.
		 * The store will be available for offline access only after it is open successfully.
		 */
		openStore: function(storename, planplant, callback, errorcallback, progress, isFirstPlanPlant, oController) {
			var startTime = new Date();
			kalydia.oData.stores[storename] = kalydia.oData.createStore(planplant, isFirstPlanPlant);
			console.log("Opening store " + storename);
			if (!$.isEmptyObject(kalydia.oData.stores[storename])) {
				kalydia.oData.stores[storename].open(function() {
						var endTime = new Date();
						var duration = endTime - startTime;
						console.log("Store " + storename + " opened in " + duration);
						sap.OData.applyHttpClient();
						if ('function' === typeof callback) {
							callback();
						}
					}, function(error) {
						var endTime = new Date();
						var duration = endTime - startTime;
						console.error("Error opening store " + storename + " in " + duration);
						kalydia.oData._errorCallback(error);
						// Close and Clear store in case of error
						kalydia.oData.closeStore(storename, kalydia.oData.removeStoreFromSession);
						if ('function' === typeof errorcallback) {
							errorcallback(error);
						}
					}
					,{
						"storeEncryptionKey": "kalydia"
					}, function(progressStatus) {
						if ('function' === typeof progress) {
							progress(progressStatus);
						}
					}
				);
			} else {
				console.log("store " + storename + " not opened - object is empty");
				console.log(kalydia.oData.stores[storename]);
			}
		},

		// Remove the store from session opened stores
		removeStoreFromSession: function(storename, callback) {
			if (!$.isEmptyObject(kalydia.oData.stores) && !$.isEmptyObject(kalydia.oData.stores[storename])) {
				console.log("Remove store " + storename + " from kalydia.oData.stores");
				delete kalydia.oData.stores[storename];
			}
			if ('function' === typeof callback) {
				callback(storename);
			}
		},

		/**
		 * Close Offline store
		 * @param {string} storename: Name of the store to be closed
		 * @param {function} callback: success callback
		 * @param {function} errorcallback: error call back
		 * @returns {void
		 */
		closeStore: function(storename, callback, errorcallback) {
			if (!$.isEmptyObject(kalydia.oData.stores) && !$.isEmptyObject(kalydia.oData.stores[storename])) {
				console.log("Close store " + storename);
				kalydia.oData.stores[storename].close(function() {
					if ('function' === typeof callback) {
						callback(storename);
					}
				}, function(error) {
					kalydia.oData._errorCallback(error);
					if ('function' === typeof errorcallback) {
						errorcallback(error);
					}
				});
			}
		},


		clearStore: function(storename, callback, errorcallback) {
			if (!$.isEmptyObject(kalydia.oData.stores) && !$.isEmptyObject(kalydia.oData.stores[storename])) {
				console.log("Clear store " + storename);
				kalydia.oData.stores[storename].clear(function() {
					delete kalydia.oData.stores[storename];
					if ('function' === typeof callback) {
						callback(storename);
					}
				}, function(error) {
					kalydia.oData._errorCallback(error);
					if ('function' === typeof errorcallback) {
						errorcallback(error);
					}
				});
			}
		},

		/**
		 * Refresh all offline stores
		 **/
		refreshAllStores: function(callback, errorcallback, progress) {
			$.each(kalydia.oData.stores, function(storename, value) {
				kalydia.oData.refreshStore(storename, callback, errorcallback, progress);
			});
		},
		/**
		 * Refresh one offline store
		 **/
		refreshStore: function(storename, callback, errorcallback, progress) {
			if (kalydia.network.isOnline()){
				kalydia.oData.stores[storename].flush(function() {
					kalydia.oData.stores[storename].refresh(function() {
						if ('function' === typeof callback) {
							callback(storename);
						}
					}, function(error) {
						if ('function' === typeof errorcallback) {
							errorcallback(storename, error);
						}
					}, null, function(progressStatus) {
						if ('function' === typeof progress) {
							progress(progressStatus);
						}
					});
				}, function(error) {
					if ('function' === typeof errorcallback) {
						errorcallback(storename, error);
					}
				}, function(progressStatus) {
					if ('function' === typeof progress) {
						progress(progressStatus);
					}
				});
			}
		},

		/**
		 * Close all offline stores
		 **/
		closeAllStores: function() {
			$.each(kalydia.oData.stores, function(storename, value) {
				kalydia.oData.stores[storename].close(kalydia.oData._closeAllStoresSuccessCallback, kalydia._errorCallback);
			});
		},

		_onrequestError: function(error) {
			console.error("Error occurred while sending request to server. " + error);
			console.error(error);
		},

		_defineRequest: function(planplant) {
			var retrieveStreams = true;
			// retrieve snchronization date

			if ($.isEmptyObject(planplant)) {
				return {
					// PlanPlant List
					"PlanPlant_DR": "/PlanPlantSet",
					
					// WorkCenter List
					"WorkCenter_DR": "/WorkCenterSet",

					// Checklist Model
					"CheckList_DR": "/CheckListSet",
					//"CheckListCaliTool_DR": "/CheckListCaliToolSet",
					//"CheckListDocument_DR": "/CheckListDocumentSet",
					//"CheckListMesure_DR": "/CheckListMesureSet",
					//"CheckListPart_DR": "/CheckListPartSet",
					//"CheckListTask_DR": "/CheckListTaskSet",
					//"CheckListTool_DR": "/CheckListToolSet",

					// Distribution List
					"DistributionList_DR": "/DistributionListSet",

					// Employee List
					"Employee_DR": "/EmployeeSet",
					"EmployeeWorkCenter_DR": "/EmployeeWorkCenterSet",

					//Material List
					"Material_DR": "/MaterialSet",
					"MaterialAvailability_DR": "/MaterialAvailabilitySet",

					// Notif Type List
					"NotifType_DR": "/NotifTypeSet",

					// Priority List
					"Priority_DR": "/PrioritySet",

					// Activity Type List
					"ActType_DR": "/ActTypeSet",

					// Compensation Type List
					"CompType_DR": "/CompTypeSet"
				};
			} else {
				// add request depending on planplant
				return {

					//Equipment
					"Equi_DR": "/EquiSet?$filter=Planplant eq '" + planplant + "'",

					//Function Location
					"FuncLoc_DR": "/FuncLocSet?$filter=Planplant eq '" + planplant + "'",

					// Damage Code
					"DamageCode_DR": "/DamageCodeSet?$filter=Planplant eq '" + workcenter + "'",
					"DamageGroup_DR": "/DamageGroupSet?$filter=Planplant eq '" + workcenter + "'",

					// Notification
					"NotifHeader_DR": "/NotifHeaderSet?$filter=Planplant eq '" + planplant + "'",
					"NotifItem_DR": "/NotifItemSet?$filter=Planplant eq '" + planplant + "'",
					"NotifComponent_DR": "/NotifComponentSet?$filter=Planplant eq '" + workcenter + "'",
					"NotifAttach_DR": {
						"url": "/NotifAttachSet?$filter=Planplant eq '" + workcenter + "'",
						"retrieveStreams": retrieveStreams
					},

					// WorkOrder
					"OrderHeader_DR": "/OrderHeaderSet?$filter=Planplant eq '" + planplant + "'",
					"OrderOperation_DR": "/OrderOperationSet?$filter=Plant eq '" + planplant + "'",
					"OrderOperationAssignment_DR": "/OrderOperationAssignmentSet?$filter=MnWkCtr eq '" + workcenter + "'",
					

					"OrderOperationCheckList_DR": "/OrderOperationCheckListSet?$filter=MnWkCtr eq '" + workcenter + "'",
					"OrderOperationCheckListAttach_DR": {
						"url": "/OrderOperationCheckListAttachSet?$filter=MnWkCtr eq '" + workcenter + "'",
						"retrieveStreams": retrieveStreams
					},
					"OrderOperationCheckListTask_DR": "/OrderOperationCheckListTaskSet?$filter=MnWkCtr eq '" + workcenter + "'",
					"OrderOperationCheckListTaskAttach_DR": {
						"url": "/OrderOperationCheckListTaskAttachSet?$filter=MnWkCtr eq '" + workcenter + "'",
						"retrieveStreams": retrieveStreams
					},
					"OrderOperationCheckListMesure_DR": "/OrderOperationCheckListMesureSet?$filter=MnWkCtr eq '" + workcenter + "'",

					"OrderOperationCheckListCaliTool_DR": "/OrderOperationCheckListCaliToolSet?$filter=MnWkCtr eq '" + workcenter + "'",
					"OrderOperationCheckListDocument_DR": "/OrderOperationCheckListDocumentSet?$filter=MnWkCtr eq '" + workcenter + "'",
					"OrderOperationCheckListTool_DR": "/OrderOperationCheckListToolSet?$filter=MnWkCtr eq '" + workcenter + "'",
					"OrderOperationCheckListPart_DR": "/OrderOperationCheckListPartSet?$filter=MnWkCtr eq '" + workcenter + "'",

					"OrderComponent_DR": "/OrderComponentSet?$filter=Plant eq '" + planplant + "'",
					//"OrderComponentReserv_DR": "/OrderComponentReservSet?$filter=MnWkCtr eq '" + workcenter + "'",

					"OrderOperationConfirmation_DR": "/OrderOperationConfirmationSet?$filter=Planplant eq '" + workcenter + "'",

					"OrderAttach_DR": {
						"url": "/OrderAttachSet?$filter=Planplant eq '" + planplant + "'",
						"retrieveStreams": retrieveStreams
					},

					"OrderRecoveryMail_DR": "/OrderRecoveryMailSet",
				};
			}
		},

		_closeAllStoresSuccessCallback: function() {
			sap.OData.removeHttpClient();
		},

		_errorCallback: function(error) {
			console.error(error);
		}
};
if (!kalydia) {
	var kalydia = {};
}
kalydia.oData = com.kalydia.edfen.workmanager.scripts.oData;
