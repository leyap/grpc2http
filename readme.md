### A grpc api to http api tool
接受http请求转换成grpc请求并转发到grpc服务, 支持热重载proto文件 
````
http client => [ http server -> grpc client ] => grpc Server
````

### Features
1. 支持热重载proto文件
2. 支持url query参数和post json参数合并,并映射到grpc参数
3. 支持http header映射到grpc medadata
4. proto文件支持import(v0.0.4新增)
5. 支持Web Debugger(v0.0.5新增)

### Install
````
npm -g i grpc2http
````

### How To Use

````
> grpc2http -h
Usage: grpc2http [options]

http client => [ http server -> grpc client ] => grpc Server

Options:
  -v, --version              output the version number
  -i, --input [input]        protos directory
  -g, --grpchost [grpchost]  grpc server host (ip:port)
  -p, --httpport [httpport]  local http listen port
  -c, --config [config]      config file (default name is grpc2http.config.json)
  -h, --help                 display help for command
````

### Use config file
````
add grpc2http.config.json in project root direction
add follow json to file:
{
    "grpcHost": "127.0.0.1:9503",
    "httpPort": "3503",
    "protoPath": "grpc/protos"
}
````

### sample proto file
````
// protos/sample.proto

syntax = "proto3";

package mycom.sample;

service User {
  rpc getInfo (GetUserInfoRequest) returns(GetUserInfoResponse) {}
}

message UserInfo {
  int32 userId = 1;
  string name = 2;
  string title = 3;
  int32 age = 4;
}

message GetUserInfoRequest {
  int32 userId = 1;
}

message GetUserInfoResponse {
  int32 code = 1;
  string msg = 2;
  UserInfo data = 3;
}
````

````
> http2grpc -i protos/
grpc server host:  127.0.0.1:9503
http listen port:  3503
{
	"mycom.sample": {
		"User": [
			"getInfo"
		]
	}
}
grpc methods list:
/mycom.sample.User/getInfo

````
Now you can open it from browser:
````
127.0.0.1:3503/mycom.sample.User/getInfo/?userId=123
````
