package com.taobao.f2e;


import java.io.File;

public class Test {

    public static void testKISSY1_3_Main() {
        Main main = new Main();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() + "../../../tests/tb_kissy_1.3/src/";
        String output = path + "../build/biz/page/";

        new File(output).mkdirs();

        main.setOutput(output + "run.js");
        main.setOutputDependency(output + "run.dep.js");
        main.setRequire("biz/page/run");
        main.getPackages().setBaseUrls(new String[]{path});
        main.getPackages().setEncodings(new String[]{
                "gbk"
        });
        main.run();
    }

    public static void testKISSY1_3_MainPackageUrl() {
        Main main = new Main();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() + "../../../tests/tb_kissy_1.3/src/";
        String output = path + "../build/biz/page/";

        new File(output).mkdirs();

        main.setOutput(output + "run.js");
        main.setOutputDependency(output + "run.dep.js");
        main.setRequire("biz/page/run");
        main.getPackages().setPackageUrls(new String[]{path + "biz/"});
        main.getPackages().setEncodings(new String[]{
                "gbk"
        });
        main.run();
    }

    public static void testKISSY1_3_ExtractDependency() throws Exception {
        ExtractDependency m = new ExtractDependency();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() +
                "../../../tests/tb_kissy_1.3/src/";
        System.out.println(new File(path).getCanonicalPath());
        m.getPackages().setBaseUrls(new String[]{
                FileUtils.escapePath(new File(path).getCanonicalPath())
        });
        m.getPackages().setEncodings(new String[]{
                "gbk"
        });
        m.setOutput(path + "../build-combo/deps.js");
        m.setOutputEncoding("utf-8");
        m.run();
    }


    public static void testKISSY1_3_ExtractDependencyPackageUrl() throws Exception {
        ExtractDependency m = new ExtractDependency();
        String path;
        path = ExtractDependency.class.getResource("/").getFile() +
                "../../../tests/tb_kissy_1.3/src/biz/";
        System.out.println(new File(path).getCanonicalPath());
        m.getPackages().setPackageUrls(new String[]{
                FileUtils.escapePath(new File(path).getCanonicalPath())
        });
        m.getPackages().setEncodings(new String[]{
                "gbk"
        });
        String output = path + "../../build-combo/";
        m.setOutput(output + "deps.js");

        new File(output).mkdirs();
        m.setOutputEncoding("utf-8");
        m.run();
    }


    public static void main(String[] args) throws Exception {
               testKISSY1_3_MainPackageUrl();
 //       testKISSY1_3_ExtractDependencyPackageUrl();
//        testKISSY1_3_ExtractDependency();
//        testKISSY1_3_Main();
    }
}
