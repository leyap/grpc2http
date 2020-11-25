var fs = require('fs');
var path = require('path');
var utils = require('util');

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var config = require('../config')

let exportObj = {}
let serviceObj = {}
let grpcMethodsList = []
let pathList = [config.protoFilePath]

function getPathList (mypath) {
    var files = fs.readdirSync(mypath)
    files.forEach(function (filename, index) {
        var fullname = path.join(mypath, filename)
        var stat = fs.statSync(fullname)
        if (stat.isDirectory()) {
            pathList.push(fullname)
            getPathList(fullname)
        }
    })
}

function build (mypath) {
    var files = fs.readdirSync(mypath)
    files.forEach(function (filename, index) {
        var extname = path.extname(filename)
        var fullname = path.join(mypath, filename)
        var stat = fs.statSync(fullname)
        if (stat.isDirectory()) {
            build(fullname)
        } else if (stat.isFile() && extname === '.proto') {
            // parseProtoFile(fullname);
            parseProtoFile(filename);
            (function (fullname) {
                fs.watchFile(fullname, (curr, prev) => {
	            console.log(fullname + ' changed!');
                    parseProtoFile(fullname, true);
                })
            })(fullname)
        }
    })
}

getPathList(config.protoFilePath)
console.log('proto include path:')
console.log(pathList)
build(config.protoFilePath)

// console.log('grpc server host: ', config.grpcServerHost);
console.log(JSON.stringify(serviceObj, null, '\t'));
console.log('grpc methods list:');
for (m of grpcMethodsList) {
    console.log(m);
}

function buildServices (grpcObj, pkgName, rewrite) {
    for (pkg in grpcObj) {
        let keyName;
        keyName = pkgName ? '.'+pkg : pkg
        if (pkgName) {
            keyName = pkgName+'.'+pkg
        } else {
            keyName = pkg
        }
        for (service in grpcObj[pkg]) {
            if (typeof grpcObj[pkg][service] !== 'function') {
                buildServices(grpcObj[pkg], keyName, rewrite)
            } else {
                if (!exportObj[keyName]) {
                    exportObj[keyName] = {}
                    serviceObj[keyName] = {}
                }
                if (exportObj[keyName][service]) {
                    if (rewrite) {
                        console.log("rewrite pgk.service: ", pkg+'.'+service)
                    } else {
                        return console.log("error: multi pgk.service: ", pkg+'.'+service)
                    }
                }
                exportObj[keyName][service] = new grpcObj[pkg][service](config.grpcServerHost, grpc.credentials.createInsecure())
                serviceObj[keyName][service] = []
                for(m in grpcObj[pkg][service].service) {
                    serviceObj[keyName][service].push(m);
                    grpcMethodsList.push(grpcObj[pkg][service].service[m].path);
                }
            }
        }
    }
}

function parseProtoFile (filePath, rewrite) {
    var packageDefinition = protoLoader.loadSync(
        filePath,
        {
            keepCase: true,
            longs: Number,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: pathList
        });
    var grpcObj= grpc.loadPackageDefinition(packageDefinition);
    buildServices(grpcObj, '', rewrite)

}

module.exports = exportObj;
