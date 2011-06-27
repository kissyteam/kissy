KISSY.ready(function(S){
	var DOM = S.DOM, Event = S.Event;
	var panel = DOM.get("#viewcode"), pre = DOM.get("pre",panel), handler = DOM.get("h3",panel), democode = DOM.get("#democode");
	pre.innerText = DOM.get(".doc").innerHTML;
	//SyntaxHighlighter.config.clipboardSwf = 'src/js/syntaxhighlighter/scripts/clipboard.swf';
	SyntaxHighlighter.all();	
	
	Event.on(handler,"click",function(){
		DOM.toggle(democode);
	});
	

		//DOM.css(democode,"visibility","hidden");
		DOM.hide(democode);

	
});





