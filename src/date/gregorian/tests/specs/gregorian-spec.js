/**
 * tests for gregorian gregorianCalendar
 * @author yiminghe@gmail.com
 */
KISSY.use('date/gregorian', function (S, GregorianCalendar) {

    var ONE_SECOND = 1000;
    var ONE_MINUTE = 60 * ONE_SECOND;
    var ONE_HOUR = 60 * ONE_MINUTE;
    var ONE_DAY = 24 * ONE_HOUR;
    // var ONE_WEEK = 7 * ONE_DAY;

    describe('GregorianCalendar', function () {


        describe('simple case', function () {
            var gregorianCalendar;

            beforeEach(function () {
                gregorianCalendar = new GregorianCalendar();
                gregorianCalendar.set(2013, GregorianCalendar.JUNE, 8, 18, 0, 0, 0);
            });

            it('time works', function () {
                expect(gregorianCalendar.get(GregorianCalendar.YEAR)).toBe(2013);
                expect(gregorianCalendar.get(GregorianCalendar.MONTH)).toBe(5);
                expect(gregorianCalendar.get(GregorianCalendar.DAY_OF_MONTH)).toBe(8);
                expect(gregorianCalendar.get(GregorianCalendar.HOUR_OF_DAY)).toBe(18);
                expect(gregorianCalendar.get(GregorianCalendar.MINUTE)).toBe(0);
                expect(gregorianCalendar.get(GregorianCalendar.SECOND)).toBe(0);
                expect(gregorianCalendar.get(GregorianCalendar.MILLISECOND)).toBe(0);
            });

            describe('WEEK_OF_YEAR works', function () {
                it('works for zh-cn', function () {
                    expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(23);
                });

                it('works for start of year', function () {
                    gregorianCalendar.set(GregorianCalendar.YEAR, 2012);
                    gregorianCalendar.set(GregorianCalendar.MONTH, 0);
                    gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 1);
                    expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(1);

                });

                it('works for start of year for setFirstDayOfWeek2', function () {
                    gregorianCalendar.set(GregorianCalendar.YEAR, 2012);
                    gregorianCalendar.set(GregorianCalendar.MONTH, 0);
                    gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 1);
                    gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.THURSDAY);
                    expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(1);
                });

                it('works for start of year 2', function () {
                    gregorianCalendar.set(GregorianCalendar.YEAR, 2011);
                    gregorianCalendar.set(GregorianCalendar.MONTH, 0);
                    gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 1);
                    expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(1);
                });

                it('works for end of year', function () {
                    gregorianCalendar.set(GregorianCalendar.YEAR, 2011);
                    gregorianCalendar.set(GregorianCalendar.MONTH, 11);
                    gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 31);
                    expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(1);
                });


                it('works for end of year', function () {
                    gregorianCalendar.set(GregorianCalendar.YEAR, 2012);
                    gregorianCalendar.set(GregorianCalendar.MONTH, 11);
                    gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 31);
                    expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(1);
                });

                it('works for ISO 8601', function () {
                    gregorianCalendar.set(GregorianCalendar.YEAR, 2012);
                    gregorianCalendar.set(GregorianCalendar.MONTH, 0);
                    gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 1);
                    gregorianCalendar.setMinimalDaysInFirstWeek(4);
                    expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_YEAR)).toBe(52);
                });

            });

            it('DAY_OF_WEEK works', function () {
                expect(gregorianCalendar.get(GregorianCalendar.DAY_OF_WEEK)).toBe(GregorianCalendar.SATURDAY);
            });

            it('WEEK_OF_MONTH works', function () {
                expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_MONTH)).toBe(2);
                gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 1);
                expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_MONTH)).toBe(1);
                gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 3);
                expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_MONTH)).toBe(2);


                gregorianCalendar.set(GregorianCalendar.YEAR, 2011);
                gregorianCalendar.set(GregorianCalendar.MONTH, 11);
                gregorianCalendar.set(GregorianCalendar.DAY_OF_MONTH, 31);
                gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.MONDAY);
                expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_MONTH)).toBe(5);
                gregorianCalendar.setFirstDayOfWeek(GregorianCalendar.THURSDAY);
                expect(gregorianCalendar.get(GregorianCalendar.WEEK_OF_MONTH)).toBe(5);
            });

            it('DAY_OF_WEEK_IN_MONTH works', function () {
                expect(gregorianCalendar.get(GregorianCalendar.DAY_OF_WEEK_IN_MONTH)).toBe(2);

                gregorianCalendar.set(2013, GregorianCalendar.APRIL, 7, 18, 0, 0);

                expect(gregorianCalendar.get(GregorianCalendar.DAY_OF_WEEK_IN_MONTH)).toBe(1);
            });

            it('getTime works', function () {
                var jsDate = new Date(2013, GregorianCalendar.JUNE, 8, 18, 0, 0, 0);
                expect(jsDate.getTime() === gregorianCalendar.getTime());
            });

            it('DAY_OF_YEAR works', function () {
                var jan1Date = new Date(2013, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0);
                var jsDate = new Date(gregorianCalendar.getTime());
                var expected = parseInt((jsDate.getTime() - jan1Date.getTime()) / ONE_DAY) + 1;
                expect(gregorianCalendar.get(GregorianCalendar.DAY_OF_YEAR)).toBe(expected);
            });

            it('WEEK_OF_YEAR works', function () {
                var gregorianCalendar = new GregorianCalendar();
                gregorianCalendar.set(GregorianCalendar.YEAR, 1);
                gregorianCalendar.set(GregorianCalendar.DAY_OF_WEEK, GregorianCalendar.TUESDAY);
                gregorianCalendar.set(GregorianCalendar.WEEK_OF_YEAR, 1);
                expect(gregorianCalendar.get((GregorianCalendar.YEAR))).toBe(1);
                expect(gregorianCalendar.get((GregorianCalendar.DAY_OF_WEEK))).toBe(GregorianCalendar.TUESDAY);
                expect(gregorianCalendar.get((GregorianCalendar.DAY_OF_MONTH))).toBe(2);
            });
        });

        describe('add works', function () {

            it('can adjust DAY_OF_MONTH', function () {
                var d = new GregorianCalendar();
                d.set(2012, GregorianCalendar.JANUARY, 31);
                d.add(GregorianCalendar.MONTH, 1);
                expect(d.get(GregorianCalendar.YEAR)).toBe(2012);
                expect(d.get(GregorianCalendar.MONTH)).toBe(GregorianCalendar.FEBRUARY);
                expect(d.get(GregorianCalendar.DAY_OF_MONTH)).toBe(29);
                // 2012-2-28
            });

            it('can adjust YEAR', function () {
                var d = new GregorianCalendar();
                d.set(2012, GregorianCalendar.JANUARY, 31);
                d.add(GregorianCalendar.MONTH, 13);
                expect(d.get(GregorianCalendar.YEAR)).toBe(2013);
                expect(d.get(GregorianCalendar.MONTH)).toBe(GregorianCalendar.FEBRUARY);
                expect(d.get(GregorianCalendar.DAY_OF_MONTH)).toBe(28);
                // 2012-2-28
            });

        });

        describe("roll works", function () {

            it('can adjust DAY_OF_MONTH', function () {
                var d = new GregorianCalendar();
                d.set(1999, GregorianCalendar.AUGUST, 31);
                d.roll(GregorianCalendar.MONTH, 8);
                expect(d.get(GregorianCalendar.YEAR)).toBe(1999);
                expect(d.get(GregorianCalendar.MONTH)).toBe(GregorianCalendar.APRIL);
                expect(d.get(GregorianCalendar.DAY_OF_MONTH)).toBe(30);
                // 2012-2-28
            });

            it('can roll to begin', function () {
                var d = new GregorianCalendar();
                d.set(1999, GregorianCalendar.JUNE, 1);
                d.roll(GregorianCalendar.WEEK_OF_MONTH, -1);
                expect(d.get(GregorianCalendar.YEAR)).toBe(1999);
                expect(d.get(GregorianCalendar.MONTH)).toBe(GregorianCalendar.JUNE);
                expect(d.get(GregorianCalendar.DAY_OF_MONTH)).toBe(29);
                // 2012-2-28
            });

        });


    });

});