/**
 * @fileOverview 列表渲染类
 * @author dxq613@gmail.com
 * @ignore
 */
KISSY.add('list/render',function (S,Controller,StatusRender) {
  'use strict';

  var $ = S.all,
    FIELD_PREFIX = 'data-';

   function get(name,self){
    if(self.renderData){
      return self.renderData[name];
    }
    return self.control.get(name);
  }

  function parseItem(element,self){
    var attrs = element.attributes,
      itemStatusFields = get('itemStatusFields',self),
      item = {};

    S.each(attrs,function(attr){
      var name = attr.nodeName;
      if(name.indexOf(FIELD_PREFIX) !== -1){
        name = name.replace(FIELD_PREFIX,'');
        item[name] = attr.nodeValue;
      }
    });
    item.text = $(element).text();
    //获取状态对应的值
    S.each(itemStatusFields,function(v,k){
      if(self.hasStatus(k,element)){
        item[v] = true;
      }
    });
    return item;
  }

 

  /**
   * @class List.Render
   * 列表渲染类
   * @protected
   * @extends Component.Render
   * @mixins List.StatusRender
   */
  var Render = Controller.getDefaultRender().extend([StatusRender],{

     /**
     * @protected
     * 清除者列表项的DOM
     */
    clearControl : function(){
      var _self = this,
        listEl = _self.getItemContainer(),
        itemCls = get('itemCls',_self);
      listEl.all('.'+itemCls).remove();
    },
    /**
     * 添加选项
     * @param {Object} item  选项值
     * @param {Number} index 索引
     */
    addItem : function(item,index){
      return this._createItem(item,index);
    },
    /**
     * 获取所有的记录
     * @return {Array} 记录集合
     */
    getItems : function(){
      var _self = this,
        elements = _self.getAllElements(),
        rst = [];
      S.each(elements,function(elem){
        rst.push(_self.getItemByElement(elem));
      });
      return rst;
    },
    /**
     * 更新列表项
     * @param  {Object} item 选项值
     * @ignore
     */
    updateItem : function(item){
      var _self = this, 
        items = _self.getItems(),
        index = S.indexOf(item,items),
        element = null,
        tpl;
      if(index >=0 ){
        element = _self.findElement(item);
        tpl = _self.getItemTpl(item,index);
        if(element){
          $(element).html($(tpl).html());
        }
      }
      return element;
    },
    /**
     * 移除选项
     * @param  {jQuery} element
     * @ignore
     */
    removeItem:function(item,element){
      element = element || this.findElement(item);
      $(element).remove();
      return element;
    },
     /**
     * 获取列表项的容器
     * @return {jQuery} 列表项容器
     * @protected
     */
    getItemContainer : function  () {
      return this.get('itemContainer') || this.$el;
    },
    /**
     * 获取记录的模板,itemTpl 和 数据item 合并产生的模板
     * @protected 
     */
    getItemTpl : function  (item,index) {
      var _self = this,
        render = get('itemTplRender',_self),
        itemTpl = get('itemTpl',_self);  
      if(render){
        return render(item,index);
      }
      
      return S.substitute(itemTpl,item);
    },
     //创建项
    _createItem : function(item,index){
      var _self = this,
        listEl = _self.getItemContainer(),
        itemCls = get('itemCls',_self),
        dataField = get('dataField',_self),
        tpl = _self.getItemTpl(item,index),
        node = $(tpl);
      if(index !== undefined){
        var target = listEl.all('.'+itemCls)[index];
        if(target){
          node.insertBefore(target);
        }else{
          node.appendTo(listEl);
        }
      }else{
        node.appendTo(listEl);
      }
      node.addClass(itemCls);
      node.data(dataField,item);
      return node;
    },
    /**
     * 获取所有列表项的DOM结构
     * @return {Array} DOM列表
     */
    getAllElements : function(){
      var _self = this,
        itemCls = get('itemCls',_self),
        el = _self.$el;
      return el.all('.' + itemCls);
    },
    /**
     * 获取DOM结构中的数据
     * @param {HTMLElement} element DOM 结构
     * @return {Object} 该项对应的值
     */
    getItemByElement : function(element){
      var _self = this,
        dataField = get('dataField',_self);
      return $(element).data(dataField);
    },
    /**
     * 查找指定的项的DOM结构
     * @param  {Object} item 
     * @return {HTMLElement} element
     */
    findElement : function(item){
      var _self = this,
        elements = _self.getAllElements(),
        result = null;

      S.each(elements,function(element){
        if(_self.getItemByElement(element) === item){
          result = element;
          return false;
        }
      });
      return result;
    }
  },{
    ATTRS : {
      items : {},
      itemContainer : {
        valueFn : function(){
          var control = this.control;
          return this.$el.one(control.get('listSelector'));
        }
      }
    },
    HTML_PARSER : {
      items : function(el){
        var _self = this,
          control = _self.control,
          rst = [],
          itemCls = control.get('itemCls'),
          dataField = control.get('dataField'),
          elements = el.all('.' + itemCls);
        S.each(elements,function(element){
          var item = parseItem(element,_self);
          rst.push(item);
          $(element).data(dataField,item);
        });
        control.setInternal('items',rst);
        return rst;
      }
    }
  },{
    name : 'ListRender'
  });

  return Render;
},{
  requires : ['component/control','list/status-render']
});