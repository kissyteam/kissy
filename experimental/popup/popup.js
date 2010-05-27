/**
 * Popup
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui-core
 */

KISSY.add("popup", function(S) {
    var DOM = S.DOM, Event = S.Event , YDOM = YAHOO.util.Dom ,
        doc = document,
        POPUP_STATE = 'data-popup-state',
        POPUP_STATE_ENABLED = 'enabled' ,
        POPUP_STATE_DISABLED = 'disabled';		

    /**
     * Popup
     * @constructor
     */
    function Popup(trigger, popup, config){
        var self=this;

        trigger = S.query( trigger );
        popup = S.get( popup );
        if( trigger.length == 0 || !popup ) return;

        popup.style.position = 'absolute' ;
        popup.style.display = 'none' ;
        self.popup = popup ;
        S.ready(function(S) {
            doc.body.appendChild( popup );
        });         

        config = S.merge(defaultConfig, config);
        self.config = config ;
        if( config.width != 'auto' ) popup.style.width = config.width+'px';
        if( config.height != 'auto' ) popup.style.height = config.height+'px';

        // 初始化遮罩(所有popup公用一个遮罩即可)
        if( config.hasMask && config.triggerType == 'click' ) Mask.init();

        //为ie6下的popup添加shim用以遮住select
        if(S.UA.ie===6) self._shim = new Shim();

        // 关闭按钮
        self._bindCloseBtn();

        //触点数组，即使只有一个触点也以数组的形式存在
        self.trigger = [] ;

        //绑定触点，并添加到触点数组
        for( var i = 0 , len = trigger.length ; i < len ; i++ ){
            self.bindTrigger( trigger[i] );
        }

        // 绑定弹出层，当triggerType为mouse时有效
        self._bindPopup();

        //self._popupHideTimeId = undefined;
		//self._popupShowTimeId = undefined;
        /**
         * 前一次触点
         */
        //self.prevTrigger = undefined;
        /**
         * 当前触点
         */
		//self.curTrigger = undefined;

    }

    S.augment(Popup,{
        //显示弹出层
        show:function(){
            var self = this , config = self.config , popup = self.popup ;
            if(self.curTrigger.getAttribute(POPUP_STATE) == POPUP_STATE_DISABLED) return;
            if( !(YDOM.getStyle(popup,'zIndex') > 1)) popup.style.zIndex = 2;
            if( config.hasMask && config.triggerType == 'click' ) Mask.show(popup);
            popup.style.display = 'block';
            self.fire( 'show');
            setPosition( popup , self.curTrigger , config.position , config.align , config.offset , config.autoFit );            
            if(self._shim) self._shim.show(popup);
            if( config.effect == 'fade') opacityAnim( popup , 0 , 1 );
        },
        //隐藏弹出层
        hide:function(){
            var self = this , config = self.config , popup = self.popup ;
            if(config.hasMask && config.triggerType == 'click') Mask.hide();            
            popup.style.display = 'none';
            if(self._shim) self._shim.hide();
            self.fire( 'hide');
        },
        //设置指定元素为触点
        bindTrigger:function( el ){
            var self = this , config = self.config ;
            self.enableTrigger( el );
            if( S.indexOf(el, self.trigger) >= 0 ) return;
            self.trigger.push( el );
            //注册事件
            if( config.triggerType == 'click' ){
                Event.on( el , 'click' , function(e){
                    e.preventDefault();
                    var el = this;
                    if( el.getAttribute( POPUP_STATE) == 'POPUP_STATE_DISABLE' ) return;
                    self._onClickTrigger( el );
                } );
            }else if( config.triggerType == 'mouse' ){
                if( config.disableClick ) Event.on( el , 'click' , function(e){ e.preventDefault(); } );
                Event.on( el , 'mouseenter', function(){
                    var el = this;
                    if( el.getAttribute( POPUP_STATE) == 'POPUP_STATE_DISABLE' ) return;
                    self._onMouseEnter( el );
                } );
                Event.on( el , 'mouseleave', function(){
                    self._onMouseLeave();
                } );
            }
        },

        enableTrigger:function( el ){
            this._setTrigger( el , POPUP_STATE_ENABLED );
        },

        disableTrigger:function( el ){
            this._setTrigger( el , POPUP_STATE_DISABLED );
        },

        //绑定popup的mouseenter和mouseleave事件
        _bindPopup:function(){
            var self = this;
            if( self.config.triggerType == 'mouse' ){
                Event.on( self.popup , 'mouseenter', function(){
                    clearTimeout( self._popupHideTimeId );
                } );
                Event.on( self.popup , 'mouseleave', function(){
                    self._onMouseLeave();
                } );
            }
        },

        /**
         * 鼠标单击触点的事件处理器
         * @param el 触点
         */
        _onClickTrigger:function(el){
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
        _onMouseEnter:function(el){
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
        _onMouseLeave:function(){
            var self = this;
            clearTimeout( self._popupShowTimeId );
		    self._popupHideTimeId = setTimeout( function(){ self.hide(); }, self.config.delay * 1000 );
        },
        _setTrigger:function( el , value ){
            var self = this ;
            var triggerArr = S.makeArray(el || self.trigger) ;
            for( var i = 0 , len = triggerArr.length ; i < len ; i++ ){
                triggerArr[i].setAttribute( POPUP_STATE , value );
            }
        },
        _bindCloseBtn:function(){
            var self = this;
            Event.on( self.popup , 'click' , function(e){
                e.preventDefault();
                var t = e.target;
                if( DOM.hasClass( t , self.config.closeBtnCls ) ){
                    self.hide();
                }else{
                    t = YDOM.getAncestorBy(t,function(el){
                        return YDOM.hasClass(el,self.config.closeBtnCls) && YDOM.isAncestor(self.popup,el);
                    });
                    if(t) self.hide();
                }
			});
        }

    });

    S.augment( Popup , S.EventTarget );

    S.Popup = Popup;

    //默认配置
    var defaultConfig = {
        // 触发类型
        triggerType: 'click', // or 'mouse'
        // 是否阻止触点的默认点击事件（只有当triggerType=='mouse'的时候该设定有效）
        disableClick: false,
        // 触发延迟
        delay: 0.1, // 100ms
        // 显示或者隐藏弹出层时的动画效果
        effect: null,// 'fade'
        // 弹出框宽度
        width: 'auto' ,
        // 弹出框高度
        height: 'auto',
        // 弹出框相对于触点的位置
        position: 'right',// or 'bottom','left','top','screenCenter'
        // 弹出框相对于触点的对齐方式
        align: 'top',// or 'right','bottom','left'
        // 弹出框的计算位置超出body时是否自动调整位置
        autoFit: true,
        // 是否有遮罩
        hasMask: false,
        // 弹出框内触发弹出框关闭的按钮的class
        closeBtnCls: 'KS_PopupCloseBtn'
    };

    //遮罩
    var Mask={
        domEl:null,
        init:function(){
            if(this.domEl) return;
            var mask=DOM.create('<div id="KSPopupMask" class="ks-popup-mask" style="display:none;position:absolute;left:0;top:0;width:100%;font-size:0px;line-height:0px;background:#000;filter:alpha(opacity=20);opacity:0.2;"></div>');
            this.domEl=mask;
            S.ready(function(S) {
                doc.body.appendChild(mask);
            });
        },
        show:function(refEl){
            var mask = this.domEl;
            if(!mask) return;
            mask.style.display = 'block';
            mask.style.height = YDOM.getDocumentHeight() + 'px';
            mask.style.zIndex = YDOM.getStyle(refEl,'zIndex')-2;
        },
        hide:function(){
            var mask = this.domEl;
            if(!mask) return;
            mask.style.display='none';
        }
    };

    //shim
    function Shim(){
        var self = this;
        var shim=DOM.create('<iframe class="ks-popup-shim" style="display:none;position:absolute;border:none;filter:alpha(opacity=0);"></iframe>');
        S.ready(function(S) {
            doc.body.appendChild(shim);
        });
        self.show = function(refEl){
            shim.style.display = 'block';
            shim.style.width = refEl.offsetWidth + 'px';
            shim.style.height = refEl.offsetHeight + 'px';
            shim.style.left = refEl.style.left;
            shim.style.top = refEl.style.top;
            shim.style.zIndex = YDOM.getStyle(refEl,'zIndex')-1;
        };
        self.hide = function(){
            shim.style.display = 'none';
        };
    }

    function setPosition( el , refEl , position , align , offset , autoFit){
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
        } else if(position=='screenCenter'){
            t = st + (dh-ph)/2;
            l = sl + (dw-pw)/2;
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

/**
 * Notes:
 *
 * 2010.04.22
 *      -由于可以不给popup自定高度，而由popup中的内容自适应，并且开放自定义事件'afterShow'
 *       那么如果用户在popup.show的时候，如果动态修改了popup的内容，并且内容加载缓慢（比如加载了图片）
 *       当popup设置为上/左对齐或者自适应位置的时候
 *       就有可能导致popup的位置计算（因为拿不到popup准确的尺寸而）出现误差
 *      -在ie6下，仅为popup设置了iframe的shim，而没有为透明遮罩设置iframe的shim
 *       ie6下iframe的透明方式有2中
 *       其中设置allowtransparent属性遮不住select
 *       设置style.filter.opacity属性使得所有在iframe下的select都会消失，这种select消失带来的不适远大于不遮挡select
 * 
 */

