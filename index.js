var proxy = require('nodeproxy');
var Request = require("./assets/js/utils/Request.js");
var Class = require('class.extend');
var os = require('os');
//--------------------------------
if (process.argv[2] == "test") {
	var unit_test = true;
	require('console-stamp')( console, {
		datePrefix:os.EOL+"---------------------------------------------"+os.EOL,
		dateSuffix:os.EOL,
		labelPrefix:os.EOL,
		labelSuffix:os.EOL,
		label:false,
		pattern : "dddd, mmmm dS, yyyy, h:MM:ss TT"+os.EOL,
	});
}
//--------------------------------
var Adp_test = Class.extend({
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	//var 
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	response_get:undefined,
	response_post:undefined,
	left:undefined,
	right:undefined,
	operation:undefined,
	operator:undefined,
	id:undefined,
	debug:false,
	unit_test:false,
	url_get:'https://interview.adpeai.com/api/v1/get-task',
	url_post:'https://interview.adpeai.com/api/v1/submit-task',
	////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	//constructor
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	init:function() {
		this.start = Date.now();
		this.execute();
		//setInterval(proxy(this.execute, this), 3000);
	},
	////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	//methods
	/////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////
	execute:function() {
		if (unit_test) {
			console.log("Initializing GET REQUEST: "+this.url_get);
		}
		//----------------------------
		Request.get(this.url_get, {"callback":proxy(this.complete_get, this)});
	},
	//-------------------------------------------------------
	complete_get:function(d, status) {
		if (unit_test) {
			console.log("GET response successfully recieved with status code \""+status+"\":", d);
		}
		//----------------------------
		this.left = d.left;
		this.right = d.right;
		this.operation = d.operation;
		this.id = d.id;
		this.response_get = d;
		//----------------------------
		this.calculate();
		//----------------------------
		this.submit_post();
	},
	//-------------------------------------------------------
	calculate:function() {
		//----------------------------
		if (this.operation == "addition") {
			this.operator = "+";
			this.answer = this.left + this.right;
		} else if (this.operation == "multiplication") {
			this.operator = "*";
			this.answer = this.left * this.right;
		} else if (this.operation == "subtraction") {
			this.operator = "-";
			this.answer = this.left - this.right;
		} else if (this.operation == "remainder") {
			this.operator = "%";
			this.answer = this.left % this.right;
		} else if (this.operation == "division") {
			this.operator = "/";
			this.answer = this.left/this.right;
		}
		//----------------------------
		if (unit_test) {
			console.log(
				"Calulating math equation: "+this.left+" "+this.operator+" "+this.right+os.EOL+
				" Result of equation: "+this.answer
			);
		}
	},
	//-------------------------------------------------------
	submit_post:function() {
		var post_data = {id:this.id, result:this.answer};
		if (unit_test) {
			console.log("Initializing POST request: "+this.url_post+os.EOL+" Body: "+JSON.stringify(post_data));
		}
		//----------------------------
		Request.post(this.url_post, {
			callback:proxy(this.complete_post, this),
			data:post_data
		});
	},
	//-------------------------------------------------------
	complete_post:function (d, status) {
		this.response_post = d;
		//----------------------------
		if (unit_test) {
			console.log("POST response successfully recieved with status code \""+status+"\":", this.response_post);
		} else {
			console.log(
				"ID: "+this.id+os.EOL+
				"Operation: "+this.operation+os.EOL+
				"Equation: "+this.left+" "+this.operator+" "+this.right+" = "+this.answer+" is "+this.response_post+os.EOL+
				"------------------------------------------"
			);
		}
		//----------------------------
		if (!unit_test) {
			this.execute();
		} else {
			this.end = Date.now();
			console.log("Script took " + ((this.end - this.start) / 1000)+" seconds to complete");
		}
	}
});

module.exports = new Adp_test();