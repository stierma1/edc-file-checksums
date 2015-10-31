"use strict"

var Worker = require("basic-distributed-computation").Worker;
var FileChecksumSp = require("edc-start-file-checksum");
var Bluebird = require("bluebird");

class FileChecksums extends Worker {
  constructor(parent){
    super("file-checksums", parent);
  }

  work(req){

    var reqPromises = req.body.map(function(file){
      return FileChecksumSp.createRequest(file);
    }).map((req1) => {
      var defer = Bluebird.defer();
      this.parent.emit("request-start", req1, (err, reqArr) => {
        if(err){
          defer.reject(err);
        } else {
          defer.resolve(reqArr[1]);
        }
      });
      return defer.promise;
    });

    Bluebird.all(reqPromises)
      .then((vals) => {
        req.body = vals;
        req.next();
      })
      .catch((err) => {
        req.status(err).next();
      })
  }
}

module.exports = FileChecksums;
