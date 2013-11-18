package com.taobao.f2e;

import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

import java.util.ArrayList;

/**
 * utils for module
 *
 * @author yiminghe@gmail.com
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
     * startWith '#' has special meaning
     *
     * @param astRoot ast root
     * @param name    module name
     * @return String[] required processedModules 's name
     *
     *      KISSY.add(function(){
     *          var module=this;
     *          var a=module.require('a');
     *      })
     *
     *      KISSY.add('x',['a'],function(){});
     */
    public static String[] getRequiresFromAst(Node astRoot, String name) {
        ArrayList<String> re = new ArrayList<String>();
        Node firstParameter = astRoot.getFirstChild().getFirstChild().getFirstChild().getNext();
        if (firstParameter.getType() == Token.FUNCTION) {
            ArrayList<Node> nodes = new ArrayList<Node>();
            findModuleRequire(astRoot, nodes);
            Node requireVal = new Node(Token.ARRAYLIT);
            for (Node node : nodes) {
                requireVal.addChildrenToBack(node.cloneTree());
            }
            firstParameter.getParent().addChildBefore(requireVal,firstParameter);
        }
        Node list = astRoot.getFirstChild().getFirstChild().getFirstChild().getNext();
        Node fl = list.getFirstChild();
        while (fl != null) {
            if (fl.getType() == Token.STRING) {
                /**
                 * depName can be relative ./ , ../
                 */
                re.add(ModuleUtils.getDepModuleName(name, fl.getString()));
            } else {
                // conditional loader
                // window.localStorage?"localStorage":""
                String source = AstUtils.toSource(fl);
                source = source.substring(0, source.length() - 1);
                re.add("#" + source);
            }
            fl = fl.getNext();
        }
        return re.toArray(new String[re.size()]);
    }

    static void findModuleRequire(Node root, ArrayList<Node> nodes) {
        if (root.getType() == Token.CALL) {
            Node first = root.getFirstChild();
            if (first.getType() == Token.GETPROP) {
                Node name = first.getFirstChild();
                Node method = name.getNext();
                if (name.getType() == Token.NAME &&
                        method.getType() == Token.STRING &&
                        name.getString().equals("module") && method.getString().equals("require")) {
                    nodes.add(first.getNext());
                    return;
                }
            }
        }
        Node firstChild = root.getFirstChild();
        while (firstChild != null) {
            findModuleRequire(firstChild, nodes);
            firstChild = firstChild.getNext();
        }
    }
}
