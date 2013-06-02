;(function(window, document, tt, undefined) {
'use strict';

var NS = 'modal',
	setting = {
		container: document.body,
		shieldClassName: '.shield',
		innerClassName: '.inner',
		closeClassName: '.close',
		embedTargetSelector: '.embed',
		hideTargetSelector: 'object',
		type: 'ajax',
		url: '',
		timeout: 10000,
		// 「エラーが発生しました」
		errorHtml: '<p>\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F</p>',
		onopen: null,
		onclose: null,
		minMarginTop: 35
	},
    // iOS4.x はイベントの発行がおかしいので切り分け
    oldiOS = (tt.env.ios && tt.env.versionCode < 5000),
    tapEvent = oldiOS ? 'click' : 'tap';;


function Modal(element, option) {
	var self = this,
		zoom;

	this.option = tt.extend({}, setting, option);
	this.option.zoom = +(tt('html').css('zoom')) || 1;
	this.isShow = false;
	this.render = this._renders[this.option.type];
	if (this.option.type === 'embed') {
		this.embedTarget = tt(this.option.embedTargetSelector);
	}
	this.hideTarget = null;
	this.html = tt('html');
	this.shield = tt(document.createElement('div'));
	this.shield.addClass(
		this.option.shieldClassName.substr(1, this.option.shieldClassName.length));
	this.inner = tt(document.createElement('div'));
	this.inner.addClass(
		this.option.innerClassName.substr(1, this.option.innerClassName.length));
	this.shield.append(this.inner);
	this.shield.hide();
	tt(this.option.container).append(this.shield);

    element.on('click', function(ev) { ev.preventDefault(); });
	element.on('tap', function(ev) {
		ev.preventDefault();
		self._tap();
	});
    this.shield.on('click', function(ev) { if (ev.target === self.shield[0]) { ev.preventDefault(); } });
	this.shield.on('tap', function(ev) {
		if (ev.target === self.shield[0]) {
			ev.preventDefault();
			self.hide();
		}
	});
    (!oldiOS) && this.shield.on('click', this.option.closeClassName, function(ev) { ev.preventDefault(); });
	this.shield.on(tapEvent, this.option.closeClassName, function(ev) {
		ev.preventDefault();
		self.hide();
	});

	return this;
}

Modal.prototype = {
	constructor: Modal,
	show: function(mix) {
		var self = this,
			innerHeight, verticalHeight = getVerticalCenter();

		this.hideTarget = tt(this.option.hideTargetSelector).css('visibility', 'hidden');
		this.inner.css('visibility', 'hidden');
		this.shield.css('height', getPageSize() / this.option.zoom + 'px');
		this.shield.show();
		this.inner.css('top',
				Math.max(getVerticalCenter() / this.option.zoom, this.option.minMarginTop) + 'px');
		this.inner.css('visibility', 'visible');
		this.render.call(this ,mix);
		this.option.onopen && this.option.onopen();
		this.isShow = true;
		this.html.addClass('kill-link');
	},
	hide: function() {
		var self = this;

		if (!this.isShow) {
			return;
		}
		this.shield.hide();
		this.inner.html('');
		this.hideTarget && this.hideTarget.css('visibility', 'visible');
		this.hideTarget = null;
		this.option.onclose && this.option.onclose();
		this.isShow = false;
		setTimeout(function() {
			self.html.removeClass('kill-link');
		}, 600);
	},
	_renders: {
		'embed': function(element) {
			this.inner.html(this.embedTarget[0].innerHTML);
			this.inner.css('margin-top', (- this.inner.height() / 2) + 'px');
		},
		'ajax': function(url) {
			var self = this;

			tt.ajax({
				type: 'GET',
				url:  url || this.option.url,
				dataType: 'html',
				timeout: this.option.timeout,
				success: function(data) {
					self.inner.html(data);
					self.inner.css('margin-top', (- this.inner.height() / 2) + 'px');
				},
				error: function() {
					self.inner.html(self.option.errorHtml);
				}
			});
		},
	},
	_tap: function() {
		if (this.isShow) {
			this.hide();
		} else {
			this.show();
		}
	},
};

function getPageSize () {
	return Math.max(
		document.body.clientHeight,
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		document.documentElement.clientHeight
	);
}

function getVerticalCenter () {
	var screenHeight = (window.orientation === 0) ? screen.availHeight : screen.availWidth,
		height = Math.min(screenHeight, window.innerHeight);

	return window.pageYOffset + (height / 2);
}

tt.fn[NS] = tt.fn[NS] || function(option) {
	return new Modal(this, option);
}

})(this, document, this.tt);
