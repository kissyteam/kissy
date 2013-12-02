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
        relativeDepName = addIndexAndRemoveJsExt(relativeDepName);
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

    public static String addIndexAndRemoveJsExt(String name) {
        if (name.endsWith("/")) {
            name += "index";
        } else {
            if (name.endsWith(".js")) {
                name = name.substring(0, name.length() - 3);
            }
        }
        return name;
    }


    /**
     * @param astRoot ast root
     * @param name    module name
     * @return String[] required processedModules 's name
     *         <p/>
     *         KISSY.add(function(){
     *         var module=this;
     *         var a=module.require('a');
     *         })
     *         <p/>
     *         KISSY.add('x',['a'],function(){});
     */
    public static String[] getRequiresFromAst(Node astRoot, String name) {
        ArrayList<String> re = new ArrayList<String>();
        Node firstParameter = astRoot.getFirstChild().getFirstChild().getFirstChild().getNext();
        Node requireVal = new Node(Token.ARRAYLIT);
        if (firstParameter.getType() == Token.FUNCTION) {
            ArrayList<Node> nodes = new ArrayList<Node>();
            findModuleRequire(astRoot, nodes);
            for (Node node : nodes) {
                Node newNode = node.cloneTree();
                if (newNode.getType() == Token.STRING) {
                    String modName = newNode.getString();
                    if (modName.endsWith(".js")) {
                        newNode.setString(modName.substring(0, modName.length() - 3));
                    }
                }
                requireVal.addChildrenToBack(newNode);
            }
        }
        firstParameter.getParent().addChildBefore(requireVal, firstParameter);
        Node list = astRoot.getFirstChild().getFirstChild().getFirstChild().getNext();
        Node fl = list.getFirstChild();
        while (fl != null) {
            /**
             * depName can be relative ./ , ../
             */
            re.add(ModuleUtils.getDepModuleName(name, fl.getString()));
            fl = fl.getNext();
        }
        return re.toArray(new String[re.size()]);
    }

    static void findModuleRequire(Node root, ArrayList<Node> nodes) {
        if (root.getType() == Token.CALL) {
            Node name = root.getFirstChild();
            if (name.getType() == Token.NAME && name.getString().equals("require")) {
                nodes.add(name.getNext());
                return;
            }

        }
        Node firstChild = root.getFirstChild();
        while (firstChild != null) {
            findModuleRequire(firstChild, nodes);
            firstChild = firstChild.getNext();
        }
    }
}
