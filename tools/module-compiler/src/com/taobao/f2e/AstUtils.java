package com.taobao.f2e;

import com.google.javascript.jscomp.*;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.rhino.Node;

/**
 * @author yiminghe@gmail.com
 * @since 2011-01-18
 */
public class AstUtils {
	/**
	 * get root node of ast from javascript source string
	 *
	 * @param {String} code	javascript source
	 * @return {Node} root	node of ast corresponding to source code
	 */
	public static Node parse(String code,String name) {
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
		options.prettyPrint = true;
		c.initOptions(options);

		Compiler.CodeBuilder cb = new Compiler.CodeBuilder();
		//finally can get source code by ast
		c.toSource(cb, 0, jsRoot);
		return cb.toString();
	}

	public static void main(String[] args) {
		String code = "var xyz=1+2+3;alert(xyz);alert(z);";
		String code2 = "var z=2;";
		String kissy = "KISSY.add('event',function(){},{requires:['dom','event']});";
		String seajs = "module.declare('x',['z','p'],function(){require('2');});";

		Node k = parse(kissy,"kissy");


		//System.out.println(k.toStringTree());


		Node sea = parse(seajs,"seajs");


		System.out.println(sea.toStringTree());
//		System.out.println(sea.getFirstChild().getFirstChild().getChildAtIndex(1).toStringTree());
//		System.out.println(sea.getFirstChild().getFirstChild().getChildAtIndex(1).getChildAtIndex(2)
//		.getFirstChild().getFirstChild().getFirstChild().getType()
//		);
		//get ast
		Node n = parse(code,"test");

		//add ast
		Node n2 = parse(code2,"test");

		//use cloneTree to get a node with its children and children's children
		Node newChild = n2.getFirstChild().cloneTree();

		//add one node from tree1 to tree2
		n.addChildAfter(newChild, n.getFirstChild());

		Node nn = Node.newString("program generated");
		n.addChildToBack(nn);

		//serialize
		//System.out.println(toSource(n));


	}
}
