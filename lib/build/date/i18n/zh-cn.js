/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:54
*/
/*
combined modules:
date/i18n/zh-cn
*/
KISSY.add('date/i18n/zh-cn', [], function (S, require, exports, module) {
    /**
 * locale info for KISSY Date
 * @ignore
 * @author yiminghe@gmail.com
 */
    module.exports = {
        // in minutes
        timezoneOffset: 8 * 60,
        firstDayOfWeek: 1,
        minimalDaysInFirstWeek: 1,
        // DateFormatSymbols
        eras: [
            '\u516C\u5143\u524D',
            '\u516C\u5143'
        ],
        months: [
            '\u4E00\u6708',
            '\u4E8C\u6708',
            '\u4E09\u6708',
            '\u56DB\u6708',
            '\u4E94\u6708',
            '\u516D\u6708',
            '\u4E03\u6708',
            '\u516B\u6708',
            '\u4E5D\u6708',
            '\u5341\u6708',
            '\u5341\u4E00\u6708',
            '\u5341\u4E8C\u6708'
        ],
        shortMonths: [
            '\u4E00\u6708',
            '\u4E8C\u6708',
            '\u4E09\u6708',
            '\u56DB\u6708',
            '\u4E94\u6708',
            '\u516D\u6708',
            '\u4E03\u6708',
            '\u516B\u6708',
            '\u4E5D\u6708',
            '\u5341\u6708',
            '\u5341\u4E00\u6708',
            '\u5341\u4E8C\u6708'
        ],
        weekdays: [
            '\u661F\u671F\u5929',
            '\u661F\u671F\u4E00',
            '\u661F\u671F\u4E8C',
            '\u661F\u671F\u4E09',
            '\u661F\u671F\u56DB',
            '\u661F\u671F\u4E94',
            '\u661F\u671F\u516D'
        ],
        shortWeekdays: [
            '\u5468\u65E5',
            '\u5468\u4E00',
            '\u5468\u4E8C',
            '\u5468\u4E09',
            '\u5468\u56DB',
            '\u5468\u4E94',
            '\u5468\u516D'
        ],
        ampms: [
            '\u4E0A\u5348',
            '\u4E0B\u5348'
        ],
        /*jshint quotmark: false*/
        datePatterns: [
            'yyyy\'\u5E74\'M\'\u6708\'d\'\u65E5\' EEEE',
            'yyyy\'\u5E74\'M\'\u6708\'d\'\u65E5\'',
            'yyyy-M-d',
            'yy-M-d'
        ],
        timePatterns: [
            'ahh\'\u65F6\'mm\'\u5206\'ss\'\u79D2\' \'GMT\'Z',
            'ahh\'\u65F6\'mm\'\u5206\'ss\'\u79D2\'',
            'H:mm:ss',
            'ah:mm'
        ],
        dateTimePattern: '{date} {time}'
    };
});
