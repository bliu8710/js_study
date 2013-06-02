/**
 * easy paging plugin for Zepto.js
 *
 * name:    pager.js
 * version: 0.0.1
 * require: Zepto.js
 * author:  kei takahashi
 */
;(function(window, document, tt, undefined) {
'use strict';

var NS = 'pager',
	li = document.createElement('li'),
	anchor = document.createElement('a'),
	supportTouch = 'ontouchstart' in document,
	oldiOS = (tt.env.ios && tt.env.versionCode < 5000),
	tapEvent = oldiOS ? 'tap' : 'tap',
	events = {
		touchStart:    supportTouch ? 'touchstart' : 'mousedown',
		touchMove:     supportTouch ? 'touchmove'  : 'mousemove',
		touchEnd:      supportTouch ? 'touchend'   : 'mouseup'
	},
	setting = {
		pagerSelector      : '.ui-pager',
		anchorSelector     : '.ui-pager-item a',
		nextSelector       : '.btn-next',
		prevSelector       : '.btn-prev',
		currentNumSelector : 'input[name="currentpage"]',
		maxNumSelector     : 'input[name="maxpage"]',
		itemClassName      : 'ui-pager-item',
		currentClassName   : 'current',
		disableClassName   : 'disable',
		viewCount          : 3,
		duration           : 300,
		tapNumCallback  : null
	};

function Pager(wrapper, option) {
	var self = this,
		index = 0,
		locked = false,
		body = tt(document.body);

	this.option = option;
	this.wrapper = wrapper;
	this.pagers = tt(this.option.pagerSelector);
	this.nextBtn = tt(this.option.nextSelector);
	this.prevBtn = tt(this.option.prevSelector);
	this.page = {};
	this.nodes = {
		item: document.createElement('li'),
		btn: document.createElement('a')
	};
	this.nodes.item.className = this.option.itemClassName;
	this.nodes.item.appendChild(this.nodes.btn);

	this.initNode();

	body.on(tapEvent, this.option.anchorSelector, function(ev) {
		var target = tt(this);

		ev.preventDefault();
		if (target.hasClass('current')) {
			return;
		}
		if (self.option.tapNumCallback) {
			if (self.option.tapNumCallback.call(self, target.get())) {
				self.page.current = +target.getAttribute('data-num');
				self.pagers.find(self.option.currentClassName).
					removeClass(self.option.currentClassName);
				tt(target).addClass(self.option.currentClassName);
			}
		} else if (target.href) {
			window.location = target.href;
		}
	});

	this.nextBtn.on(tapEvent, function() {
		if (locked) {
			return
		}
		locked = true;
		self.next();
		unlock();
	});

	this.prevBtn.on(tapEvent, function() {
		if (locked) {
			return;
		}
		locked = true;
		self.prev();
		unlock();
	});

	function unlock() {
		setTimeout(function() {
			locked = false;
		}, self.option.duration);
	}
}

Pager.prototype = {
	constructor: Pager,
	next: function() {
		if (this.page.max < (this.page.lead + this.option.viewCount)) {
			return;
		}
		this.page.lead += this.option.viewCount;
		this.pagers.each(function() {
			var childs = [].slice.call(this.children);

			childs.forEach(function(child) {
				var className = child.className;

				if (className.indexOf('pos-c') > -1) {
					child.className =
						className.replace('pos-c', 'pos-p');
				} else if (className.indexOf('pos-n') > -1) {
					child.className =
						className.replace('pos-n', 'pos-c');
				} else if (className.indexOf('pos-p') > -1) {
					child.parentNode.removeChild(child);
				}
			});

		});
		this.addNextNode();
		this._toggleBtnClass();
	},
	prev: function() {
		if (1 >= this.page.lead) {
			return;
		}
		this.page.lead -= this.option.viewCount;
		this.pagers.each(function() {
			var childs = [].slice.call(this.children);

			childs.forEach(function(child) {
				var className = child.className;

				if (className.indexOf('pos-c') > -1) {
					child.className =
						className.replace('pos-c', 'pos-n');
				} else if (className.indexOf('pos-p') > -1) {
					child.className =
						className.replace('pos-p', 'pos-c');
				} else if (className.indexOf('pos-n') > -1) {
					child.parentNode.removeChild(child);
				}
			});
		});
		this.addPrevNode();
		this._toggleBtnClass();
	},
	initNode: function() {
		this.pagers.each(function() {
			var child;

			while (child = this.firstChild) {
				this.removeChild(child);
			}
		});
		this.page.current = +tt(this.option.currentNumSelector).attr('value') || 1;
		this.page.max = +tt(this.option.maxNumSelector).attr('value') || null;
		this.page.lead = this.page.current;

		if (this.page.max === null) {
			throw new Error('Max page number not found.');
		}

		var over = ((this.page.current % this.option.viewCount) || this.option.viewCount) - 1,
			lead = this.page.current - over,
			i = 0,
			iz = Math.min(this.option.viewCount, (this.page.max - (lead - 1)));

		this.page.lead = lead + i;
		for (; i < iz; ++i) {
			this.pagers.append(this._getItemNode(
				'pos-c-' + i,
				lead + i));
		}

		this.addNextNode();
		this.addPrevNode();
		this._toggleBtnClass();
	},
	addNextNode: function() {
		var next = this.page.lead + this.option.viewCount,
			over = this.page.max - next,
			i = 0,
			iz = Math.min(this.option.viewCount,
					      Math.abs(over) + 1);

		for (; i < iz; ++i) {
			this.pagers.append(this._getItemNode(
				'pos-n-' + i,
				next + i));
		}
	},
	addPrevNode: function() {
		var prev = this.page.lead - this.option.viewCount,
			i = 0,
			iz = 3;

		if (prev <= 0) {
			return;
		}

		for (; i < iz; ++i) {
			this.pagers.append(this._getItemNode(
				'pos-p-' + i,
				prev + i));
		}
	},
	_getItemNode: function(posClassName, num) {
		var item = this.nodes.item.cloneNode(true),
			btn = item.firstChild;

		item.className += ' ' + posClassName;
		if (num === this.page.current) {
			item.className += ' ' + this.option.currentClassName;
		}
		btn.setAttribute('data-num', num);
		btn.textContent = num;
		return item;
	},
	_toggleBtnClass: function(next, prev) {
		var disable = this.option.disableClassName;

		if (prev || this.page.lead === 1) {
			this.prevBtn.addClass(disable);
		} else if (!prev && this.prevBtn.hasClass(disable)) {
			this.prevBtn.removeClass(disable);
		}

		if  (next || ((this.page.lead + this.option.viewCount) > this.page.max)) {
			this.nextBtn.addClass(disable);
		} else if (!next && this.nextBtn.hasClass(disable)) {
			this.nextBtn.removeClass(disable);
		}
	}
};

tt.fn[NS] = tt.fn[NS] || function(option) {
	if (!this.length) {
		return this;
	}
	return new Pager(this, tt.extend({}, setting, option || {}));
};

})(this, document, this.tt);
