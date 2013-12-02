package com.taobao.f2e;

import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

/**
 * KISSY Module Format.
 *
 * @author yiminghe@gmail.com
 */
public class Module {
    /**
     * module 's full file path.
     */
    private String fullpath = null;

    private Package pck;
    /**
     * encoding of module 's code file.
     */
    private String encoding = "utf-8";
    /**
     * module name.
     */
    private String name;
    /**
     * module file 's content
     */
    private String content = null;
    /**
     * module 's complete code
     */
    private String code;
    /**
     * module 's require module  name.
     */
    private String[] requires = null;
    /**
     * module code 's ast root.
     */
    private Node astRoot = null;

    public void setPck(Package pck) {
        this.pck = pck;
    }

    public Node getAstRoot() {
        if (astRoot != null) {
            return astRoot;
        }
        try {
            String content = this.getContent();
            astRoot = AstUtils.parse(content, name);
            return astRoot;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public String getContent() {
        if (content != null) {
            return content;
        } else {
            return content = FileUtils.getFileContent(this.getFullpath(), encoding);
        }
    }

    /**
     * S.add(func); -> S.add("moduleName",func);
     */
    public void completeModuleName() {
        Module module = this;
        Node moduleNameNode = module.getModuleNameNode();
        moduleNameNode.addChildAfter(Node.newString(module.getName()),
                moduleNameNode.getParent().getChildBefore(moduleNameNode));
        module.setCode(AstUtils.toSource(module.getAstRoot()));
    }

    public String[] getRequires() {
        if (requires != null) {
            return requires;
        }
        Node astRoot = this.getAstRoot();
        return ModuleUtils.getRequiresFromAst(astRoot, name);
    }

    public String getFullpath() {
        if (this.fullpath != null) {
            return this.fullpath;
        }
        String extName = name.substring(pck.getName().length());
        String path = pck.getPath();
        // base/src/base.js
        if (extName.length() == 0) {
            path = path.substring(0, path.length() - 1);
        }
        if (extName.endsWith(".js")) {
            path += extName;
        } else {
            path += extName + ".js";
        }
        return this.fullpath = path;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    private Node getModuleNameNode() {
        astRoot = this.getAstRoot();
        Node getProp = astRoot.getFirstChild().getFirstChild().getFirstChild();
        //add method's first parameter is not string，add module name automatically
        return getProp.getNext();
    }

    public boolean isValidFormat() {
        Node t,
                root = this.getAstRoot();
        if (root == null) {
            return false;
        } else if (root.getType() != Token.SCRIPT) {
            return false;
        }
        t = root.getFirstChild();
        if (t == null) {
            return false;
        } else if (t.getType() != Token.EXPR_RESULT) {
            return false;
        }
        t = t.getFirstChild();
        if (t == null) {
            return false;
        } else if (t.getType() != Token.CALL) {
            return false;
        }
        t = t.getFirstChild();
        if (t == null) {
            return false;
        } else if (t.getType() != Token.GETPROP) {
            return false;
        }

        // t.getNext(); => module name . str,type==STRING

        t = t.getFirstChild();

        if (t == null) {
            return false;
        } else if (t.getType() != Token.NAME) {
            return false;
        } else if (!t.getString().equals("KISSY")) {
            return false;
        }

        t = t.getNext();

        if (t == null) {
            return false;
        } else if (t.getType() != Token.STRING) {
            return false;
        } else if (!t.getString().equals("add")) {
            return false;
        }

        return true;
    }
}
