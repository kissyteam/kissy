		KISSY.config({
			packages:[{
					name:"validation",
					path:"../../"		//Auth存放的路径
				}
			]
		});
		
		
		
		KISSY.ready(function(S){
		
			S.all("pre").each(function(){
				var a = S.DOM.create("<div class='highlighterbox'/>");
				a.innerHTML = Highlighter.Execute(this.text(), "js");
				this.hide();
				S.one(a).insertAfter(this);
				
				
			});
		
		});
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
/*
 * SyCODE Syntax Highlighter
 * Version 1.0.0
 * Copyright (C) 2007-2008 Muchool.com
 * http://www.muchool.com
 *
 * SyCODE Syntax Highlighter是一个基于javascript实现的语法高亮程序，实现方式借鉴了著名的db.SyntaxHighlighter采用
 * 正则表达式进行关键字匹配，处理速度比db.SyntaxHighlighter高出 5~10倍，是目前处理速度最快的javascript语法高亮程
 * 序。
 *	
 * SyCODE Syntax Highlighter具有速度高可扩展性强的特点，在一台当前主流PC机上可以轻松完成32KB的代码高亮处理，能够
 * 一次性完成64KB的代码高亮处理而不出现脚本缓慢提示，通过添加不同的正则表达式可以实现任何一种编程语言的语法高亮处
 * 理。
 *
 * SyCODE Syntax Highlighter 1.0 内部已经实现二十于种语系的语法高亮，包括：
 * 1. C/C++
 * 2. C#
 * 3. CSS
 * 4. Delphi/Kylix
 * 5. Pascal
 * 6. Java
 * 7. Vb/Vb.net
 * 8. J(ava)Script
 * 9. ActionScript
 * 10. Php
 * 11. Python
 * 12. Ruby/Rails
 * 13. Perl
 * 14. Assembly
 * 15. Bat 批处理
 * 16. UNIX Shell
 * 18. AWK
 * 19. Sql
 * 20. xml/xhtml
 *
 * example: Highlighter.Execute(cleanCode, language);
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General 
 * Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option) 
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more 
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this library;if not, write to 
 * the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

var Highlighter = {
	Brushes: {},
	RegexLib: {
		MultiLineCComments : new RegExp('/\\*[\\s\\S]*?\\*/', 'gm'),
		SingleLineCComments : new RegExp('//.*$', 'gm'),
		SingleLinePerlComments : new RegExp('#.*$', 'gm'),
		DoubleQuotedString : new RegExp('"(?:\\.|(\\\\\\")|[^\\""\\n])*"','g'),
		SingleQuotedString : new RegExp("'(?:\\.|(\\\\\\')|[^\\''\\n])*'", 'g')
	},
	Match: function(value, index, css) {
		this.value = value;
		this.index = index;
		this.length = value.length;
		this.css = css;
	},
	Execute: function(str,lang) {
		var registered = new Object();
		for(var brush in Highlighter.Brushes)
		{
			var aliases = Highlighter.Brushes[brush].Aliases;
			if(aliases == null) continue;
			for(var i=0;i<aliases.length;i++) registered[aliases[i].toLowerCase()] = brush;
		};
		if(!!registered[lang.toLowerCase()]) {
			var ht = new Highlighter.Brushes[registered[lang.toLowerCase()]]();
			return ht.Highlight(str);
		}
		else {
			str = str.replace(/&/g, '&amp;');
			str = str.replace(/</g, '&lt;');
			str = str.replace(/>/g, '&gt;');
			str = str.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
			str = str.replace(/[ ]{2}/g, '&nbsp;&nbsp;');
			return str.replace(/\n/g, '<br/>');
		}
	}
};

Highlighter.Brushe = new Function();
Highlighter.Brushe.SortCallback = function(m1, m2) {
	if(m1.index < m2.index)
		return -1;
	else if(m1.index > m2.index)
		return 1;
	else
	{
		if(m1.length < m2.length)
			return -1;
		else if(m1.length > m2.length)
			return 1;
	}
	return 0;
}
Highlighter.Brushe.prototype = {
	GetMatches: function(regex, css) {
		var index = 0;
		var match = null;
	
		while((match = regex.exec(this.code)) != null)
			this.matches.push(new Highlighter.Match(match[0], match.index, css));
	},
	AddBit: function(str, css) {
		if(str == null || str.length == 0)
			return;
	
		str = str.replace(/&/g, '&amp;');
		str = str.replace(/</g, '&lt;');
		str = str.replace(/>/g, '&gt;');
		str = str.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		str = str.replace(/[ ]{2}/g, '&nbsp;&nbsp;');
		str = str.replace(/\n/g, '<br/>');
		
		if(css != null)
		{
			this.buffer.push('<span style="' + css + '">' + str + '</span>');
		}
		else
		{
			this.buffer.push(str);
		}
	},
	ProcessRegexList: function() {
		for(var i = 0; i < this.regexList.length; i++)
			this.GetMatches(this.regexList[i].regex, this.regexList[i].css);
	},
	Highlight: function(code) {
		function Trim(str)
		{
			return str.replace(/^\s*(.*?)[\s\n]*$/g, '$1');
		}
	
		function Unindent(str)
		{
			var lines = str.split('\n');
			var indents = new Array();
			var regex = new RegExp('^\\s*', 'g');
			var min = 1000;
	
			for(var i = 0; i < lines.length && min > 0; i++)
			{
				if(Trim(lines[i]).length == 0)
					continue;
					
				var matches = regex.exec(lines[i]);
	
				if(matches != null && matches.length > 0)
					min = Math.min(matches[0].length, min);
			}
	
			if(min > 0)
				for(var i = 0; i < lines.length; i++)
					lines[i] = lines[i].substr(min);
	
			return lines.join('\n');
		}
		
		function Copy(string, pos1, pos2)
		{
			return string.substr(pos1, pos2 - pos1);
		}
		
		if(code == null)
			code = '';
		
		this.originalCode = code;
		this.code = Unindent(code);
		this.buffer = new Array();
		this.matches = new Array();
	
		this.ProcessRegexList();
		
		if(this.matches.length == 0)
		{
			this.AddBit(this.code, null);
			return this.buffer.join('');
		}
	
		this.matches = this.matches.sort(Highlighter.Brushe.SortCallback);
	
		var pos	= 0;
		for(var i = 0; i < this.matches.length; i++)
		{
			var match = this.matches[i];
	
			if(match == null || match.length == 0)
				continue;
	
			if(match.index >= pos)
			{
				this.AddBit(Copy(this.code, pos, match.index), null);
				this.AddBit(match.value, match.css);
				pos = match.index + match.length;
			}
		}
		
		this.AddBit(this.code.substr(pos), null);
		return this.buffer.join('');
	},
	GetKeywords: function(str) {
		return '\\b' + str.replace(/\s+/g, '\\b|\\b') + '\\b';
	},
	GetKeywordsCSS: function(str) {
		return '\\b([a-z_]|)' + str.replace(/ /g, '(?=:)\\b|\\b([a-z_\\*]|\\*|)') + '(?=:)\\b';
	},
	GetValuesCSS: function(str) {
		return '\\b' + str.replace(/ /g, '(?!-)(?!:)\\b|\\b()') + '\:\\b';
	}
}


