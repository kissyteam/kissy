/**
 * Grid Design Script by lifesinger@gmail.com
 */

var GridDesign = {

	data: null,

	init: function(data, container) {
		this.data = data;
		this.container = container;
	},

	paint: function() {

		var N = this.data.N.value >> 0,
		c = this.data.c.value >> 0,
		g = this.data.g.value >> 0,
		m1 = this.data.m1.value >> 0,
		m2 = this.data.m2.value >> 0,
		W = this.data.W.value >> 0;
		var container = this.container;

		// set container style
		container.style.width = W + 'px';
		container.style.height = Math.round(W * 0.618) + 'px'; // gold

		var wrapper	= document.createElement('div');
		// append html as child
		wrapper.append = function(html) {
			this.innerHTML = this.innerHTML + html;
		};

		// left margin
		if(m1 > 0) {
			wrapper.append('<div class="grid margin" style="width: ' + m1 + 'px">' + m1 + '</div>');
		}

		// columns and gutters
		if(N > 0) {
			for(var n = 1; n <= N; ++n) {
				wrapper.append('<div class="grid column" style="width: ' + c + 'px">' + c + '</div>');
				if(n < N) {
					wrapper.append('<div class="grid gutter" style="width: ' + g + 'px">' + g + '</div>');
				}
			}
		}

		// right margin
		if(m2 > 0) {
			wrapper.append('<div class="grid margin" style="width: ' + m2 + 'px">' + m2 + '</div>');
		}

		container.innerHTML = wrapper.innerHTML;

		// resize
		var loader = new YAHOO.util.YUILoader({
			require: ['resize'],
			base: 'http://yui.yahooapis.com/2.7.0/build/',
			onSuccess: function() {
				new YAHOO.util.Resize(container);
			}
		});
		loader.insert();
	},

	paintRows: function() {

		var Y = YAHOO.util;

		// already exists? just toggle display
		var rowsContainer = Y.Dom.get('gridRowsContainer');
		if(rowsContainer) {
			this.CommonLib.toggleDisplay(rowsContainer);
			return;
		}

		// create it
		var c = this.data.c.value >> 0,
		g = this.data.g.value >> 0,
		m1 = this.data.m1.value >> 0,
		m2 = this.data.m2.value >> 0,
		W = this.data.W.value >> 0;

		var M = Math.round((W * 0.618) / (c + g));

		// set container style
		this.container.style.width = W + 'px';
		this.container.style.height = M * (c + g) - g + 'px';

		// set gridRowsContainer style
		var rowsWrapper = document.getElementById('gridRowsContainer') || document.createElement('div');
		rowsWrapper.id = 'gridRowsContainer';
		rowsWrapper.style.width = (W - m1  - m2) + 'px';
		rowsWrapper.style.left = m1 + 'px';

		// append html as child
		rowsWrapper.append = function(html) {
			this.innerHTML = this.innerHTML + html;
		}

		// rows and gutters
		rowsWrapper.innerHTML = '';
		if(M > 0) {
			for(var m = 1; m <= M; ++m) {
				rowsWrapper.append('<div class="grid row" style="height: ' + c + 'px"></div>');
				if(m < M) {
					rowsWrapper.append('<div class="grid gutter" style="height: ' + g + 'px"></div>');
				}
			}
		}		

		// add
		this.container.appendChild(rowsWrapper);
	},

	paintRules: function() {

		var Y = YAHOO.util;

		// already exists? just toggle display
		var rowsContainer = Y.Dom.get('gridRulesContainer');
		if(rowsContainer) {
			this.CommonLib.toggleDisplay(rowsContainer);
			return;
		}

		// create it
		var c = this.data.c.value >> 0,
		g = this.data.g.value >> 0,
		m1 = this.data.m1.value >> 0,
		m2 = this.data.m2.value >> 0,
		W = this.data.W.value >> 0,
		N = this.data.N.value >> 0;

		// set container style
		this.container.style.width = W + 'px';
		this.container.style.height = N * (c + g) - g + 'px';

		// set gridRulesContainer style
		var rulesWrapper = document.createElement('div');
		rulesWrapper.id = 'gridRulesContainer';
		rulesWrapper.style.width = (W - m1  - m2) + 'px';
		rulesWrapper.style.left = m1 + 'px';

		// append html as child
		rulesWrapper.append = function(html) {
			this.innerHTML = this.innerHTML + html;
		};

		// rules
		rulesWrapper.innerHTML = '';
		if(N > 0) {
			var w = c;
			for(var n = 1; n <= N; ++n) {
				w = n * (c + g) - g;
				rulesWrapper.append('<div class="grid rule" style="width: ' + w + 'px; height: ' + c + 'px; margin-bottom: ' + g + 'px"><div class="size">' + w + '</div></div>');
			}
		}		

		// add
		this.container.appendChild(rulesWrapper);
	},

	paintBox: function(config) {

		var c = this.data.c.value>> 0,
		g = this.data.g.value>> 0,
		m1 = this.data.m1.value>> 0,
		N = this.data.N.value>> 0;
		var C = c + g;
		var Y = YAHOO.util;

		// set gridBox style
		var box = document.createElement('div');
		Y.Dom.addClass(box, 'grid-box');
		box.innerHTML = '<div class="box-info"></div>';
		box.setInfo = function(width, height) {
			var info = Y.Dom.getElementsByClassName('box-info', 'div', this)[0];

			// width = cols * C - g, height = rows * C - g
			var cols = Math.round((width + g) / C);
			var rows = Math.round((height + g) / C);
			width = cols * C - g;
			if(!config['freeY'].checked) {
				height = rows * C - g;
			}

			info.innerHTML = '<span class="box-info-w">' + width + '</span>';
			info.innerHTML += '<span class="multi-flag"> x </span><span class="box-info-h">' + height + '</span>';
			info.innerHTML += '<span class="box-info-cols">cols = ' + cols + '</span>';

			if(!config['freeY'].checked) {
				info.innerHTML += '<span class="box-info-rows">rows = ' + rows + '</span>';
			}

			if(config['displayInfo'] === false) {
				Y.Dom.addClass(info, 'hidden');
			}
		};

		var s = 2 * C - g;
		box.style.width = box.style.height = s + 'px';
		box.setInfo(s, s);

		var halfN = Math.floor(N / 2);
		box.style.left = m1 + halfN * C + 'px';
		box.style.top = ((halfN > 2)? 2 : halfN) * (c + g) + 'px';

		this.container.appendChild(box);

		// drag drop
		var dd = new Y.DD(box);
		var containerSize = [parseInt(this.container.style.width), parseInt(this.container.style.height)];
		dd.on('endDragEvent', function() {
			var el = this.getEl();

			// constrain to viewport
			var x = parseInt(el.style.left),
			y = parseInt(el.style.top),
			h = parseInt(el.style.height),
			w = parseInt(el.style.width),
			maxH = containerSize[1],
			maxW = containerSize[0];

			if(x < 0) x = m1;
			else if(x + w > maxW) x = maxW - w;
			if(y < 0) y = 0;
			else if(y + h > maxH) h = maxH - h;

			// top = C * n, left = m1 + C * m
			el.style.left = Math.round(x / C) * C + 'px';
			if(!config['freeY'].checked) {
				el.style.top = Math.round(y / C) * C + 'px';
			} else {
				el.style.top = y + 'px';
			}
		});

		// resize
		var loader = new Y.YUILoader({
			require: ['resize'],
			base: 'http://yui.yahooapis.com/2.7.0/build/',
			onSuccess: function() {

				var rs = new Y.Resize(box);
				rs.on('endResize', function() {
					var el = this.getWrapEl();

					var w = parseInt(el.style.width);
					var h = parseInt(el.style.height);

					// w or h = n * (c + g) - g;
					var cols = Math.round((w + g) / C);
					var rows = Math.round((h + g) / C);
					el.style.width = cols * C - g + 'px';
					if(!config.freeY.checked) {
						el.style.height = rows * C  - g + 'px';
					}

					w = parseInt(el.style.width);
					h = parseInt(el.style.height);
					el.setInfo(w, h);
				});

				rs.on('beforeResize', function(e) {
					this.getWrapEl().setInfo(e.width, e.height);
				});
			}
		});
		loader.insert();
	},

	CommonLib: {

		toggleDisplay: function(el) {
			var D = YAHOO.util.Dom;
			if(D.hasClass(el, 'hidden')) {
				D.removeClass(el, 'hidden');
			} else {
				D.addClass(el, 'hidden');
			}
		}
	}
};
