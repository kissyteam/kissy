/**
 * utils for gregorian date
 * @author yiminghe@gmail.com
 */
KISSY.add('date/gregorian/utils', function (S) {

    var ACCUMULATED_DAYS_IN_MONTH
        //   1/1 2/1 3/1 4/1 5/1 6/1 7/1 8/1 9/1 10/1 11/1 12/1
        = [-31, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    var ACCUMULATED_DAYS_IN_MONTH_LEAP
        //   1/1 2/1   3/1   4/1   5/1   6/1   7/1   8/1   9/1
        // 10/1   11/1   12/1
        = [-31, 0, 31, 59 + 1, 90 + 1, 120 + 1, 151 + 1, 181 + 1,
        212 + 1, 243 + 1, 273 + 1, 304 + 1, 334 + 1];

    var JANUARY = 1,
        FEBRUARY = 2;//,
//        MARCH = 3,
//        APRIL = 4,
//        MAY = 5,
//        JUNE = 6,
//        JULY = 7,
//        AUGUST = 8,
//        SEPTEMBER = 9,
//        OCTOBER = 10,
//        NOVEMBER = 11,
//        DECEMBER = 12;

    var Utils = {},
        toInt = parseInt;

    var BASE_YEAR = 1970;

    var FIXED_DATES = [
        719163, // 1970
        719528, // 1971
        719893, // 1972
        720259, // 1973
        720624, // 1974
        720989, // 1975
        721354, // 1976
        721720, // 1977
        722085, // 1978
        722450, // 1979
        722815, // 1980
        723181, // 1981
        723546, // 1982
        723911, // 1983
        724276, // 1984
        724642, // 1985
        725007, // 1986
        725372, // 1987
        725737, // 1988
        726103, // 1989
        726468, // 1990
        726833, // 1991
        727198, // 1992
        727564, // 1993
        727929, // 1994
        728294, // 1995
        728659, // 1996
        729025, // 1997
        729390, // 1998
        729755, // 1999
        730120, // 2000
        730486, // 2001
        730851, // 2002
        731216, // 2003
        731581, // 2004
        731947, // 2005
        732312, // 2006
        732677, // 2007
        733042, // 2008
        733408, // 2009
        733773, // 2010
        734138, // 2011
        734503, // 2012
        734869, // 2013
        735234, // 2014
        735599, // 2015
        735964, // 2016
        736330, // 2017
        736695, // 2018
        737060, // 2019
        737425, // 2020
        737791, // 2021
        738156, // 2022
        738521, // 2023
        738886, // 2024
        739252, // 2025
        739617, // 2026
        739982, // 2027
        740347, // 2028
        740713, // 2029
        741078, // 2030
        741443, // 2031
        741808, // 2032
        742174, // 2033
        742539, // 2034
        742904, // 2035
        743269, // 2036
        743635, // 2037
        744000, // 2038
        744365 // 2039
    ];

    function getDayOfYear(year, month, dayOfMonth) {
        return dayOfMonth + (isLeapYear(year) ?
            ACCUMULATED_DAYS_IN_MONTH_LEAP[month] :
            ACCUMULATED_DAYS_IN_MONTH[month]);
    }

    function getDayOfWeekFromFixedDate(fixedDate) {
        // The fixed day 1 (January 1, 1 Gregorian) is Monday.
        if (fixedDate >= 0) {
            // 1 -> sunday
            return (fixedDate % 7) + 1;
        }
        return mod(fixedDate, 7) + 1;
    }

    function getGregorianYearFromFixedDate(fixedDate) {
        var d0;
        var d1, d2, d3;//, d4;
        var n400, n100, n4, n1;
        var year;

        if (fixedDate > 0) {
            d0 = fixedDate - 1;
            n400 = toInt(d0 / 146097);
            d1 = (d0 % 146097);
            n100 = toInt(d1 / 36524);
            d2 = d1 % 36524;
            n4 = toInt(d2 / 1461);
            d3 = d2 % 1461;
            n1 = toInt(d3 / 365);
            //d4 = (d3 % 365) + 1;
        } else {
            d0 = fixedDate - 1;
            n400 = floorDivide(d0, 146097);
            d1 = mod(d0, 146097);
            n100 = Utils.floorDivide(d1, 36524);
            d2 = mod(d1, 36524);
            n4 = floorDivide(d2, 1461);
            d3 = mod(d2, 1461);
            n1 = floorDivide(d3, 365);
            //d4 = mod(d3, 365) + 1;
        }
        year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
        if (!(n100 == 4 || n1 == 4)) {
            ++year;
        }

        return year;
    }

    S.mix(Utils, {

        'isLeapYear': function (year) {
            if ((year & 3) != 0) {
                return false;
            }
            return (year % 100 != 0) || (year % 400 == 0);
        },

        /**
         * @ignore
         * @param n
         * @param d
         * @param [r]
         * @returns {number}
         */
        floorDivide: function (n, d, r) {
            if (n >= 0) {
                if (r) {
                    r[0] = n % d;
                }

                return toInt(n / d);
            }
            var q = toInt((n + 1) / d) - 1;
            if (r) {
                r[0] = n - (q * d);
            }
            return q;
        },

        mod: function (x, y) {
            return (x - y * floorDivide(x, y));
        },

        // month: 0 based
        getFixedDate: function (year, month, dayOfMonth) {
            // 0 based to 1 based
            month++;

            // gregorian stars with 0
            // utils starts with 1
            var isJan1 = month == JANUARY && dayOfMonth == 1;
            var n = year - BASE_YEAR;
            if (n >= 0 && n < FIXED_DATES.length) {
                var jan1 = FIXED_DATES[n];
                return isJan1 ? jan1 : jan1 + getDayOfYear(year, month, dayOfMonth) - 1;
            }
            var prevYear = year - 1;
            var days = dayOfMonth;

            if (prevYear >= 0) {
                days += 365 * prevYear +
                    toInt(prevYear / 4) -
                    toInt(prevYear / 100) +
                    toInt(prevYear / 400) +
                    toInt((367 * month - 362) / 12);
            } else {
                days += (365 * prevYear) +
                    floorDivide(prevYear, 4) -
                    floorDivide(prevYear, 100) +
                    floorDivide(prevYear, 400) +
                    floorDivide((367 * month - 362), 12);
            }
            if (month > FEBRUARY) {
                days -= isLeapYear(year) ? 1 : 2;
            }
            return days;
        },

        getGregorianDateFromFixedDate: function (fixedDate) {
            var year = getGregorianYearFromFixedDate(fixedDate);
            var jan1 = Utils.getFixedDate(year, JANUARY - 1, 1);
            var isLeap = isLeapYear(year);
            var priorDays = fixedDate - jan1;
            var mar1 = jan1 + 31 + 28;
            if (isLeap) {
                mar1++;
            }
            if (fixedDate >= mar1) {
                priorDays += isLeap ? 1 : 2;
            }
            var month = 12 * priorDays + 373;
            if (month > 0) {
                month = toInt(month / 367);
            } else {
                month = floorDivide(month, 367);

            }

            var month1 = jan1 + ACCUMULATED_DAYS_IN_MONTH[month];

            if (isLeap && month > FEBRUARY) {
                ++month1;
            }

            var dayOfMonth = fixedDate - month1 + 1;
            var dayOfWeek = getDayOfWeekFromFixedDate(fixedDate);

            return {
                year: year,
                // to 0 based
                month: month - 1,
                dayOfMonth: dayOfMonth,
                dayOfWeek: dayOfWeek,
                isLeap: isLeap
            };
        }

    });

    var floorDivide = Utils.floorDivide,
        isLeapYear = Utils.isLeapYear,
        mod = Utils.mod;

    return Utils;

});