Highlighter.Brushes.Cpp = function()
{
	var datatypes = 'ATOM BOOL BOOLEAN BYTE CHAR COLORREF DWORD DWORDLONG DWORD_PTR DWORD32 DWORD64 FLOAT HACCEL HALF_PTR HANDLE HBITMAP HBRUSH HCOLORSPACE HCONV HCONVLIST HCURSOR HDC HDDEDATA HDESK HDROP HDWP HENHMETAFILE HFILE HFONT HGDIOBJ HGLOBAL HHOOK HICON HINSTANCE HKEY HKL HLOCAL HMENU HMETAFILE HMODULE HMONITOR HPALETTE HPEN HRESULT HRGN HRSRC HSZ HWINSTA HWND INT INT_PTR INT32 INT64 LANGID LCID LCTYPE LGRPID LONG LONGLONG LONG_PTR LONG32 LONG64 LPARAM LPBOOL LPBYTE LPCOLORREF LPCSTR LPCTSTR LPCVOID LPCWSTR LPDWORD LPHANDLE LPINT LPLONG LPSTR LPTSTR LPVOID LPWORD LPWSTR LRESULT PBOOL PBOOLEAN PBYTE PCHAR PCSTR PCTSTR PCWSTR PDWORDLONG PDWORD_PTR PDWORD32 PDWORD64 PFLOAT PHALF_PTR PHANDLE PHKEY PINT PINT_PTR PINT32 PINT64 PLCID PLONG PLONGLONG PLONG_PTR PLONG32 PLONG64 POINTER_32 POINTER_64 PSHORT PSIZE_T PSSIZE_T PSTR PTBYTE PTCHAR PTSTR PUCHAR PUHALF_PTR PUINT PUINT_PTR PUINT32 PUINT64 PULONG PULONGLONG PULONG_PTR PULONG32 PULONG64 PUSHORT PVOID PWCHAR PWORD PWSTR SC_HANDLE SC_LOCK SERVICE_STATUS_HANDLE SHORT SIZE_T SSIZE_T TBYTE TCHAR UCHAR UHALF_PTR UINT UINT_PTR UINT32 UINT64 ULONG ULONGLONG ULONG_PTR ULONG32 ULONG64 USHORT USN VOID WCHAR WORD WPARAM WPARAM WPARAM char bool short int __int32 __int64 __int8 __int16 long float double __wchar_t clock_t _complex _dev_t _diskfree_t div_t ldiv_t _exception _EXCEPTION_POINTERS FILE _finddata_t _finddatai64_t _wfinddata_t _wfinddatai64_t __finddata64_t __wfinddata64_t _FPIEEE_RECORD fpos_t _HEAPINFO _HFILE lconv intptr_t jmp_buf mbstate_t _off_t _onexit_t _PNH ptrdiff_t _purecall_handler sig_atomic_t size_t _stat __stat64 _stati64 terminate_function time_t __time64_t _timeb __timeb64 tm uintptr_t _utimbuf va_list wchar_t wctrans_t wctype_t wint_t signed';

	var keywords = 'break case catch class const __finally __exception __try const_cast continue private public protected __declspec default delete deprecated do dynamic_cast else enum explicit extern if for friend goto inline mutable namespace new noinline noreturn nothrow register reinterpret_cast return selectany sizeof static static_cast struct switch template this throw true false try typedef typeid typename union using virtual void volatile whcar_t while';

	var extensions = 'dllexport dllimport naked thread uuid';
	
	this.regexList = [
		{ regex: Highlighter.RegexLib.MultiLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp('^ *#.*', 'gm'),				css: 'color:#008000' },
		{ regex: new RegExp(this.GetKeywords(datatypes), 'gm'),		css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(extensions), 'gm'),	css: 'color:#FF8000' }
	];
}
Highlighter.Brushes.Cpp.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.Cpp.Aliases	= ['cpp', 'cc', 'h', 'hpp', 'cxx', 'hxx', 'c', 'c++'];


Highlighter.Brushes.CSharp = function()
{
	var datatypes = 'bool byte char class decimal delegate double enum float int interface long object sbyte short string struct uint ulong ushort';

	var keywords =	'abstract as base break case catch const continue default do else event explicit extern false finally fixed for foreach get goto if implicit in internal lock namespace null operator out override params private protected public readonly ref return sealed set stackalloc static switch this throw true try unsafe using virtual void while';

	var operators = 'is new sizeof typeof checked unchecked';
	
	this.regexList = [
		{ regex: Highlighter.RegexLib.MultiLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp('^\\s*#.*', 'gm'),				css: 'color:#008080' },
		{ regex: new RegExp(this.GetKeywords(datatypes), 'gm'),		css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(operators), 'gm'),		css: 'color:#008000' }
	];
}
Highlighter.Brushes.CSharp.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.CSharp.Aliases	= ['cs', 'c#', 'c-sharp', 'csharp'];

Highlighter.Brushes.CSS = function()
{
	var keywords =	'ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index';

	var values =	'above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow';
	
	var fonts =	'[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif';

	this.regexList = [
		{ regex: Highlighter.RegexLib.MultiLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp('\\#[a-zA-Z0-9]{3,6}', 'g'),		css: 'color:blue' },
		{ regex: new RegExp('(-?\\d+)(\.\\d+)?(px|em|pt|\:|\%|)', 'g'),	css: 'color:blue' },
		{ regex: new RegExp('!important', 'g'),				css: 'color:red' },
		{ regex: new RegExp(this.GetKeywordsCSS(keywords), 'gm'),	css: 'color:#FF00FF' },
		{ regex: new RegExp(this.GetValuesCSS(values), 'g'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetValuesCSS(fonts), 'g'),		css: 'color:#008000' }
	];
}
Highlighter.Brushes.CSS.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.CSS.Aliases	= ['css'];


Highlighter.Brushes.Delphi = function()
{
	var keywords =	'abs addr and ansichar ansistring array as asm begin boolean byte cardinal case char class comp const constructor currency destructor div do double downto else end except exports extended false file finalization finally for function goto if implementation in inherited int64 initialization integer interface is label library longint longword mod nil not object of on or packed pansichar pansistring pchar pcurrency pdatetime pextended pint64 pointer private procedure program property pshortstring pstring pvariant pwidechar pwidestring protected public published raise real real48 record repeat set shl shortint shortstring shr single smallint string then threadvar to true try type unit until uses val var varirnt while widechar widestring with word write writeln xor';
	var directives = 'absolute abstract assembler automated cdecl contains default dispid dynamic export external far forward implements index message name near nodefault overload override package pascal readonly register reintroduce requires resident safecall stdcall stored virtual writeonly';
	
	this.regexList = [
		{ regex: new RegExp('\\(\\*[\\s\\S]*?\\*\\)', 'gm'),		css: 'color:#008080' },
		{ regex: new RegExp('{(?!\\$)[\\s\\S]*?}', 'gm'),		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp('\\{\\$[a-zA-Z]+ .+\\}', 'g'),		css: 'color:#008284' },
		{ regex: new RegExp('\\b[\\d]+\\.?[\\d]*\\b', 'g'),			css: 'color:red' },
		{ regex: new RegExp('\\$[a-zA-Z0-9]+\\b', 'g'),			css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(directives), 'gm'),	css: 'color:#FF8000' }
	];
}
Highlighter.Brushes.Delphi.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.Delphi.Aliases	= ['pas', 'delphi', 'pascal'];


