﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 7 19:26
*/
/**
 * locale info for KISSY Date
 * @author yiminghe@gmail.com
 */
KISSY.add('date/i18n/zh-cn', {
    // in minutes
    timezoneOffset: 8 * 60,
    firstDayOfWeek: 1,
    minimalDaysInFirstWeek: 1,

    // DateFormatSymbols
    eras: ['公元前', '公元'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'],
    shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'],
    weekdays: ['星期天', '星期一', '星期二', '星期三', '星期四',
        '星期五', '星期六'],
    shortWeekdays: ['周日', '周一', '周二', '周三', '周四', '周五',
        '周六'],
    ampms: ['上午', '下午'],
    datePatterns: ["yyyy'年'M'月'd'日' EEEE", "yyyy'年'M'月'd'日'", "yyyy-M-d", "yy-M-d"],
    timePatterns: ["ahh'时'mm'分'ss'秒' 'GMT'Z", "ahh'时'mm'分'ss'秒'", "H:mm:ss", "ah:mm"],
    dateTimePattern: '{date} {time}'
});
