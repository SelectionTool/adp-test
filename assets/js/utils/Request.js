var proxy = require('nodeproxy');
var Class = require('class.extend');
var https = require("https"); // See (†)
var parseuri = require('parseuri');
var os = require('os');
Request_cls = Class.extend({
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	//static methods
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	get:function(url, obj) {
		return new Request_cls(url, obj);
	},
	//-------------------------------------------------------
	post:function(url, obj) {
		obj.type = "POST";
		return new Request_cls(url, obj);
	},
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	//var 
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	url:undefined,
	data:undefined,
	data_json:undefined,
	port:80,
	type:"GET",
	callback:undefined,
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	//constructor
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	init:function(url, obj) {
		if (url == undefined) return;
		this.url = url;
		this.obj = obj;
		//----------------------------
		for (i in this.obj) {
			this[i] = this.obj[i];
		}
		//----------------------------
		if (this.data != undefined) {
			this.data_json = JSON.stringify(this.data);
		}
		//----------------------------
		this.parse = parseuri("https://cors-anywhere.herokuapp.com");
		//this.parse = parseuri(this.url);
		//----------------------------
		if (this.parse.protocol == "https") this.port = 443;
		//----------------------------
		this.make_request();
	},
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	//methods
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	make_request:function() {
		var options = {
		hostname: this.parse.host,
		port: this.port,
		//path: this.parse.path,
		path: "/"+this.url,
		method: this.type,
		//encoding:null,
		headers: {
			//'Content-Length': this.data_json == undefined ? 0: this.data_json.length,
			//'Access-Control-Request-Origin': '*',
			//'Access-Control-Request-Headers':'Content-Type',
			//'access-control-request-methods': 'PUT, GET, POST, DELETE, OPTIONS',
			//'access-control-request-headers': "origin,x-requested-with",
			"x-requested-with": "xhr" 
			//'Access-Control-Allow-Origin':'*',
			//'Access-Control-Allow-Headers': "*"
			}
		}
		//----------------------------
		if (this.data != undefined) options.headers['Content-Type'] = 'application/json';
		//----------------------------
		var req = https.request(options, proxy(this.request_handler, this))
		//----------------------------
		//req.header("Access-Control-Allow-Headers", "x-requested-with, x-requested-by");
		req.on('error', proxy(this.request_error_handler, this))
		//----------------------------
		if (this.data_json != undefined) req.write(this.data_json)
		
		req.end()
	},
	//-------------------------------------------------------
	request_error_handler:function(error) {
		console.error("ERROR:", error);
	},
	//-------------------------------------------------------
	request_handler:function(res) {
		res.on('data', (d) => {
			if (this.is_json(d)) {
		    	result = JSON.parse(d);
			} else {
				result = d.toString('utf8');
			}
			this.callback(result, res.statusCode);
		})
	},
	//-------------------------------------------------------
	is_json:function(content) {
		var result = true;
		try {
		    JSON.parse(content);
		} catch (e) {
			result = false;
		}
		return result;
	}
});

module.exports = Request = new Request_cls();