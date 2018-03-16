
    var hostweburl;

    var numberOfSharePointRequests = 0;
    function getQueryStringParameter(paramToRetrieve) {
        var params =
            document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == paramToRetrieve)
                return singleParam[1];
        }
    }
    var web;
    var context;
    var rootfolder;
    var localFolderToUse;
    var fileAlso = false;
    
    var windowsFolder = Windows.Storage.ApplicationData.current.localFolder;
    var sharePointFolder = "SharePointDocs";
    
//  For Testing 
//    var sharePointServerURL = "http://extranetd2-qal.eu.edfencorp.net";
//    var sharePointURL = sharePointServerURL + "/d2/mobility";
//    var sharePointURLSharedDoc = sharePointURL + "/Shared%20Documents";
//    var folderSharedDoc = "Shared Documents";
    
//  For Production
    var sharePointServerURL = "http://teamsite.eu.edfencorp.net";
    var sharePointURL = sharePointServerURL + "/collab/eens";
    var sharePointURLSharedDoc = sharePointURL + "/Manufacturers%20documents";
    var folderSharedDoc = "Manufacturers documents";
	
    function getSomething(filesAlsoLocal, serverReleativeUrl, folder) {
        numberOfSharePointRequests = 0;
        filesAlso = filesAlsoLocal;
        if (folder == null) {
        	windowsFolder.createFolderAsync(sharePointFolder, Windows.Storage.CreationCollisionOption.openIfExists).done(function (folder) {
                localFolderToUse = folder;
            });
            
        }
        else
            localFolderToUse = folder;
        try {
           // var url = appContext.applicationEndpointURLCustom + ".landpage/"
           var url = sharePointURL;
            //var url = "http://extranetd2-qal.eu.edfencorp.net/d2/mobility/Shared Documents/dlls.txt";
            //$.ajax({
            //            url: url, sucess: function (evt) {

            //            console.log(evt);
            //            context = new SP.ClientContext(url);
            //            web = context.get_web();
            //            var list = web.get_lists().getByTitle('Documents');
            //            rootfolder = web.getFolderByServerRelativeUrl('Shared Documents');
            //            allFolderItems = rootfolder.get_folders();
            //            context.load(allFolderItems);
            //            allFileItems = rootfolder.get_files()
            //            context.load(allFileItems);
            //            context.executeQueryAsync(Function.createDelegate(this, this.successRootFolder), Function.createDelegate(this, this.asyncError));
            //            }, error: function (evt) {
            //                console.log(evt);
            //            }
            //})
            //    .done(function completed(result) {
            //    console.log(result);
            //    context = new SP.ClientContext(url);
            //    web = context.get_web();
            //    var list = web.get_lists().getByTitle('Documents');
            //    rootfolder = web.getFolderByServerRelativeUrl('Shared Documents');
            //    allFolderItems = rootfolder.get_folders();
            //    context.load(allFolderItems);
            //    allFileItems = rootfolder.get_files()
            //    context.load(allFileItems);
            //    context.executeQueryAsync(Function.createDelegate(this, this.successRootFolder), Function.createDelegate(this, this.asyncError));
            //}, function progress(result) {
            //    console.log(result);
            //});
            WinJS.xhr({ url: url, headers: { "accept": "application/json" } }).done(function completed(result) {
               
            //    console.log(result);
            //}, function error(error) {
            //    sap.m.MessageToast.show("Fail");
            //    console.log(error);
            //});
                context = new SP.ClientContext(url);
                web = context.get_web();
                var list = web.get_lists().getByTitle('Documents');
                if (serverReleativeUrl == null || serverReleativeUrl.length<=0)
                    rootfolder = web.getFolderByServerRelativeUrl(folderSharedDoc);
                else
                    rootfolder = web.getFolderByServerRelativeUrl(serverReleativeUrl);
                allFolderItems = rootfolder.get_folders();
                context.load(allFolderItems);
                if (filesAlso) {
                    allFileItems = rootfolder.get_files()
                    context.load(allFileItems);
                }
                context.executeQueryAsync(Function.createDelegate(this, this.successRootFolder), Function.createDelegate(this, this.asyncError));
            }, function error(result) {
                sap.m.MessageToast.show("Fail");
                console.log(result);
            });
           
        } catch (e) {
            console.log(e);
        }
    }
    function getEverything(currentFolderSharePoint, currentFolderLocal) {
       // var context = new SP.ClientContext("http://extranetd2-qal.eu.edfencorp.net/d2/mobility/");
        var allSubFolderItems =currentFolderSharePoint.get_folders();
        var allSubFileItems = currentFolderSharePoint.get_files();
        context.load(allSubFolderItems);
        context.load(allSubFileItems);
        context.executeQueryAsync(function () {
            var fileUrls = '';
            var ListEnumerator = allSubFolderItems.getEnumerator();
            while (ListEnumerator.moveNext()) {
                var currentItem = ListEnumerator.get_current();
                createFolder(currentItem, currentFolderLocal);
            }
            if (filesAlso) {
                var ListEnumerator = allSubFileItems.getEnumerator();

                while (ListEnumerator.moveNext()) {
                    var currentItem = ListEnumerator.get_current();
                    createFile(currentItem, currentFolderLocal);
                }
            }

        }, Function.createDelegate(this, this.asyncError));

    }
    function extractFilename(path) {
        path = path.substring(path.lastIndexOf("/") + 1);
        return (path.match(/[^.]+(\.[^?#]+)?/) || [])[0];
    }
    function getFilesForThisFolderFromSharePoint(folder) {
        folder.getFileAsync("info.info").then(function (file) {
            return Windows.Storage.FileIO.readTextAsync(file);
        }, function (error) {
            sap.m.MessageToast.show("Not a SharePoint folder or SharePoint info missing, please refresh");
        }).done(function (data) {
            if (typeof data == "undefined") {
                sap.m.MessageToast.show("Not a SharePoint folder or SharePoint info missing, please refresh");
                console.log(data);
            }else if (data.length < 0)
                sap.m.MessageToast.show("Not a SharePoint folder or SharePoint info missing, please refresh");
            else {
                getSomething(true, data, folder);
            }
        }, function (error) {
            sap.m.MessageToast.show("Not a SharePoint folder or SharePoint info missing, please refresh");
        })
    }
    function saveToFileFromLink(link,callBackSuccess,callBackFailure,pointer) {
        filename = extractFilename(link);
       
        var SharePointOtherDocsFolder = null;
        windowsFolder.createFolderAsync(sharePointFolder, Windows.Storage.CreationCollisionOption.openIfExists).done(function (folder) {
            folder.createFolderAsync("Others", Windows.Storage.CreationCollisionOption.openIfExists).done(function (folder) {
            SharePointOtherDocsFolder = folder;
            folder.getFileAsync(filename).then(function (file) {
                callBackSuccess(file);
            }, function () {
                searchFileAndOpen(link, pointer, function fileNotFoundCallBack() {


                    var url = link;
                    WinJS.xhr({ url: url, responseType: "blob" }).done(
                        function completed(result) {
                            if (result.readyState === 4) {
                                if (result.status !== 200) {
                                    callBackFailure("Error downloading file");
                                    WinJS.log && WinJS.log("Unable to download blob - status code: " + result.status.toString(), "sample", "error");
                                } else {
                                    var blob = result.response;
                                    folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.openIfExists).then(function (folder) {
                                        writeBlobToFile(blob, folder, folder, callBackSuccess);
                                    })
                                }
                            } else {
                                callBackFailure("Error downloading file");
                            }
                        }, function error(result) {
                            callBackFailure("Error downloading file: Status: " + result.status + " " + result.statusText);
                            console.log(result);
                        });
                }, function (evt) {
                    console.log(evt);
                });
            });
        });
        });
    }
    function createFile(currentItem, currentFolderLocal) {
        numberOfSharePointRequests++;
        currentFolderLocal.createFileAsync(currentItem.get_name(), Windows.Storage.CreationCollisionOption.openIfExists).then(function (folder) {
            var sharePointModifiedDate = currentItem.get_timeLastModified();
            folder.getBasicPropertiesAsync().then(function (properties) {
                var localModifiedDate = properties.dateModified;
                if (sharePointModifiedDate > properties.dateModified || properties.size <= 5) {


                    var url = sharePointServerURL + currentItem.get_serverRelativeUrl()
                    WinJS.xhr({ url: url, responseType: "blob" }).done(
                        function completed(result) {
                            if (result.readyState === 4) {
                                if (result.status !== 200) {
                                    numberOfSharePointRequests--;
                                    folder.deleteAsync();
                                    WinJS.log && WinJS.log("Unable to download blob - status code: " + result.status.toString(), "sample", "error");
                                } else {
                                    var blob = result.response;
                                    writeBlobToFile(blob, folder, currentFolderLocal, null);
                                }
                            } else {
                                folder.deleteAsync();
                            }
                        }, function error(result) {
                            numberOfSharePointRequests--;
                            folder.deleteAsync();
                            console.log(result);
                        }, function progress(result) {

                        });
                } else {
                    numberOfSharePointRequests--;
                }
            });
        }, function (evt) {
            console.log(evt);
        });
    }
    function writeBlobToFile(blob, filename, folder, callBackSuccess) {
 
      
        //folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (file) {
            
            filename.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function (output) {
 
                // Get the IInputStream stream from the blob object 
                var input = blob.msDetachStream(); 
 
                // Copy the stream from the blob to the File stream 
                Windows.Storage.Streams.RandomAccessStream.copyAsync(input, output).then(function () { 
                    output.flushAsync().done(function () { 
                        input.close(); 
                        output.close();
                        if (callBackSuccess != null) {
                            callBackSuccess(filename);
                        }
                        numberOfSharePointRequests--;
                        console.log("File '" + filename.name + "' saved successfully !");
                    }, function (error) {
                        folder.deleteAsync();
                        console.log(error);
                    });
                }, asyncError); 
            }, asyncError); 
        //}, asyncError); 
    } 
    function asyncError(evt) {
        numberOfSharePointRequests--;
        console.log(evt);
    }
    function createFolder(currentItem, currentFolder) {
        numberOfSharePointRequests++;
        currentFolder.createFolderAsync(currentItem.get_name(), Windows.Storage.CreationCollisionOption.openIfExists).done(function (folder) {
             console.log(folder);
             console.log(currentItem);
             folder.createFileAsync("info.info", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                 var serverUrl = currentItem.get_serverRelativeUrl();
                 return Windows.Storage.FileIO.writeTextAsync(file, serverUrl);
             }).done(function (evt) {
                 numberOfSharePointRequests--;
               // console.log(folder);
             }, function (evt) {
                 console.log(folder);
             }, function (evt) {
                 console.log(folder);
             })
            getEverything(currentItem, folder);
        });
    }
    //function createSubFolder(currentItem, currentFolderLocal) {
    //    currentFolderLocal.createFolderAsync(currentItem.get_name(), Windows.Storage.CreationCollisionOption.openIfExists).done(function (folder) {
    //        console.log(folder);
    //        console.log(currentItem);
    //        getEverything(currentItem, folder);
    //    });
    //}
    function successRootFolder(evt) {
        var fileUrls = '';
        var ListEnumerator = this.allFolderItems.getEnumerator();
        while (ListEnumerator.moveNext())
        {
            var currentItem = ListEnumerator.get_current();
           
            createFolder(currentItem, localFolderToUse);
           
        }
        if (filesAlso) {
            var ListEnumerator = this.allFileItems.getEnumerator();

            while (ListEnumerator.moveNext()) {
                var currentItem = ListEnumerator.get_current();
               
                createFile(currentItem, localFolderToUse);
               

            }
        }
    }
    //function successSubFolder(evt)
    //{
    //    var fileUrls = '';
    //    var ListEnumerator = this.allFolderItems.getEnumerator();
    //    while (ListEnumerator.moveNext()) {
    //        var currentItem = ListEnumerator.get_current();
    //        createSubFolder(currentItem, evt.currentFolderLocal);
    //    }
    //    var ListEnumerator = this.allFileItems.getEnumerator();

    //    while (ListEnumerator.moveNext()) {
    //        var currentItem = ListEnumerator.get_current();
    //        evt.currentFolderLocal.createFileAsync(currentItem.get_name(), Windows.Storage.CreationCollisionOption.openIfExists).then(function (folder) {
    //            console.log(folder);
    //            console.log(currentItem);
    //        }, function (evt) {
    //            console.log(evt);
    //        });
    //    }
    //}
    //function failed(sender, args) {
    //    console.log('failed. Message:' + args.get_message());
    //}


