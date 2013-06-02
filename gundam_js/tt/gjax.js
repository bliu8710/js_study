/**
 * easy tab style switch box
 *
 * name:    switchTab
 * require: Zepto.js
 * author:  kei takahashi
 */
;(function(window, document, tt, undefined) {

var NS = "gjax",
	setting = {
		startCallback: null,
		endCallback: null
	};

/*
option
*/
function Gjax(url, params, option) {
	var self = this,
		body = tt(document.body);

	this.option = tt.extend({}, setting, option);
	this.url = url;
	this.params = params;
}

Gjax.prototype = {
	constructor: Gjax,
	load: function(callback) {
		this.getData(this.getParams(), callback);
	},
	getParams: function() {
		var res = this.params;
		res['async'] = 1;
		return res;
	},
	setData: function(data, callback) {
		for (var i = 0; data.containers[i]; i++) {
			var container = tt(data.containers[i].selector);
			container.html(data.containers[i].html);
		}
		this.option.endCallback && this.option.endCallback(true);
		callback && callback();
	},
	getData: function(params, callback) {
		var self = this;

		this.option.startCallback && this.option.startCallback();
		tt.ajax({
			type: 'get',
			url:  this.url,
			data: params,
			dataType: 'json',
			timeout: 10000,
			success: function(data) {
				self.setData(data, callback && function() {
					callback(true);
				});
			},
			error:   function() {
				callback && callback(true);
				self.option.endCallback && self.option.endCallback(false);
				alert('\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F');
			}
		});
	}
};

tt[NS] = tt[NS] || function(url, params, option) {
	return new Gjax(url, params, option);
};

})(this, document, this.tt);
