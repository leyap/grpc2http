var express = require('express');
var router = express.Router();

var jsonToGrpc = require('../grpc/jsonToGrpc');

router.all('/*', function(req, res, next) {
  let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const headers = req.headers;

  const params = req.params[0].split(/\.(\w+\/)/);
  if (params.length < 3) {
    return res.json({
      code: 303, msg: "grpc request format error: " + req.params[0]
    });
  }
  const packageName = params[0];
  let serviceName = params[1];
  serviceName = serviceName.substring(0, serviceName.length-1)
  let methodName = params[2];
  if (methodName[methodName.length-1] === '/') {
    methodName = methodName.substring(0, methodName.length-1)
  }
  console.log('Request from http client:');
  console.log('client ip: ', clientIp);
  console.log('package: ', packageName);
  console.log('service: ', serviceName);
  console.log('method: ', methodName);

  const body = {...req.query, ...req.body}

  console.log('headers:');
  console.log(JSON.stringify(headers, null, '\t'));
  console.log('body:');
  console.log(JSON.stringify(body, null, '\t'));

  jsonToGrpc(packageName, serviceName, methodName, {body, headers}, (grpcRes, err) => {
    if (err) {
      return res.json({
        code: err.errCode, msg: err.msg
      });
    }
    res.json(grpcRes);
  });
});

module.exports = router;
