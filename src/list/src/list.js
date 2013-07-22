/**
 * @fileOverview List 的入口文件
 * @author dxq613@gmail.com
 * @ignore
 */

KISSY.add('list',function (S,List,Render,Selection,Status) {
  
  S.mix(List,{
    Render : Render,
    Selection : Selection,
    Status : Status
  });
  return List;
},{
  requires : ['list/control','list/render','list/selection','list/status']
});