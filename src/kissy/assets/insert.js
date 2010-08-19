KISSY.add('insert', function(S){
	S.log('insert is attached');
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

