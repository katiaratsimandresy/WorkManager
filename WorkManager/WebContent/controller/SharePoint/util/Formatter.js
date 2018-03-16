jQuery.sap.declare("com.kalydia.edfen.workmanager.controller.SharePoint.util.Formatter");

com.kalydia.edfen.workmanager.controller.SharePoint.util.Formatter = {

	uppercaseFirstChar : function(sStr) {
		return sStr.charAt(0).toUpperCase() + sStr.slice(1);
	},

	discontinuedStatusState : function(sDate) {
		return sDate ? "Error" : "None";
	},

	discontinuedStatusValue : function(sDate) {
		return sDate ? "Discontinued" : "";
	},
	filter : function(check) {
		return new sap.ui.model.Filter("GetNotCompleted", sap.ui.model.FilterOperator.EQ, true);
	},
	Qty : function(value) {
		if (!isNaN(parseInt(value)))
			return parseInt(value);
		else
			return "";
	},
	currencyValue : function(value) {
		return parseFloat(value).toFixed(2);
	},
	imageFormatter : function(type, value) {
		return atob(value);
	},
	Status : function(value) {
		switch (value) {
		case "1":
			return ("Priority/Safety");
			break;
		case "4":
			return ("Next intervention");
			break;
		case "3":
			return ("Minor issue");
			break;
		case "2":
			return ("Stop/Default");
			break;
		default:
			return ("-");

			break;

		}
	},
	State : function(value) {
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

		// return (value &&
		// com.vaspp.GoodsReceipt.utils.formatter._statusStateMap[value]) ?
		// com.vaspp.GoodsReceipt.utils.formatter._statusStateMap[value]
		// : "None";
	},

	Quantity : function(value) {
		try {
			return (value) ? parseFloat(value).toFixed(0) : value;
		} catch (err) {
			return "Not-A-Number";
		}
	},

	Date : function(value) {
		if (value) {
			if (typeof value != "object") {
				value = value.replace("/Date(", "");
				value = parseInt(value.replace(")/", ""));
			}
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern : "dd-MM-yyyy"
			});
			return oDateFormat.format(new Date(value));
		} else {
			return value;
		}
	},
	DateTimeFormatForDisplay : function(value) {
		if (value) {
			index = value.indexOf("T");
			value = parseInt(value.subStr(0, index));
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern : "dd-MM-yyyy"
			});
			return oDateFormat.format(new Date(value));
		} else {
			return value;
		}
	},
	Time : function(value) {
		if (value) {
			value = value.replace("PT", "");

			value = (value.replace("H", ""));
			value = (value.replace("M", ""));
			value = (value.replace("S", ""));
			var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern : "H:mm"
			});
			if (value.substring(0, 2) == "00" && value.substring(2, 4) == "00")
				return "";
			else
				return oDateFormat.format(new Date(2015, 12, 05, value.substring(0, 2), value.substring(2, 4), value.substring(4, 6)), false);
		} else {
			return value;
		}
	},
	DateTime : function(value, onlyTime) {
		if (!onlyTime) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern : "yyyy-MM-dd"

				});
				var hh = value.getUTCHours();
				var mm = value.getUTCMinutes();
				var ss = value.getSeconds();
				// This line gives you 12-hour (not 24) time
				// if (hh > 12) {
				// hh = hh - 12;
				// }
				// These lines ensure you have two-digits
				if (hh < 10) {
					hh = "0" + hh;
				}
				if (mm < 10) {
					mm = "0" + mm;
				}
				if (ss < 10) {
					ss = "0" + ss;
				}
				// This formats your string to HH:MM:SS
				var t = hh + ":" + mm + ":" + ss;
				return oDateFormat.format(new Date(value)) + "T" + t;
			} else {
				return value;
			}
		} else {
			if (value) {
				var date = new Date(value);
				var hh = date.getHours();
				var mm = date.getMinutes();
				var ss = date.getSeconds();
				// if (hh > 12) {
				// hh = hh - 12;
				// }
				// These lines ensure you have two-digits
				if (hh < 10) {
					hh = "0" + hh;
				}
				if (mm < 10) {
					mm = "0" + mm;
				}
				if (ss < 10) {
					ss = "0" + ss;
				}

				return "PT" + hh + "H" + mm + "M" + ss + "S"

			}
		}
	},
	Blank : function(val) {
		if (val == "0.000") {
			var tableLineItems = invFCUpdateView.byId("invFCUpdateTbl");
			var items = tableLineItems.getItems();
			for (var i = 0; i < items.length; i++) {
				var qtyVal = items[i].getAggregation("cells")[1].getValue();
				if (qtyVal == "") {
					items[i].getAggregation("cells")[1].setValue("");
				}
			}
		}
	},

};