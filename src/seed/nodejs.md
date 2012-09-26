h1.  KISSY for NodeJS

nodejs-kissy 实现了将 kissy 移植到 nodeJS 上运行

h1.  通过NPM安装 nodejs-kissy

需要预装 npm

<pre class="console">npm install KISSY</pre>

h1.  通过源码安装 nodejs-kissy

需要预装 npm 和 git

<pre class="console">git clone git://github.com/kissyteam/kissy.git
cd kissy/
npm install .</pre>

h1. Hello World

新建文件test.js

<pre class="console">var S = require('KISSY');
S.ready(function(S){
	S.log('hello world!');
});</pre>

运行

<pre class="console">node test.js</pre>

h1.  Using KISSY

<!--
"KISSY-Calendar Demo"://gist.github.com/662117
-->

"KISSY-Overlay Demo"://gist.github.com/1703698

h1.  License

KISSY 遵守 "MIT":https://github.com/kissyteam/kissy/blob/master/LICENSE.md 协议
