/**
 * @fileOverview 信息提示类及管理
 * @author 常胤 <lzlu.com>
 */

KISSY.add("validation/warn", function(S, Util, Warn, BaseClass, Alert, Static, Float) {

    /**
     * 增加三种自带的样式
     */
    Warn.extend("Alert", Alert);
    Warn.extend("Static", Static);
    Warn.extend("Float", Float);


    //提示类基类，方便用户自己扩展
    Warn.BaseClass = BaseClass;
    return Warn;

}, { requires: ["./utils","./warn/base","./warn/baseclass","./warn/alert","./warn/static","./warn/float"] });