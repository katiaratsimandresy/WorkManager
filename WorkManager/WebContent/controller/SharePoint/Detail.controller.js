/** @module Sharepoint */

jQuery.sap.require("com.kalydia.edfen.workmanager.controller.SharePoint.util.Formatter");
jQuery.sap.require("com.kalydia.edfen.workmanager.controller.SharePoint.util.Controller");
var fileExplorer = null;
var folderFragment;
var requestIntervalid = 0;
com.kalydia.edfen.workmanager.controller.SharePoint.util.Controller.extend("com.kalydia.edfen.workmanager.controller.SharePoint.Detail", {

	onInit: function() {
		fileExplorer = this;
		this.getView().addEventDelegate({
			onBeforeShow: function(evt) {

			}
		});
		fileExplorer.getRouter("Documents").attachRoutePatternMatched(fileExplorer.onRouteMatched, fileExplorer);

	},
	/**
	 * RoutePatternMatched event handler
	 * @param{sap.ui.base.Event} oEvent router pattern matched event object
	 */
	onRouteMatched: function(oEvent) {
		var sName = oEvent.getParameter("name");
		if (sName === "Documents"){
			sap.Xhook.disable();
			fileExplorer.XhookDisable = true;
		}else{
			if (fileExplorer.XhookDisable){
				sap.Xhook.enable();
				fileExplorer.XhookDisable = false;
			}
		}
	},
	refreshRootLocalDocuments: function(evt) {
		listItem = evt.oSource.oParent.oParent;
		//listItem.removeAllContent();
		var evt = {};
		evt.oSource = listItem;
		fileExplorer.initPress(evt, true);
	},
	refreshDocuments: function(evt) {
		evt.oSource.setEnabled(true);
		getSomething(false, null, null);
		window.clearInterval(requestIntervalid);
		requestIntervalid = window.setInterval(function() {
			var numberOfSharePointRequests = fileExplorer.getView().byId("numberOfSharePointRequests").setText("Requests pending " + numberOfSharePointRequests);
		}, 1000);
		var Documents_refreshed = fileExplorer.getView().getModel("i18n").getProperty("Documents_refreshed");
		sap.m.MessageToast.show(Documents_refreshed + "...");
	},
	initPress: function(evt, removeAll) {

		// var text = evt.oSource.getContent()[0].getTitle();
		var key = "documentsLibrary";
		//switch (text) {
		//    case "Pictures": {
		//        key = "picturesLibrary";

		//        break;
		//    }
		//    case 'Music': {
		//        key = "musicLibrary";

		//    }
		//    case 'Videos': {
		//        key = "videosLibrary";

		//    }
		//    case 'Documents': {
		//        key = "documentsLibrary";

		//        break;
		//    }
		//}
		var folderList = new sap.m.List({
			showNoData: false
		});
		var filesList = new sap.m.List({
			showNoData: false
		});
		if (removeAll) {
			var initalContent = evt.oSource.getContent()[0];
			evt.oSource.removeAllContent();
			evt.oSource.addContent(initalContent);

		}
		if (evt.oSource.getContent().length > 1) {

			return;
		}
		evt.oSource.addContent(folderList);
		evt.oSource.addContent(filesList);
		Windows.Storage.ApplicationData.current.localFolder.createFolderAsync("SharePointDocs", Windows.Storage.CreationCollisionOption.openIfExists).done(function(folder) {

			getSubFolders(folder, function(evt) {



				for (var i = 0; i < evt.length; i++) {
					var iDontKnow = new sap.m.Bar({
						contentLeft: [new sap.m.ObjectIdentifier({
							title: evt[i].displayName
						}).addStyleClass("content")],
						contentRight: [new sap.m.Button({
							type: "Transparent",
							icon: "sap-icon://download",
							press: function(evt) {
								getFilesForThisFolderFromSharePoint(evt.oSource.oParent.subFolderPointer);
								window.clearInterval(requestIntervalid);
								requestIntervalid = window.setInterval(function() {
									fileExplorer.getView().byId("numberOfSharePointRequests").setText("No of File download pending: " + numberOfSharePointRequests);
								}, 1000);
							}
						}).addStyleClass("content"), new sap.m.Button({
							icon: "sap-icon://refresh",
							type: "Transparent",
							press: function(evt) {
								listItem = evt.oSource.oParent.oParent;
								//listItem.removeAllContent();
								var evt = {};
								evt.oSource = listItem;
								fileExplorer.listPress(evt, true);
							}
						}).addStyleClass("content")]
					});
					iDontKnow.subFolderPointer = evt[i];
					var item = new sap.m.CustomListItem({
						press: fileExplorer.listPress,
						type: "Active",
						content: [iDontKnow]
					})

					folderList.addItem(item);
				}

			}, function(evt) {

				for (var i = 0; i < evt.length; i++) {
					if (evt[i].displayName.indexOf("info") == -1) {
						var item = new sap.m.CustomListItem({
							press: function(evt) {
								fileExplorer.filePress(evt)
							},
							type: "Active",
							content: [new sap.m.Bar({
								contentLeft: [new sap.m.Label({
									text: evt[i].displayName
								}).addStyleClass("content")],
								contentRight: [new sap.m.Label({
									text: evt[i].displayType
								}).addStyleClass("content")]
							}).addStyleClass("transparent")]

						})
						item.relatedFile = evt[i];
						filesList.addItem(item);
					}
				}

			});
		});
	},
	listPress: function(evt, removeAll) {
		console.log("listPress" + evt);
		var o = evt.oSource.getContent()[0];
		console.log(o);
		console.log(o.subFolderPointer);
		var folderList = new sap.m.List({
			noDataText: "No folders",
			showNoData: false
		});
		var filesList = new sap.m.List({
			noDataText: "No files",
			showNoData: false
		});
		if (removeAll) {
			var initalContent = evt.oSource.getContent()[0];
			evt.oSource.removeAllContent();
			evt.oSource.addContent(initalContent);

		}
		if (evt.oSource.getContent().length > 1) {
			return;
			// evt.oSource.removeContent(evt.oSource.getContent()[i]);
		}
		evt.oSource.addContent(folderList);
		evt.oSource.addContent(filesList);
		getSubFolders(o.subFolderPointer, function(evt) {
			console.log("evt");
			console.log(evt)
			if (evt.length == 0) {
				folderList.oParent.removeContent(folderList);
				return;
			}
			/* var subPathLength = (evt[i].path.match(/\\/g) || []).length;
             for (var j = 0; j < subPathLength; j++) {

             }*/
			for (var i = 0; i < evt.length; i++) {
				var subPathLength = (evt[i].path.match(/\\/g) || []).length;
				var iDontKnow = new sap.m.Bar();
				iDontKnow.addStyleClass("transparent");
				for (var j = 0; j < subPathLength - 3; j++) {
					iDontKnow.addContentLeft(new sap.m.Text({
						text: " ",
						type: "Transparent"
					}));
				}
				iDontKnow.addContentLeft(new sap.m.Button({
					icon: "sap-icon://navigation-right-arrow",
					type: "Transparent"
				}));
				iDontKnow.addContentLeft(new sap.m.Label({
					design: "Bold",
					text: evt[i].displayName
				}));
				iDontKnow.addContentRight(new sap.m.Button({
					icon: "sap-icon://download",
					type: "Transparent",
					press: function(evt) {
						getFilesForThisFolderFromSharePoint(evt.oSource.oParent.subFolderPointer);
						window.clearInterval(requestIntervalid);
						requestIntervalid = window.setInterval(function() {
							fileExplorer.getView().byId("numberOfSharePointRequests").setText("No of File download pending: " + numberOfSharePointRequests);
						}, 1000);
					}
				}));
				iDontKnow.addContentRight(new sap.m.Button({
					icon: "sap-icon://refresh",
					type: "Transparent",
					press: function(evt) {
						listItem = evt.oSource.oParent.oParent;
						//listItem.removeAllContent();
						var evt = {};
						evt.oSource = listItem;
						fileExplorer.listPress(evt, true);
					}
				}).addStyleClass("content"))
				iDontKnow.subFolderPointer = evt[i];
				var item = new sap.m.CustomListItem({
					press: fileExplorer.listPress,
					type: "Active",
					content: [iDontKnow]
				})

				folderList.addItem(item);
				iDontKnow.addStyleClass("transparent");
			}

		}, function(evt) {
			console.log(evt)
		});


		getFilesForFolder(o.subFolderPointer, function(evt) {
			if (evt.length == 0) {
				filesList.oParent.removeContent(filesList);
				return;
			}
			try {
				Windows.System.Launcher.launchFileAsync(evt[0], function(evt) {
					console.log(evt)
				}, function(evt) {
					console.log(evt)
				});
			} catch (e) {
				console.log(e);
			}
			for (var i = 0; i < evt.length; i++) {
				if (evt[i].displayName.indexOf("info") == -1) {
					var subPathLength = (evt[i].path.match(/\\/g) || []).length;
					var iDontKnow = new sap.m.Bar();
					for (var j = 0; j < subPathLength - 3; j++) {
						iDontKnow.addContentLeft(new sap.m.Text({
							text: " ",
							type: "Transparent"
						}));
					}
					var file = (evt[i]);
					iDontKnow.addContentLeft(new sap.m.Text({
						text: evt[i].displayName
					}));
					iDontKnow.addContentRight(new sap.m.Label({
						text: evt[i].displayType
					}).addStyleClass("content"));
					iDontKnow.subFolderPointer = evt[i];
					var path = evt[i].path;
					var item = new sap.m.CustomListItem({
						press: function(evt) {
							fileExplorer.filePress(evt)
						},
						type: "Active",
						content: [iDontKnow]

					})
					item.relatedFile = evt[i];
					filesList.addItem(item);
				}
			}
		})

	},
	filePress: function(evt) {

		console.log(typeof evt.oSource.relatedFile);
		try {
			// window.open(evt.oSource.relatedFile.path,"_blank");
			var options = new Windows.System.LauncherOptions();
			options.displayApplicationPicker = false;
			options.desiredRemainingView = true;
			Windows.System.Launcher.launchFileAsync(evt.oSource.relatedFile, options, function(evt) {
				console.log(evt)
			}, function(evt) {
				console.log(evt)
			});
		} catch (e) {
			console.log(e);
		}
	},
});
