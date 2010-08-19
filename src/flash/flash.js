/**
 * @module   Flash 全局静态类
 * @author   kingfo<oicuicu@gmail.com>
 */
KISSY.add('flash', function(S){
	
	S.Flash = {
		/**
		 * flash 实例 map { '#id': elem, ... }
         * @static
		 */
		swfs: { },
		length: 0
	};

}, { requires: ['core'] });
