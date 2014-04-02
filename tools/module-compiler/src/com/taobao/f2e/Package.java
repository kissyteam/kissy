package com.taobao.f2e;

/**
 * Package data structure for kissy module system
 *
 * @author yiminghe@gmai.com
 */
public class Package {
    private String name;
    private String path;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBase() {
        return path;
    }

    public void setBase(String path) {
        path = FileUtils.escapePath(path).trim();
        if (!path.endsWith("/")) {
            path += "/";
        }
        this.path = path;
    }
}
