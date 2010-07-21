/**
 * @author kingfo  oicuicu@gmail.com
 */
KISSY.add("flash",function(S){
	
	KISSY.Flash = {
		/**
		 * 静态
		 * Flash实例存储对象  是hashmap
		 * 按id存储
		 */
		swfs:(S.Flash || { }).swfs || { },
		/**
		 * 静态
		 * 按序存储 flash id
		 */
		names:(S.Flash || { }).names || []
	};
	
	
	
});
