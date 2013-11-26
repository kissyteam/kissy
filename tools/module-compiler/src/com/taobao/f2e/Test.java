package com.taobao.f2e;


import java.io.File;

/**
 * simple manual test
 *
 * @author yiminghe@gmail.com
 */
public class Test {
    public static void testKISSY1_3_Packager() {
        Main main = new Main();
        String path;
        path = "D:\\code\\kissy_git\\kissy\\src\\base\\src\\";
        String output = "D:\\code\\kissy_git\\kissy\\build\\base\\";

        new File(output).mkdirs();

        main.setOutput(output + "base-pkg.js");
        main.setOutputDependency("D:\\code\\kissy_git\\kissy\\src\\base\\meta\\deps.js");
        main.setRequire("base");
        main.getPackages().initByBaseUrls(path);
        main.setCompact(true);
        main.run();
    }

    public static void testKISSY1_3_Packager2() {
        Main main = new Main();
        String path;
        path = "D:\\code\\kissy_git\\kissy\\src\\anim\\sub-modules\\base\\src\\";
        String output = "D:\\code\\kissy_git\\kissy\\build\\anim\\base\\";

        new File(output).mkdirs();

        main.setOutput(output + "base-pkg.js");
        main.setOutputDependency("D:\\code\\kissy_git\\kissy\\src\\anim\\sub-modules\\base\\meta\\deps.js");
        main.setRequire("anim/base");
        main.getPackages().initByPackageUrls("anim/base="+path+"base");
        main.setCompact(true);
        main.run();
    }

    public static void testKISSY1_4_Packager2() {
        Main main = new Main();
        String path;
        path = "D:\\code\\kissy_git\\kissy\\kissy\\src\\base\\src\\";
        String output = "D:\\code\\kissy_git\\kissy\\kissy\\build\\base\\";

        new File(output).mkdirs();

        main.setOutput(output + "base-pkg.js");
        main.setOutputDependency("D:\\code\\kissy_git\\kissy\\kissy\\src\\base\\meta\\deps.js");
        main.setRequire("base");
        main.getPackages().initByPackageUrls("base="+path+"base");
        main.setCompact(true);
        main.run();
    }

    public static void testKISSY1_3_Main() {
        Main main = new Main();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() +
                "../../tests/tb_kissy_1.3/src/";
        String output = path + "../build/biz/page/";

        new File(output).mkdirs();

        main.setOutput(output + "run.js");
        main.setOutputDependency(output + "run.dep.js");
        main.setRequire("biz/page/run");
        main.getPackages().initByBaseUrls(path);

        main.run();
    }

    public static void testKISSY1_3_MainPackageUrl() {
        Main main = new Main();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() +
                "../../tests/tb_kissy_1.3/src/";
        String output = path + "../build/biz/page/";

        new File(output).mkdirs();

        main.setOutput(output + "run.js");
        main.setOutputDependency(output + "run.dep.js");
        main.setRequire("biz/page/run");
        main.getPackages().initByPackageUrls(path + "biz/");
        main.run();
    }


    public static void testKISSY1_4_MainPackageUrl() {
        Main main = new Main();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() +
                "../../../kissy/tools/module-compiler/tests/tb_kissy_1.4/src/";
        String output = path + "../build/";

        new File(output).mkdirs();

        main.setOutput(output + "run.js");
        main.setOutputDependency(output + "run.dep.js");
        main.setRequire("biz");
        main.getPackages().initByPackageUrls(path + "biz/");
        main.run();
    }

    public static void testKISSY1_3_ExtractDependency() throws Exception {
        ExtractDependency m = new ExtractDependency();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() +
                "../../tests/tb_kissy_1.3/src/";
        System.out.println(new File(path).getCanonicalPath());
        m.getPackages().initByBaseUrls(
                FileUtils.escapePath(new File(path).getCanonicalPath())
        );
        m.setOutput(path + "../build-combo/deps.js");
        m.run();
    }


    public static void testKISSY1_3_ExtractDependencyPackageUrl() throws Exception {
        ExtractDependency m = new ExtractDependency();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() +
                "../../tests/tb_kissy_1.3/src/biz/";
        System.out.println(new File(path).getCanonicalPath());
        m.getPackages().initByPackageUrls(
                FileUtils.escapePath(new File(path).getCanonicalPath())
        );
        String output = path + "../../build-combo/";
        m.setOutput(output + "deps.js");

        new File(output).mkdirs();
        m.run();
    }


    public static void main(String[] args) throws Exception {
        testKISSY1_4_Packager2();
    }
}
