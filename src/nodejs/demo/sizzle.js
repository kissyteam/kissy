
var S = require('../../../build/kissy-nodejs');

// S.log(S);

S.use('sizzle',function(S){
	document.body.innerHTML = '<div id="J_calendar"><ul><li>first li</li><li>second li</li></ul></div>';
	S.log(S.one('body li:eq(1)').html());
});
