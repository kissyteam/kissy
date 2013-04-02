/**
 * @fileOverview 支持模板
 * @ignore
 */

KISSY.add("component/base/tpl", function (S) {
  /**
   * @class KISSY.Component.Tpl
   * Template extension class. Make component extensionable used templates.
   */
  function Tpl() {
  }

  Tpl.ATTRS = {
    /**
    * 控件的模版，用于初始化
    * @cfg {String} tpl
    */
    /**
     * 控件的模板
     * @type {String}
     */
    tpl : {
      view : true,
      sync: false
    },
    /**
     * <p>控件的渲染函数，应对一些简单模板解决不了的问题，例如有if,else逻辑，有循环逻辑,
     * 函数原型是function(data){},其中data是控件的属性值</p>
     * <p>控件模板的加强模式，此属性会覆盖@see {BUI.Component.UIBase.Tpl#property-tpl}属性</p>
     * @cfg {Function} tplRender
     */
    /**
     * <p>控件的渲染函数，应对一些简单模板解决不了的问题，例如有if,else逻辑，有循环逻辑,
     * 函数原型是function(data){},其中data是控件的属性值</p>
     * <p>控件模板的加强模式，，此属性会覆盖@see {BUI.Component.UIBase.Tpl#property-tpl}属性</p>
     * @type {Function}
     * @readOnly
     */
    tplRender : {
      view : true,
      value : null
    },
    /**
     * 这是一个选择器，使用了模板后，子控件可能会添加到模板对应的位置,
     * 默认为null,此时子控件会将控件最外层 el 作为容器
     * @type {String}
     */
    childContainer : {
      view : true
    }
  };

  Tpl.prototype = {
    __renderUI : function () {
      //使用srcNode时，不使用模板
      if(!this.get('srcNode')){
        this.setTplContent();
      }
    },
    /**
     * 根据控件的属性和模板生成控件内容
     */
    setTplContent : function () {
      var _self = this,
        attrs = _self.getAttrVals();
      _self.get('view').setTplContent(attrs);
    },
    //模板发生改变
    _uiSetTpl : function(){
      this.setTplContent();
    }
  }
  return Tpl;
});