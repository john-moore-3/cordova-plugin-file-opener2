
	var cordova = require('cordova'),
		fileOpener2 = require('./FileOpener2');

	var schemes = [
        { protocol: 'ms-app', getFile: getFileFromApplicationUri },
        { protocol: 'file:///', getFile: getFileFromFileUri }
	]

	function getFileFromApplicationUri(uri) {
		console.log('getFileFromApplicationUri');
	    var applicationUri = new Windows.Foundation.Uri(uri);
	    
	    var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(applicationUri);
	    console.log('file: ', file);

	    return file;
	}

	function getFileFromFileUri(uri) {
		console.log('getFileFromFileUri');
	    var path = Windows.Storage.ApplicationData.current.localFolder.path +
                        uri.substr(8);
        console.log('path: ', path);
        var file = getFileFromNativePath(path);
        console.log('file: ', file);

	    return file;
	}

	function getFileFromNativePath(path) {
		console.log('getFileFromNativePath');
	    var nativePath = path.split("/").join("\\");
	    console.log('nativePath: ', nativePath);

		var file = Windows.Storage.StorageFile.getFileFromPathAsync(nativePath);
		console.log('file: ', file);

	    return file;
	}

	function getFileLoaderForScheme(path) {
	    var fileLoader = getFileFromNativePath;

	    schemes.some(function (scheme) {
	        return path.indexOf(scheme.protocol) === 0 ? ((fileLoader = scheme.getFile), true) : false;
	    });

	    return fileLoader;
	}

	module.exports = {

	    open: function (successCallback, errorCallback, args) {
	        var path = args[0];
	        
	        var getFile = getFileLoaderForScheme(path);

	        getFile(path).then(function (file) {
	            var options = new Windows.System.LauncherOptions();

	            Windows.System.Launcher.launchFileAsync(file, options).then(function (success) {
	                if (success) {
	                    successCallback();
	                } else {
	                    errorCallback();
	                }
	            });

	        }, function (error) {
	            console.log("FileOpener2.open: Windows error - ", error);
	        });
		}
		
	};

	require("cordova/exec/proxy").add("FileOpener2", module.exports);

