;(function(window, document, tt, undefined) {
'use strict';

var loader = new Loader(),
    // iOS4.x はイベントの発行がおかしいので切り分け
    oldiOS = (tt.env.ios && tt.env.versionCode < 5000),
    tapEvent = oldiOS ? 'click' : 'tap';

// dispatcher
function dispatcher() {
	var path, fn,
		args = [].slice.call(arguments),
		uri = window.decodeURIComponent(window.location + "");

    // if first argument is function, execute it
	(typeof args[0] === 'function') && (args.shift())();

	while ((path = args.shift()) && (fn = args.shift())) {
		if (typeof path !== 'string' || typeof fn !== 'function') {
			continue;
		} else if ((new RegExp('^http.*?' + path).test(uri))) {
			fn();
		}
	}
}

// loading
function Loader() {
	var state = false,
        element;

    tt(function() {
        element = tt('.loader');
    });

    this.show = function() {
		if (state) {
			return;
		}
	    element.addClass('show');
		state = true;
    };
    this.hide = function() {
		element.removeClass('show');
		state = false;
    };
	return this;
}

// アプリ用にメニューが表示できるかを取得できるようにする
window.__canOpenModal = function() {
	return tt('.embed').length;
};


//### execute dispatcher

dispatcher(
// first function is common processing all pages
function() {
	var modal = null;

    tt(function() {
		var body = tt(document.body),
			ua = tt.env.ios		? 'ios' :
				 tt.env.android ? 'android' : '';

		if (ua) {
			tt('html').addClass(ua);
		}
        body.on('change', '.auto-submit', function(ev) {
            var form = tt(ev.currentTarget)[0].form;

            if (form) {
                return;
            }
            form.submit();
        });
        modal = tt('.open-modal').modal({
            closeClassName: '.modal-close',
            embedTargetSelector: '.embed',
            type: 'embed',
			errorHtml: '<p>\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F</p>' // エラーが発生しました
        });
		body.on('touch', '.tap', function() {
			var target = tt(this);

			target.addClass('hover');
			setTimeout(function() {
				target.removeClass('hover');
			}, 700);
		});
    });

	// アプリ用のモーダルメニュー実装
	window.addEventListener('hashchange', function(ev) {
		var hash = window.location.hash;

		if (hash !== "#toggle_modal" || !modal) {
			if (!hash) {
				ev.preventDefault();
			}
			return;
		} else {
			ev.preventDefault();
			if (modal.isShow) {
				modal.hide();
			} else {
				modal.show();
			}
		}
		window.location.hash = "empty";
	}, false);

	window.addEventListener('load', function() {
        if (/#/.test(window.location + "") || window.pageYOffset > 1) {
            return;
        }
        setTimeout(function() {
            window.scrollTo(0, 1);
        }, tt.env.isAndroid ? 200 : 0);
	}, false);
},
// タブ切り替え
'(_gndm_mypage|_gndm_ev)',
function() {
    tt(function() {
        tt('.tab-switch-link').switchTab();
    });
},
// href組み込み型のページャー
'(_gndm_un_list_t|_gndm_part_list|_gndm_kit_list|_gndm_ki_shop_list|_gndm_pa_shop_list)',
function() {
    tt(function() {
		tt('.ui-pager-wrap').pager({
            tapNumCallback: function(target) {
                _goToPage(target.getAttribute('data-num'));
            }
        });
    });

    function _goToPage(num) {
        var params = tt.query2object(window.location.search);

        params.p = num;
        location.href = '?' + tt.param(params);
    }
},
// 一括チェック系
'(_gndm_un_list_t|_gndm_cstm_t)',
function() {
    tt(function() {
		var body = tt(document.body),
			form = tt('.form-units'),
			checkAll = tt('.check-all'),
			btn = tt('.form-submit');

        checkAll.on('click', function(ev) { ev.preventDefault(); });
		checkAll.on(tapEvent, function(ev) {
			var cond = checkAll.hasClass('selected') ? false : true;

			ev.preventDefault();
			tt('.selectable').each(function() {
				_toggleCheck(this, cond);
			});
			_toggleSubmit();
		});

		form.on('click', '.selectable', function(ev) {
			_toggleSubmit();
		});

		_toggleSubmit();

		function _toggleSubmit() {
			if (tt('.selectable:checked').length < 1) {
				checkAll.removeClass('selected');
				checkAll.html('一括チェック');
				btn.addClass('btn-disable');
			} else {
				checkAll.addClass('selected');
				checkAll.html('一括チェック解除');
				btn.removeClass('btn-disable');
			}
		}

		function _toggleCheck(element, checked) {
			var data = tt(element).data();

			if (checked && !(+data.lv === 1 && +data.clv === 0 && +data.producable === 1)) {
				return;
			}
			element.checked = checked;
		}
    });
},
// モーダル型絞り込み, ajaxなし
'(_gndm_cstm_t|_gndm_un_man_l)',
function() {
	tt(function() {
		var body = tt(document.body),
			form = tt('.unit-sort'),
			pager = tt('.ui-pager-wrap').pager({
				tapNumCallback: function(target) {
					tt('input[name="p"]').attr('value', target.getAttribute('data-num'));
					form[0].submit();
					return true;
				}
			}),
			modalUnitType = tt('.btn-unit-type').modal({
				closeClassName: '.close, .window-footer .btn',
				embedTargetSelector: '.embed-unit-type',
				type: 'embed',
				onopen: function() {
					_onSortOpen('u_t');
				}
			}),
			modalSortType = tt('.btn-sort-type').modal({
				closeClassName: '.close, .window-footer .btn',
				embedTargetSelector: '.embed-sort-type',
				type: 'embed',
				onopen: function() {
					_onSortOpen('o');
				}
			}),
			inputs = {},
			labels = {};

		function _onSortOpen(name) {
			var value = inputs[name]['value'];

			tt('.list-item-radio[name="'+ name +'"][value="'+ value +'"]').
				parent().addClass('selected');
		}

		// input, labelを一旦取得
		form.find('input[type="hidden"]').each(function() {
			inputs[this.getAttribute('name')] = this;
		});
		form.find('button .label').each(function() {
			labels[this.getAttribute('data-name')] = this;
		});

		// inputとlabelの初期値を流し込む
		tt('.list-item-radio[data-init="1"]').each(function() {
			_updateInfo(this);
		});

		// sort関連のボタンが押された場合
        (!oldiOS) && body.on('click', '.list-item-label', function(ev) { ev.preventDefault(); });
		body.on(tapEvent, '.list-item-label', function(ev) {
			var target = tt(this),
				name = target.attr('name');

            ev.preventDefault();
            if (target.hasClass('disabled') || target.hasClass('selected')) {
                return;
            }

			tt('.list-item-label.selected').
				removeClass('selected');
			target.addClass('selected');
			_updateInfo(target[0].firstChild);

			setTimeout(function() {
				modalUnitType.hide();
				modalSortType.hide();
				form[0].submit();
			}, 400);
		});

		// sort, pageなどのinputとlabelを更新
		function _updateInfo(ref) {
			var name = ref.getAttribute('name');

			if (!inputs[name] || !labels[name]) {
				return;
			}
			inputs['p'].setAttribute('value', '1');
			inputs[name].setAttribute('value', ref.getAttribute('value'));
			labels[name].textContent = ref.getAttribute('data-label');
		}
	});
},
// モーダル型絞り込み、動的ページ取得
'(_gndm_unit_list|_gndm_un_wait_l)',
function() {
	var currentBubble = null;

	tt(function() {
		var pInput = tt('input[name="p"]'),
			body = tt(document.body),
			inputs = {},
			labels = {},
			lastOpenNav = null,
			ujax = tt.ujax({
				formSelector: '.unit-sort',
				containerSelector: '.unit-lists',
				startCallback: function() {
					loader.show();
				},
				endCallback: function(state) {
					loader.hide();
				}
			}),
			pager = tt('.ui-pager-wrap').pager({
				tapNumCallback: function(target) {
					var value = target.getAttribute('data-num');

					pInput.attr('value', value);
					ujax.load(function(cond) {
						if (!cond) {
							return;
						}
						pager.page.current = +value;
						tt('.ui-pager li.current').removeClass('current');
						tt('a[data-num="'+value+'"]').parent().addClass('current');
					});
					return false;
				}
			}),
			modalUnitType = tt('.btn-unit-type').modal({
				closeClassName: '.close, .window-footer .btn',
				embedTargetSelector: '.embed-unit-type',
				type: 'embed',
				onopen: function() {
					_onSortOpen('u_t');
				}
			}),
			modalSortType = tt('.btn-sort-type').modal({
				closeClassName: '.close, .window-footer .btn',
				embedTargetSelector: '.embed-sort-type',
				type: 'embed',
				onopen: function() {
					_onSortOpen('o');
				}
			});

		function _onSortOpen(name) {
			var value = inputs[name]['value'];

			tt('.list-item-radio[name="'+ name +'"][value="'+ value +'"]').
				parent().addClass('selected');
		}

		// sort処理
		// input, labelを一旦取得
		tt('input[type="hidden"]').each(function() {
			inputs[this.getAttribute('name')] = this;
		});
		tt('button .label').each(function() {
			labels[this.getAttribute('data-name')] = this;
		});
		// inputとlabelの初期値を流し込む
		tt('.list-item-radio[data-init="1"]').each(function() {
			_updateInfo(this);
		});
		// sort関連のボタンが押された場合
        (!oldiOS) && body.on('click', '.list-item-label', function(ev) { ev.preventDefault(); });
		body.on(tapEvent, '.list-item-label', function(ev) {
			var target = tt(this),
				name = target.attr('name');

            ev.preventDefault();
            if (target.hasClass('disabled') || target.hasClass('selected')) {
                return;
            }

			tt('.list-item-label.selected').
				removeClass('selected');
			target.addClass('selected');
			_updateInfo(target[0].firstChild);　// 初めての要素

			setTimeout(function() {
				modalUnitType.hide();
				modalSortType.hide();
				ujax.load(function(cond) {
					if (!cond) {
						return;
					}
					pager.initNode();
				});
			}, 400);
		});


		// popup関連
        (!oldiOS) && body.on('click', '.js-unit-window', function(ev) { ev.preventDefault(); });
		body.on(tapEvent, '.js-unit-window', function(ev) {
			var target = tt(this),
				box = target.parents('.unit-box'),
				popupName = target.data('target'),
				popup = box.find('.unit-window[data-window="'+ popupName +'"]');

			ev.preventDefault();
			if (!popup || !popup.length || loader.state) {
				return;
			}
			tt('.unit-window').hide();

			if (lastOpenNav) {
				lastOpenNav.box.removeClass('state-navi');
				lastOpenNav.button.each(function() {
					this.firstChild.textContent = 'カスタム';
				});
				lastOpenNav = null;
			}

			switch (popupName) {
			case 'ride':
				_popup(popup, target.attr('href'), function() {
					tt('.state-rided .js-unit-label-ride').html('搭乗する');
					target.each(function() {
						this.firstChild.textContent = '搭乗中';
					});
					tt('.unit-box').removeClass('state-rided');
					box.addClass('state-rided');
				});
				break;
			case 'lock':
				_popup(popup, target.attr('href'), function() {
					box.addClass('state-locked');
				});
				break;
			case 'unlock':
				_popup(popup, target.attr('href'), function() {
					box.removeClass('state-locked');
				});
				break;
			case 'navi':
				tt('.js-unit-window.on').each(function() {
					if (this === target[0]) {
						return;
					}
					tt(this).removeClass('on');
				});
				if (target.hasClass('on')) {
					target.removeClass('on');
					popup.hide();
				} else {
					target.addClass('on');
					target.each(function() {
						this.firstChild.textContent = '閉じる';
					});
					box.addClass('state-navi');
					popup.show();
					lastOpenNav = {
						box: box,
						button: target
					};
				}
				break;
			}
		});

		// sort, pageなどのinputとlabelを更新
		function _updateInfo(ref) {
			var name = ref.getAttribute('name');

			if (!inputs[name] || !labels[name]) {
				return;
			}
			inputs['p'].setAttribute('value', '1');
			inputs[name].setAttribute('value', ref.getAttribute('value'));
			labels[name].textContent = ref.getAttribute('data-label');
		}

		function _popup(target, href, callback) {
			tt('.js-unit-window.on').removeClass('on');
			_ajax(href, function() {
				target.show();
				currentBubble = target;
				callback && callback();
				setTimeout(function() {
					target.hide();
					currentBubble = null;
				}, 5000);
			});
		}
	});
},
'_gndm_unit',
function() {
	tt(function() {
		var wrapper = tt('.unit-detail-navi'),
			info = tt('.unit-detail-info'),
			currentBubble;

		tt('.js-ajax-btn').
            on('click', function(ev) { ev.preventDefault(); }).
            on('tap', function(ev) {
			var target = tt(ev.currentTarget),
				targetPopup = tt('[data-window="'+ target.data('target') +'"]');

			ev.preventDefault();
			_ajax(target.attr('href'), function() {
				wrapper.toggleClass(target.data('state'));
				_popup(targetPopup);
			});
		});

		function _popup(target) {
			info.addClass('on-popup');
			if (currentBubble) {
				currentBubble.hide();
			}
			currentBubble = target;
			currentBubble.show();
			setTimeout(function() {
				info.removeClass('on-popup');
				currentBubble.hide();
				currentBubble = null;
			}, 5000);
		}
	});
},
// 部隊戦本部
'(_gndm_war_grp_t|_gndm_war_f)',
function() {
	tt(function() {
		var body = tt(document.body);

		// Tabが押された場合
        (!oldiOS) && body.on('click', '.js-tab-label', function(ev) { ev.preventDefault(); }); //click event 止める
		body.on(tapEvent, '.js-tab-label', function(ev) {
			var target = tt(this),
				name = target.attr('name'),
				action = target.attr('data-action');

            ev.preventDefault();
            if (target.hasClass('disabled') || target.hasClass('current')) {
                return;
            }

			tt('.js-tab-label.current').
				removeClass('current');
			target.addClass('current');

			setTimeout(function() {
				var url = '_gndm_war_grp_t_tab';
				var params = {
					"action": action
				};

				tt.gjax(url, params, {
					startCallback: function() {
						loader.show();
					},
					endCallback: function(state) {
						loader.hide();
					}
				}).load();
			}, 400);
		});

		// みんなのコメントを更新するボタンを押された場合
        (!oldiOS) && body.on('click', '.js-update-button', function(ev) { ev.preventDefault(); }); //click event 止める
		body.on(tapEvent, '.js-update-button', function(ev) {
			var target = tt(this);

            ev.preventDefault();

			setTimeout(function() {
				var url = '_gndm_war_grp_t_p_l_async';
				var params = {};

				tt.gjax(url, params, {
					startCallback: function() {
						loader.show();
					},
					endCallback: function(state) {
						loader.hide();
					}
				}).load();
			}, 400);
		});
	});
});

function _ajax(url, callback) {
	loader.show();
	tt.ajax({
		type: 'get',
		url: url,
		dataType: 'json',
		timeout: 10000,
		success: function(data) {
			loader.hide();
			if (data.success) {
				callback && callback();
			} else {
				alert('\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F');
			}
		},
		error: function() {
			loader.hide();
			alert('\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F');
		}
	});
}

})(this, document, this.tt);

