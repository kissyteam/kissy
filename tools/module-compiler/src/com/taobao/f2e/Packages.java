package com.taobao.f2e;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.regex.Pattern;

/**
 * KISSY Packages config.
 *
 * @author yiminghe@gmail.com
 * @since 2012-08-06
 */
public class Packages {

    private static HashMap<String, Module> moduleCache = new HashMap<String, Module>();

    static Pattern trimLastPart = Pattern.compile("[^/]*/$");

    /**
     * package encoding
     */
    private String[] encodings = {"utf-8"};

    /**
     * package base urls
     */
    private String[] baseUrls = {
            //"d:/code/kissy_git/kissy/tools/module-compiler/tests/kissy/"
    };


    private String[] packageUrls = {
            //"d:/code/kissy_git/kissy/tools/module-compiler/tests/kissy/biz/"
    };

    public String[] getEncodings() {
        return encodings;
    }

    public String[] getPackageUrls() {
        return packageUrls;
    }

    public void setPackageUrls(String[] packageUrls) {
        ArrayList<String> re = new ArrayList<String>();
        for (String base : packageUrls) {
            base = FileUtils.escapePath(base).trim();
            if (!base.endsWith("/")) {
                base += "/";
            }
            re.add(base);
        }
        this.packageUrls = re.toArray(new String[re.size()]);
    }

    public void setEncodings(String[] encodings) {
        this.encodings = encodings;
    }

    public String[] getBaseUrls() {
        return baseUrls;
    }

    public void setBaseUrls(String[] baseUrls) {

        ArrayList<String> re = new ArrayList<String>();
        for (String base : baseUrls) {
            base = FileUtils.escapePath(base).trim();
            if (!base.endsWith("/")) {
                base += "/";
            }
            re.add(base);
        }
        this.baseUrls = re.toArray(new String[re.size()]);
    }

    public Module getModuleFromName(String moduleName) {
        Module m = this.getModuleFromCache(moduleName);
        if (m != null) {
            return m;
        }
        Packages packages = this;

        String path = packages.getModuleFullPath(moduleName);


        String baseUrl = path.replaceFirst("(?i)" + moduleName + ".js$", "");

        String[] baseUrls = packages.getBaseUrls();
        if (baseUrls.length == 0) {
            ArrayList<String> tmp = new ArrayList<String>();
            String[] packageUrls = packages.getPackageUrls();
            for (String packageUrl : packageUrls) {
                tmp.add(trimLastPart.matcher(packageUrl).replaceAll(""));
            }
            baseUrls = tmp.toArray(new String[tmp.size()]);
        }

        int index = ArrayUtils.indexOf(baseUrls, baseUrl);

        String[] encodings = packages.getEncodings();

        if (index == -1 || index >= encodings.length) {
            index = 0;
        }
        String encoding = encodings[index];
        m = constructModule(encoding, path, moduleName);
        if (m != null) {
            this.setModuleToCache(moduleName, m);
        }
        return m;
    }

    private Module getModuleFromCache(String moduleName) {
        return moduleCache.get(moduleName);
    }

    private void setModuleToCache(String moduleName, Module module) {
        moduleCache.put(moduleName, module);
    }

    private Module constructModule(String encoding, String path, String moduleName) {
        Module module = new Module();
        module.setEncoding(encoding);
        module.setFullpath(path);
        module.setName(moduleName);
        if (module.isValidFormat()) {
            moduleName = module.getModuleNameFromNode();
            if (moduleName != null) {
                module.setName(moduleName);
            }
            return module;
        }
        return null;
    }

    private String getModuleFullPath(String moduleName) {
        Packages packages = this;
        String r = FileUtils.escapePath(moduleName);
        String path = null;
        String[] baseUrls = packages.getBaseUrls();
        if (r.charAt(0) == '/') {
            r = r.substring(1);
        }
        if (!r.endsWith(".js") && !r.endsWith(".JS")) {
            r += ".js";
        }
        if (baseUrls.length > 0) {
            for (String baseUrl : baseUrls) {
                path = baseUrl + r;
                if (new File(path).exists()) {
                    break;
                }
            }
        } else {
            String[] packageUrls = this.packageUrls;
            int index = r.indexOf('/');
            if (index == -1) {
                return path;
            }
            String packageName = r.substring(0, index);
            for (String packageUrl : packageUrls) {
                if (packageUrl.endsWith(packageName + '/')) {
                    path = packageUrl + r.substring(index + 1);
                    break;
                }
            }
        }
        return path;
    }

    public boolean isModuleExists(String moduleName) {
        String path = this.getModuleFullPath(moduleName);
        return path != null && new File(this.getModuleFullPath(moduleName)).exists();
    }


    public Module getModuleFromPath(String path) {
        String name;
        String[] encodings = this.getEncodings();
        String encoding = encodings[0];
        path = FileUtils.escapePath(path);
        String[] baseUrls = this.getBaseUrls();
        int finalIndex = -1,
                curIndex;
        String finalBase = "";
        int packageIndex = -1;
        int finalPackageIndex = -1;
        Module m = null;
        if (baseUrls.length > 0) {
            for (String baseUrl : baseUrls) {
                packageIndex++;
                curIndex = path.indexOf(baseUrl, 0);
                if (curIndex > finalIndex) {
                    finalIndex = curIndex;
                    finalPackageIndex = packageIndex;
                    finalBase = baseUrl;
                }
            }
        } else {
            for (String packageUrl : packageUrls) {
                packageIndex++;
                curIndex = path.indexOf(packageUrl, 0);
                if (curIndex > finalIndex) {
                    finalIndex = curIndex;
                    finalPackageIndex = packageIndex;
                    finalBase = packageUrl;
                }
            }
            finalBase = trimLastPart.matcher(finalBase).replaceAll("");
        }
        if (finalIndex != -1) {
            name = FileUtils.removeSuffix(path.substring(finalBase.length()));
            m = this.getModuleFromCache(name);
            if (m != null) {
                return m;
            }
            if (finalPackageIndex < encodings.length) {
                encoding = encodings[finalPackageIndex];
            }
            m = constructModule(encoding, path, name);
            if (m != null) {
                this.setModuleToCache(name, m);
            }
        }
        return m;
    }
}