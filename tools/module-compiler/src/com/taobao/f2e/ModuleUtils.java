package com.taobao.f2e;

import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

import java.util.ArrayList;

/**
 * utils for module
 */
public class ModuleUtils {


    /**
     * @param moduleName      event/ie
     * @param relativeDepName 1. event/../s to s
     *                        2. event/./s to event/s
     *                        3. ../h to h
     *                        4. ./h to event/h
     * @return dep's normal path
     */
    public static String getDepModuleName(String moduleName, String relativeDepName) {
        relativeDepName = FileUtils.escapePath(relativeDepName);
        moduleName = FileUtils.escapePath(moduleName);
        String depModuleName;
        //no relative path
        if (!relativeDepName.contains("../") &&
                !relativeDepName.contains("./")) {
            depModuleName = relativeDepName;

        } else {
            //at start,consider moduleName
            if (relativeDepName.indexOf("../") == 0
                    || relativeDepName.indexOf("./") == 0) {
                int lastSlash = moduleName.lastIndexOf("/");
                String archor = moduleName;
                if (lastSlash == -1) {
                    archor = "";
                } else {
                    archor = archor.substring(0, lastSlash + 1);
                }
                return FileUtils.normPath(archor + relativeDepName);
            }
            //at middle,just norm
            depModuleName = FileUtils.normPath(relativeDepName);
        }
        return depModuleName;
    }


    /**
     * 数组中 #开头的字符串表示表达式
     * @param astRoot ast root
     * @param name    module name
     * @return String[] required processedModules 's name
     */
    public static String[] getRequiresFromAst(Node astRoot, String name) {
        ArrayList<String> re = new ArrayList<String>();
        Node r = astRoot.getFirstChild().getFirstChild().getLastChild();
        if (r.getType() == Token.OBJECTLIT) {
            Node first = r.getFirstChild();
            while (first != null) {
                /**
                 * KISSY.add("xx",function(){},{
                 * 	requires:["y1","y2"]
                 * });
                 */
                if (first.getString().equals("requires")) {
                    Node list = first.getFirstChild();
                    if (list.getType() == Token.ARRAYLIT) {
                        Node fl = list.getFirstChild();
                        while (fl != null) {
                            if (fl.getType() == Token.STRING) {
                                /**
                                 * depName can be relative ./ , ../
                                 */
                                re.add(ModuleUtils.getDepModuleName(name, fl.getString()));
                            } else {
                                // conditional loader
                                // 条件表达式
                                // window.localStorage?"localStorage":""
                                String source = AstUtils.toSource(fl);
                                source = source.substring(0, source.length() - 1);
                                re.add("#" + source);
                            }
                            fl = fl.getNext();
                        }
                    }
                    break;
                }
                first = first.getNext();
            }
        }
        return re.toArray(new String[re.size()]);
    }
}
