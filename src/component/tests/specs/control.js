KISSY.add(function (S,Control) {
  
  describe('测试控件生命周期',function(){

    describe('测试control与view的生成',function(){

      it('control 生成',function(){

      });
      it('view 生成',function(){

      });
      it('生成过程中的事件',function(){

      });
      it('测试延迟执行的函数',function(){

      });
    });



    describe('测试控件与mixin',function(){

      it('测试mixin生效',function(){

      });

      it('测试mixin覆盖',function(){

      });
    });

    describe('测试控件与plugin',function(){

      it('测试Plugin的生成',function(){

      });

    });

    describe('测试控件与子控件',function(){

      it('测试父子包含关系',function(){

      });

      it('测试查找子控件',function(){

      });

      it('测试查找父控件',function(){

      });

      it('父子控件的mixin应用',function(){

      });
    });

    describe('测试控件生命周期',function(){

      it('测试control与view的生成顺序',function(){

      });
      it('测试control与mixin的执行顺序',function(){

      });

      it('测试control与plugin的执行顺序',function(){

      });

      it('测试control与子控件的执行顺序',function(){

      });

      describe('析构函数执行',function(){

      });
    });
  });

  describe('测试控件配置项',function(){

  });

  describe('测试tpl',function(){
    it('初始化配置tpl',function(){

    });

    it('修改tpl',function(){

    });
  });

  describe('测试控件基本操作',function(){
    describe('设置属性',function(){

    });

    describe('control与view的同步',function(){

    });
    describe('事件操作',function(){

      it('初始化时添加事件',function(){

      });
      it('注册事件',function(){

      });
      it('释放事件',function(){

      });

    });
    it('显示',function(){

    });

    it('隐藏',function(){

    });

    it('获取焦点',function(){

    });

    it('丢失焦点焦点',function(){

    });

    it('测试移动',function(){

    });
  });

  describe('测试控件事件',function(){

    it('鼠标点击',function(){

    });

    it('键盘事件',function(){

    });

    it('disabled状态下触发事件',function(){

    });
  });

  describe('测试继承及类管理',function(){

    it('继承extend静态方法',function(){

    });

    it('测试调试信息',function(){

    });

    it('获取类信息',function(){

    });

  });


},{
    requires:['component/control']
});