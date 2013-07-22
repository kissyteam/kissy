/**
 * @fileOverview 单选或者多选
 * @author  dxq613@gmail.com
 * @ignore
 */
KISSY.add('list/selection',function (S) {
    'use strict';

    /**
     * @class List.Selection
     * 选中控件中的项
     * ** 当选择是子控件时，element 和 item 都是指 子控件；**
     * ** 当选择的是DOM元素时，element 指DOM元素，item 指DOM元素对应的记录 **
     * @abstract
     */
    var selection = function(){

    };

    selection.ATTRS = 
    {
        /**
         * 选中的事件
         * <pre><code>
         * var list = new List({
         *   itemTpl : '&lt;li id="{value}"&gt;{text}&lt;/li&gt;',
         *   idField : 'value',
         *   selectedEvent : 'mouseenter',
         *   render : '#t1',
         *   items : [{value : '1',text : '1'},{value : '2',text : '2'}]
         * });
         * </code></pre>
         * @cfg {String} [selectedEvent = 'click']
         */
        selectedEvent:{
            value : 'click'
        },
        events : {
            value : {
                /**
                   * 选中的菜单改变时发生，
                   * 多选时，选中，取消选中都触发此事件，单选时，只有选中时触发此事件
                   * @event
                   * @param {Object} e 事件对象
                   * @param {Object} e.item 当前选中的项
                   * @param {HTMLElement} e.domTarget 当前选中的项的DOM结构
                   * @param {Boolean} e.selected 是否选中
                   */
                'selectedchange' : false,

                /**
                   * 选择改变前触发，可以通过return false，阻止selectedchange事件
                   * @event
                   * @param {Object} e 事件对象
                   * @param {Object} e.item 当前选中的项
                   * @param {Boolean} e.selected 是否选中
                   */
                'beforeselectedchange' : false,

                /**
                   * 菜单选中
                   * @event
                   * @param {Object} e 事件对象
                   * @param {Object} e.item 当前选中的项
                   * @param {HTMLElement} e.domTarget 当前选中的项的DOM结构
                   */
                'itemselected' : false,

                /**
                   * 菜单取消选中
                   * @event
                   * @param {Object} e 事件对象
                   * @param {Object} e.item 当前选中的项
                   * @param {HTMLElement} e.domTarget 当前选中的项的DOM结构
                   */
                'itemunselected' : false
            }
        },
        /**
         * 数据的id字段名称，通过此字段查找对应的数据
         * <pre><code>
         * var list = new List.SimpleList({
         *   itemTpl : '&lt;li id="{value}"&gt;{text}&lt;/li&gt;',
         *   idField : 'value',
         *   render : '#t1',
         *   items : [{value : '1',text : '1'},{value : '2',text : '2'}]
         * });
         * </code></pre>
         * @cfg {String} [idField = 'id']
         */
        /**
         * 数据的id字段名称，通过此字段查找对应的数据
         * @type {String}
         * @ignore
         */
        idField : {
            value : 'id'
        },
        /**
         * 是否多选
         * <pre><code>
         * var list = new List.SimpleList({
         *   itemTpl : '&lt;li id="{value}"&gt;{text}&lt;/li&gt;',
         *   idField : 'value',
         *   render : '#t1',
         *   multipleSelect : true,
         *   items : [{value : '1',text : '1'},{value : '2',text : '2'}]
         * });
         * </code></pre>
         * @cfg {Boolean} [multipleSelect=false]
         */
        /**
         * 是否多选
         * @type {Boolean}
         * @default false
         */
        multipleSelect : {
            value : false
        }

    };

    selection.prototype = 
    {
        /**
         * 清理选中的项
         * <pre><code>
         *  list.clearSelection();
         * </code></pre>
         *
         */
        clearSelection : function(){
            var _self = this,
                selection = _self.getSelection();
            S.each(selection,function(item){
                _self.clearSelected(item);
            });
        },
        /**
         * 获取选中的项的值
         * @template
         * @return {Array} 
         */
        getSelection : function(){

        },
        /**
         * 获取选中的第一项,
         * <pre><code>
         * var item = list.getSelected(); //多选模式下第一条
         * </code></pre>
         * @return {Object} 选中的第一项或者为null
         */
        getSelected : function(){
            
        },
        /**
         * 根据 idField 获取到的值
         * @protected
         * @return {Object} 选中的值
         */
        getSelectedValue : function(){
            var _self = this,
                field = _self.get('idField'),
                item = _self.getSelected();

            return _self.getValueByField(item,field);
        },
        /**
         * 获取选中的值集合
         * @protected
         * @return {Array} 选中值得集合
         */
        getSelectionValues:function(){
            var _self = this,
                field = _self.get('idField'),
                items = _self.getSelection();
            return S.map(items,function(item){
                return _self.getValueByField(item,field);
            });
        },
        /**
         * 获取选中的文本
         * @protected
         * @return {Array} 选中的文本集合
         */
        getSelectionText:function(){
            var _self = this,
                items = _self.getSelection();
            return S.map(items,function(item){
                return _self.getItemText(item);
            });
        },
        /**
         * 移除选中
         * <pre><code>
         *    var item = list.getItem('id'); //通过id 获取选项
         *    list.setSelected(item); //选中
         *
         *    list.clearSelected();//单选模式下清除所选，多选模式下清除选中的第一项
         *    list.clearSelected(item); //清除选项的选中状态
         * </code></pre>
         * @param {Object} [item] 清除选项的选中状态，如果未指定则清除选中的第一个选项的选中状态
         */
        clearSelected : function(item){
            var _self = this;
            item = item || _self.getSelected();
            if(item){
                _self.setItemSelected(item,false);
            } 
        },
        /**
         * 获取选项显示的文本
         * @protected
         */
        getSelectedText : function(){
            var _self = this,
                item = _self.getSelected();
            return _self.getItemText(item);
        },
        /**
         * 设置选中的项
         * <pre><code>
         *  var items = list.getItemsByStatus('active'); //获取某种状态的选项
         *  list.setSelection(items);
         * </code></pre>
         * @param {Array} items 项的集合
         */
        setSelection: function(items){
            var _self = this;

            items = S.isArray(items) ? items : [items];

            S.each(items,function(item){
                _self.setSelected(item);
            }); 
        },
        /**
         * 设置选中的项
         * <pre><code>
         *   var item = list.getItem('id');
         *   list.setSelected(item);
         * </code></pre>
         * @param {Object} item 记录或者子控件
         * @param {Component.Controller|Object} element 子控件或者DOM结构
         */
        setSelected: function(item){
            var _self = this,
                multipleSelect = _self.get('multipleSelect');
                
            if(!multipleSelect){
                var selectedItem = _self.getSelected();
                if(item !== selectedItem){
                    //如果是单选，清除已经选中的项
                    _self.clearSelected(selectedItem);
                }
               
            }
            _self.setItemSelected(item,true);
            
        },
        /**
         * 选项是否被选中
         * @template
         * @param  {*}  item 选项
         * @return {Boolean}  是否选中
         */
        isItemSelected : function(item){

        },
        /**
         * 设置选项的选中状态
         * @param {*} item 选项
         * @param {Boolean} selected 选中或者取消选中
         * @protected
         */
        setItemSelected : function(item,selected){
            var _self = this,
                isSelected;
            //当前状态等于要设置的状态时，不触发改变事件
            if(item){
                isSelected =  _self.isItemSelected(item);
                if(isSelected === selected){
                    return;
                }
            }
            if(_self.fire('beforeselectedchange') !== false){
                _self.setSelectedStatus(item,selected);
            }
        },
        /**
         * 设置选项的选中状态
         * @template
         * @param {*} item 选项
         * @param {Boolean} selected 选中或者取消选中
         * @protected
         */
        setSelectedStatus : function(item,selected){

        },
        /**
         * 设置所有选项选中
         * <pre><code>
         *  list.setAllSelection(); //选中全部，多选状态下有效
         * </code></pre>
         * @template
         */
        setAllSelection : function(){
          
        },
        /**
         * 设置项选中，通过字段和值
         * @param {String} field 字段名,默认为配置项'idField',所以此字段可以不填写，仅填写值
         * @param {Object} value 值
         * @example
         * <pre><code>
         * var list = new List.SimpleList({
         *   itemTpl : '&lt;li id="{id}"&gt;{text}&lt;/li&gt;',
         *   idField : 'id', //id 字段作为key
         *   render : '#t1',
         *   items : [{id : '1',text : '1'},{id : '2',text : '2'}]
         * });
         *
         *   list.setSelectedByField('123'); //默认按照id字段查找
         *   //或者
         *   list.setSelectedByField('id','123');
         *
         *   list.setSelectedByField('value','123');
         * </code></pre>
         */
        setSelectedByField:function(field,value){
            if(!value){
                value = field;
                field = this.get('idField');
            }
            var _self = this,
                item = _self.findItemByField(field,value);
            _self.setSelected(item);
        },
        /**
         * 设置多个选中，根据字段和值
         * <pre><code>
         * var list = new List.SimpleList({
         *   itemTpl : '&lt;li id="{value}"&gt;{text}&lt;/li&gt;',
         *   idField : 'value', //value 字段作为key
         *   render : '#t1',
         *   multipleSelect : true,
         *   items : [{value : '1',text : '1'},{value : '2',text : '2'}]
         * });
         *   var values = ['1','2','3'];
         *   list.setSelectionByField(values);//
         *
         *   //等于
         *   list.setSelectionByField('value',values);
         * </code></pre>
         * @param {String} field 默认为idField
         * @param {Array} values 值得集合
         */
        setSelectionByField:function(field,values){
            if(!values){
                values = field;
                field = this.get('idField');
            }
            var _self = this;
            S.each(values,function(value){
                _self.setSelectedByField(field,value);
            });   
        },
        /**
         * 选中完成后，触发事件
         * @protected
         * @param  {*} item 选项
         * @param  {Boolean} selected 是否选中
         * @param  {jQuery} element 
         */
        afterSelected : function(item,selected,element){
            var _self = this;

            if(selected){
                _self.fire('itemselected',{item:item,domTarget:element});
                _self.fire('selectedchange',{item:item,domTarget:element,selected:selected});
            }else{
                _self.fire('itemunselected',{item:item,domTarget:element});
                if(_self.get('multipleSelect')){ //只有当多选时，取消选中才触发selectedchange
                    _self.fire('selectedchange',{item:item,domTarget:element,selected:selected});
                } 
            } 
        }

    };
    
    return selection;
});