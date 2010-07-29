/**
 * @module   Flash 全局静态类
 * @author   kingfo<oicuicu@gmail.com>
 * @depends  ks-core
 */
KISSY.add('flash', function(S){
	
	S.Flash = {
		/**
		 * flash 实例 map, key 为 id
         * @static
		 */
		swfs: {},

		/**
		 * 按序存储 flash id
         * @static
		 */
		names: []
	};
});
