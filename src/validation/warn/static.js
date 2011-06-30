/**
 * 提示类：Static
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/static", function(S, DOM, Event, Util, Define) {
	var symbol = Define.Const.enumvalidsign;
	
	function Static(){
		return {
			init: function(){
				var self = this, tg = self.target,
					panel,label,estate;
					
				panel = DOM.create(self.template);
				estate = DOM.get('.estate',panel), label = DOM.get('.label',panel);
				tg.parentNode.appendChild(panel);
				DOM.hide(panel);
				
				S.mix(self,{
					panel: panel,
					estate: estate,
					label: label
				})
				
				self._bindEvent(self.el, self.event ,function(ev){
					var result = self.fire("valid",{event:ev.type});
					if(S.isArray(result) && result.length==2){
						self.showMessage(result[1],result[0],ev.type);
					}
				})
			},

			showMessage: function(result,msg,evttype) {
				var self = this,
					panel = self.panel, estate = self.estate, label = self.label;	
				
				if(self.invalidClass){
					if(result==symbol.ignore && result==symbol.ok){
						DOM.removeClass(self.el,self.invalidClass);
					}else{
						DOM.addClass(self.el,self.invalidClass);
					}
				}

				if(result==symbol.ignore){
					DOM.hide(panel);
				}else{
					var est = "error";
					if(result==symbol.error){
						est= "error";
					}else if(result==symbol.ok){
						est = "ok";
					}else if(result==symbol.hint){
						est = "tip";
					}
					DOM.removeClass(estate,"ok tip error");
					DOM.addClass(estate,est);
					DOM.html(label,msg);
					DOM.show(panel);	
				}
			},
			
			style: {
				text: {
					template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
					event: 'focus blur keyup'
				},
				siderr: {
					template: '<div class="valid-siderr"><p class="estate"><s></s><span class="label"></span></p></div>',
					event: 'focus blur keyup'
				},
				under: {
					template: '<div class="valid-under"><p class="estate"><span class="label"></span></p></div>',
					event: 'focus blur keyup'
				},
				sidebd: {
					template: '<div class="valid-sidebd"><p class="estate"><span class="label"></span></p></div>',
					event: 'focus blur'
				}
			}
			
	
		}
	}

	return Static;

}, { requires: ['dom',"event","../utils","../define"] });

