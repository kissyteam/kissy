/**
 * @fileOverview 选项状态变化
 * @author dxq613@gmail.com
 * @ignore
 */

KISSY.add('list/status',function (S) {

  'use strict';
  /** 
   * @class List.Status
   * 选项状态扩展
   * 
   */
  function Status(){}


  Status.ATTRS = {

    /**
     * 子控件各个状态默认采用的样式
     * <pre><code>
     * var list = new List.SimpleList({
     *   render : '#t1',
     *   itemStatusCls : {
     *     selected : 'active', //默认样式为list-item-selected,现在变成'active'
     *     hover : 'hover' //默认样式为list-item-hover,现在变成'hover'
     *   },
     *   items : [{id : '1',text : '1',type : '0'},{id : '2',text : '2',type : '1'}]
     * });
     * list.render();
     * </code></pre>
     * @type {Object}
     */
    itemStatusCls : {
      view : true,
      value : {}
    },
    /**
     * 选项状态对应的选项值
     * 
     *   - 此字段用于将选项记录的值跟显示的DOM状态相对应
     *   - 例如：下面记录中 <code> checked : true </code>，可以使得此记录对应的DOM上应用对应的状态(默认为 'list-item-checked')
     *     <pre><code>{id : '1',text : 1,checked : true}</code></pre>
     *   - 当更改DOM的状态时，记录中对应的字段属性也会跟着变化
     * <pre><code>
     *   var list = new List({
     *   render : '#t1',
     *   idField : 'id', //自定义样式名称
     *   itemStatusFields : {
     *     checked : 'checked',
     *     disabled : 'disabled'
     *   },
     *   items : [{id : '1',text : '1',checked : true},{id : '2',text : '2',disabled : true}]
     * });
     * list.render(); //列表渲染后，会自动带有checked,和disabled对应的样式
     *
     * var item = list.getItem('1');
     * list.hasStatus(item,'checked'); //true
     *
     * list.setItemStatus(item,'checked',false);
     * list.hasStatus(item,'checked');  //false
     * item.checked;                    //false
     * 
     * </code></pre>
     * ** 注意 **
     * 此字段跟 {@link #itemStatusCls} 一起使用效果更好，可以自定义对应状态的样式
     * @cfg {Object} itemStatusFields
     */
    itemStatusFields : {
      value : {}
    },
    events :{
      value : [
        /**
         * @event
         * 选项状态发生改变
         * @param {Object} e 事件对象
         * @param {Object} item 选项值
         * @param {String} e.status 状态名称
         * @param {Boolean} e.value 状态值
         */
        'itemstatuschange'
      ]
    }


  };

  S.augment(Status,{

    __bindUI : function(){
      var _self = this;

      //同步状态
      _self.on('itemrendered itemupdated',function(ev){
        var item = ev.item,
          element = ev.element;
        _self._syncItemStatus(item,element);
      });
    },
    //同步选项状态
    _syncItemStatus : function(item,element){
      var _self = this,
        itemStatusFields = _self.get('itemStatusFields');
      S.each(itemStatusFields,function(v,k){
        _self.get('view').setItemStatusCls(k,element,item[v]);
      });
    },
    /**
     * 查找指定的项的DOM结构
     * @template
     * @param  {Object} item 
     * @return {HTMLElement} element
     */
    findElement : function(item){

    },
    /**
     * @protected
     * 获取记录中的状态值，未定义则为undefined
     * @param  {Object} item  记录
     * @param  {String} status 状态名
     * @return {Boolean|undefined}  
     */
    getStatusValue : function(item,status){
      var _self = this,
        itemStatusFields = _self.get('itemStatusFields'),
        field = itemStatusFields[status];
      return item[field];
    },
    /**
     * 更改状态值对应的字段
     * @protected
     * @param  {String} status 状态名
     * @return {String} 状态对应的字段
     */
    getStatusField : function(status){
      var _self = this,
        itemStatusFields = _self.get('itemStatusFields');
      return itemStatusFields[status];
    },
    /**
     * 根据状态获取选项
     * <pre><code>
     *   //设置状态
     *   list.setItemStatus(item,'active');
     *   
     *   //获取'active'状态的选项
     *   list.getItemsByStatus('active');
     * </code></pre>
     * @param  {String} status 状态名
     * @return {Array}  选项组集合
     */
    getItemsByStatus : function(status){
      var _self = this,
        elements = _self.get('view').getElementsByStatus(status),
        rst = [];
      S.each(elements,function(element){
        rst.push(_self.getItemByElement(element));
      });
      return rst;
    },
    /**
     * 选项是否存在某种状态
     * <pre><code>
     * var item = list.getItem('2');
     * list.setItemStatus(item,'active',true);
     * list.hasStatus(item,'active'); //true
     *
     * list.setItemStatus(item,'active',false);
     * list.hasStatus(item,'false'); //true
     * </code></pre>
     * @param {*} item 选项
     * @param {String} status 状态名称，如selected,hover,open等等
     * @param {HTMLElement} [element] 选项对应的Dom，放置反复查找
     * @return {Boolean} 是否具有某种状态
     */
    hasStatus : function(item,status,element){
      var _self = this;

      element = element || _self.findElement(item);
      return _self.get('view').hasStatus(status,element);
    },
    /**
     * 设置选项状态,可以设置任何自定义状态
     * <pre><code>
     * var item = list.getItem('2');
     * list.setItemStatus(item,'active',true);
     * list.hasStatus(item,'active'); //true
     *
     * list.setItemStatus(item,'active',false);
     * list.hasStatus(item,'false'); //true
     * </code></pre>
     * @param {*} item 选项
     * @param {String} status 状态名称
     * @param {Boolean} value 状态值，true,false
     * @param {HTMLElement} [element] 选项对应的Dom，避免反复查找
     */
    setItemStatus : function(item,status,value,element){
      var _self = this;
      element = element || _self.findElement(item);
      if(!_self.isItemDisabled(item,element) || status === 'disabled'){ //禁用后，阻止添加任何状态变化
        if(status == 'disabled' && value){ //禁用，同时清理其他状态
          _self.clearItemStatus(item);
        }
        _self.setStatusValue(item,status,value);
        _self.get('view').setItemStatusCls(status,element,value);
        _self.fire('itemstatuschange',{item : item,status : status,value : value,element : element})
        if(status == 'selected'){ //处理选中
          _self.afterSelected(item,value,element);
        }

      }
    },
    /**
     * 清除所有选项状态,如果指定清除的状态名，则清除指定的，否则清除所有状态
     * @param {Object} item 选项
     */
    clearItemStatus : function(item,status,element){
      var _self = this,
        itemStatusFields = _self.get('itemStatusFields');
      element = element || _self.findElement(item);
        
      if(status){
        _self.setItemStatus(item,status,false,element);
      }else{
        S.each(itemStatusFields,function(v,k){
          _self.setItemStatus(item,k,false,element);
        });
        if(!itemStatusFields['selected']){
          _self.setItemSelected(item,false);
        }
        //移除hover状态
        _self.setItemStatus(item,'hover',false);
      }
      
    },
    /**
     * 是否选项被禁用
     * <pre><code>
     * var item = list.getItem('2');
     * if(list.isItemDisabled(item)){ //如果选项禁用
     *   //TO DO
     * }
     * </code></pre>
     * @param {Object} item 选项
     * @return {Boolean} 选项是否禁用
     */
    isItemDisabled : function(item,element){
      return this.hasStatus(item,'disabled',element);
    },
    /**
     * 设置选项禁用
     * <pre><code>
     * var item = list.getItem('2');
     * list.setItemDisabled(item,true);//设置选项禁用，会在DOM上添加 itemCls + 'disabled'的样式
     * list.setItemDisabled(item,false); //取消禁用，可以用{@link #itemStatusCls} 来替换样式
     * </code></pre>
     * @param {Object} item 选项
     */
    setItemDisabled : function(item,disabled){
      
      var _self = this;
      /*if(disabled){
        //清除选择
        _self.setItemSelected(item,false);
      }*/
      _self.setItemStatus(item,'disabled',disabled);
    },
    /**
     * 设置记录状态值
     * @protected
     * @param  {Object} item  记录
     * @param  {String} status 状态名
     * @param {Boolean} value 状态值
     */
    setStatusValue : function(item,status,value){
      var _self = this,
        itemStatusFields = _self.get('itemStatusFields'),
        field = itemStatusFields[status];
      if(field){
        item[field] = value;
      }
    }
  });

  return Status;
});