/**
 * 增加默认的三种提示类
 * @validationor: 常胤 <lzlu.com>
 */

KISSY.add("validation/warn/manage", function(S, Warn, Alert, Static, Float) {

	Warn.extend("Alert",Alert);
	Warn.extend("Static",Static);
	Warn.extend("Float",Float);

	
}, {requires: [
			"validation/warn/base",
			"validation/warn/alert","validation/warn/static","validation/warn/float"
		]}
);