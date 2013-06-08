/**
 * tests for gregorian date
 * @author yiminghe@gmail.com
 */
KISSY.use('date/gregorian', function (S, GregorianDate) {

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    // var ONE_WEEK = 7 * ONE_DAY;

    describe('GregorianDate', function () {

        var jsDate, date;

        beforeEach(function () {
            jsDate = new Date(2013, GregorianDate.JUNE, 8, 18, 0, 0, 0);
            date = new GregorianDate(jsDate.getTime());
        });

        it('time works', function () {
            expect(date.get(GregorianDate.YEAR)).toBe(2013);
            expect(date.get(GregorianDate.MONTH)).toBe(5);
            expect(date.get(GregorianDate.DATE)).toBe(8);
            expect(date.get(GregorianDate.HOUR)).toBe(6);
            expect(date.get(GregorianDate.AM_PM)).toBe(GregorianDate.PM);
            expect(date.get(GregorianDate.HOUR_OF_DAY)).toBe(18);
            expect(date.get(GregorianDate.MINUTE)).toBe(0);
            expect(date.get(GregorianDate.SECOND)).toBe(0);
            expect(date.get(GregorianDate.MILLISECOND)).toBe(0);
        });

        it('WEEK_OF_YEAR works', function () {
            expect(date.get(GregorianDate.WEEK_OF_YEAR)).toBe(23);
        });

        it('DAY_OF_WEEK works', function () {
            expect(date.get(GregorianDate.DAY_OF_WEEK)).toBe(GregorianDate.SATURDAY);
        });

        it('WEEK_OF_MONTH works', function () {
            expect(date.get(GregorianDate.WEEK_OF_MONTH)).toBe(2);
        });

        it('ERA works', function () {
            expect(date.get(GregorianDate.ERA)).toBe(GregorianDate.AD);
        });

        it('DAY_OF_WEEK_IN_MONTH works', function () {
            expect(date.get(GregorianDate.DAY_OF_WEEK_IN_MONTH)).toBe(2);
        });

        it('DAY_OF_YEAR works', function () {
            var jan1Date = new Date(2013, GregorianDate.JANUARY, 1, 0, 0, 0, 0);
            var expected = parseInt((jsDate.getTime() - jan1Date.getTime()) / ONE_DAY)+1;
            expect(date.get(GregorianDate.DAY_OF_YEAR)).toBe(expected);
        });

    });

});