
var S = KISSY;

// 默认内置模块调用场景:
// 页面只需引入 ks-seed.js, 然后
S.use('switchable', function() {
   // init code
});
// 内部模块仅支持大粒度，如：ks-core, sizzle, flash, switchable, suggest


// 自定义模块调用场景：
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


// 目前的传统方式：
// 页面引入 mod-xx.js, 文件里面用 KISSY.add('mod-xx', fn) 组织
(function() {
    // 直接调用 mod-xx
})();
// 或
S.ready(function() {
   // 直接调用 mod-xx
});


// insert 方式：
// 页面引入 seed.js
S.insert({
    fullpath: 'url',
    requires: ['xx']
});


// 非 combo 方式：在 use 或 insert 处，立刻发起请求
// combo 方式：在 dom ready 时才发起请求

