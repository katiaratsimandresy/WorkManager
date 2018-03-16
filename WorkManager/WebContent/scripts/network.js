jQuery.sap.declare("com.kalydia.edfen.workmanager.scripts.network");

com.kalydia.edfen.workmanager.scripts.network = {

    checkConnection: function() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';
        console.log('Connection type: ' + states[networkState]);
    },

    isOnline: function() {
        if (window.cordova && navigator.connection) {
            var networkState = navigator.connection.type;
            return (Connection.NONE !== networkState) && (Connection.CELL_2G !== networkState)
                && (Connection.CELL !== networkState) && (Connection.UNKNOWN !== networkState);
        }
        return navigator.onLine;
    }


};
if (!kalydia) {
    var kalydia = {};
}

kalydia.network = com.kalydia.edfen.workmanager.scripts.network;
