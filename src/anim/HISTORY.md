# anim

## 1.4

 - [+] anim 增加自定义机制 {backgroundPosition:{easing:,fx:{frame:function(){}}}}
 - [+] anim 支持 cubic-bezier easing
 - [+] anim 支持 useTransition 配置使用 css3 transition 提高性能
 - [*] support cross-browser css transform

         new Anim(t,{'transform':'rotate(39deg) skew(40deg)'}).run();
