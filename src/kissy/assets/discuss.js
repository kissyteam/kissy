
var S = KISSY;

// 一、默认内置模块调用场景:
// 页面只需引入 ks-seed.js, 然后
S.use('switchable', function() {
   // init code
});
// 内部模块仅支持大粒度，如：ks-core, sizzle, flash, switchable, suggest


// 二、自定义模块调用场景：
// 引入 seed.js
S.add({
   'mod-xx': {
       fullpath: 'path/to/file',
       requires: ['ks-core']
   }
});
S.use('mod-xx', function() {
   // init code
});


// 三、目前的传统方式：
// 页面引入 mod-xx.js, 文件里面用 KISSY.add('mod-xx', fn) 组织
(function() {
    // 直接调用 mod-xx
})();
// 或
S.ready(function() {
   // 直接调用 mod-xx
});


// 四、insert/import/include 匿名模块：
// 页面引入 seed.js
S.use({
    fullpath: 'url',
    requires: ['xx']
});


// 五、everyThingIsReady 模式： loaderReady ?
S.use('mod1','mod2');
//html code
S.allReady(function(){
   // loader 的 modules 都加载完毕 + dom 已 ready 时才执行
});



// 非 combo 方式：在 use 或 insert 处，立刻发起请求
// combo 方式：在 dom ready 时才发起请求

