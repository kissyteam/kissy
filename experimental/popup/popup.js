/**
 * Popup
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui-core, yui2-animation
 */

KISSY.add("datagrid", function(S) {
    var DOM = S.DOM, Event = S.Event , YDom = YAHOO.util.Dom ,
        doc = document
        ;

    /**
     * Popup
     * @constructor
     */
    function Popup(trigger, popup, config){
        var self=this;

        trigger = S.query( trigger );
        popup = S.get( popup );
        if( !trigger || !popup ) return;

        popup.style.position = 'absolute' ;
        popup.style.display = 'none' ;
        S.ready(function(S) {
            doc.body.appendChild( popup );
        });
        self.popup = popup ;

        config = config || {};
        config = S.merge(Popup.Config, config);
        self.config = config ;

        // 遮罩
        if( config.hasMask && !Popup.mask && config.triggerType == 'click' ){
            S.ready(function(S) {
                var mask = document.createElement("div");
                    mask.id = 'KSPopupMask' ;
					mask.className = "ks-popup-mask" ;
					doc.body.appendChild(mask);
					mask.style.display = "none";
				Popup.mask=mask;
                var maskStyle = '.ks-popup-mask{position:absolute;left:0;top:0;width:100%;font-size:0px;line-height:0px;background:#000;filter:alpha(opacity=20);opacity:0.2;}';
                DOM.addStyleSheet(maskStyle, 'KSPopupMask');
            });
        }

        // 关闭按钮
        if( config.clsCloseBtn ){
            Event.on( popup , 'click' , function(e){
                e.preventDefault();
                var t = e.target;
                if( DOM.hasClass( t , config.clsCloseBtn ) ){
                    self.hide();
                } 				
			});
        }

        for( var i = 0 , len = trigger.length ; i < len ; i++ ){
            self.attachTrigger( trigger[i] );
        }

        // 当触发事件为mouse时，给弹出层添加mouse事件处理句柄
        if( config.triggerType == 'mouse' ){
            Event.on( popup , 'mouseenter', function( e ){
                var el = this;
                self._mouseenterHandler( el );
            } );
            Event.on( popup , 'mouseleave', function( e ){
                var el = this;
                self._mouseleaveHandler();
            } );
        }


    }

    S.mix(Popup.prototype,{
        trigger:[],
        popup:null,
        config:null,
        //前一次触点
        prevTrigger:null,
        //当前触点
		curTrigger:null,
        //显示弹出层
        show:function(){
            var self = this ;
            if( self.config.triggerType = 'click' && self.config.hasMask ) Popup.showMask();
            var config = self.config , popup = self.popup ;
            popup.style.display = 'block';
            if( config.width != 'auto' ) popup.style.width = config.width+'px';
            if( config.height != 'auto' ) popup.style.height = config.height+'px';
			var pos = YDom.getXY( self.curTrigger );
			if ( S.isArray ( config.offset ) ) {
				pos[0] += parseInt( config.offset[0] , 10 );
				pos[1] += parseInt( config.offset[1] , 10 );
			}
			var  tw = self.curTrigger.offsetWidth, th = self.curTrigger.offsetHeight,
				pw = popup.offsetWidth , ph = popup.offsetHeight,
				dw = YDom.getViewportWidth(), dh = YDom.getViewportHeight(),
				sl = YDom.getDocumentScrollLeft(), st = YDom.getDocumentScrollTop(),
				l = pos[0], t = pos[1];
			if (config.position == 'left') {
				l = pos[0]-pw;
				t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;
			} else if (config.position == 'right') {
				l = pos[0]+tw;
				t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;
			} else if (config.position == 'bottom') {
				t = t+th;
				l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;
			} else if (config.position == 'top') {
				t = t-ph;
				l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;
			}
            //防止出界
			if(config.autoFit) {
				if ( t-st+ph > dh ) t = dh-ph+st-2; /* 2px 偏差 */
                if ( l-sl+pw > dw) l = dw-pw+sl-2;
                t = Math.max( t , 0 );
			    l = Math.max( l , 0 );
			}
			popup.style.top = t + 'px';
			popup.style.left = l + 'px';
        },
        //隐藏弹出层
        hide:function(){
            var self = this ;
            if( self.config.triggerType = 'click' && self.config.hasMask ) Popup.hideMask();
            self.popup.style.display = 'none';            
        },
        //设置指定元素为触点
        attachTrigger:function( el ){
            var self = this , config = self.config ;
            if( getIndexOfArrEl( self.trigger , el ) >= 0 ) return;
            self.trigger.push( el );
            //注册事件
            if( config.triggerType == 'click' ){
                Event.on( el , 'click' , function( e ){
                    var el = this;
                    self._triggerClickHandler( el );
                } );
            }else if( config.triggerType == 'mouse' ){
                if( config.disableClick ) Event.on( el , 'click' , function(e){ e.preventDefault(); } );
                Event.on( el , 'mouseenter', function( e ){
                    var el = this;
                    self._mouseenterHandler( el );
                } );
                Event.on( el , 'mouseleave', function( e ){
                    self._mouseleaveHandler();
                } );
            }
        },
        //取消指定触点
        detachTrigger:function( el ){
            var self = this , config = self.config ;
            if( getIndexOfArrEl( self.trigger , el ) < 0 ) return;
            //注册事件
                        
        },
		_popupHideTimeId:null,
		_popupShowTimeId:null,
        /**
         * 鼠标单击触点的事件处理器
         * @param el 触点
         */
        _triggerClickHandler:function(el){
            var self = this ;
            self.prevTrigger = self.curTrigger ;
            self.curTrigger = el ;
            if( self.prevTrigger == self.curTrigger ){
                self.popup.style.display == 'none' ? self.show() : self.hide() ;
            }else{
                self.show();
            }
        },
        /**
         * 鼠标进入触点或者弹出层时的事件处理器
         * @param el 触点或弹出层
         */
        _mouseenterHandler:function(el){
            var self = this ;
            clearTimeout( self._popupHideTimeId );
            // 如果mouseenter的对象是触点
            if( el != self.popup ){
                self.prevTrigger = self.curTrigger ;
                self.curTrigger = el ;
            }
            self._popupShowTimeId = setTimeout( function(){ self.show(); }, self.config.delay * 1000 );
        },
        /**
         * 鼠标离开触点或者弹出层时的事件处理器
         * @param el 触点或弹出层
         */
        _mouseleaveHandler:function(){
            var self = this;
            clearTimeout( self._popupShowTimeId );
		    self._popupHideTimeId = setTimeout( function(){ self.hide(); }, self.config.delay * 1000 );
        }
    });

    S.mix( Popup.prototype , S.EventTarget );

    /******************************************************************************************************************
     * @默认设置
     *****************************************************************************************************************/

    //默认配置
    Popup.Config = {
        // 触发类型
        triggerType: 'click', // or 'mouse'
        // 是否阻止触点的默认点击事件（只有当triggerType=='mouse'的时候该设定有效）
        disableClick: false,
        // 触发延迟
        delay: 0.1, // 100ms
        // 显示或者隐藏弹出层时的动画效果
        animType: null,// 'fade' , 'width' , 'height' , 'both'
        // 弹出框宽度
        width: 'auto' ,
        // 弹出框高度
        height: 'auto',
        // 弹出框相对于触点的位置
        position: 'right',// or 'bottom','left','top'
        // 弹出框相对于触点的对齐方式
        align: 'top',// or 'right','bottom','left'
        // 弹出框的计算位置超出body时是否自动调整位置
        autoFit: true,
        // 是否有遮罩
        hasMask: false,
        // 弹出框内触发弹出框关闭的按钮的class
        clsCloseBtn: null
    };

    //遮罩对象
    Popup.mask = null;

    //显示遮罩
    Popup.showMask = function(){
        var mask = Popup.mask ;
        if( !mask ) return ;
        mask.style.display = 'block';
        mask.style.height = YDom.getDocumentHeight() + 'px';
    };
    
    //隐藏遮罩
    Popup.hideMask = function(){
        var mask = Popup.mask ;
        if( mask ) mask.style.display = 'none';
    }

    S.Popup = Popup;

    function getIndexOfArrEl( arr , el ){
        var idx = -1 ;
        for( var i = 0 , len = arr.length ; i < len ; i++ ){
            if( arr[i] == el ){
                idx = i;
                break;
            }
        }
        return idx;
    }
});

