package com.taobao.f2e;

import com.google.javascript.jscomp.*;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.rhino.Node;

/**
 * utils for ast
 *
 * @author yiminghe@gmail.com
 */
public class AstUtils {
    /**
     * get root node of ast from javascript source string
     *
     * @param {String} code	javascript source
     * @return {Node} root	node of ast corresponding to source code
     */
    public static Node parse(String code, String name) {
        //just want to use Compiler as one parameter for CompilerInput's getAstRoot method
        Compiler compiler = new Compiler();
        CompilerOptions options = new CompilerOptions();
        // Advanced mode is used here, but additional options could be set, too.
        CompilationLevel.WHITESPACE_ONLY.setOptionsForCompilationLevel(
                options);
        compiler.initOptions(options);
        //get a fake file representing input source code
        //CompilerInput need JSSourceFile as type of input for constructor
        JSSourceFile input = JSSourceFile.fromCode(name, code);
        CompilerInput ci = new CompilerInput(input);
        //here we go , finally get root node of ast
        return ci.getAstRoot(compiler);
    }

    /**
     * get javascript source from root node of its ast
     *
     * @param {Node} jsRoot root node of javascript source's abstract syntax tree
     * @return {String} corresponding javascript source
     */
    public static String toSource(Node jsRoot) {
        //here,just want Compiler's toSource method
        Compiler c = new Compiler();
        CompilerOptions options = new CompilerOptions();
        //just need option,no real effect
        CompilationLevel.WHITESPACE_ONLY.setOptionsForCompilationLevel(
                options);
        options.collapseVariableDeclarations = false;
        options.prettyPrint = true;
        c.initOptions(options);

        Compiler.CodeBuilder cb = new Compiler.CodeBuilder();
        //finally can get source code by ast
        c.toSource(cb, 0, jsRoot);
        return cb.toString();
    }

    public static void main(String[] args) {
        String kissyCjs = "KISSY.add(function(S,require){" +
                "var t = require('my.js');" +
                "require('z');" +
                "require('z2');" +
                "t.done();" +
                "});";
        //kissyCjs = "KISSY.add('2342345');";
        Node k = parse(kissyCjs, "kissy");
        System.out.println(k.toStringTree());
        if (true) {
            //return;
        }

        ModuleUtils.getRequiresFromAst(k, "k");
        System.out.println(k.toStringTree());
        System.out.println(AstUtils.toSource(k));

    }
}
