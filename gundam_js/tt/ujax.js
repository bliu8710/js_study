/**
 * easy tab style switch box
 *
 * name:    switchTab
 * require: Zepto.js
 * author:  kei takahashi
 */
;(function(window, document, tt, undefined) {

var NS = 'ujax',
	li = document.createElement('li'),
	anchor = document.createElement('a'),
	setting = {
		formSelector: '.form',
		containerSelector: '.container',
		pageTopSelector: '#content-top',
		startCallback: null,
		endCallback: null,
		zoom: null
	};

li.className = 'item';
li.appendChild(anchor);

function Ujax(option) {
	var self = this,
		body = tt(document.body);

	this.option = tt.extend({}, setting, option);
	this.option.zoom = this.option.zoom || +(tt('html').css('zoom')) || 1;
	this.pageTopAnchor = tt(this.option.pageTopSelector);
	this.form = tt(this.option.formSelector);
	this.url = this.form.attr('action');
	this.inputs = this.form.find('input, select, textarea');
	this.pageInput = this.form.find('input[name=p]');
	this.container = tt(this.option.containerSelector);

	this.inputs.on('change', function() {
		self.load();
	});
}

Ujax.prototype = {
	constructor: Ujax,
	load: function(callback) {
		this.getData(this.getParams(), callback);
	},
	getParams: function() {
		var res = {};

		this.inputs.each(function() {
			var name = this.getAttribute('name'),
				value = this.getAttribute('value');

			if (!name) {
				return;
			}
			if ('selectedIndex' in this) {
				value = this.options[this.selectedIndex].value;
			}
			res[name] = value || "";
		});
		res['async'] = 1;
		return res;
	},
	setData: function(data, callback) {
		this.container.html(data);
		this.option.endCallback && this.option.endCallback(true);
		callback && callback();
		window.scrollTo(0, this.pageTopAnchor[0].offsetTop * this.option.zoom);
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
				self.setData(data.units, callback && function() {
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

tt[NS] = tt[NS] || function(option) {
	return new Ujax(option);
};

})(this, document, this.tt);