Highlighter.Brushes.Java = function()
{
	var keywords =	'abstract assert boolean break byte case catch char class const continue default do double else enum extends false final finally float for goto if implements import instanceof int interface long native new null package private protected public return short static strictfp super switch synchronized this throw throws true transient try void volatile while';
	var objects = 'AbstractMethodError AccessException Acl AclEntry AclNotFoundException ActionEvent ActionListener Adjustable AdjustmentEvent AdjustmentListener Adler32 AlreadyBoundException Applet AppletContext AppletStub AreaAveragingScaleFilter ArithmeticException Array ArrayIndexOutOfBoundsException ArrayStoreException AudioClip AWTError AWTEvent AWTEventMulticaster AWTException BeanDescriptor BeanInfo Beans BigDecimal BigInteger BindException BitSet Boolean BorderLayout BreakIterator BufferedInputStream BufferedOutputStream BufferedReader BufferedWriter Button ButtonPeer Byte ByteArrayInputStream ByteArrayOutputStream Calendar CallableStatement Canvas CanvasPeer Certificate Character CharacterIterator CharArrayReader CharArrayWriter CharConversionException Checkbox CheckboxGroup CheckboxMenuItem CheckboxMenuItemPeer CheckboxPeer CheckedInputStream CheckedOutputStream Checksum Choice ChoiceFormat ChoicePeer Class ClassCastException ClassCircularityError ClassFormatError ClassLoader ClassNotFoundException Clipboard ClipboardOwner Cloneable CloneNotSupportedException CollationElementIterator CollationKey Collator Color ColorModel Compiler Component ComponentAdapter ComponentEvent ComponentListener ComponentPeer ConnectException ConnectIOException Connection Constructor Container ContainerAdapter ContainerEvent ContainerListener ContainerPeer ContentHandler ContentHandlerFactory CRC32 CropImageFilter Cursor Customizer CardLayout DatabaseMetaData DataFlavor DataFormatException DatagramPacket DatagramSocket DatagramSocketImpl DataInput DataInputStream DataOutput DataOutputStream DataTruncation Date DateFormat DateFormatSymbols DecimalFormat DecimalFormatSymbols Deflater DeflaterOutputStream DGC Dialog DialogPeer Dictionary DigestException DigestInputStream DigestOutputStream Dimension DirectColorModel Double Driver DriverManager DriverPropertyInfo DSAKey DSAKeyPairGenerator DSAParams DSAPrivateKey DSAPublicKey EmptyStackException Enumeration EOFException Error Event EventListener EventObject EventQueue EventSetDescriptor Exception ExceptionInInitializerError ExportException FeatureDescriptor Field FieldPosition File FileDescriptor FileDialog FileDialogPeer FileInputStream FilenameFilter FileNameMap FileNotFoundException FileOutputStream FileReader FileWriter FilteredImageSource FilterInputStream FilterOutputStream FilterReader FilterWriter Float FlowLayout FocusAdapter FocusEvent FocusListener Font FontMetrics FontPeer Format Frame FramePeer Graphics GregorianCalendar GridBagConstraints GridBagLayout GridLayout Group GZIPInputStream GZIPOutputStream Hashtable HttpURLConnection Identity IdentityScope IllegalAccessError IllegalAccessException IllegalArgumentException IllegalComponentStateException IllegalMonitorStateException IllegalStateException IllegalThreadStateException Image ImageConsumer ImageFilter ImageObserver ImageProducer IncompatibleClassChangeError IndexColorModel IndexedPropertyDescriptor IndexOutOfBoundsException InetAddress Inflater InflaterInputStream InputEvent InputStream InputStreamReader Insets InstantiationError InstantiationException Integer InternalError InterruptedException InterruptedIOException IntrospectionException Introspector InvalidClassException InvalidKeyException InvalidObjectException InvalidParameterException InvocationTargetException IOException ItemEvent ItemListener ItemSelectable Key KeyAdapter KeyEvent KeyException KeyListener KeyManagementException KeyPair KeyPairGenerator Label LabelPeer LastOwnerException LayoutManager LayoutManager2 Lease LightweightPeer LineNumberInputStream LineNumberReader LinkageError List ListPeer ListResourceBundle LoaderHandler Locale LocateRegistry LogStream Long MalformedURLException MarshalException Math MediaTracker Member MemoryImageSource Menu MenuBar MenuBarPeer MenuComponent MenuComponentPeer MenuContainer MenuItem MenuItemPeer MenuPeer MenuShortcut MessageDigest MessageFormat Method MethodDescriptor MissingResourceException Modifier MouseAdapter MouseEvent MouseListener MouseMotionAdapter MouseMotionListener MulticastSocket Naming NegativeArraySizeException NoClassDefFoundError NoRouteToHostException NoSuchAlgorithmException NoSuchElementException NoSuchFieldError NoSuchFieldException NoSuchMethodError NoSuchMethodException NoSuchObjectException NoSuchProviderException NotActiveException NotBoundException NotOwnerException NotSerializableException NullPointerException Number NumberFormat NumberFormatException Object ObjectInput ObjectInputStream ObjectInputValidation ObjectOutput ObjectOutputStream ObjectStreamClass ObjectStreamException ObjID Observable Observer Operation OptionalDataException OutOfMemoryError OutputStream OutputStreamWriter Owner PaintEvent Panel PanelPeer ParameterDescriptor ParseException ParsePosition Permission PipedInputStream PipedOutputStream PipedReader PipedWriter PixelGrabber Point Polygon PopupMenu PopupMenuPeer PreparedStatement Principal PrintGraphics PrintJob PrintStream PrintWriter PrivateKey Process Properties PropertyChangeEvent PropertyChangeListener PropertyChangeSupport PropertyDescriptor PropertyEditor PropertyEditorManager PropertyEditorSupport PropertyResourceBundle PropertyVetoException ProtocolException Provider ProviderException PublicKey PushbackInputStream PushbackReader Random RandomAccessFile Reader Rectangle Registry RegistryHandler Remote RemoteCall RemoteException RemoteObject RemoteRef RemoteServer RemoteStub ReplicateScaleFilter ResourceBundle ResultSet ResultSetMetaData RGBImageFilter RMIClassLoader RMIFailureHandler RMISecurityException RMISecurityManager RMISocketFactory RuleBasedCollator Runnable Runtime RuntimeException Scrollbar ScrollbarPeer ScrollPane ScrollPanePeer SecureRandom Security SecurityException SecurityManager SequenceInputStream Serializable ServerCloneException ServerError ServerException ServerNotActiveException ServerRef ServerRuntimeException ServerSocket Shape Short Signature SignatureException Signer SimpleBeanInfo SimpleDateFormat SimpleTimeZone Skeleton SkeletonMismatchException SkeletonNotFoundException Socket SocketException SocketImpl SocketImplFactory SocketSecurityException SQLException SQLWarning Stack StackOverflowError Statement StreamCorruptedException StreamTokenizer String StringBuffer StringBufferInputStream StringCharacterIterator StringIndexOutOfBoundsException StringReader StringSelection StringTokenizer StringWriter StubNotFoundException SyncFailedException System SystemColor TextArea TextAreaPeer TextComponent TextComponentPeer TextEvent TextField TextFieldPeer TextListener Thread ThreadDeath ThreadGroup Throwable Time Timestamp TimeZone Toolkit TooManyListenersException Transferable Types UID UnexpectedException UnicastRemoteObject UnknownError UnknownHostException UnknownServiceException UnmarshalException Unreferenced UnsatisfiedLinkError UnsupportedEncodingException UnsupportedFlavorException URL URLConnection URLEncoder URLStreamHandler URLStreamHandlerFactory UTFDataFormatException Vector VerifyError VetoableChangeListener VetoableChangeSupport VirtualMachineError Visibility VMID Void Window WindowAdapter WindowEvent WindowListener WindowPeer WriteAbortedException Writer ZipEntry ZipException ZipFile ZipInputStream ZipOutputStream';

	this.regexList = [
		{ regex: Highlighter.RegexLib.MultiLineCComments,			css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleLineCComments,			css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,			css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,			css: 'color:#990000' },
		{ regex: new RegExp('\\b([\\d]+(\\.[\\d]+)?|0x[a-f0-9]+)\\b', 'gi'),	css: 'color:red' },
		{ regex: new RegExp('(?!\\@interface\\b)\\@[\\$\\w]+\\b', 'g'),		css: 'color:#FF8000' },
		{ regex: new RegExp('\\@interface\\b', 'g'),				css: 'color:#008000' },
		{ regex: new RegExp(this.GetKeywords(objects), 'gm'),			css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),			css: 'color:blue' }
	];
}
Highlighter.Brushes.Java.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.Java.Aliases	= ['jav', 'java'];


Highlighter.Brushes.JScript = function()
{
	var keywords =	'abstract break byte case catch char class const continue default delete do double else extends false final finally float for function goto if implements import in instanceof int interface long native null package private protected public reset return short static super switch synchronized this throw transient true try var void while with';
	
	var objects = 'Anchor Applet Area Arguments Array Boolean Button Checkbox Collection Crypto Date Dictionary Document Drive Drives Element Enumerator Event File FileObject FileSystemObject FileUpload Folder Folders Form Frame Function Global Hidden History HTMLElement Image Infinity Input JavaArray JavaClass JavaObject JavaPackage JSObject Layer Link Math MimeType Navigator Number Object Option Packages Password Plugin PrivilegeManager Random RegExp Screen Select String Submit Text Textarea URL VBArray Window WScript';
	
	var properties = 'above abs acos action activeElement alert alinkColor all altKey anchor anchors appCodeName applets apply appName appVersion arguments arity asin assign atan atan2 atob availHeight availLeft availTop availWidth ActiveXObject back background below bgColor big blink blur bold border borderWidths bottom btoa button call callee caller cancelBubble captureEvents ceil charAt charCodeAt charset checked children classes className clear clearInterval clearTimeout click clientInformation clientX clientY close closed colorDepth compile complete concat confirm constructir contains contextual cookie cos crypto ctrlKey current data defaultCharset defaultChecked defaultSelected defaultStatus defaultValue description disableExternalCapture disablePrivilege document domain E Echo element elements embeds enabledPlugin enableExternalCapture enablePrivilege encoding escape eval event exec exp expando FromPoint fgColor fileName find fixed floor focus fontColor fontSize form forms forward frames fromCharCode fromElement getAttribute get getClass getDate getDay getFullYear getHours getMember getMilliseconds getMinutes getMonth getSeconds getSelection getSlot getTime getTimezoneOffset getUTCDate getUTCDay getUTCFullYear getUTCHours getUTCMilliseconds getUTCMinutes getUTCMonth getUTCSeconds getWindow getYear global go HandleEvent Height hash hidden history home host hostName href hspace id ids ignoreCase images index indexOf inner innerHTML innerText innerWidth insertAdjacentHTML insertAdjacentText isFinite isNaN italics java javaEnabled join keyCode Links LN10 LN2 LOG10E LOG2E lang language lastIndex lastIndexOf lastMatch lastModified lastParen layers layerX layerY left leftContext length link linkColor load location locationBar log lowsrc MAX_VALUE MIN_VALUE margins match max menubar method mimeTypes min modifiers moveAbove moveBelow moveBy moveTo moveToAbsolute multiline NaN NEGATIVE_INFINITY name navigate navigator netscape next number offscreenBuffering offset offsetHeight offsetLeft offsetParent offsetTop offsetWidth offsetX offsetY onabort onblur onchange onclick ondblclick ondragdrop onerror onfocus onHelp onkeydown onkeypress onkeyup onload onmousedown onmousemove onmouseout onmouseover onmouseup onmove onreset onresize onsubmit onunload open opener options outerHeight outerHTML outerText outerWidth POSITIVE_INFINITY PI paddings pageX pageXOffset pageY pageYOffset parent parentElement parentLayer parentWindow parse parseFloat parseInt pathname personalbar pixelDepth platform plugins pop port pow preference previous print prompt protocol prototype push random readyState reason referrer refresh releaseEvents reload removeAttribute removeMember replace resizeBy resizeTo returnValue reverse right rightcontext round SQRT1_2 SQRT2 screenX screenY scroll scrollbars scrollBy scrollIntoView scrollTo search select selected selectedIndex self setAttribute setDay setFullYear setHotkeys setHours setInterval setMember setMilliseconds setMinutes setMonth setResizable setSeconds setSlot setTime setTimeout setUTCDate setUTCFullYear setUTCHours setUTCMillseconds setUTCMinutes setUTCMonth setUTCSeconds setYear setZOptions shift shiftKey siblingAbove siblingBelow signText sin slice smallsort source sourceIndex splice split sqrt src srcElement srcFilter status statusbar stop strike style sub submit substr substring suffixes sun sup systemLanguage TYPE tagName tags taint taintEnabled tan target test text title toElement toGMTString toLocaleString toLowerCase toolbar top toString toUpperCase toUTCString type UTC unescape unshift untaint unwatch userAgent userLanguage value valueOf visibility vlinkColor vspace watch which width window write writeln x y zIndex';
	
	var operators = 'is new sizeof typeof unchecked';
	
	this.regexList = [
		{ regex: Highlighter.RegexLib.MultiLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp('^\\s*#.*', 'gm'),				css: 'color:#008000' },
		{ regex: new RegExp(this.GetKeywords(objects), 'gm'),		css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(properties), 'gm'),	css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(operators), 'gm'),		css: 'color:#008000' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' }
	];
}
Highlighter.Brushes.JScript.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.JScript.Aliases	= ['js', 'jscript', 'javascript'];


