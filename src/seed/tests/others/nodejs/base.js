var KISSY = require('../../../../../build/kissy-nodejs').KISSY;

var path=require('./path');

var x=path.resolve(path.resolve('d:\\timer.js','./'),'.\\');

console.log(x);

KISSY.use('base',function(S,Base) {
    // 自定义类
    // 继承 Base
   var MyClass= Base.extend({},{
       ATTRS:{
           size: {
               value: 0,
               setter: function(v) {
                   if (typeof v == 'string' && v.indexOf('inch')!== -1) {
                       return parseFloat(v)*10/3;
                   }
                   return parseFloat(v);
               },
               getter: function(v) {
                   return v;
               }
           }
       }
   });

    var cls = new MyClass();

    // 绑定事件
    cls.on('afterSizeChange', function(ev){
        S.log('change '+ ev.attrName + ': '+ev.prevVal+' --> '+ev.newVal);
    });

    // 设置属性
    cls.set('size', 20);

    // 获取属性
    S.log(cls.get('size'));

    // 重置
    cls.reset();
    S.log(cls.get('size'));
});

