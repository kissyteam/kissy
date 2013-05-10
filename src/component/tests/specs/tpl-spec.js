
KISSY.use('component/base',function (S,Component) {

  describe('测试控件模板',function(){
    var A = Component.Controller.extend({

    },{
      ATTRS : {
        tpl : {
          value : '<a href="http://www.taobao.com">{text}</a>'
        }
      }
    },{
      xclass : 'test'
    });

    it('测试tpl 属性',function(){
      var text = 'nihao,hello',
        c = new A({
        render : '#t1',
        text : text
      }).render();
      var aEl = c.get('el').one('a')
      expect(aEl.length).not.toBe(0);
      expect(aEl.text()).toBe(text);
    });

    it('测试自定义 tpl 属性',function(){
      var text = 'nihao,hello',
        c = new A({
        render : '#t1',
        text : text,
        tpl : '<span>{text}</span>'
      }).render();
      var aEl = c.get('el').one('span')
      expect(aEl.length).not.toBe(0);
      expect(aEl.text()).toBe(text);
    });

    it('测试tplRender 属性',function(){
      var 
        c = new A({
        render : '#t1',
        show : false,
        tplRender : function(v){
          if(v.show){
            return "show";
          }else{
            return "hide";
          }
        }
      }).render();
      var aEl = c.get('el').one('a')
      expect(aEl).toBe(null);
      expect(c.get('el').text()).toBe('hide');
    });
        
    it('测试子控件容器属性',function(){
      var text = 'nihao,hello',
        c = new A({
        render : '#t1',
        tpl : '<div class="container"></div>',
        childContainer : '.container',
        children : [
          {text : text,xclass : 'test', id: 'a'},
          {text : text,xclass : 'test', id : 'b'}
        ]
      }).render();

      var container = c.get('el').one('.container');
      expect(container).not.toBe(null);

      var aEl = container.all('a');
      expect(aEl.length).toBe(c.get('children').length);/**/
    });

  });
  
});