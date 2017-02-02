var fs = require("fs");

module.exports = function(file, obj){

	obj = obj || {};
	var self = this;

	if(!fs.existsSync(file)){
		fs.writeFileSync(file, JSON.stringify(obj), "utf-8");
	}

	this.read = function(){
		return JSON.parse(fs.readFileSync(file, "utf-8"));
	};

	this.write = function(cb){
		fs.writeFileSync(file, JSON.stringify(cb(self.read())), "utf-8");
	};

}
