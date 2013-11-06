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

    static long COUNT = System.currentTimeMillis();

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
     */
    public static String[] getRequiresFromAst(Node astRoot, String name) {
        ArrayList<String> re = new ArrayList<String>();
        Node func = astRoot.getFirstChild().getFirstChild();
        Node r = func.getLastChild();
        if (r.getType() != Token.OBJECTLIT) {
            //KISSY.add(function(){ KISSY.require('./x')});
            ArrayList<Node> nodes = new ArrayList<Node>();
            ArrayList<String> ids = new ArrayList<String>();
            ArrayList<Node> cleans = new ArrayList<Node>();
            findKISSY_require(astRoot, nodes, ids, cleans);
            for (Node clean : cleans) {
                clean.detachFromParent();
            }
            if (nodes.size() > 0) {
                Node config = new Node(Token.OBJECTLIT);
                Node require = Node.newString("requires");
                Node requireVal = new Node(Token.ARRAYLIT);
                for (Node node : nodes) {
                    node.detachFromParent();
                    requireVal.addChildrenToBack(node);
                }
                config.addChildrenToBack(require);
                require.addChildrenToBack(requireVal);
                func.addChildrenToBack(config);
                Node fn = func.getChildAtIndex(1);
                if (fn.getType() != Token.FUNCTION) {
                    fn = fn.getNext();
                }
                if (fn.getType() == Token.FUNCTION) {
                    Node lp = fn.getChildAtIndex(1);
                    if (!lp.hasChildren()) {
                        lp.addChildrenToBack(Node.newString(Token.NAME, "S"));
                    }
                    Node before = lp.getFirstChild();
                    for (String id : ids) {
                        Node newChild = Node.newString(Token.NAME, id);
                        lp.addChildAfter(newChild, before);
                        before = newChild;
                    }
                }
            }
        }
        r = func.getLastChild();
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

    static void findKISSY_require(Node root, ArrayList<Node> nodes, ArrayList<String> ids, ArrayList<Node> cleans) {
        if (root.getType() == Token.CALL) {
            Node first = root.getFirstChild();
            if (first.getType() == Token.GETPROP) {
                Node name = first.getFirstChild();
                Node method = name.getNext();
                if (name.getType() == Token.NAME &&
                        method.getType() == Token.STRING &&
                        name.getString().equals("KISSY") && method.getString().equals("require")) {
                    nodes.add(first.getNext());
                    if (root.getParent().getType() == Token.NAME) {
                        ids.add(root.getParent().getString());
                        cleans.add(root.getParent().getParent());
                    } else {
                        ids.add("KISSY_" + (COUNT++));
                        cleans.add(root.getParent());
                    }
                    return;
                }
            }
        }
        Node firstChild = root.getFirstChild();
        while (firstChild != null) {
            findKISSY_require(firstChild, nodes, ids, cleans);
            firstChild = firstChild.getNext();
        }
    }
}
