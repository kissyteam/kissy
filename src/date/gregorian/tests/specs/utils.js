/**
 * tests for gregorian gregorianCalendar
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, GregorianCalendar) {

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    // var ONE_WEEK = 7 * ONE_DAY;

    var Utils = GregorianCalendar.Utils;

    var day1 = new Date(1, 0, 1);
    day1.setFullYear(1);

    function getDiffByDays(day2) {
        return parseInt((day2.getTime() - day1.getTime()) / ONE_DAY) + 1;
    }

    describe('GregorianCalendar Utils', function () {

        it('mod works', function () {
            expect(Utils.mod(8, 7)).toBe(1);
            expect(Utils.mod(7, 7)).toBe(0);
            expect(Utils.mod(-8, 7)).toBe(6);
            expect(Utils.mod(-7, 7)).toBe(0);
        });


        it('getFixedDate works', function () {
            var d = new Date(2013, 0, 3, 0, 0, 0, 0);
            expect(getDiffByDays(d)).toBe(734869 + 2);

            d = new Date(2013, 0, 1, 0, 0, 0, 0);
            expect(getDiffByDays(d)).toBe(734869);
            expect(getDiffByDays(d)).toBe(Utils.getFixedDate(2013, 0, 1));

            d = new Date(3013, 4, 3, 0, 0, 0, 0);
            expect(getDiffByDays(d)).toBe(Utils.getFixedDate(3013, 4, 3));


            d = new Date(-3013, 4, 3, 0, 0, 0, 0);
            expect(getDiffByDays(d)).toBe(Utils.getFixedDate(-3013, 4, 3));
        });


        it('getGregorianDateFromFixedDate works', function () {
            var d = new Date(2013, 0, 3, 0, 0, 0, 0);
            var d2 = Utils.getGregorianDateFromFixedDate(Utils.getFixedDate(2013, 0, 3));
            expect(d2.year).toBe(d.getFullYear());
            expect(d2.month).toBe(d.getMonth());
            expect(d2.dayOfMonth).toBe(d.getDate());
            expect(d2.dayOfWeek).toBe(d.getDay());

            d = new Date(2013, 0, 1, 0, 0, 0, 0);
            d2 = Utils.getGregorianDateFromFixedDate(Utils.getFixedDate(2013, 0, 1));
            expect(d2.year).toBe(d.getFullYear());
            expect(d2.month).toBe(d.getMonth());
            expect(d2.dayOfMonth).toBe(d.getDate());
            expect(d2.dayOfWeek).toBe(d.getDay());

            d = new Date(3013, 3, 1, 0, 0, 0, 0);
            d2 = Utils.getGregorianDateFromFixedDate(Utils.getFixedDate(3013, 3, 1));
            expect(d2.year).toBe(d.getFullYear());
            expect(d2.month).toBe(d.getMonth());
            expect(d2.dayOfMonth).toBe(d.getDate());
            expect(d2.dayOfWeek).toBe(d.getDay());
        });
    });

},{
        requires:['date/gregorian']
    });