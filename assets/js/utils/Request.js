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
		//this.parse = parseuri("https://cors-anywhere.herokuapp.com");
		this.parse = parseuri(this.url);
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
		  //path: "/"+this.parse.path,
		  path: this.url,
		  method: this.type,
		  //encoding:null,
		  headers: {
		    'Content-Type': 'application/json',
		    'Content-Length': this.data_json == undefined ? 0: this.data_json.length,
		    'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers':'Content-Type',
			'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With',
		    //'Access-Control-Allow-Origin':'*',
		    //'Access-Control-Allow-Headers': "*"
		  }
		}
		//----------------------------
		var req = https.request(options, proxy(this.request_handler, this))
		//----------------------------
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
			try {
			    result = JSON.parse(d);
			} catch (e) {
				result = d.toString('utf8');
			}
			this.callback(result, res.statusCode);
		})
		
	}
});

module.exports = Request = new Request_cls();