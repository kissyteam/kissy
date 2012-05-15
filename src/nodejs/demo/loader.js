
var S = require('../../../build/kissy-nodejs');
var path=require("path");
/**
 * 包配置
 */
S.config({
    packages:[{
        name:'example',
        path:path.dirname(__filename)+'/../'
    }]
});

/**
 * 使用use add来启动程序 
 */
S.add('abc',function(S){
	return 'add abc ok';
});
S.use('abc',function(S,a){
	S.log(a);
});


/**
 * 引入外部文件
 */
S.use('example/extra', function(S,extra) {
    S.log(extra);
});

/**
 * 使用S.ready启动程序
 */
S.ready(function(S) {
    S.log('S.ready ok');
});

/**
 * 引入内部模块ajax
 */
S.use('ajax', function(S) {
    S.log('ajax ok');
});

