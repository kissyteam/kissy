/**
 * @fileOverview List 控件的实现
 * @author dxq613@gmail.com
 * @ignore
 */

KISSY.add('list/control',function (S,Controller,Selection,Render,Status,KeyNav) {

  var $ = S.all;

  /**
   * @class List
   * 列表控件
   * @extends Component.Controller
   * @mixins List.Selection
   * @mixins List.KeyNav
   */
  var List = Controller.extend([Selection,Status,KeyNav],{

    bindUI : function(){
      var _self = this,
        selectedEvent = _self.get('selectedEvent'),
        itemCls = _self.get('itemCls'),
        itemContainer = _self.get('view').getItemContainer(),
        el = _self.get('el');

      //点击事件
      itemContainer.delegate('click','.'+itemCls,function(ev){
        var itemEl = $(ev.currentTarget),
          item = _self.getItemByElement(itemEl);
        if(_self.isItemDisabled(item,itemEl)){ //禁用状态下阻止选中
          return;
        }
        var rst = _self.fire('itemclick',{item:item,element : itemEl[0],domTarget:ev.target,domEvent:ev});
        if(rst !== false && selectedEvent == 'click'){
          setItemSelectedStatus(item,itemEl); 
        }
      });
      if(selectedEvent !== 'click'){ //如果选中事件不等于click，则进行监听选中
        itemContainer.delegate(selectedEvent,'.'+itemCls,function(ev){
          var itemEl = $(ev.currentTarget),
            item = _self.getItemByElement(itemEl);
          if(_self.isItemDisabled(item,itemEl)){ //禁用状态下阻止选中
            return;
          }
          setItemSelectedStatus(item,itemEl); 
        });
      }

      itemContainer.delegate('mouseover','.'+itemCls,function(ev){
        if(_self.isItemDisabled(ev.item,ev.currentTarget)){ //如果禁用
          return;
        }
        var element = ev.currentTarget;
          item = _self.getItemByElement(element);
          
        if(_self.get('highlightedStatus') === 'hover'){
          _self.setHighlighted(item,element)
        }else{
          _self.setItemStatus(item,'hover',true,element);
        }
        
      }).delegate('mouseout','.'+itemCls,function(ev){
        _self.setItemStatus(ev.item,'hover',false,ev.currentTarget);
      });
      
      //设置选中状态
      function setItemSelectedStatus(item,itemEl){
        var multipleSelect = _self.get('multipleSelect'),
          isSelected;
        isSelected = _self.isItemSelected(item,itemEl);
        if(!isSelected){
          if(!multipleSelect){
            _self.clearSelected();
          }
          _self.setItemSelected(item,true,itemEl);
        }else if(multipleSelect){
          _self.setItemSelected(item,false,itemEl);
        }           
      }
      
    },
    
    /**
     * 获取选项的数量
     * <pre><code>
     *   var count = list.getCount();
     * </code></pre>
     * @return {Number} 选项数量
     */
    getCount : function () {
      return this.getItems().length;
    },
    /**
     * 获取所有选项值，如果选项是子控件，则是所有子控件
     * <pre><code>
     *   var items = list.getItems();
     *   //等同
     *   list.get(items);
     * </code></pre>
     * @return {Array} 选项值集合
     */
    getItems : function () {
      return this.get('items');
    },
    /**
     * 获取第一项
     * <pre><code>
     *   var item = list.getFirstItem();
     *   //等同
     *   list.getItemAt(0);
     * </code></pre>
     * @return {Object} 选项值（子控件）
     */
    getFirstItem : function () {
      return this.getItemAt(0);
    },
    /**
     * 获取最后一项
     * <pre><code>
     *   var item = list.getLastItem();
     *   //等同
     *   list.getItemAt(list.getCount()-1);
     * </code></pre>
     * @return {Object} 选项值（子控件）
     */
    getLastItem : function () {
      return this.getItemAt(this.getCount() - 1);
    },
    /**
     * 通过索引获取选项值（子控件）
     * <pre><code>
     *   var item = list.getItemAt(0); //获取第1个
     *   var item = list.getItemAt(2); //获取第3个
     * </code></pre>
     * @param  {Number} index 索引值
     * @return {Object}  选项（子控件）
     */
    getItemAt : function  (index) {
      return this.getItems()[index] || null;
    },
    /**
     * 通过Id获取选项，如果是改变了idField则通过改变的idField来查找选项
     * <pre><code>
     *   //如果idField = 'id'
     *   var item = list.getItem('2'); 
     *   //等同于
     *   list.findItemByField('id','2');
     *
     *   //如果idField = 'value'
     *   var item = list.getItem('2'); 
     *   //等同于
     *   list.findItemByField('value','2');
     * </code></pre>
     * @param {String} id 编号
     * @return {Object} 选项（子控件）
     */
    getItem : function(id){
      var field = this.get('idField');
      return this.findItemByField(field,id);
    },
    /**
     * 返回指定项的索引
     * <pre><code>
     * var index = list.indexOf(item); //返回索引，不存在则返回-1
     * </code></pre>
     * @param  {Object} 选项
     * @return {Number}   项的索引值
     */
    indexOfItem : function(item){
      return S.indexOf(item,this.getItems());
    },
    /**
     * 获取DOM结构中的数据
     * @protected
     * @param {HTMLElement} element DOM 结构
     * @return {Object} 该项对应的值
     */
    getItemByElement : function(element){
      return this.get('view').getItemByElement(element);
    },
    /**
     * 获取选中的项的值
     * @override
     * @return {Array} 
     * @ignore
     */
    getSelection : function(){
      return this.getItemsByStatus('selected');
    },
    /**
     * 获取选中的第一项,
     * <pre><code>
     * var item = list.getSelected(); //多选模式下第一条
     * </code></pre>
     * @return {Object} 选中的第一项或者为null
     */
    getSelected : function(){ //this.getSelection()[0] 的方式效率太低
      var _self = this,
        element = _self.get('view').getFirstElementByStatus('selected');
        return _self.getItemByElement(element) || null;
    },
    /**
     * 查找指定的项的DOM结构
     * <pre><code>
     *   var item = list.getItem('2'); //获取选项
     *   var element = list.findElement(item);
     *   $(element).addClass('xxx');
     * </code></pre>
     * @param  {Object} item 
     * @return {HTMLElement} element
     */
    findElement : function(item){
      var _self = this;
      return this.get('view').findElement(item);
    },
     /**
     * 添加多条选项
     * <pre><code>
     * var items = [{id : '1',text : '1'},{id : '2',text : '2'}];
     * list.addItems(items);
     * </code></pre>
     * @param {Array} items 记录集合（子控件配置项）
     */
    addItems : function (items) {
      var _self = this;
      S.each(items,function (item) {
          _self.addItem(item);
      });
    },
    /**
     * 插入多条记录
     * <pre><code>
     * var items = [{id : '1',text : '1'},{id : '2',text : '2'}];
     * list.addItemsAt(items,0); // 在最前面插入
     * list.addItemsAt(items,2); //第三个位置插入
     * </code></pre>
     * @param  {Array} items 多条记录
     * @param  {Number} start 起始位置
     */
    addItemsAt : function(items,start){
      var _self = this;
      S.each(items,function (item,index) {
        _self.addItemAt(item,start + index);
      });
    },
    /**
     * 更新列表项，修改选项值后，DOM跟随变化
     * <pre><code>
     *   var item = list.getItem('2');
     *   list.text = '新内容'; //此时对应的DOM不会变化
     *   list.updateItem(item); //DOM进行相应的变化
     * </code></pre>
     * @param  {Object} item 选项值
     */
    updateItem : function(item){
      var _self = this,
        element =  _self.get('view').updateItem(item);
      _self.fire('itemupdated',{item : item,element : element})
    },
    /**
     * 添加选项,添加在控件最后
     * 
     * <pre><code>
     * list.addItem({id : '3',text : '3',type : '0'});
     * </code></pre>
     * 
     * @param {Object} item 选项，子控件配置项、子控件
     * @return {Object} 子控件或者选项记录
     */
    addItem : function (item) {
       return this.addItemAt(item,this.getCount());
    },
    /**
     * 在指定位置添加选项
     * <pre><code>
     * list.addItemAt({id : '3',text : '3',type : '0'},0); //第一个位置
     * </code></pre>
     * @param {Object} item 选项，子控件配置项、子控件
     * @param {Number} index 索引
     * @return {Object} 子控件或者选项记录
     */
    addItemAt : function(item,index) {
      var _self = this,
        items = _self.get('items');
      if(index === undefined) {
          index = items.length;
      }
      items.splice(index, 0, item);
      _self.addItemToView(item,index);
      return item;
    },
    /**
      * 根据字段查找指定的项
      * @param {String} field 字段名
      * @param {Object} value 字段值
      * @return {Object} 查询出来的项（传入的记录或者子控件）
      * @protected
    */
    findItemByField:function(field,value){
      var _self = this,
        items = _self.get('items'),
        result = null;
      S.each(items,function(item){
        if(item[field] === value){
            result = item;
            return false;
        }
      });

      return result;
    },
    /**
     * 
     * 获取此项显示的文本  
     * @param {Object} item 获取记录显示的文本
     * @protected            
     */
    getItemText:function(item){
      var _self = this,
          textGetter = _self.get('textGetter');

      if(!item){
        return '';
      }
      if(textGetter){
        return textGetter(item);
      }else{
        return $(_self.findElement(item)).text();
      }
    },
    /**
     * 清除所有选项,不等同于删除全部，此时不会触发删除事件
     * <pre><code>
     * list.clearItems(); 
     * //等同于
     * list.set('items',items);
     * </code></pre>
     */
    clearItems : function(){
      var _self = this,
          items = _self.getItems();
      items.splice(0);
      _self.clearControl();
    },
    /**
     * 选项是否被选中
     * <pre><code>
     *   var item = list.getItem('2');
     *   if(list.isItemSelected(item)){
     *     //TO DO
     *   }
     * </code></pre>
     * @override
     * @param  {Object}  item 选项
     * @return {Boolean}  是否选中
     */
    isItemSelected : function(item,element){
      var _self = this;
      element = element || _self.findElement(item);

      return _self.hasStatus(item,'selected',element);
    },
    /**
     * 删除选项
     * <pre><code>
     * var item = list.getItem('1');
     * list.removeItem(item);
     * </code></pre>
     * @param {Object} item 选项（子控件）
     */
    removeItem : function (item) {
      var _self = this,
        items = _self.get('items'),
        index;
      index = S.indexOf(item,items);
      if(index !== -1){
        items.splice(index, 1);
      }
      element = _self.get('view').removeItem(item);
      _self.fire('itemremoved',{item:item,element: element});
    },
    /**
     * 移除选项集合
     * <pre><code>
     * var items = list.getSelection();
     * list.removeItems(items);
     * </code></pre>
     * @param  {Array} items 选项集合
     */
    removeItems : function(items){
      var _self = this;

      S.each(items,function(item){
          _self.removeItem(item);
      });
    },
    /**
     * 通过索引删除选项
     * <pre><code>
     * list.removeItemAt(0); //删除第一个
     * </code></pre>
     * @param  {Number} index 索引
     */
    removeItemAt : function (index) {
      this.removeItem(this.getItemAt(index));
    }, 
    /**
     * 设置所有选项选中
     * @ignore
     */
    setAllSelection : function(){
      var _self = this,
        items = _self.getItems();
      _self.setSelection(items);
    },
    /**
     * @override
     * @ignore
     */
    setSelectedStatus : function(item,selected,element){
      var _self = this;
      element = element || _self.findElement(item);
      
      _self.setItemStatus(item,'selected',selected,element);
      //_self.afterSelected(item,selected,element);
    },
    /**
     * @private
     * 直接在View上显示
     * @param {Object} item 选项
     * @param {Number} index 索引
     */
    addItemToView : function(item,index){
      var _self = this,
        element = _self.get('view').addItem(item,index);
      _self.fire('itemrendered',{item:item,element : $(element)[0]});
    },
    /**
     * @private
     * @override
     * 清除者列表项的DOM
     */
    clearControl : function(){
      this.fire('beforeitemsclear');
      this.get('view').clearControl();
      this.fire('afteritemsclear');
    },
    /**
     * 设置列表记录
     * <pre><code>
     *   list.setItems(items);
     *   //等同 
     *   list.set('items',items);
     * </code></pre>
     * @param {Array} items 列表记录
     */
    setItems : function(items){
      var _self = this;
      //清理子控件
      _self.clearControl();
      _self.fire('beforeitemsshow');
      S.each(items,function(item,index){
        _self.addItemToView(item,index);
      });
      _self.fire('afteritemsshow');
    },
    //设置记录
    _onSetItems : function (items) {
      var _self = this;
      //使用srcNode 的方式，不同步
      if(_self.get('srcNode') && !_self.get('rendered')){
        return;
      }
      this.setItems(items);
    }
  },{

    ATTRS : {
      /**
       * 在DOM节点上存储数据的字段
       * @type {String}
       * @private
       */
      dataField : {
        view:true,
        value:'data-item'
      },
      /**
       * 选项所在容器
       * @type {jQuery}
       * @protected
       */
      listSelector : {
        view : true,
        value : 'ul'
      },
      /**
       * 选择的数据集合
       * <pre><code>
       * var list = new List({
       *   itemTpl : '&lt;li id="{value}"&gt;{text}&lt;/li&gt;',
       *   idField : 'value',
       *   render : '#t1',
       *   items : [{value : '1',text : '1'},{value : '2',text : '2'}]
       * });
       * list.render();
       * </code></pre>
       * @cfg {Array} items
       */
      /**
       * 选择的数据集合
       * <pre><code>
       *  list.set('items',items); //列表会直接替换内容
       *  //等同于 
       *  list.clearItems();
       *  list.addItems(items);
       * </code></pre>
       * @type {Array}
       */
      items:{
        view : true,
        value : []
      },
      /**
       * 覆写内容模板
       * @type {String}
       */
      content : {
        view: true,
        value : '<ul></ul>'
      },
      /**
       * 列表项的默认模板,仅在初始化时传入。
       * @cfg {String} itemTpl
       */
      itemTpl : {
        view : true,
        value: '<li>{text}</li>'
      },
      /**
       * 列表项的渲染函数，应对列表项之间有很多差异时
       * <pre><code>
       * var list = new List({
       *   itemTplRender : function(item){
       *     if(item.type == '1'){
       *       return '&lt;li&gt;&lt;img src="xxx.jpg"/&gt;'+item.text+'&lt;/li&gt;'
       *     }else{
       *       return '&lt;li&gt;item.text&lt;/li&gt;'
       *     }
       *   },
       *   idField : 'value',
       *   render : '#t1',
       *   items : [{value : '1',text : '1',type : '0'},{value : '2',text : '2',type : '1'}]
       * });
       * list.render();
       * </code></pre>
       * @type {Function}
       */
      itemTplRender : {
        view : true
      },
      /**
       * 用于获取选项显示文本的函数，如果为空，直接使用Node的 text 方法
       * @cfg {Function} textGetter
       */
      textGetter : {

      },
      /**
       * 项的样式，用来获取子项
       * @cfg {Object} itemCls
       */
      itemCls : {
        view : true,
        valueFn : function(){
          return this.get('prefixCls') + 'list-item'
        }
      },  
      events : {

        value : [
          /**
           * 选项点击事件,如果return false,阻止选中事件触发
           * @event
           * @param {Object} e 事件对象
           * @param {Object} e.item 点击的选项
           * @param {HTMLElement} e.element 选项代表的DOM对象
           * @param {HTMLElement} e.domTarget 点击的DOM对象
           */
          'itemclick',
          /**
           * 选项对应的DOM创建完毕
           * @event
           * @param {Object} e 事件对象
           * @param {Object} e.item 渲染DOM对应的选项
           * @param {HTMLElement} e.element 渲染的DOM对象
           */
          'itemrendered',
          /**
           * @event
           * 删除选项
           * @param {Object} e 事件对象
           * @param {Object} e.item 删除DOM对应的选项
           * @param {HTMLElement} e.element 删除的DOM对象
           */
          'itemremoved',
          
          /**
           * @event
           * 更新选项
           * @param {Object} e 事件对象
           * @param {Object} e.item 更新DOM对应的选项
           * @param {HTMLElement} e.element 更新的DOM对象
           */
          'itemupdated',
          /**
          * 设置记录时，所有的记录显示完毕后触发
          * @event
          */
          'afteritemsshow',
          /**
          * 清空所有记录，DOM清理前
          * @event
          */
          'beforeitemsclear'
        ]
      },
      /**
       * 渲染类
       * @type {Object}
       * @ignore
       */
      xrender : {
        value : Render
      }
    },
    xclass : 'list'
  });

  return List;
},{
  requires : ['component/control','list/selection','list/render','list/status','list/key-nav']
});