/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:36
*/
/*
 Combined modules by KISSY Module Compiler: 

 component/manager
*/

KISSY.add("component/manager", [], function(S) {
  var basePriority = 0, Manager, uis = {}, componentInstances = {};
  Manager = {__instances:componentInstances, addComponent:function(component) {
    componentInstances[component.get("id")] = component
  }, removeComponent:function(component) {
    delete componentInstances[component.get("id")]
  }, getComponent:function(id) {
    return componentInstances[id]
  }, createComponent:function(component, parent) {
    var ChildConstructor, xclass;
    if(component) {
      if(!component.isControl && parent) {
        if(!component.prefixCls) {
          component.prefixCls = parent.get("prefixCls")
        }
        if(!component.xclass && component.prefixXClass) {
          component.xclass = component.prefixXClass;
          if(component.xtype) {
            component.xclass += "-" + component.xtype
          }
        }
      }
      if(!component.isControl && (xclass = component.xclass)) {
        ChildConstructor = Manager.getConstructorByXClass(xclass);
        if(!ChildConstructor) {
          S.error("can not find class by xclass desc : " + xclass)
        }
        component = new ChildConstructor(component)
      }
      if(component.isControl && parent) {
        component.setInternal("parent", parent)
      }
    }
    return component
  }, getConstructorByXClass:function(classNames) {
    var cs = classNames.split(/\s+/), p = -1, t, i, uic, ui = null;
    for(i = 0;i < cs.length;i++) {
      uic = uis[cs[i]];
      if(uic && (t = uic.priority) > p) {
        p = t;
        ui = uic.constructor
      }
    }
    return ui
  }, setConstructorByXClass:function(className, ComponentConstructor) {
    uis[className] = {constructor:ComponentConstructor, priority:basePriority++}
  }};
  return Manager
});

