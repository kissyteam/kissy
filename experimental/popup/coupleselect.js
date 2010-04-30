/**
 * CoupleSelect
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui-core
 */

KISSY.add("coupleselect", function(S) {
    var DOM = S.DOM, Event = S.Event , YDOM = YAHOO.util.Dom ,
        KS_CS_PREFIX = 'ks-cs-',
        doc = document;

    /**
     * CoupleSelect
     * @constructor
     */
    function CoupleSelect(container,config){
        container = S.get(container);
        if(!container) return;

        var self=this;
        self.container = container;
        config = S.merge(defaultConfig, config);
        self.config = config;

        // 源容器
        self.sourceBox = S.get('.'+config.sourceBoxCls,container);
        // 目标容器
        self.targetBox = S.get('.'+config.targetBoxCls,container);
        // 绑定item本身相关鼠标操作
        self._bindItems();
        // 绑定添加触点
        self.addTrigger = S.get('.'+config.addTriggerCls,container);
        if(self.addTrigger) self._bindAddTrigger();
        // 绑定移除触点
        self.removeTrigger = S.get('.'+config.removeTriggerCls,container);
        if(self.removeTrigger) self._bindRemoveTrigger();
        // 绑定移动到顶部触点
        self.moveTopTrigger = S.get('.'+config.moveTopTriggerCls,container);
        if(self.moveTopTrigger) self._bindMoveTopTrigger();
        // 绑定上移一个触点
        self.moveUpTrigger = S.get('.'+config.moveUpTriggerCls,container);
        if(self.moveUpTrigger) self._bindMoveUpTrigger();
        // 绑定下移一个触点
        self.moveDownTrigger = S.get('.'+config.moveDownTriggerCls,container);
        if(self.moveDownTrigger) self._bindMoveDownTrigger();
        // 绑定移动到底部触点
        self.moveBottomTrigger = S.get('.'+config.moveBottomTriggerCls,container);
        if(self.moveBottomTrigger) self._bindMoveBottomTrigger();

    }

    S.augment(CoupleSelect,{
        // item本身操作相关
        _bindItems:function(){
            var self = this,config = self.config;
            //对item的单击操作
            Event.on(self.container,'click',function(e){
                var t = this;
                var item = getItem(t,config.itemCls);
                if(item) self._onClickItem(item);
            });
            //对item的双击操作
            if(config.enableMoveByDbclick){
                Event.on(self.container,'dblclick',function(e){
                    var t = this;
                    var item = getItem(t,config.itemCls);
                    if(item) self._onDbclickItem(item);
                });
            }
        },
        _onClickItem:function(item){
            var self = this,config = self.config;
            if(DOM.hasClass(item,config.itemSelectedCls)){
                DOM.removeClass(item,config.itemSelectedCls);
            }else{
                self._clearSelectedStatus(YDOM.isAncestor(self.sourceBox,item) ? self.targetBox:self.sourceBox);
                DOM.addClass(item,config.itemSelectedCls);                
            }            
        },
        _onDbclickItem:function(item){

        },
        _clearSelectedStatus:function(box){
            var self = this,sourceBox = self.sourceBox,targetBox = self.targetBox;
            if(box == targetBox){

            }else if(box==sourceBox){

            }
        },
        // 添加item相关
        _bindAddTrigger:function(){},
        _addItems:function(){},
        _addItem:function(){},
        // 移除item相关
        _bindRemoveTrigger:function(){},
        _removeItems :function(){},
        _removeItem:function(){},
        // 移动item相关
        _bindMoveTopTrigger:function(){},
        _bindMoveUpTrigger:function(){},
        _bindMoveDownTrigger:function(){},                                                           
        _bindMoveBottomTrigger:function(){},
        _moveItemTop:function(){},
        _moveItemUp:function(){},
        _moveItemDown:function(){},
        _moveItemBotton:function(){},
        _moveItem:function(item,direct,step){
                
        },
        // 获取item相关
        getItems:function(){},
        getSelectedItems:function(){}
        
    });

    S.augment( CoupleSelect , S.EventTarget );

    S.CoupleSelect = CoupleSelect;

    //默认配置                                                                                                                       -
    var defaultConfig = {

        enableMultiSelect:true,
        enableReaddItem:true,
        enableMoveByDbclick:true,

        // 建议以下配置不要修改，使用默认即可

        sourceBoxCls:KS_CS_PREFIX+'source-box',
        targetBoxCls:KS_CS_PREFIX+'target-box',

        itemCls:KS_CS_PREFIX+'item',
        itemSelectedCls:KS_CS_PREFIX+'item-selected',

        addTriggerCls:KS_CS_PREFIX+'add',
        removeTriggerCls:KS_CS_PREFIX+'remove',

        moveTopTriggerCls:KS_CS_PREFIX+'move-top',
        moveUpTriggerCls:KS_CS_PREFIX+'move-up',
        moveDownTriggerCls:KS_CS_PREFIX+'move-down',
        moveBottomTriggerCls:KS_CS_PREFIX+'move-bottom'
        
    };

    function getItem(t,className){return DOM.hasClass(t, className) ? t : YDOM.getAncestorByClassName(t, className)};

});

/**
 * Notes:
 *
 * 2010.04.26
 *      -
 * 
 */

