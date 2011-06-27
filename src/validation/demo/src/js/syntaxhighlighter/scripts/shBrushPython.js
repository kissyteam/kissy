/**
 * SyntaxHighlighter
 * http://alexgorbatchev.com/
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/wiki/SyntaxHighlighter:Donate
 *
 * @version
 * 2.1.382 (June 24 2010)
 * 
 * @copyright
 * Copyright (C) 2004-2009 Alex Gorbatchev.
 *
 * @license
 * This file is part of SyntaxHighlighter.
 * 
 * SyntaxHighlighter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * SyntaxHighlighter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SyntaxHighlighter.  If not, see <http://www.gnu.org/copyleft/lesser.html>.
 */
SyntaxHighlighter.brushes.Python = function()
{
	// Contributed by Gheorghe Milas and Ahmad Sherif
	
	var keywords =  'and assert break class continue def del elif else ' +
					'except exec finally for from global if import in is ' +
					'lambda not or pass print raise return try yield while';

	var funcs = '__import__ abs all any apply basestring bin bool buffer callable ' +
				'chr classmethod cmp coerce compile complex delattr dict dir ' +
				'divmod enumerate eval execfile file filter float format frozenset ' +
				'getattr globals hasattr hash help hex id input int intern ' +
				'isinstance issubclass iter len list locals long map max min next ' +
				'object oct open ord pow print property range raw_input reduce ' +
				'reload repr reversed round set setattr slice sorted staticmethod ' +
				'str sum super tuple type type unichr unicode vars xrange zip';

	var special =  'None True False self cls class_';

	this.regexList = [
			{ regex: SyntaxHighlighter.regexLib.singleLinePerlComments, css: 'comments' },
			{ regex: /^\s*@\w+/gm, 										css: 'decorator' },
			{ regex: /(['\"]{3})([^\1])*?\1/gm, 						css: 'comments' },
			{ regex: /"(?!")(?:\.|\\\"|[^\""\n])*"/gm, 					css: 'string' },
			{ regex: /'(?!')(?:\.|(\\\')|[^\''\n])*'/gm, 				css: 'string' },
			{ regex: /\+|\-|\*|\/|\%|=|==/gm, 							css: 'keyword' },
			{ regex: /\b\d+\.?\w*/g, 									css: 'value' },
			{ regex: new RegExp(this.getKeywords(funcs), 'gmi'),		css: 'functions' },
			{ regex: new RegExp(this.getKeywords(keywords), 'gm'), 		css: 'keyword' },
			{ regex: new RegExp(this.getKeywords(special), 'gm'), 		css: 'color1' }
			];
			
	this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
};

SyntaxHighlighter.brushes.Python.prototype  = new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.Python.aliases    = ['py', 'python'];
