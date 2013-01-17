#  KISSY for NodeJS

nodejs-kissy 实现了将 kissy 移植到 nodeJS 上运行

##  通过NPM安装 nodejs-kissy

需要预装 npm

`npm install kissy`

##  通过源码安装 nodejs-kissy

需要预装 npm 和 git

    git clone git://github.com/kissyteam/kissy.git
    cd kissy/
    npm install .

## Hello World

新建文件test.js

    var S = require('kissy');
    S.ready(function(S){
	    S.log('hello world!');
    });

运行

`node test.js`

##  Using KISSY

<!--
"KISSY-Calendar Demo"://gist.github.com/662117
-->

[KISSY-Overlay Demo](http://gist.github.com/1703698)

##  License

KISSY 遵守 [MIT](https://github.com/kissyteam/kissy/blob/master/LICENSE.md) 协议
