/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 25 22:24
*/
/**
 * locale info for KISSY Date
 * @author yiminghe@gmail.com
 */
KISSY.add('intl/date/en-us', function () {
    return {
        // in minutes
        timezoneOffset: -8 * 60,
        firstDayOfWeek: 0,
        minimalDaysInFirstWeek: 1,

        // DateFormatSymbols
        eras: ['BC', 'AD'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
            'Saturday'],
        shortWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        ampms: ['AM', 'PM'],
        datePatterns:['EEEE, MMMM d, yyyy','MMMM d, yyyy','MMM d, yyyy','M/d/yy'],
        timePatterns:['h:mm:ss \'GMT\'Z','h:mm:ss a \'GMT\'Z','h:mm:ss a','h:mm a'],
        dateTimePattern:'{date} {time}'
    };
});