Highlighter.Brushes.ActionScript = function()
{
	var keywords =	'break call continue delete do duplicateMovieClip else for function if in include loadVariablesNum printNum removeMovieClip return setProperty startDrag stopDrag trace var while with';
	
	var objects =	'fscommand\\b|#include getURL gotoAndPlay gotoAndStop ifFrameLoaded loadMovieNum on onClipEvent play stop stopAllSounds tellTarget toggleHighQuality unloadMovieNum';
	
	var properties =	'align\\b|_(parent|root|alpha|currentframe|droptarget|focusrect|framesloaded|height|highquality|name|quality|rotation|soundbuftime|target|totalframes|url|width|visible|x|xmouse|xscale|y|ymouse|yscale) autoSize background backgroundColor border borderColor bold bottomScroll blockIndent bullet color embedFonts font hscroll html htmlText indent italic leading leftMargin maxChars maxhsscroll multiline password rightMargin selectable size tabEnabled tabIndex tabStops target text textColor textHeight textWidth type underline url variable wordWrap';
	
	var events =	'data dragOut dragOver enterFrame keyPress load onClose onConnect onLoad onXML press release releaseOutside rollOut rollOver';
	
	var functions =	'abs acos add addListener and appendChild asin atan atan2 attachMovie attachSound attributes ceil charAt charCodeAt childNodes chr cloneNode close concat connect constructor cos createElement createEmptyMovieClip createTextNode createTextField docTypeDecl eq escape eval evaluate exp false firstChild floor fromCharCode ge getAscii getBeginIndex getBounds getBytesLoaded getBytesTotal getCaretIndex getCode getDate getDay getDepth getEndIndex getFocus getFontList getFullYear getHours getMilliseconds getMinutes getMonth getNewTextFormat getPan getProperty getRGB getSeconds getTextExtent getTime getTimer getTimezoneOffset getTransform getUTCDate getUTCDay getUTCFullYear getUTCHours getUTCMilliseconds getUTCMinutes getUTCMonth getUTCSeconds getVersion getVolume getYear globalToLocal gt hasChildNodes hide hitTest indexOf insertBefore int isDown isFinite isNaN isToggled join lastChild lastIndexOf le length loaded loadMovie loadVariables localToGlobal log lt max maxscroll mbchr mblength mbord mbsubstring min mouseDown mouseUp ne new newline nextFrame nextScene nextSibling nodeName nodeType nodeValue not null number onReleaseOutside onDragOut onDragOver onRollOut onRollOver onRelease onPress or ord parentNode parseFloat parseInt parseXML pop pow prevFrame previousSibling prevScene print printAsBitmap push random removeNode reverse round removeListener removeTextField replaceSel restrict scroll scrollString send sendAndLoad set setDate setFocus setFullYear setHours setMilliseconds setMinutes setMonth setPan setRGB setSeconds setSelection setTextFormat setTime setTransform setUTCDate setUTCFullYear setUTCHours setUTCMilliseconds setUTCMinutes setUTCMonth setUTCSeconds setVolume setYear shift show sin slice sort splice split sqrt start status substr substring swapDepths tan targetPath this toLowerCase toString toUpperCase true typeof unescape unloadMovie unshift updateAfterEvent valueOf void xmlDecl';
	
	var objects =	'Array Boolean Color Date Key Math Mouse MovieClip Number Object Selection Sound String TextFormat XML XMLSocket';
	
	var constants =	'BACKSPACE CAPSLOCK CONTROL DELETEKEY DOWN END ENTER ESCAPE HOME INSERT LEFT LN10 LN2 LOG10E LOG2E MAX_VALUE MIN_VALUE NaN NEGATIVE_INFINITY PGDN PGUP PI POSITIVE_INFINITY RIGHT SHIFT SPACE SQRT1_2 SQRT2 TAB UP UTC';
	
	this.regexList = [
		{ regex: Highlighter.RegexLib.MultiLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp(this.GetKeywords(objects), 'gm'),		css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(properties), 'gm'),	css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(events), 'gm'),		css: 'color:#008000' },
		{ regex: new RegExp(this.GetKeywords(functions), 'gm'),		css: 'color:#ff1493' },
		{ regex: new RegExp(this.GetKeywords(constants), 'gm'),		css: 'color:#008284' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' }
	];
}
Highlighter.Brushes.ActionScript.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.ActionScript.Aliases	= ['as', 'ascript', 'actionscript'];

Highlighter.Brushes.Php = function()
{
	var funcs = 'abs acos acosh addcslashes addslashes array_change_key_case array_chunk array_combine array_count_values array_diff array_diff_assoc array_diff_key array_diff_uassoc array_diff_ukey array_fill array_filter array_flip array_intersect array_intersect_assoc array_intersect_key array_intersect_uassoc array_intersect_ukey array_key_exists array_keys array_map array_merge array_merge_recursive array_multisort array_pad array_pop array_product array_push array_rand array_reduce array_reverse array_search array_shift array_slice array_splice array_sum array_udiff array_udiff_assoc array_udiff_uassoc array_uintersect array_uintersect_assoc array_uintersect_uassoc array_unique array_unshift array_values array_walk array_walk_recursive atan atan2 atanh base64_decode base64_encode base_convert basename bcadd bccomp bcdiv bcmod bcmul bindec bindtextdomain bzclose bzcompress bzdecompress bzerrno bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir checkdate checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists closedir closelog copy cos cosh count count_chars date decbin dechex decoct deg2rad delete ebcdic2ascii echo empty end ereg ereg_replace eregi eregi_replace error_log error_reporting escapeshellarg escapeshellcmd eval exec exit exp explode extension_loaded feof fflush fgetc fgetcsv fgets fgetss file_exists file_get_contents file_put_contents fileatime filectime filegroup fileinode filemtime fileowner fileperms filesize filetype floatval flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread fscanf fseek fsockopen fstat ftell ftok getallheaders getcwd getdate getenv gethostbyaddr gethostbyname gethostbynamel getimagesize getlastmod getmxrr getmygid getmyinode getmypid getmyuid getopt getprotobyname getprotobynumber getrandmax getrusage getservbyname getservbyport gettext gettimeofday gettype glob gmdate gmmktime ini_alter ini_get ini_get_all ini_restore ini_set interface_exists intval ip2long is_a is_array is_bool is_callable is_dir is_double is_executable is_file is_finite is_float is_infinite is_int is_integer is_link is_long is_nan is_null is_numeric is_object is_readable is_real is_resource is_scalar is_soap_fault is_string is_subclass_of is_uploaded_file is_writable is_writeable mkdir mktime nl2br parse_ini_file parse_str parse_url passthru pathinfo readlink realpath rewind rewinddir rmdir round str_ireplace str_pad str_repeat str_replace str_rot13 str_shuffle str_split str_word_count strcasecmp strchr strcmp strcoll strcspn strftime strip_tags stripcslashes stripos stripslashes stristr strlen strnatcasecmp strnatcmp strncasecmp strncmp strpbrk strpos strptime strrchr strrev strripos strrpos strspn strstr strtok strtolower strtotime strtoupper strtr strval substr substr_compare';

	var keywords = 'and or xor __FILE__ __LINE__ array as break case cfunction class const continue declare default die do else elseif empty enddeclare endfor endforeach endif endswitch endwhile extends for foreach function include include_once global if new old_function return static switch use require require_once var while __FUNCTION__ __CLASS__ __METHOD__ abstract interface public implements extends private protected throw';
	
	var operators = 'AND new not OR XOR';

	this.regexList = [
		{ regex: Highlighter.RegexLib.MultiLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.SingleLineCComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp('\\$\\w+', 'g'),				css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(funcs), 'gmi'),		css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(operators), 'gm'),		css: 'color:#008000' }
	];
}
Highlighter.Brushes.Php.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.Php.Aliases	= ['php','php4'];


