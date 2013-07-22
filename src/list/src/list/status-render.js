/**
 * @fileOverview 列表选项状态控制
 * @author dxq613@gmail.com
 * @ignore
 */

KISSY.add('list/status-render',function (S) {
  'use strict';

  var $ = S.all;

  
  function get(name,self){
    if(self.renderData){
      return self.renderData[name];
    }
    return self.control.get(name);
  }


  /**
   * @class List.StatusRender
   * 选项状态扩展 渲染类
   * @protected
   */
  var Render = function(){};

  S.augment(Render,{

    /**
     * 根据状态获取DOM
     * @return {Array} DOM数组
     */
    getElementsByStatus : function(status){
      var _self = this,
        cls = _self.getItemStatusCls(status),
        el = _self.$el;
      return el.all('.' + cls);
    },
    /**
     * 根据状态获取第一个DOM 节点
     * @param {String} name 状态名称
     * @return {HTMLElement} Dom 节点
     */
    getFirstElementByStatus : function(name){
      var _self = this,
        cls = _self.getItemStatusCls(name),
        el = _self.$el;
      return el.one('.' + cls);
    },
    /**
     * 是否有某个状态
     * @param {*} name 状态名称
     * @param {HTMLElement} element DOM结构
     * @return {Boolean} 是否具有状态
     */
    hasStatus : function(name,element){
      var _self = this,
        cls = _self.getItemStatusCls(name);
      return $(element).hasClass(cls);
    },
    /**
     * 获取列表项对应状态的样式
     * @param  {String} name 状态名称
     * @return {String} 状态的样式
     */
    getItemStatusCls : function(name){
      var _self = this,
        itemCls = get('itemCls',_self),
        itemStatusCls = get('itemStatusCls',_self);
      if(itemStatusCls && itemStatusCls[name]){
        return itemStatusCls[name];
      }
      return itemCls + '-' + name;
    },
    /**
     * 设置列表项选中
     * @protected
     * @param {*} name 状态名称
     * @param {HTMLElement} element DOM结构
     * @param {Boolean} value 设置或取消此状态
     */
    setItemStatusCls : function(name,element,value){
      var _self = this,
        cls = _self.getItemStatusCls(name),
        method = value ? 'addClass' : 'removeClass';
      if(element){
        $(element)[method](cls);
      }
    }
  });

  return Render;
},{
  requires : ['core']
});