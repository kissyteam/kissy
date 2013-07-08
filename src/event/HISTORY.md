# event

## 1.4

 - [+] 支持 Event.on(target,type,opts), opts 可以是对象描述，例如 opts.once/opts.filter
 - [+] 支持 Event.on(target,opts), opts 为事件与对象描述对

        Event.on(document.body,{
            'click':{
                fn:function(){
                },
                filter: '' // delegate,
                once:true // 绑定一次
            },
            'mouseenter':function(){}
        });

 - [+] Event.detach 支持 deep ，递归移除子节点事件

        Event.detach(document.body,{
            'click':{
                deep:true
            }
        });
        Event.detach(document.body,{
            // 全部事件
            '':{
                deep:true
            }
        });

 - [*] support windows8 touch