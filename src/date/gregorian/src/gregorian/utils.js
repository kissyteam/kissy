/**
 * utils for gregorian date
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Const=require('./const');
    var ACCUMULATED_DAYS_IN_MONTH
            //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
            = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],

        ACCUMULATED_DAYS_IN_MONTH_LEAP
            //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
            // 10/1   11/1   12/1
            = [ 0, 31, 59 + 1, 90 + 1, 120 + 1, 151 + 1, 181 + 1,
            212 + 1, 243 + 1, 273 + 1, 304 + 1, 334 + 1],

        DAYS_OF_YEAR = 365,
        DAYS_OF_4YEAR = 365 * 4 + 1,
        DAYS_OF_100YEAR = DAYS_OF_4YEAR * 25 - 1,
        DAYS_OF_400YEAR = DAYS_OF_100YEAR * 4 + 1,

        Utils = {};

    function getDayOfYear(year, month, dayOfMonth) {
        return dayOfMonth + (isLeapYear(year) ?
            ACCUMULATED_DAYS_IN_MONTH_LEAP[month] :
            ACCUMULATED_DAYS_IN_MONTH[month]);
    }

    function getDayOfWeekFromFixedDate(fixedDate) {
        // The fixed day 1 (January 1, 1 Gregorian) is Monday.
        if (fixedDate >= 0) {
            return fixedDate % 7;
        }
        return mod(fixedDate, 7);
    }

    function getGregorianYearFromFixedDate(fixedDate) {
        var d0;
        var d1, d2, d3;//, d4;
        var n400, n100, n4, n1;
        var year;
        d0 = fixedDate - 1;

        n400 = floorDivide(d0 / DAYS_OF_400YEAR);
        d1 = mod(d0, DAYS_OF_400YEAR);
        n100 = floorDivide(d1 / DAYS_OF_100YEAR);
        d2 = mod(d1, DAYS_OF_100YEAR);
        n4 = floorDivide(d2 / DAYS_OF_4YEAR);
        d3 = mod(d2, DAYS_OF_4YEAR);
        n1 = floorDivide(d3 / DAYS_OF_YEAR);

        year = 400 * n400 + 100 * n100 + 4 * n4 + n1;

        // ?
        if (!(n100 === 4 || n1 === 4)) {
            ++year;
        }

        return year;
    }

    S.mix(Utils, {
        'isLeapYear': function (year) {
            if ((year & 3) !== 0) {
                return false;
            }
            return (year % 100 !== 0) || (year % 400 === 0);
        },

        mod: function (x, y) {
            // 负数时不是镜像关系
            return (x - y * floorDivide(x / y));
        },

        // month: 0 based
        getFixedDate: function (year, month, dayOfMonth) {
            var prevYear = year - 1;
            // 考虑公元前
            return DAYS_OF_YEAR * prevYear + floorDivide(prevYear / 4) -
                floorDivide(prevYear / 100) + floorDivide(prevYear / 400) +
                getDayOfYear(year, month, dayOfMonth);
        },

        getGregorianDateFromFixedDate: function (fixedDate) {
            var year = getGregorianYearFromFixedDate(fixedDate);
            var jan1 = Utils.getFixedDate(year, Const.JANUARY, 1);
            var isLeap = isLeapYear(year);
            var ACCUMULATED_DAYS = isLeap ? ACCUMULATED_DAYS_IN_MONTH_LEAP : ACCUMULATED_DAYS_IN_MONTH;
            var daysDiff = fixedDate - jan1;
            var month, i;

            for (i = 0; i < ACCUMULATED_DAYS.length; i++) {
                if (ACCUMULATED_DAYS[i] <= daysDiff) {
                    month = i;
                } else {
                    break;
                }
            }

            var dayOfMonth = fixedDate - jan1 - ACCUMULATED_DAYS[month] + 1;
            var dayOfWeek = getDayOfWeekFromFixedDate(fixedDate);

            return {
                year: year,
                month: month,
                dayOfMonth: dayOfMonth,
                dayOfWeek: dayOfWeek,
                isLeap: isLeap
            };
        }
    });

    var floorDivide = Math.floor,
        isLeapYear = Utils.isLeapYear,
        mod = Utils.mod;

    return Utils;
});