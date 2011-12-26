/**
 * @fileOverview 扩展提示类:alert
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/alert", function(S, DOM, Event, Util, Define) {
	var symbol = Define.Const.enumvalidsign;

	function Alert(){
		return {
			init: function(){
				this.single = true;
			},
			showMessage: function(estate,msg) {
				var self = this;
				if(estate == symbol.error){
					self.invalidClass&&DOM.addClass(self.target,self.invalidClass);
					alert(msg);
					self.target.focus();
					return false;
				}else{
					self.invalidClass&&DOM.removeClass(self.target, self.invalidClass);
				}
			},
			style:{
				alert:{
					invalidClass:'vailInvalid'
				}
			}
		}
	}
	
	return Alert;

}, { requires: ['dom',"event","../utils","../define"] });
























	
	
	