Highlighter.Brushes.Python = function()
{
	var keywords =  'and assert break class continue def del elif else except exec finally for from global if import in is lambda not or pass print raise return try yield while';

	var special =  'None True False self cls class_'

	this.regexList = [
		{ regex: Highlighter.RegexLib.SingleLinePerlComments,			css: 'color:#008080' },
		{ regex: new RegExp("^\\s*@\\w+", 'gm'),				css: 'color:#ff1493' },
		{ regex: new RegExp("(['\"]{3})([^\\1])*?\\1", 'gm'),			css: 'color:#FF8000' },
		{ regex: new RegExp('"(?!")(?:\\.|\\\\\\"|[^\\""\\n\\r])*"', 'gm'),	css: 'color:#990000' },
		{ regex: new RegExp("'(?!')*(?:\\.|(\\\\\\')|[^\\''\\n\\r])*'", 'gm'),	css: 'color:#990000' },
		{ regex: new RegExp("\\b\\d+\\.?\\w*", 'g'),				css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),			css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(special), 'gm'),			css: 'color:#8A2BE2' }
        ];
}
Highlighter.Brushes.Python.prototype  = new Highlighter.Brushe();
Highlighter.Brushes.Python.Aliases    = ['py', 'python'];


Highlighter.Brushes.Ruby = function()
{
	var keywords =	'alias and BEGIN begin break case class def define_method defined do each else elsif END end ensure false for if in module new next nil not or raise redo rescue retry return self super then throw true undef unless until when while yield';

	var builtins =	'Array Bignum Binding Class Continuation Dir Exception FalseClass File::Stat File Fixnum Fload Hash Integer IO MatchData Method Module NilClass Numeric Object Proc Range Regexp String Struct::TMS Symbol ThreadGroup Thread Time TrueClass'

	this.regexList = [
		{ regex: Highlighter.RegexLib.SingleLinePerlComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp(':[a-z][A-Za-z0-9_]*', 'g'),		css: 'color:#aa7700' },
		{ regex: new RegExp('(\\$|@@|@)\\w+', 'g'),			css: 'color:#aa7700' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(builtins), 'gm'),		css: 'color:red' }
	];
}
Highlighter.Brushes.Ruby.prototype = new Highlighter.Brushe();
Highlighter.Brushes.Ruby.Aliases = ['rb', 'ruby', 'rails', 'ror'];


Highlighter.Brushes.Perl = function()
{
	var keywords =	'while\\b|\\s+\\-A\\b|\\s+\\-B\\b|\\s+\\-C\\b|\\s+\\-M\\b|\\s+\\-O\\b|\\s+\\-R\\b|\\s+\\-S\\b|\\s+\\-T\\b|\\s+\\-W\\b|\\s+\\-X\\b|\\s+\\-b\\b|\\s+\\-c\\b|\\s+\\-d\\b|\\s+\\-e\\b|\\s+\\-f\\b|\\s+\\-g\\b|\\s+\\-k\\b|\\s+\\-l\\b|\\s+\\-o\\b|\\s+\\-p\\b|\\s+\\-r\\b|\\s+\\-s\\b|\\s+\\-t\\b|\\s+\\-u\\b|\\s+\\-w\\b|\\s+\\-x\\b|\\s+\\-z\\b|\\s+__DATA__\\S+|\\s+__END__\\S+|\\s+__FILE__\\S+|\\s+__LINE__\\s+|\\bcontinue do else elsif for foreach goto if last local my next no our package redo return require sub until unless use';

	var methods =	'accept alarm atan2 bind binmode bless caller chdir chmod chomp chop chown chr chroot close closedir connect cos crypt dbmclose dbmopen defined delete die dump each endgrent endhostent endnetent endprotoent endpwent endservent eof eval exec exit exp exists fcntl fileno flock fork formline format getc getgrent getgrgid getgrname gethostbyaddr gethostbyname gethostent getlogin getnetbyaddr getnetbyname getnetent getpeername getpgrp getppid getpriority getprotobyname getprotobynumber getprotoent getpwent getpwnam getpwuid getservbyname getservbyport getservent getsockname getsockopt glob gmtime grep hex index int ioctl join keys kill lc lcfirst length link listen localtime log lstat map mkdir msgctl msgget msgrcv msgsnd new oct open opendir ord pack pipe pop pos print printf push quotemeta rand read readdir readline readlink recv ref rename reset reverse rewinddir rindex rmdir scalar seek seekdir select semctl semgett semop send setgrent sethostent setnetent setpgrp setpriority setprotoent setpwent setservent setsockopt shift shmctl shmget shmread shmwrite shutdown sin sleep socket socketpair sort splice split sprintf sqrt srand stat study substr symlink syscall sysopen sysread system syswrite tell telldir tie tied time times truncate uc ucfirst umask undef unlink unpack unshift utime values vec wait waitpid wantarray warn write';
	
	var operators =	'AUTOLOAD and BEGIN CORE DESTROY eq END ge gt le lt ne not m or q qq qw qx SUPER s tr UNIVERSAL x xor y';
	
	this.regexList = [
		{ regex: Highlighter.RegexLib.SingleLinePerlComments,		css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp('\\$\\w+', 'g'),				css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(methods), 'gm'),		css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(operators), 'gm'),	css: 'color:008000' }
	];
}
Highlighter.Brushes.Perl.prototype = new Highlighter.Brushe();
Highlighter.Brushes.Perl.Aliases = ['pl', 'cgi', 'pm', 'plx', 'perl'];

