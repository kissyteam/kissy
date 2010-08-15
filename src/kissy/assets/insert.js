KISSY.add('insert',function(S){
	S.log('11111111111111111');
	YUI({
		charset:'utf-8',
		modules:{
			'calendar':{
				fullpath:'http://cubee.github.com/src/calendar/calendar.js',
				requires:['node']
			}
		}
	}).use('calendar',function(Y){
		new Y.Calendar('J_calendar');
	});
});

KISSY.ready(function(S){
	S.log('dom ready 2');
});
