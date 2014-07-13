jasmine.getEnv().updateInterval = 1000;
jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
jasmine.getEnv().addReporter(new jasmine.ConsoleReporter());
jasmine.getEnv().addReporter(new jasmine.KissyReport(window.component));
jasmine.getEnv().addReporter(new jasmine.JSReporter());