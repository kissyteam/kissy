/**
 * tests for gregorian gregorianDate
 * @author yiminghe@gmail.com
 */
KISSY.use('date/gregorian', function (S, GregorianCalendar) {

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    // var ONE_WEEK = 7 * ONE_DAY;

    describe('GregorianCalendar', function () {


        describe('simple case',function(){
            var gregorianDate;

            beforeEach(function () {
                gregorianDate = new GregorianCalendar();
                gregorianDate.set(2013, GregorianCalendar.JUNE, 8, 18, 0, 0, 0);
            });

            it('time works', function () {
                expect(gregorianDate.get(GregorianCalendar.YEAR)).toBe(2013);
                expect(gregorianDate.get(GregorianCalendar.MONTH)).toBe(5);
                expect(gregorianDate.get(GregorianCalendar.DAY_OF_MONTH)).toBe(8);
                expect(gregorianDate.get(GregorianCalendar.HOUR_OF_DAY)).toBe(18);
                expect(gregorianDate.get(GregorianCalendar.MINUTE)).toBe(0);
                expect(gregorianDate.get(GregorianCalendar.SECOND)).toBe(0);
                expect(gregorianDate.get(GregorianCalendar.MILLISECOND)).toBe(0);
            });

            it('WEEK_OF_YEAR works', function () {
                expect(gregorianDate.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(23);
            });

            it('DAY_OF_WEEK works', function () {
                expect(gregorianDate.get(GregorianCalendar.DAY_OF_WEEK)).toBe(GregorianCalendar.SATURDAY);
            });

            it('WEEK_OF_MONTH works', function () {
                expect(gregorianDate.get(GregorianCalendar.WEEK_OF_MONTH)).toBe(2);
            });

            it('DAY_OF_WEEK_IN_MONTH works', function () {
                expect(gregorianDate.get(GregorianCalendar.DAY_OF_WEEK_IN_MONTH)).toBe(2);
            });

            it('getTime works',function(){
                var jsDate=new Date(2013, GregorianCalendar.JUNE, 8, 18, 0, 0, 0);
                expect(jsDate.getTime()===gregorianDate.getTime());
            });

            it('DAY_OF_YEAR works', function () {
                var jan1Date = new Date(2013, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0);
                var jsDate = new Date(gregorianDate.getTime());
                var expected = parseInt((jsDate.getTime() - jan1Date.getTime()) / ONE_DAY)+1;
                expect(gregorianDate.get(GregorianCalendar.DAY_OF_YEAR)).toBe(expected);
            });
        });

        describe('complex case',function(){

            it('WEEK_OF_YEAR works',function(){
                var gregorianDate = new GregorianCalendar();
                gregorianDate.set(GregorianCalendar.YEAR,1);
                gregorianDate.set(GregorianCalendar.DAY_OF_WEEK,GregorianCalendar.TUESDAY);
                gregorianDate.set(GregorianCalendar.WEEK_OF_YEAR,1);
                expect(gregorianDate.get((GregorianCalendar.YEAR))).toBe(1);
                expect(gregorianDate.get((GregorianCalendar.DAY_OF_WEEK))).toBe(GregorianCalendar.TUESDAY);
                expect(gregorianDate.get((GregorianCalendar.DAY_OF_MONTH))).toBe(2);
            });

        });



    });

});