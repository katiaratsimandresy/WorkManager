/** @module Formatters */

sap.ui.define(function() {
	"use strict";
	return {

		sharepointUrlConverter: function(sUrl){

			if (window.cordova){
				return decodeURIComponent(sUrl.replace(sharePointURLSharedDoc,sharePointFolder).split("/").join("\\"));
			}else{
				return sUrl;
			}
		},

		// functionalLocationSelect.fragment.xml
		isFuncLocSelectionnable : function(value) {
			if (value == 1)
				return false;
			else
				return true;
		},

		// iconSaveStatus
		iconSaveStatus : function(inErrorState){
			if (inErrorState){
				return ("sap-icon://message-error");
			} else {
				return ("");
			}
		},

		// SimilarNotification.view.xml
		getNotificationState : function(priority) {
			switch (priority) {
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

			}
		},

		DateTimeToString : function(dateTime) {
			var date = new Date(dateTime);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				style : "short"
			});
			if (dateTime){
				return oDateFormat.format(new Date(date.getTime()));
			} else {
				return oDateFormat.format(new Date());
			}
		},

		DateTimeToDateString : function(dateTime) {
			var date = new Date(dateTime);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				style : "short"
			});
			if (dateTime){
				return oDateFormat.format(new Date(date.getTime()));
			} else {
				return oDateFormat.format(new Date());
			}
		},

		DateTimeToTimeString : function(dateTime) {
			var date = new Date(dateTime);
			var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				style : "short"
			});
			if (dateTime){
				return oDateFormat.format(new Date(date.getTime()));
			} else {
				return oDateFormat.format(new Date());
			}
		},

		EDMDateTimeToString : function(dateTime) {
			var date = new Date(dateTime);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				style : "short"
			});
			if (dateTime){
				return oDateFormat.format(new Date(date.getTime() + date.getTimezoneOffset()*60*1000));
			} else {
				return dateTime;
			}
		},

		EDMDateTimeToFullString : function(dateTime) {
			var date = new Date(dateTime);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				style : "medium"
			});
			if (dateTime){
				return oDateFormat.format(new Date(date.getTime() + date.getTimezoneOffset()*60*1000));
			} else {
				return dateTime;
			}
		},

		EDMTimeToTimeString: function(value) {
			if((typeof value === "object") && (value !== null)){
				return new sap.ui.model.odata.type.Time().formatValue(value, "string");
			} else if ((typeof value === "string") && (value !== null)) {
				return new sap.ui.model.odata.type.Time().formatValue(this.XSTimeToEDMTime(value), "string");
			} 
			else {
				return value;
			}
		},

		getDateAtMidnight: function(){
			var now = new Date();
			return new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					0,0,0);
		},

		EDMDateToJSObject: function(value){
			var date = this.getDateAtMidnight();
			if((typeof value === "object") && (value !== null)){
				return new Date(value.getTime() + value.getTimezoneOffset()*60*1000);
			} else {
				return value;
			}
		},

		EDMTimeToJSObject: function(value){
			var date = this.getDateAtMidnight();
			if((typeof value === "object") && (value !== null)){
				return new Date(value.ms + date.getTime());
			} else if((typeof value === "string") && (value !== null)){
				return new Date(
						date.getFullYear(),
						date.getMonth(),
						date.getDate(),
						value.substring(2,4),
						value.substring(5,7),
						value.substring(9,11));
			} else {
				return value;
			}
		},

		XSDateToJSObject: function(value){
			if((typeof value === "string") && (value !== null)){
				var date = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-ddTHH:mm:ss" }).parse(value);
				return new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
			} else {
				return value;
			}
		},

		XSTimeToEDMTime: function(value){
			var date = this.getDateAtMidnight();
			if((typeof value === "object") && (value !== null)){
				return {
					ms: new Date(value.ms - date.getTime() + date.getTimezoneOffset()*60*1000).getTime(),
					__edmType: "Edm.Time"
				}
			} else if((typeof value === "string") && (value !== null)){
				return {
					ms:new Date(
							"1970",
							"00",
							"01",
							value.substring(2,4),
							value.substring(5,7),
							value.substring(8,10)).getTime() - new Date(0).getTimezoneOffset()*60*1000, 
							__edmType: "Edm.Time"
				}
			} else {
				return value;
			}
		},

		JSDateTimeToEDMDateTime: function(value){
			if((typeof value === "object") && (value !== null)){
				return new Date(value.getTime() - value.getTimezoneOffset()*60*1000).toJSON().substring(0,19);

			} else {
				return value;
			}
		},

		JSDateTimeToEDMDate: function(value){
			if((typeof value === "object") && (value !== null)){
				return new Date(value.getTime() - value.getTimezoneOffset()*60*1000).toJSON().substring(0,10)+"T00:00:00";

			} else {
				return value;
			}
		},

		JSDateTimeToEDMTime: function(value){
			if((typeof value === "object") && (value !== null)){
				if (!window.cordova){
					var date = new this.getDateAtMidnight();
					return {
						ms:new Date(
								date.getFullYear(),
								date.getMonth(),
								date.getDate(),
								value.getHours(),
								value.getMinutes(),
								0).getTime() - date.getTimezoneOffset()*60*1000, 
								__edmType: "Edm.Time"
					}
				}else{
					var Hours = (value.getHours() < 10)?'0' + value.getHours() + "H" : value.getHours() + "H";
					var Minutes = (value.getMinutes() < 10)?'0' + value.getMinutes() + "M" : value.getMinutes() + "M";
					var Seconds = "00S";
					return "PT"+ Hours + Minutes + Seconds;
				}

			} else {
				return value;
			}
		},

		addLeadingZero : function(value, length) {
			if (!isNaN(parseInt(value))) {
				while (value.length < length) {
					value = "0" + value;
				}
			}
			return value;
		},

		removeLeadingZeros : function(value) {
			if ($.isEmptyObject(value)) {
				return '';
			}
			return value.replace(/^0+/, '');
		},
		
		removeTrailingingZeros : function(value) {
			if ($.isEmptyObject(value)) {
				return '';
			}
			// To keep only integer part and significant decimals
			const regex1 = /(?=.*?\.)(.*?[1-9])(?!.*?\.)(?=0*$)|^.*$/g;
			// To remove decimals if only zeros
			const regex2 = /(\.0+$)/g;

			var aResult = value.match(regex1);
			var expValue = aResult[0].replace(regex2, "");
			return expValue;
		},

		formatState : function(value) {
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

		formatFlag : function(value) {
			if (!value || value == false || value == "False" || value == "false" || value === "" || value === " ")
				return false;
			else
				return true;
		},

		formatNotFlag : function(value) {
			if (!value || value == false || value == "False" || value == "false" || value === "" || value === " ")
				return true;
			else
				return false;
		},

		formatArrayCount: function(value){
			if (value) {
				return value.length;
			}
		},

		formatDependantExists: function(value){
			if(value.length > 0){
				return true;
			} else {
				return false;
			}
		},

		formatGetFileName: function(value){
			if(value){
				var aSplit = value.split("/");
				return aSplit[aSplit.length-1];
			} else {
				return value;
			}
		},

		formatIconMimeType: function(value){
			switch(value){
			case "application/pdf":
				return "sap-icon://pdf-attachment";
			default:
				return "";
			}
		},

		initProgressBarValue: function(value){
			if(value){
				return value;
			} else {
				return 0;
			}
		},
		
		/**
		 * Define if user can or cannot activate planplant switch
		 * @param {String} icon: Sync icon
		 */
		planplantChangeEnabled: function (icon) {
			if (icon == 'upload-to-cloud' || icon == 'download-from-cloud') {
				return false;
			} else {
				return true;
			}
		},
		/**
		 * Define if user or cannot open planplant selection list
		 * @param {Boolean} bBusy: is app busy?
		 * @param {Boolean} bMenu: is menu display?
		 * @returns {Boolean}
		 */
		planplantChangeButtonEnabled: function (bBusy, bMenu) {
			if (bBusy || !bMenu) {
				return false;
			} else {
				return true;
			}
		}

	}
})
