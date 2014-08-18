/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/outdent/cmd",["editor","../dent-cmd"],function(h,b){var d=b("editor"),e=b("../dent-cmd"),f=e.addCommand,g=e.checkOutdentActive;return{init:function(c){f(c,"outdent");var b=d.Utils.getQueryCmd("outdent");c.hasCommand(b)||c.addCommand(b,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new d.ElementPath(a),g(a)}})}}});
