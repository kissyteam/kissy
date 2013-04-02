/**
 * @fileOverview 模板扩展类视图类
 * @ignore
 */

KISSY.add('component/base/tpl-render',function (S) {
  /**
   * @class KISSY.Component.TplRender
   * @private
   * Template extension class. Make component extensionable used templates.
   */
  function TplRender() {
  }

  TplRender.ATTRS = {
    /**
     * 模板
     * @protected
     * @type {String}
     */
    tpl:{

    }
  };

  TplRender.prototype = {
    /**
     * 获取生成控件的模板
     * @protected
     * @param  {Object} attrs 属性值
     * @return {String} 模板
     */
    getTpl:function (attrs) {
        var _self = this,
            tpl = _self.get('tpl'),
            tplRender = _self.get('tplRender');
        attrs = attrs || _self.getAttrVals();

        if(tplRender){
          return tplRender(attrs);
        }
        if(tpl){
          return S.substitute(tpl,attrs);
        }
        return '';
    },
    /**
     * 如果控件设置了模板，则根据模板和属性值生成DOM
     * 如果设置了content属性，此模板不应用
     * @protected
     * @param  {Object} attrs 属性值，默认为初始化时传入的值
     */
    setTplContent:function (attrs) {
        var _self = this,
            el = _self.get('el'),
            content = _self.get('content'),
            tpl = _self.getTpl(attrs);
        if(!content && tpl){
          el.empty();
          el.html(tpl);
          var contentContainer = _self.get('childContainer'),
            contentEl;
          if(contentContainer){
            contentEl = el.one(contentContainer);
            if(contentEl && contentEl.length){
              _self.set('contentEl',contentEl);
            }
          }
        }
    }
  };

  return TplRender;

});