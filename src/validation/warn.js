/**
 * 信息提示类及管理
 * @validationor: 常胤 <lzlu.com>
 */

KISSY.add("validation/warn", function(S, Util, Warn, BaseClass, Alert, Static, Float, Fixed) {

	/**
	 * 增加三种自带的样式
	 */
	Warn.extend("Alert",Alert);
	Warn.extend("Static",Static);
	Warn.extend("Float",Float);
	Warn.extend("Fixed",Float);
	

	//提示类基类，方便用户自己扩展
	Warn.BaseClass = BaseClass;
	

	return Warn;
		
}, { requires: ["validation/utils","validation/warn/base","validation/warn/baseclass","validation/warn/alert","validation/warn/static","validation/warn/float","validation/warn/fixed"] });