Highlighter.Brushes.Assembly = function()
{
	var keywords =	'aaa\\b|\\s+\\.break\\b|\\s+\\.breakif\\b|\\s+\\.continue\\b|\\s+\\.else\\b|\\s+\\.elseif\\b|\\s+\\.endif\\b|\\s+\\.exit\\b|\\s+\\.if\\b|\\s+\\.repeat\\b|\\s+\\.startup\\b|\\s+\\.until\\b|\\s+\\.untilcxz\\b|\\s+\\.while\\b|\\baad aam aas adc add and arpl bound bsf bsr bswap bt btc btr bts call cbw cdq clc cld cli clts cmc cmov cmp cmps cmpsb cmpsd cmpsw cmpxchg cmpxchg8b cpuid cwd cwde daa das dec div enter esc hlt idiv imul in inc ins insb insd insw int into invd invlpg invoke iret iretd ja jae jb jbe jc jcxz je jecxz jg jge jl jle jmp jna jnae jnb jnbe jnc jne jng jnge jnl jnle jno jnp jns jnz jo jp jpe jpo js jz lahf lar lds lea leave les lfs lgdt lgs lidt lldt lmsw lock lods lodsb lodsd lodsw loop loope loopne loopnz loopz lsl lss ltr mov movs movsb movsd movsw movsx movzx mul neg nop not oio or out outs outsb outsd outsw pop popa popad popf popfd push pusha pushad pushf pushfd pushw rcl rcr rdmsr rdtsc rep repe repne repnz repz ret retf retn rol ror rsdc rsldt rsm rsts sahf sal sar sbb scas scasb scasd scasw seta setae setb setbe setc sete setg setge setl setle setna setnae setnb setnc setne setng setnge setnl setnle setno setnp setns setnz seto setp setpe setpo sets setz sgdt shl shld shr shrd sidt sldt smsw stc std sti stos stosb stosd stosw str sub svdc svldt svts test verr verw wait wbinvd wrmsr xadd xchg xlat xlatb xor';

	var objects =	'addr\\b|\\s+\\%cond\\b|\\s+\\%out\\b|\\s+\\.186\\b|\\s+\\.286\\b|\\s+\\.286c\\b|\\s+\\.286p\\b|\\s+\\.287\\b|\\s+|\\.386\\b|\\s+\\.386p\\b|\\s+\\.387\\b|\\s+\\.486\\b|\\s+\\.486c\\b|\\s+\\.486p\\b|\\s+\\.586\\b|\\s+\\.586p\\b|\\s+\\.686\\b|\\s+\\.686p\\b|\\s+\\.8086\\b|\\s+\\.8087\\b|\\s+\\.alpha\\b|\\s+\\.dosseg\\b|\\s+\\.code\\b|\\s+\\.const\\b|\\s+\\.cref\\b|\\s+\\.data\\b|\\s+\\.data\\?\\s+|\\s+\\.err\\b|\\s+\\.err1\\b|\\s+\\.err2\\b|\\s+\\.errb\\b|\\s+\\.errdef\\b|\\s+ \\.errdif\\b|\\s+\\.erre\\b|\\s+\\.fardata\\b|\\s+\\.fardata\\?\\s+|\\s+\\.k3d\\b|\\s+\\.lall\\b|\\s+\\.lfcond\\b|\\s+\\.list\\b|\\s+\\.mmx\\b|\\s+\\.model\\b|\\s+\\.msfloat\\b|\\s+\\.nolist\\b|\\s+\\.nolistmacro\\b|\\s+\\.radix\\b|\\s+\\.sall\\b|\\s+\\.seq\\b|\\s+\\.sfcond\\b|\\s+\\.stack\\b|\\s+\\.type\\b|\\s+\\.xall\\b|\\s+\\.xcref\\b|\\s+\\.xlist\\b|\\s+@catstr\\b|\\s+@code\\b|\\s+@codesize\\b|\\s+@cpu\\b|\\s+@curseg\\b|\\s+@data\\b|\\s+@data\\?\\s+|\\s+@datasize\\b|\\s+@date\\b|\\s+@environ\\b|\\s+@fardata\\b|\\s+@fardata\\?\\s+|\\s+@filename\\b|\\s+@instr\\b|\\s+@interface\\b|\\s+@model\\b|\\s+@sizestr\\b|\\s+@stack\\b|\\s+@startup\\b|\\s+@substr\\b|\\s+@time\\b|\\s+@version\\b|\\s+@wordsize align arg assume at basic byte c casemap catstr codeptr codeseg comm comment common compact dataptr db dd df dosseg dup dq dt dw dword echo else elseif elseifdef elseifidn elseifidni end endif endm endp ends epilogue epiloguedef eq equ even exitm export expr32 extern externdef extrn far far16 far32 farstack flat for forc fortran fword ge global goto group gt high highword huge ideal if if1 if2 ifb ifdef ifdif ifdifi ifidn ifidni ife ifnb ifndef include includelib instr integer irp irpc jumps label large le length lengthof listing local locals lroffset low lowword lt macro mask masm masm51 medium memory mm2word mmword model multerrs name near near32 nle nokeyword nolist nolocals noljmp nolocals nomasm51 none nonunique noscoped nosmart nothing offset opattr option or org page para pascal popcontext private proc prologue prologuedef proto ptr public publicdll purge pushcontext pword quirks qword readonly real4 real8 real10 record rept req sbyte sdword seg segment shl short size sizeof small smart stack stdcall struc struct substr subtitle subttl sword symtype tbyte textequ this tiny title tword type typedef use16 use32 uses union vararg width word';
	
	var methods =	'f2xm1 fabs fadd faddp fbld fbstp fchs fclex fcmov fcom fcomp fcompp fcos fdecstp fdiv fdivp fdivr fdivrp ffree fiadd ficom ficomp fidiv fidivr fild fimul fincstp finit fist fistp fisub fisubr fld fld1 fldcw fldenv fldl2e fldl2t fldlg2 fldln2 fldpi fldz fly2x fly2xp1 fmul fmulp fnclex fninit fnop fnsave fnstcw fnstenv fnstsw fpatan fprem fprem1 fptan fqrt frndint frstor fsave fscale fsin fsincos fst fstcw fstenv fstp fstsw fsub fsubp fsubr fsubrb ftst fucom fucomp fucompp fwait fxam fxch fxtract';
	
	var operators =	'ah\\b|\\s+\\$\\s+|\\s+\\?\\s+|\\s+@@\\s+|\\s+@b\\b|\\s+@f  al ax bh bl bp bx carry\\?\\s+|\\bch cl cr0 cr2 cr3 cr4 cs cx dh di dl dr0 dr1 dr2 dr3 dr4 dr5 dr6 dr7 ds dx eax ebx ebp ecx edi edx es esi esp ext0 ext1 ext2 ext3 ext4 ext5 ext6 ext7 extb0 extb1 extb2 extb3 fs gs mm mm0 mm1 mm2 mm3 mm4 mm5 mm6 mm7 overflow? parity? si sign? sp ss tr3 tr4 tr5 tr6 tr7 xmm xmm0 xmm1 xmm2 xmm3 xmm4 xmm5 xmm6 zero\\?\\s+|\\bxmm7';
	
	var commands =	'addps addss andnps andps cmpeqps cmpeqss cmpleps cmpless cmpltps cmpltss cmpneqps cmpneqss cmpnleps cmpnless cmpnltps cmpnltss cmpordps cmpordss cmpps cmpss cmpunordps cmpunordss comiss cvtpi2ps cvtps2pi cvtsi2ss cvttps2pi cvttss2si cvtss2si divps divss emms femms fxrstor fxsave ldmxcsr maskmovq maxps maxss minps minss movaps movd movdf movdt movhps movhlps movlhps movlps movmskps movntps movntq movq movss movups mulps mulss orps packssdw packsswb packuswb paddb paddd paddsb paddsw paddusb paddusw paddw pand pandn pavgb pavgusb pavgw pcmpeqb pcmpeqd pcmpeqd pcmpeqw pcmpgtb pcmpgtd pcmpgtw pextrw pf2id pfacc pfadd pfcmpeq pfcmpge pfcmpgt pfmax pfmin pfmul pfrcp pfrcpit1 pfrcpit2 pfsqit1 pfrsqrt pfsub pfsubr pi2fd pinsrw pmaddwd pmaxsw pmaxub pminsw pminub pmovmskb pmulhrw pmulhuw pmulhw pmullw por prefetch prefetchw prefetchnta prefetcht0 prefetcht1 prefetcht2 psadbw pslld psllq psllw psrad psraw psrld psrlq psrlw psubb psubd psubsb psubsw psubusb psubusw psubw punpckhbw punpckhdq punpckhwd punpcklbw punpckldq punpcklwd pxor pshufw rcpps rcpss rdpmc rsqrtps rsqrtss sfence shufps sqrtps sqrtss stmxcsr subps subss syscall sysret ucomiss unpckhps unpckps unpcklps xmmword xorps';
	
	this.regexList = [
		{ regex: new RegExp(';.*$', 'gm'),				css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gmi'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(objects), 'gmi'),		css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(commands), 'gmi'),		css: 'color:#ff1493' },
		{ regex: new RegExp(this.GetKeywords(methods), 'gmi'),		css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(operators), 'gmi'),	css: 'color:008000' }
	];
}
Highlighter.Brushes.Assembly.prototype = new Highlighter.Brushe();
Highlighter.Brushes.Assembly.Aliases = ['s', 'asm', 'inb', 'mac', 'cod', 'masm'];


