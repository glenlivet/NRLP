/**
 * New node file
 */

var CodeGenerator = module.exports = function CodeGenerator() {

	this.available = 0;
	this.occupied = {};

};

CodeGenerator.prototype.next = function() {
	do {
		if ((typeof this.occupied[this.available] === 'undefined')
				|| this.occupied[this.available] === null) {
			this.occupied[this.available] = true;
			var rtn = this.available;
			if(this.available === 65535){
				this.available = 0;
			}
			return rtn;
		}
	} while (++this.available);
};

CodeGenerator.prototype.recycle = function(number){
	this.occupied[number] = null;
};

