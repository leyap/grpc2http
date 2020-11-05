var grpc = require('grpc')
var grpcClient = require('./grpc_client');

module.exports = function jsonToGrpc (pkg, service, method, req, cb) {
    const {body, headers} = req
  if (grpcClient[pkg] && grpcClient[pkg][service] && grpcClient[pkg][service][method]) {
    const meta = new grpc.Metadata();
    Object.keys(headers).forEach((k) => {
      meta.add(k, headers[k]);
    })
    grpcClient[pkg][service][method](body, meta, function(err, response) {
      if (err) {
        console.log('Error from grpc service:')
        console.log(err.toString());
        cb(null, { errCode: 301, msg: err.toString() });
      } else {
        console.log('Response from grpc service:')
        console.log(JSON.stringify(response,null, '\t'))
        cb(response, null);
      }
    });
  } else {
    let errMsg = 'Error! unknown grpc method: ' + pkg + '.' + service + '/' + method;
    console.error(errMsg)
    cb(null, { errCode: 300, msg: errMsg });
  }
};