Highlighter.Brushes.Batch = function()
{
	var variables =	'%([0-9]\\b|\\*|\\$|allusersprofile\\%|appdata%|clientname%|commonprogramfiles%|computername%|comspec%|fp_no_host_check%|homedrive%|homepath%|lang%|logonserver%|number_of_processors%|os%|path%|pathext%|processor_architecture%|processor_identifier%|processor_level%|processor_revision%|programfiles%|prompt%|sessionname%|systemdrive%|systemroot%|temp%|tmp%|userdomain%|username%|userprofile%|windir%|cd%|date%|time%|random%|errorlevel%|cmdextversion%|cmdcmdline\\%)';
	
	var keywords =	'cmdextversion con defined disabledelayedexpansion disableextensions do EnableDelayedExpansion enableextensions else eof equ errorlevel exist geq gtr leq lss neq not nul on off';
	
	var commands =	'assoc at attrib break cacls call cd chcp chdir chkdsk chkntfs cls cmd color comp compact convert copy date del deltree dir diskcomp diskcopy doskey echo endlocal erase exit fc find findstr for format ftype goto graftabl help if label md mkdir mode more move path pause popd print prompt pushd rd recover ren rename replace rmdir set setlocal shift sort start subst time title tree type ver verify vol xcopy';
	
	this.regexList = [
		{ regex: new RegExp('(rem\\s+|:).*$', 'gmi'),			css: 'color:#008080' },
		{ regex: new RegExp('%(?:\\.|(\\\\\\%)|[^\\%\\n\\s])+%', 'g'),	css: 'color:#ff1493' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp(variables, 'gmi'),				css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(commands), 'gmi'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gmi'),		css: 'color:#FF8000' }
	];
}
Highlighter.Brushes.Batch.prototype = new Highlighter.Brushe();
Highlighter.Brushes.Batch.Aliases = ['bat', 'cmd'];

Highlighter.Brushes.Shell = function()
{
	var variables =	'cdpath debug dir dir_list editor file_name filename home ifs lang mail mailcheck mailpath oldpwd path ppid ps1 ps2 ps3 reply save_sts save_lst shacct shell source source_list term';
	
	var keywords =	'case do done elif else esac endif fi for if in then until while';
	
	var commands =	'alias admin apropos ar as at atq atrm awk banner basename batch bc bdiff bfs bg break cal calendar cancel cat cb cc cd cdc cflow chgrp chmod chown clear cmp col comb comm compress continue cp cpio crontab crypt cscope csh csplit ctags ctrace cu cut cxref date dbx dc dd delta deroff df diff diff3 dircmp dirname dis download dpost du echo ed edit egrep env ed edpr eval exec exstr exit export face factor false fg fgrep file find finger fmli fmt fmtmsg fold ftp function gcore gencat get getopts gettxt gprof grep groups hash head help hostid hostname iconv id install ipcrm ipcs ismpx join jsh jterm jobs jwin keylogin keylogout kill ksh layers ld ldd lex line lint ln login logname lorder lp lpq lpr lprm lprof lpstat lptest ls lsm4 mail mailalias mailx make makekey man mcs mesg mkdir mkmsgs more mv  nawk newform newgrp news nice nl nm nohup notify nroff od openwin pack page passwd paste pcat pg pic pr printenv printf prof prs ps ptx pwd rcp read readonly red regcmp relogin reset return rksh rlogin rm rmdel rmdir rsh ruptime rwho sact sccs sccsdiff sdb sdiff sed select set sh shl shift shutdown size sleep soelim sort spell split srchtxt strings strip stop stty su sum suspend tabs tail talk tar tbl tee telnet test time timex touch tput tr trap troff true truss tset tsort tty type typeset ulimit umask uname uncompress unget uniq unit unpack unset uptime users uucp uudecode uuencode uuglist uulog uunmae uupick uustat uuto uux vacation val vc vedit vi view w wait wall wc what whatis which who whoami write xargs yacc zcat';
	
	this.regexList = [
		{ regex: new RegExp('#.*$', 'gm'),				css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },
		{ regex: new RegExp(variables, 'gmi'),				css: 'color:#ff1493' },
		{ regex: new RegExp(this.GetKeywords(commands), 'gmi'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gmi'),		css: 'color:#FF8000' }
	];
}
Highlighter.Brushes.Shell.prototype = new Highlighter.Brushe();
Highlighter.Brushes.Shell.Aliases = ['sh', 'ksh', 'csh', 'shell'];

Highlighter.Brushes.AWK = function()
{
	var variables =	'ARGC ARGV CONVFMT ENVIRON FILENAME FNR FS NF NR OFMT OFS ORS RLENGTH RS RSTART SUBSEP';

	var keywords =	'atan2 break BEGIN  close continue cos delete do else exp exit END  for function getline gsub if index int length local log match next print printf rand return sin split sprintf sqrt srand sub substr system tolower toupper while';
	
	this.regexList = [
		{ regex: new RegExp('#.*$', 'gm'),				css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:#990000' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:#990000' },

		{ regex: new RegExp(this.GetKeywords(variables), 'gmi'),	css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gmi'),		css: 'color:blue' }
	];
}
Highlighter.Brushes.AWK.prototype = new Highlighter.Brushe();
Highlighter.Brushes.AWK.Aliases = ['awk'];

Highlighter.Brushes.Sql = function()
{
	var funcs = 'abs add_months ascii ceil chr concat convert cos cosh decode exp floor greatest hextoraw initcap instr last_day length ln log lower lpad ltrim mod months_between next_day new_time nls_initcap nls_lower nls_upper nvl power rawtohex replace round rowidtochar rpad rtrim sign sin sinh soundex sqrt substr substrb tan tanh to_char to_date to_label to_multi_byte to_number to_single_type translate trunc upper userenv vsize';

	var methods = 'bind_variable bind_variable_char bind_variable_raw bind_variable_rowid broken change close_cursor column_value column_value_char column_value_raw column_value_rowid define_column define_column_char define_column_raw define_column_rowid disable enable execute execute_and_fetch fetch_rows get_line get_lines interval is_open last_error_position last_row_count last_row_id last_sql_function_code new_line next_date parse put put_line remove submit what';
	
	var keywords = 'abort accept access add alter array arraylen as asc assert assign at audit authorization avg base_table begin binary_integer body boolean by case char char_base check close cluster clusters colauth column comment commit compress connect constant crash create current currval cursor database data_base date dba debugoff debugon declare decimal default definition delay delete desc digits dispose distinct do drop else elsif end entry exception exception_init exclusive exists exit false fetch file float for form from function generic goto grant group having identified if immediate increment index indexes indicator initial insert integer interface intersect into is level limited lock long loop max maxextents min minextents minus mislabel mod mode natural naturaln new nextval noaudit nocompress nologging nowait number number_base of offline on online open option order others out package partition pctfree pctused pls_integer positive positiven pragma prior private privileges procedure public raise range raw real record ref release remr rename resource return reverse revoke rollback row rowid rowlabel rownum rows rowtype run savepoint schema select separate session set share smallint space sql sqlcode sqlerrm start statement stddev subtype successful sum synonym sysdate tabauth table tables task terminate then to trigger true type uid union unique update use user validate values varchar varchar2 variance view views when whenever where while with work write xor';
	
	var packages = 'DBMS_OUTPUT DBMS_JOB DBMS_SQL';
	
	var operators =	'all and any between cross in join like not null or outer some';

	this.regexList = [
		{ regex: new RegExp('--(.*)$', 'gm'),				css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,		css: 'color:red' },
		{ regex: Highlighter.RegexLib.SingleQuotedString,		css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(funcs), 'gmi'),		css: 'color:#ff1493' },
		{ regex: new RegExp(this.GetKeywords(methods), 'gmi'),		css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(operators), 'gmi'),	css: 'color:#808080' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gmi'),		css: 'color:blue' },
		{ regex: new RegExp(this.GetKeywords(packages), 'gmi'),		css: 'color:#990000' }
	];
}
Highlighter.Brushes.Sql.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.Sql.Aliases	= ['4gl', 'proc', 'sql'];


Highlighter.Brushes.Vb = function()
{
	var funcs = 'Abs Array Asc AscB AscW Atn Avg CBool CByte CCur CDate CDbl Cdec Choose Chr ChrB ChrW CInt CLng Command Cos Count CreateObject CSng CStr CurDir CVar CVDate CVErr Date DateAdd DateDiff DatePart DateSerial DateValue Day DDB Dir DoEvents Environ EOF Error Exp FileAttr FileDateTime FileLen Fix Format FreeFile FV GetAllStrings GetAttr GetAutoServerSettings GetObject GetSetting Hex Hour IIf IMEStatus Input InputB InputBox InStr InstB Int IPmt IsArray IsDate IsEmpty IsError IsMissing IsNull IsNumeric IsObject LBound LCase Left LeftB Len LenB LoadPicture Loc LOF Log LTrim Max Mid MidB Min Minute MIRR Month MsgBox Now NPer NPV Oct Partition Pmt PPmt PV QBColor Rate RGB Right RightB Rnd RTrim Second Seek Sgn Shell Sin SLN Space Spc Sqr StDev StDevP Str StrComp StrConv String Switch Sum SYD Tab Tan Time Timer TimeSerial TimeValue Trim TypeName UBound UCase Val Var VarP VarType Weekday Year';
	
	var methods = 'Accept Activate Add AddCustom AddFile AddFromFile AddFromTemplate AddItem AddNew AddToAddInToolbar AddToolboxProgID Append AppendChunk Arrange Assert AsyncRead BatchUpdate BeginTrans Bind Cancel CancelAsyncRead CancelBatch CancelUpdate CanPropertyChange CaptureImage CellText CellValue Circle Clear ClearFields ClearSel ClearSelCols Clone Close Cls ColContaining ColumnSize CommitTrans CompactDatabase Compose Connect Copy CopyQueryDef CreateDatabase CreateDragImage CreateEmbed CreateField CreateGroup CreateIndex CreateLink CreatePreparedStatement CreatePropery CreateQuery CreateQueryDef CreateRelation CreateTableDef CreateUser CreateWorkspace Customize Delete DeleteColumnLabels DeleteColumns DeleteRowLabels DeleteRows DoVerb Drag Draw Edit EditCopy EditPaste EndDoc EnsureVisible EstablishConnection Execute ExtractIcon Fetch FetchVerbs Files FillCache Find FindFirst FindItem FindLast FindNext FindPrevious Forward GetBookmark GetChunk GetClipString GetData GetFirstVisible GetFormat GetHeader GetLineFromChar GetNumTicks GetRows GetSelectedPart GetText GetVisibleCount GoBack GoForward Hide HitTest HoldFields Idle InitializeLabels InsertColumnLabels InsertColumns InsertObjDlg InsertRowLabels InsertRows Item KillDoc Layout Line LinkExecute LinkPoke LinkRequest LinkSend Listen LoadFile LoadResData LoadResPicture LoadResString LogEvent MakeCompileFile MakeReplica MoreResults Move MoveData MoveFirst MoveLast MoveNext MovePrevious NavigateTo NewPage NewPassword NextRecordset OLEDrag OnAddinsUpdate OnConnection OnDisconnection OnStartupComplete Open OpenConnection OpenDatabase OpenQueryDef OpenRecordset OpenResultset OpenURL Overlay PaintPicture Paste PastSpecialDlg PeekData Play Point PopulatePartial PopupMenu Print PrintForm PropertyChanged PSet Quit Raise RandomDataFill RandomFillColumns RandomFillRows rdoCreateEnvironment rdoRegisterDataSource ReadFromFile ReadProperty Rebind ReFill Refresh RefreshLink RegisterDatabase Reload Remove RemoveAddInFromToolbar RemoveItem Render RepairDatabase Reply ReplyAll Requery ResetCustom ResetCustomLabel ResolveName RestoreToolbar Resync Rollback RollbackTrans RowBookmark RowContaining RowTop Save SaveAs SaveFile SaveToFile SaveToolbar SaveToOle1File Scale ScaleX ScaleY Scroll Select SelectAll SelectPart SelPrint Send SendData Set SetAutoServerSettings SetData SetFocus SetOption SetSize SetText SetViewport Show ShowColor ShowFont ShowHelp ShowOpen ShowPrinter ShowSave ShowWhatsThis SignOff SignOn Size Span SplitContaining StartLabelEdit StartLogging Stop Synchronize TextHeight TextWidth ToDefaults TwipsToChartPart TypeByChartType Update UpdateControls UpdateRecord UpdateRow Upto WhatsThisMode WriteProperty ZOrder';
	
	var events = 'AccessKeyPress AfterAddFile AfterChangeFileName AfterCloseFile AfterColEdit AfterColUpdate AfterDelete AfterInsert AfterLabelEdit AfterRemoveFile AfterUpdate AfterWriteFile AmbienChanged ApplyChanges Associate AsyncReadComplete AxisActivated AxisLabelActivated AxisLabelSelected AxisLabelUpdated AxisSelected AxisTitleActivated AxisTitleSelected AxisTitleUpdated AxisUpdated BeforeClick BeforeColEdit BeforeColUpdate BeforeConnect BeforeDelete BeforeInsert BeforeLabelEdit BeforeLoadFile BeforeUpdate ButtonClick ButtonCompleted ButtonGotFocus ButtonLostFocus Change ChartActivated ChartSelected ChartUpdated Click ColEdit Collapse ColResize ColumnClick Compare ConfigChageCancelled ConfigChanged ConnectionRequest DataArrival DataChanged DataUpdated DblClick Deactivate DeviceArrival DeviceOtherEvent DeviceQueryRemove DeviceQueryRemoveFailed DeviceRemoveComplete DeviceRemovePending DevModeChange Disconnect DisplayChanged Dissociate DoGetNewFileName Done DonePainting DownClick DragDrop DragOver DropDown EditProperty EnterCell EnterFocus Event ExitFocus Expand FootnoteActivated FootnoteSelected FootnoteUpdated GotFocus HeadClick InfoMessage Initialize IniProperties ItemActivated ItemAdded ItemCheck ItemClick ItemReloaded ItemRemoved ItemRenamed ItemSeletected KeyDown KeyPress KeyUp LeaveCell LegendActivated LegendSelected LegendUpdated LinkClose LinkError LinkNotify LinkOpen Load LostFocus MouseDown MouseMove MouseUp NodeClick ObjectMove OLECompleteDrag OLEDragDrop OLEDragOver OLEGiveFeedback OLESetData OLEStartDrag OnAddNew OnComm Paint PanelClick PanelDblClick PathChange PatternChange PlotActivated PlotSelected PlotUpdated PointActivated PointLabelActivated PointLabelSelected PointLabelUpdated PointSelected PointUpdated PowerQuerySuspend PowerResume PowerStatusChanged PowerSuspend QueryChangeConfig QueryComplete QueryCompleted QueryTimeout QueryUnload ReadProperties Reposition RequestChangeFileName RequestWriteFile Resize ResultsChanged RowColChange RowCurrencyChange RowResize RowStatusChanged SelChange SelectionChanged SendComplete SendProgress SeriesActivated SeriesSelected SeriesUpdated SettingChanged SplitChange StateChanged StatusUpdate SysColorsChanged Terminate TimeChanged TitleActivated TitleSelected TitleActivated UnboundAddData UnboundDeleteRow UnboundGetRelativeBookmark UnboundReadData UnboundWriteData Unload UpClick Updated Validate ValidationError WillAssociate WillChangeData WillDissociate WillExecute WillUpdateRows WithEvents WriteProperties';

	var keywords = 'AppActivate Base Beep Call Case ChDir ChDrive Const Declare DefBool DefByte DefCur DefDate DefDbl DefDec DefInt DefLng DefObj DefSng DefStr Deftype DefVar DeleteSetting Dim Do Else ElseIf End Enum Erase Exit Explicit FileCopy For ForEach Friend Function Get GoSub GoTo If Implements Kill Let LineInput Lock LSet MkDir Name Next OnError On Option Private Property Public Put RaiseEvent Randomize ReDim Rem Reset Resume Return RmDir RSet SavePicture SaveSetting SendKeys SetAttr Static Sub Then Type Unlock Wend While Width With Write';

	this.regexList = [
		{ regex: new RegExp('\'.*$', 'gm'),			css: 'color:#008080' },
		{ regex: Highlighter.RegexLib.DoubleQuotedString,	css: 'color:#990000' },
		{ regex: new RegExp('^\\s*#.*', 'gm'),			css: 'color:#990000' },
		{ regex: new RegExp(this.GetKeywords(funcs), 'gm'),	css: 'color:#008000' },
		{ regex: new RegExp(this.GetKeywords(methods), 'gm'),	css: 'color:#FF8000' },
		{ regex: new RegExp(this.GetKeywords(events), 'gm'),	css: 'color:red' },
		{ regex: new RegExp(this.GetKeywords(keywords), 'gm'),	css: 'color:blue' }
	];
}
Highlighter.Brushes.Vb.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.Vb.Aliases	= ['bas', 'frm', 'cls', 'vbs', 'ctl', 'vb', 'vb.net'];


Highlighter.Brushes.Xml = function() {
	this.regexList = [
		{ regex: new RegExp('(\\&lt;|<)\\![\\s\\w]+[\\s\\S]*?(\\&gt;|>)', 'gm'),			css: 'color:#ff1493' },
		{ regex: new RegExp('(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)', 'gm'),		css: 'color:#808080' },
		{ regex: new RegExp('(\\&lt;|<)\\!--[\\s\\S]*?--(\\&gt;|>)', 'gm'),				css: 'color:#006600' },
		{ regex: new RegExp('\\b[\\w\\?\\-:]+(?=(\\s*=[^<>]*>))', 'gm'),				css: 'color:red' },
		{ regex: new RegExp('xsl:[\\w-]+(?=([\\s\\S]*=[\\s\\S]*)|(\\s*\\?*(\\&gt;|>)+))', 'gmi'),	css: 'color:#50AF98' },
		{ regex: new RegExp('(\\&lt;|<)/?((?!xsl:)[/\\w\\?-]*)?(?!\\!|-|\\])|/*\\?*(\\&gt;|>)', 'gmi'),	css: 'color:blue' }
	];
}
Highlighter.Brushes.Xml.prototype	= new Highlighter.Brushe();
Highlighter.Brushes.Xml.Aliases	= ['asp', 'jsp', 'aspx', 'htt', 'htx', 'phtml', 'wml', 'rss', 'xhtml', 'shtml', 'dhtml', 'dtd', 'html', 'htm', 'xhtml', 'xml', 'xsd', 'xsl', 'xslt', 'config'];
