# anim

## 1.4

 - [+] anim support promise api. deprecated ``on`` method
 - [+] anim 增加自定义机制 {backgroundPosition:{easing:,frame:function(){}}}
 - [+] anim 支持普通对象动画 new Anim({a:1},{a:2},{frame:function(anim,fx){}}).run();
 - [+] anim 支持 cubic-bezier easing
 - [+] anim 支持 useTransition 配置使用 css3 transition 提高性能
 - [*] support cross-browser css transform

         new Anim(t,{'transform':'rotate(39deg) skew(40deg)'}).run();
