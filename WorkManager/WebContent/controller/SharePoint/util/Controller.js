jQuery.sap.declare("com.kalydia.edfen.workmanager.controller.SharePoint.util.Controller");

sap.ui.core.mvc.Controller.extend("com.kalydia.edfen.workmanager.controller.SharePoint.util.Controller", {
	getEventBus : function () {
		return sap.ui.getCore().getEventBus();
	},

	getRouter : function () {
		return sap.ui.core.UIComponent.getRouterFor(this);
	}
});