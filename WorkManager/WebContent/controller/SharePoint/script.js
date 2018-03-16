// handling document ready and phonegap deviceready


// Phonegap is loaded and can be used


function extractFilename(path) {
    path = path.substring(path.lastIndexOf("/") + 1);
    return (path.match(/[^.]+(\.[^?#]+)?/) || [])[0];
}



var docuemntListFragment = null;
function searchFileAndOpen(name, pointer, fileNotFoundCallBack) {

    if (docuemntListFragment == null)
    docuemntListFragment = sap.ui.xmlfragment("EDF_EN.Documents.view.sparePartFragment",pointer);
    
    Windows.Storage.ApplicationData.current.localFolder.createFolderAsync("SharePointDocs", Windows.Storage.CreationCollisionOption.openIfExists).done(function (folder) {

        var options = new Windows.Storage.Search.QueryOptions(Windows.Storage.Search.CommonFileQuery.orderBySearchRank, ["*"]);
        options.userSearchFilter = extractFilename(name);
        var fileQuery = folder.createFileQueryWithOptions(options);
        fileQuery.getFilesAsync().done(function (files) {
            if (files.size === 0) {
                fileNotFoundCallBack();
                return;//"No files found for \"<b>" + name + "</b>\"";
            } else 
                if (files.size === 1) {
                    files.forEach(function (file) {
                        try {
                            // window.open(evt.oSource.relatedFile.path,"_blank");
                            var options = new Windows.System.LauncherOptions();
                            options.displayApplicationPicker = false;
                            options.desiredRemainingView = true;
                            Windows.System.Launcher.launchFileAsync(file, options, function (evt) {
                                console.log(evt);
                                docuemntListFragment.close();
                            }, function (evt) {
                                docuemntListFragment.close();
                                console.log(evt)
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    })
                }
                else {
                    docuemntListFragment.getContent()[0].removeAllItems();
                files.forEach(function (file) {
                    var item = new sap.m.ColumnListItem(
                        {
                            type: "Active",
                            press: function (evt) {
                                try {
                                    // window.open(evt.oSource.relatedFile.path,"_blank");
                                    var options = new Windows.System.LauncherOptions();
                                    options.displayApplicationPicker = false;
                                    options.desiredRemainingView = true;
                                    Windows.System.Launcher.launchFileAsync(evt.oSource.relatedFile, options, function (evt) {
                                        console.log(evt);
                                        docuemntListFragment.close();
                                    }, function (evt) {
                                        docuemntListFragment.close();
                                        console.log(evt)
                                    });
                                } catch (e) {
                                    console.log(e);
                                }
                            },
                            cells: [new sap.m.Text({ text: file.name }),
                                   new sap.m.Text({ text: file.displayType })
                            ]
                        }
                       );
                    item.relatedFile = file;
                    docuemntListFragment.getContent()[0].addItem(item);


                });
                docuemntListFragment.open();
            }
        });
    });
    


}
/* get the root file system */
function getFileSystem(rootFolderName,callbackFolders, callbackFiles){

    var rootFolder = Windows.Storage.KnownFolders[rootFolderName];
    getSubFolders(rootFolder, function (evt) {
        callbackFolders(evt);

    });
    getFilesForFolder(rootFolder, function (evt) {
        callbackFiles(evt);

    });
}
function getSubFolders(rootFolder, callback) {
    
    var subFolders = [];
    rootFolder.getFoldersAsync()
        .then(function getFileSuccess(manifestFile) {
            subFolders = manifestFile;
            console.log(manifestFile);
            callback(subFolders);
           
        });
}
function getFilesForFolder(folder, callback) {

    var files = [];
    folder.getFilesAsync().then(function getFileSuccess1(manifestFile) {
            files = manifestFile;
            callback(files);
         //   console.log(manifestFile);
        });
}
function getFileName(folder, callback) {

    var files = [];
    folder.getFilesAsync()()
        .then(function getFileSuccess(manifestFile) {
            subFolders = manifestFile;
            callBack(files);
            console.log(manifestFile);
        });
}

