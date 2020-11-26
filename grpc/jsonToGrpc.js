var grpc = require('grpc')
var grpcClient = require('./grpc_client');
const {clientWS, onmessage} = require('../service/mws');

onmessage( (data) => {
  const {name, grpc, params, headers} = data
  const {pkg, service, method} = grpc
    jsonToGrpc(pkg, service, method, {body: params, headers, clientIp: ''})
})

function getTimeStr(time) {
  if (time > 1000) {
    return (time / 1000) + 's'
  }
  else {
    return time + 'ms'
  }
}

function jsonToGrpc (pkg, service, method, req, cb) {
    const {body, headers, clientIp} = req
  if (grpcClient[pkg] && grpcClient[pkg][service] && grpcClient[pkg][service][method]) {
    const meta = new grpc.Metadata();
    Object.keys(headers).forEach((k) => {
      meta.add(k, headers[k]);
    })

    const startTime = new Date()

    grpcClient[pkg][service][method](body, meta, function(err, response) {
      console.log(response.data)
      console.log(response.data[0], response.data[1])
      if (err) {
        console.log('Error from grpc service:')
        console.log(err.toString());
        cb && cb(null, { errCode: 301, msg: err.toString() });
      } else {
        console.log('Response from grpc service:')
        let resJSONstr = JSON.stringify(response)
          if (resJSONstr.length> 80) {
            resJSONstr = resJSONstr.substring(0, 80)+'......'
          }
        console.log(resJSONstr)
        cb && cb(response, null);
      }

      const endTime = new Date()
      clientWS.clients.forEach((ws) => {
        ws.send(JSON.stringify({
          name:pkg+'.'+service+'/'+method,
          request: {
            params: body,
            headers: headers
          },
          response: {
            data: {
              result: err?err:response
            },
            opt: {
              grpc: {
                pkg,
                service,
                method
              },
              requestTime: startTime,
              allTime: getTimeStr(endTime - startTime),
              clientIp: clientIp
            }
          }

        }))
      })

    });
  } else {
    let errMsg = 'Error! unknown grpc method: ' + pkg + '.' + service + '/' + method;
    console.error(errMsg)
    cb && cb(null, { errCode: 300, msg: errMsg });
  }
};
module.exports = jsonToGrpc
