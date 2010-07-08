/* vim: set et sw=4 ts=4 sts=4 fdm=indent ff=unix fenc=gbk: */
/**
 * KISSY.Dialog 简易模拟窗口
 * 如果drag: true, 则需要引用YAHOO.util.DD
 *
 * @creator     小虎<xiaohu@taobao.com>
 * @date		2010.07.08
 * @version		0.1
 */


KISSY.add('dialog', function( S, undefined ) {
	var DOM = S.DOM, Event = S.Event, doc = document, IE = S.UA.ie,
		DP = Dialog.prototype, _id_counter = 0,

		// 简易管理器
		Manage = {
			
			/* 存储已初始化的dialog */
			list: {},
			
			/**
			 * 返回 NS.util.Dialog对象
			 */
			get: function(id, config) {
				var self = this, D;
				if(!id || !self.list[id]) {
					D = new S.Dialog(config);
					id = !id ? D.elem.id : id;
					self.list[id] = D;
				}
				return self.list[id];
			}
		},


/* 默认HTML
<dialog class="ks-dialog">
	<hd class="ks-dialog-hd"></hd>
	<bd class="ks-dialog-bd"></bd>
	<ft class="ks-dialog-ft"></ft>
	<overlay></overlay>
</dialog>
<mask class="ks-dialog-mask"></mask>
*/	
		defConfig = {
			head: 'Title',
			body: '<div class="ks-dialog-loading">正在加载，请稍候...</div>',
			foot: '<a href="" class="ks-dialog-close">close</a>',
			center: true,
			width: '580px',
			keypress: true,
			mask: false,
			drag: false,
			close: true,
			className: 'ks-dialog',
			classNameHd: 'ks-dialog-hd',
		    classNameBd: 'ks-dialog-bd',
			classNameFt: 'ks-dialog-ft',
			maskClassName: 'ks-dialog-mask'
		}, KS_FIX_SELECT = 'ks-fix-select', VISIBILITY = 'visibility', HIDDEN = 'hidden',

		/**
		 * 所有自定义事件列表
		 */
		CHANGE_HEADER = "changeHeader",	//修改hd
		CHANGE_BODY = "changeBody",		//修改bg
		CHANGE_FOOTER = "changeFooter",	//修改ft
		CENTER = "center",					//center后
		BEFORE_SHOW = "beforeShow",		//show之前
		SHOW = "show",						//show
		BEFORE_HIDE = "beforeHide",		//hide之前
		HIDE = "hide"						//hide
    ;
		
	function Dialog (config) {
		var self = this;
		self.config = S.merge(defConfig, config || {});
		self._createView();

		if(true === self.config.keypress) Event.on(doc, 'keypress', function(evt) {
			if (27 === evt.keyCode && 200 === self._status) {
				self.hide();
			}
		});

	}

	S.mix(DP, S.EventTarget);

	S.mix(DP, {

		/**
		 * 居中 return this
		 */
		center: function() {
			var self = this, elem = self.elem, x, y,
				elemWidth = elem.offsetWidth,
				elemHeight = elem.offsetHeight,
				viewPortWidth = DOM.viewportWidth(),
                viewPortHeight = DOM.viewportHeight();
                
            if (elemWidth < viewPortWidth) {
                x = (viewPortWidth / 2) - (elemWidth / 2) + DOM.scrollLeft();
            } else {
                x = DOM.scrollLeft();
            }

            if (elemHeight < viewPortHeight) {
                y = (viewPortHeight / 2) - (elemHeight / 2) + DOM.scrollTop();
            } else {
                y = DOM.scrollTop();
			}

            
            DOM.css(elem, 'left', x + 'px');
            DOM.css(elem, 'top', y + 'px');
			DOM.css(self.mask, 'height', DOM.docHeight() + 'px');

            self.fire( CENTER );
            return self;
		},
		
		/**
		 * setHeader
		 */
		setHeader: function(str) {
			var self = this;
			str = str + "";
			self.elemHead.innerHTML = str;
			
			self.fire( CHANGE_HEADER );
			return self;
		},
		
		/**
		 * setbody
		 */
		setBody: function(str) {
			var self = this;
			if(str.nodeType) { // 如果是节点元素, 清空elemBody, 再插入节点元素
				self.elemBody.innerHTML = '';
				self.elemBody.appendChild(str);
			} else {
				str = str + "";
				self.elemBody.innerHTML = str;
            }

			self.fire( CHANGE_BODY );
			return self;
		},
		
		/**
		 * setFooter
		 */
		setFooter: function(str) {
			var self = this;
			str = str + "";
			self.elemFoot.innerHTML = str;
			
			self.fire( CHANGE_FOOTER );
			return self;
        },

		/**
		 * show
		 */
		show: function() {
			var self = this, cfg = self.config;
			self.fire( BEFORE_SHOW );
			
			if(true === cfg.center) self.center();
			
            DOM.css(self.elem, VISIBILITY, "");
			DOM.css(self.mask, VISIBILITY, "");
			DOM.css(self.mask, 'height', DOM.docHeight() + 'px');
			if(IE && 6 === IE) {
				DOM.addClass(doc.body, KS_FIX_SELECT);
			}			
			self._status = 200;
			self.fire( SHOW );
			
			return self;
		},
		
		
		/**
		 * hide
		 */
		hide: function() {
			var self = this, cfg = self.config;
			if ( 400 === self._status ) return;
			self.fire( BEFORE_HIDE );

			DOM.css(self.elem, VISIBILITY, HIDDEN);
			DOM.css(self.mask, VISIBILITY, HIDDEN);
			if(IE && 6 === IE) {
				DOM.removeClass(doc.body, KS_FIX_SELECT);
			}
			self._status = 400;
			self.fire( HIDE );


			return self;
		},
		
		_createView: function() {
			var self = this, cfg = self.config;

			self.elem = doc.createElement('dialog');
			self.elem.id = cfg.className + _id_counter++;
			self.elem.className = cfg.className;
			DOM.css(self.elem, 'width', cfg.width);
			DOM.css(self.elem, VISIBILITY, HIDDEN);
			
			//hd
			self.elemHead = doc.createElement('hd');
			self.elemHead.className = cfg.classNameHd;
			self.elemHead.innerHTML = cfg.head;
			
			//bd
			self.elemBody = doc.createElement('bd');
            self.elemBody.className = cfg.classNameBd;
            self.setBody( cfg.body );


            //overlay
            self.elemOverlay = doc.createElement('overlay');

			// 注册关闭按钮
			if(true === cfg.close) {
                //ft
                self.elemFoot = doc.createElement('ft');
                self.elemFoot.className = cfg.classNameFt;
                self.elemFoot.innerHTML = cfg.foot;
                Event.on(DOM.query('a.ks-dialog-close', this.elemFoot), 'click', function(evt) {
					evt.preventDefault();
					self.hide();
				});
			}
		    
            //append
			self.elem.appendChild(self.elemHead);
            self.elem.appendChild(self.elemBody);
            self.elem.appendChild(self.elemFoot);
            self.elem.appendChild(self.elemOverlay);
			doc.body.appendChild(self.elem);
			
			// 初始化遮罩层
			if(true === cfg.mask) {
				self.mask = doc.createElement('mask');
				self.mask.id = self.elem.id + '_' + cfg.maskClassName;
				self.mask.className = cfg.maskClassName;
				DOM.css(self.mask, 'height', DOM.docHeight() + 'px');
				doc.body.appendChild(self.mask);
			}
			
			// 初始化拖拽
			if(true === cfg.drag) {
				DOM.addClass(self.elem, cfg.className + '-dd');
				self.DD = new YAHOO.util.DD(self.elem);
				self.DD.setHandleElId(self.elemHead);
			}

		},

		/*
		 * 内部状态码 400为hide, 200为show
		 *
		 * */
		_status: 400
	});

	S.Dialog = Dialog;
	S.DialogManage = Manage;
});
