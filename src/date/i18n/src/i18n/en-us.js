/**
 * locale info for KISSY Date
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add('date/i18n/en-us', {
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
    datePatterns: ['EEEE, MMMM d, yyyy', 'MMMM d, yyyy', 'MMM d, yyyy', 'M/d/yy'],
    timePatterns: ['h:mm:ss \'GMT\'Z', 'h:mm:ss a \'GMT\'Z', 'h:mm:ss a', 'h:mm a'],
    dateTimePattern: '{date} {time}'
});