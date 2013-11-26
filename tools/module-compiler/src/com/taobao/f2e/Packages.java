package com.taobao.f2e;

import java.io.File;
import java.io.FileFilter;
import java.util.HashMap;
import java.util.Map;

/**
 * KISSY Packages config.
 *
 * @author yiminghe@gmail.com
 */
public class Packages {

    private Map<String, Package> packages;

    private static HashMap<String, Module> moduleCache = new HashMap<String, Module>();

    public void setPackages(Map<String, Package> packages) {
        this.packages = packages;
    }

    public Map<String, Package> getPackages() {
        return this.packages;
    }

    private void setModuleToCache(String moduleName, Module module) {
        moduleCache.put(moduleName, module);
    }

    private Module constructModule(Package p, String moduleName) {
        Module module = new Module();
        module.setPck(p);
        module.setName(moduleName);
        return module.isValidFormat()?module:null;
    }

    public void initByBaseUrls(String baseUrlStr) {
        String[] bases = baseUrlStr.split(",");
        Map<String, Package> ps = new HashMap<String, Package>();
        for (String base : bases) {
            File f = new File(base);
            File[] files = f.listFiles(new FileFilter() {
                public boolean accept(File pathname) {
                    return pathname.isDirectory() || pathname.getName().endsWith(".js");
                }
            });
            for (File d : files) {
                String name = d.getName();
                String path = d.getAbsolutePath();
                if (d.isFile()) {
                    name = d.getName().substring(0, d.getName().length() - 3);
                    path = d.getParentFile().getAbsolutePath() + '/' + name;
                }
                if (ps.get(name) != null) {
                    continue;
                }
                Package p = new Package();
                p.setPath(path);
                p.setName(name);
                ps.put(name, p);
            }
        }
        this.setPackages(ps);
    }

    public void initByPackageUrls(String packageUrlStr) {
        String[] bases = packageUrlStr.split(",");
        Map<String, Package> ps = new HashMap<String, Package>();
        for (String base : bases) {
            // anim/base=d:/c/d
            int equalIndex = base.indexOf("=");
            String name = "";
            if (equalIndex != -1) {
                name = base.substring(0, equalIndex);
                base = base.substring(equalIndex + 1);
            }
            File d = new File(base);
            Package p = new Package();
            p.setPath(d.getAbsolutePath());
            if (name.length() == 0) {
                name = d.getName();
            }
            p.setName(name);
            ps.put(name, p);
        }
        this.setPackages(ps);
    }

    public Module getModuleFromName(String moduleName) {

        Module m = moduleCache.get(moduleName);

        if (moduleCache.containsKey(moduleName)) {
            return m;
        }

        Package f = null;
        String fName = "";

        for (String pName : packages.keySet()) {
            Package p = packages.get(pName);
            if (moduleName.startsWith(p.getName()) && p.getName().length() > fName.length()) {
                f = p;
                fName = f.getName();
            }
        }

        if (f == null) {
            m = null;
        } else {
            m = constructModule(f, moduleName);
        }

        this.setModuleToCache(moduleName, m);

        return m;
    }

    public boolean isModuleExists(String moduleName) {
        return getModuleFromName(moduleName) != null;
    }

    public boolean isPackageNameAlone(String packagePath,String modulePath){
        String packageModulePath=packagePath.substring(0,packagePath.length()-1)+".js";
        if(packageModulePath.equals(modulePath)){
            return true;
        }
        return false;
    }

    public Module getModuleFromPath(String path) {
        path = FileUtils.escapePath(path);

        boolean packageNameAlone = false;

        String fName = "";
        Package f = null;

        for (String pName : packages.keySet()) {
            Package p = packages.get(pName);
            if(packageNameAlone=isPackageNameAlone(p.getPath(),path)){
                f=p;
                fName=f.getName();
                break;
            }
            else if (path.startsWith(p.getPath()) && p.getName().length() > fName.length()) {
                f = p;
                fName = f.getName();
            }
        }

        if (f == null) {
            return null;
        }

        if(packageNameAlone){
            return getModuleFromName(fName);
        }

        String extName = path.substring(f.getPath().length());
        extName = extName.substring(0, extName.length() - 3);

        if (extName.length() != 0 && fName.length() != 0) {
            extName = "/" + extName;
        }

        return getModuleFromName(fName + extName);
    }

    public static void main(String[] args) {
        System.out.println("123".substring(3));
        System.out.println(moduleCache.get("x"));
        System.out.println(moduleCache.containsKey("x"));
        moduleCache.put("x", null);
        System.out.println(moduleCache.get("x"));
        System.out.println(moduleCache.containsKey("x"));
    }
}