/**
 * @fileOverview  Validation默认配置和常量
 * @author 常胤 (lzlu.com)
 */

KISSY.add("validation/define",function(){
	
	var Define = {};
	
	//默认配置
	Define.Config = {
		/**
		 * 伪属性配置名称
		 */
		attrname: 'data-valid',
		/**
		 * 自动生成的字段ID的前缀
		 */
		prefix: "auth-f",
		/**
		 * 默认消息提示类型
		 */
		defaultwarn: "alert"
	};
	
	
	//常量定义
	Define.Const = {
		/**
		 * 字段校验状态枚举
		 * error 错误
		 * ok 正确
		 * hint 提示
		 * ignore 忽略
		 */
		enumvalidsign: {
			error: 0,
			ok: 1,
			hint: 2,
			ignore: 3
		}
	};

	return Define
	
});
