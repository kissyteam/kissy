/**
 * Popup
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui-core
 */

KISSY.add("datagrid", function(S) {
    var DOM = S.DOM, Event = S.Event , YDOM = YAHOO.util.Dom ,
        doc = document,
        POPUP_STATE = 'data-ks-popup-state' , POPUP_STATE_ENABLED = 'enabled' , POPUP_STATE_DISABLED = 'disabled';

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
        if( config.width != 'auto' ) popup.style.width = config.width+'px';
        if( config.height != 'auto' ) popup.style.height = config.height+'px';

        // 遮罩
        if( config.hasMask && !Popup.mask && config.triggerType == 'click' ){
            S.ready(function(S) {
                var mask = createEl('div',"ks-popup-mask",doc.body);
                    mask.id = 'KSPopupMask' ;
			        mask.style.display = "none";
				Popup.mask=mask;
                var maskStyle = '.ks-popup-mask{position:absolute;left:0;top:0;width:100%;font-size:0px;line-height:0px;background:#000;filter:alpha(opacity=20);opacity:0.2;}';
                DOM.addStyleSheet( maskStyle , 'KSPopupMask' );
            });
        }

        //为ie6下的popup添加iframe底（用以遮住select，但不特别处理ie6下的mask，以免select消失引起用户反感）
        if(S.UA.ie===6){
            S.ready(function(S) {
                self._popupRebase = createEl('iframe',"ks-popup-rebase",doc.body);
                self._popupRebase.style.display = 'none';
                var rebaseStyle = '.ks-popup-rebase{position:absolute;border:none;filter:alpha(opacity=0);}';
                DOM.addStyleSheet( rebaseStyle , 'KSPopupRebase' );
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

        self.trigger = [] ;
        for( var i = 0 , len = trigger.length ; i < len ; i++ ){
            self.attachTrigger( trigger[i] );
        }

        // 当触发事件为mouse时，给弹出层添加mouse事件处理句柄
        if( config.triggerType == 'mouse' ){
            Event.on( popup , 'mouseenter', function(){
                clearTimeout( self._popupHideTimeId );
            } );
            Event.on( popup , 'mouseleave', function(){
                self._mouseleaveHandler();
            } );
        }

    }

    S.mix(Popup.prototype,{
        //前一次触点
        prevTrigger:null,
        //当前触点
		curTrigger:null,
        //显示弹出层
        show:function(){
            var self = this , config = self.config , popup = self.popup , popupZIndex = YDOM.getStyle(popup,'zIndex') ;
            if(self.curTrigger.getAttribute(POPUP_STATE) == POPUP_STATE_DISABLED) return;
            if( !(popupZIndex > 1)) popupZIndex = popup.style.zIndex = 2;
            if( config.triggerType = 'click' && config.hasMask ){
                Popup.mask.style.zIndex = popupZIndex-1;
                Popup.showMask();
            }
            popup.style.display = 'block';
            //必须把自定义事件放这里，如果放在后面，引起popup尺寸变化，后面的位置计算就会出错了
            self.fire( 'afterShow' , { 'popup':popup , 'trigger':self.curTrigger });
            Popup.setPosition( popup , self.curTrigger , config.position , config.align , config.offset , config.autoFit );
            if(self._popupRebase){
                var rebase = self._popupRebase;
                    rebase.style.display = '';
                    rebase.style.width = popup.offsetWidth + 'px';
                    rebase.style.height = popup.offsetHeight + 'px';
                    rebase.style.left = popup.style.left;
                    rebase.style.top = popup.style.top;
                    rebase.style.zIndex = popupZIndex - 1 ;
            }
            if( config.animType == 'fade') opacityAnim( popup , 0 , 1 );
        },
        //隐藏弹出层
        hide:function(){
            var self = this , config = self.config , popup = self.popup ;
            if( config.triggerType = 'click' && config.hasMask ) Popup.hideMask();
            popup.style.display = 'none';
            if(self._popupRebase) self._popupRebase.style.display = 'none';
            self.fire( 'afterHide' , { 'popup':popup , 'trigger':self.curTrigger });
        },
        //设置指定元素为触点
        attachTrigger:function( el ){
            var self = this , config = self.config ;
            self.enableTrigger( el );
            if( getIndexOfArrEl( self.trigger , el ) >= 0 ) return;
            self.trigger.push( el );
            //注册事件
            if( config.triggerType == 'click' ){
                Event.on( el , 'click' , function(e){
                    e.preventDefault();
                    var el = this;
                    if( el.getAttribute( POPUP_STATE) == 'POPUP_STATE_DISABLE' ) return;
                    self._triggerClickHandler( el );
                } );
            }else if( config.triggerType == 'mouse' ){
                if( config.disableClick ) Event.on( el , 'click' , function(e){ e.preventDefault(); } );
                Event.on( el , 'mouseenter', function(){
                    var el = this;
                    if( el.getAttribute( POPUP_STATE) == 'POPUP_STATE_DISABLE' ) return;
                    self._mouseenterHandler( el );
                } );
                Event.on( el , 'mouseleave', function(){
                    self._mouseleaveHandler();
                } );
            }
        },

        enableTrigger:function( el ){
            this._setTrigger( el , POPUP_STATE_ENABLED );
        },

        disableTrigger:function( el ){
            this._setTrigger( el , POPUP_STATE_DISABLED );
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
         */
        _mouseleaveHandler:function(){
            var self = this;
            clearTimeout( self._popupShowTimeId );
		    self._popupHideTimeId = setTimeout( function(){ self.hide(); }, self.config.delay * 1000 );
        },
        _setTrigger:function( el , value ){
            var self = this , triggerArr = [] ;
            if( !el ){
                triggerArr = self.trigger;
            }else if( S.isArray(el) ){
                triggerArr = el;
            }else{
                triggerArr.push( el );
            }
            for( var i = 0 , len = triggerArr.length ; i < len ; i++ ){
                triggerArr[i].setAttribute( POPUP_STATE , value );
            }
        }

    });

    S.mix( Popup.prototype , S.EventTarget );

    //默认配置
    Popup.Config = {
        // 触发类型
        triggerType: 'click', // or 'mouse'
        // 是否阻止触点的默认点击事件（只有当triggerType=='mouse'的时候该设定有效）
        disableClick: false,
        // 触发延迟
        delay: 0.1, // 100ms
        // 显示或者隐藏弹出层时的动画效果
        animType: null,// 'fade'
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
        mask.style.height = YDOM.getDocumentHeight() + 'px';
    };
    
    //隐藏遮罩
    Popup.hideMask = function(){
        var mask = Popup.mask ;
        if( mask ) mask.style.display = 'none';
    };

    Popup.setPosition = function( el , refEl , position , align , offset , autoFit){
        var pos = YDOM.getXY( refEl );
        if ( S.isArray ( offset ) ) {
            pos[0] += parseInt( offset[0] , 10 );
            pos[1] += parseInt( offset[1] , 10 );
        }
        var  tw = refEl.offsetWidth, th = refEl.offsetHeight,
            pw = el.offsetWidth , ph = el.offsetHeight,
            dw = YDOM.getViewportWidth(), dh = YDOM.getViewportHeight(),
            sl = YDOM.getDocumentScrollLeft(), st = YDOM.getDocumentScrollTop(),
            l = pos[0], t = pos[1];
        if (position == 'left') {
            l = pos[0]-pw;
            t = (align == 'center')?(t-ph/2+th/2):(align == 'bottom')?(t+th-ph):t;
        } else if (position == 'right') {
            l = pos[0]+tw;
            t = (align == 'center')?(t-ph/2+th/2):(align == 'bottom')?(t+th-ph):t;
        } else if (position == 'bottom') {
            t = t+th;
            l = (align == 'center')?(l+tw/2-pw/2):(align == 'right')?(l+tw-pw):l;
        } else if (position == 'top') {
            t = t-ph;
            l = (align == 'center')?(l+tw/2-pw/2):(align == 'right')?(l+tw-pw):l;
        }
        //防止出界
        if(autoFit) {
            if ( t-st+ph > dh ) t = dh-ph+st-2;
            if ( l-sl+pw > dw) l = dw-pw+sl-2;
            t = Math.max( t , 0 );
            l = Math.max( l , 0 );
        }
        el.style.top = t + 'px';
        el.style.left = l + 'px';
    };

    S.Popup = Popup;

    function createEl(tagName,className,parentNode){
        var el = doc.createElement(tagName);
        if(className) el.className = className;
        if(parentNode) parentNode.appendChild(el);
        return el;
    }

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

    function setOpacity( el , opacity ){
            el.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
            el.style.opacity = opacity ;
    }

    function opacityAnim( el , from , to ){
        var curOpacity = from , step = parseInt( ( to - from ) / 10 * 100 )/ 100;
        setOpacity( el , curOpacity );
        var intervalId = setInterval( function(){
            curOpacity = curOpacity + step ;
            if(( from > to && curOpacity < to ) || ( from < to && curOpacity > to)){
                curOpacity = to;
                clearInterval( intervalId );
            }
            setOpacity( el , curOpacity );
        } , 25 );
    }
});

