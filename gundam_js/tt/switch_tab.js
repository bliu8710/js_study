;(function(window, document, tt, undefined) {
'use strict';

var NS = 'switchTab',
	supportTouch = 'ontouchstart' in document, // for pc support
	setting = {
		currentClassName: 'current',
		targetAttrName: 'target',
	};

tt.fn[NS] = tt.fn[NS] = function(option) {
	var self = this,
		initial = null;

	option = tt.extend(setting, option);
	this.match(function() {
		if (tt(this).hasClass('current')) {
			initial = this;
			return true;
		}
		return false;
	});
	this.on('tap', function(ev) {
		_switch(ev.currentTarget);
	});
	initial && _switch(initial);

	return this;

	function _switch(current) {
		self.each(function(index) {
			var target = tt('.' + tt(this).data(option.targetAttrName));

			if (current !== this) {
				tt(this).removeClass(option.currentClassName);
				target.hide();
			} else {
				tt(this).addClass(option.currentClassName);
				target.show();
			}
		});
	}
};

})(this, document, this.tt);
