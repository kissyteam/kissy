/**
 * @fileOverview 增加常用校验规则
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/normal", function(S, DOM, Event, Util, Rule) {
	
	//自定义函数
	Rule.add("func","校验失败。",function(value,text,fun){
		var result = fun.call(this,value);

		if(result===false){
			return text;
		}

		if(!Util.isEmpty(result)){
			return result;
		}

	});

	//正则校验
	Rule.add("regex","校验失败。",function(value,text,reg){
		if(!new RegExp(reg).test(value)){
			return text;
		}
	});
	
	
	Rule.add("depend","该字段无需校验",function(value,text,fun){
		return fun.call(this,value);
	});
	
 
	//ajax校验
//	Rule.add("remote","校验失败。",function(value,text,url){
//
//	});
	//ajax校验
	Rule.add("ajax","校验失败。",function(value,text,fun){
		return fun.call(this,value);
	});
	
	//为空校验
	Rule.add("required","此项为必填项。",function(value,text,is){
		if(S.isArray(value) && value.length==0){
			return text;
		}
		if(Util.isEmpty(value) && is){
			return text;
		}
	});

	//重复校验
	Rule.add("equalTo","两次输入不一致。",function(value,text,to){
		if(value !== DOM.val(S.get(to))){
			return text;
		}
	});

	//长度校验
	Rule.add("length","字符长度不能小于{0},且不能大于{1}",function(value,text,minLen,maxLen,realLength){
		var len = Util.getStrLen(value,realLength),
			minl = Util.toNumber(minLen), maxl = Util.toNumber(maxLen);
		if(!(len>=minl && len<=maxl)){
			return Util.format(text,minl,maxl);
		}
	});
	
	//最小长度校验
	Rule.add("minLength","不能小于{0}个字符。",function(value,text,minLen,realLength){
		var len = Util.getStrLen(value,realLength),
			minl = Util.toNumber(minLen);
		if(len<minl){
			return Util.format(text,minl);
		}
	});
	
	//最大长度校验
	Rule.add("maxLength","不能大于{0}个字符。",function(value,text,maxLen,realLength){
		var len = Util.getStrLen(value,realLength),
			maxl = Util.toNumber(maxLen);
		if(len>maxl){
			return Util.format(text,maxl);
		}
	});
	
	//允许格式
	Rule.add("fiter","允许的格式{0}。",function(value,text,type){
		if(!new RegExp( '^.+\.(?=EXT)(EXT)$'.replace(/EXT/g, type.split(/\s*,\s*/).join('|')), 'gi' ).test(value)){
			return Util.format(text,type);
		}
	});
	
	//数值范围校验
	Rule.add("range","只能在{0}至{1}之间。",function(value,text,min,max){
		min = Util.toNumber(min), max = Util.toNumber(max);
		if(value<min || value>max){
			return Util.format(text,min,max);
		}
	});
	
	//checkbox数量校验
	Rule.add("group","只能在{0}至{1}之间。",function(value,text,min,max){
		if(S.isArray(value)){
			var len = value.length;
			if(!(len>=min && len<=max)){
				return Util.format(text, min, max);
			}
		}
	});
	
	//两端不含空格
	Rule.add("trim","两端不能含有空格。",function(value,text){
		if(/(^\s+)|(\s+$)/g.test(value)){
			return text
		}
	});
	
	//左侧不能含有空格
	Rule.add("ltrim","字符串最前面不能包含空格",function(value,text){
		if(/^\s+/g.test(value)){
			return text
		}
	});
	
	//右侧不能含有空格
	Rule.add("rtrim","字符串末尾不能包含空格",function(value,text){
		if(/\s+$/g.test(value)){
			return text
		}
	});
	
	Rule.add("card","身份证号码不正确",function(value,text){
		var iW = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2,1],
			iSum = 0;
		for( i=0;i<17;i++){
			iSum += parseInt(value.charAt(i))* iW[i];
		}
		var sJYM = (12-(iSum % 11)) % 11;
		if(sJYM == 10){
			sJYM = 'x';
		}
		var cCheck = value.charAt(17).toLowerCase();
		if( cCheck != sJYM ){
			return text;
		}
	});
	
	
	
	S.each([["chinese",/^[\u0391-\uFFE5]+$/,"只能输入中文"],
			["english",/^[A-Za-z]+$/,"只能输入英文字母"],
			["currency",/^\d+(\.\d+)?$/,"金额格式不正确。"],
			["phone",/^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,"电话号码格式不正确。"],
			["mobile",/^((\(\d{2,3}\))|(\d{3}\-))?13\d{9}$/,"手机号码格式不正确。"],
			["url",/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]':+!]*([^<>""])*$/,"url格式不正确。"],
			["email",/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,"请输入正确的email格式"]
		],function(item){
			Rule.add(item[0],item[2],function(value,text){
				if(!new RegExp(item[1]).test(value)){
					return text;
				}
			});
		});



}, { requires: ['dom',"event","../utils","./base"] });





