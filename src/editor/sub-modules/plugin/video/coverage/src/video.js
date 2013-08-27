function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/video.js']) {
  _$jscoverage['/video.js'] = {};
  _$jscoverage['/video.js'].lineData = [];
  _$jscoverage['/video.js'].lineData[5] = 0;
  _$jscoverage['/video.js'].lineData[6] = 0;
  _$jscoverage['/video.js'].lineData[9] = 0;
  _$jscoverage['/video.js'].lineData[10] = 0;
  _$jscoverage['/video.js'].lineData[13] = 0;
  _$jscoverage['/video.js'].lineData[16] = 0;
  _$jscoverage['/video.js'].lineData[18] = 0;
  _$jscoverage['/video.js'].lineData[21] = 0;
  _$jscoverage['/video.js'].lineData[23] = 0;
  _$jscoverage['/video.js'].lineData[24] = 0;
  _$jscoverage['/video.js'].lineData[27] = 0;
  _$jscoverage['/video.js'].lineData[28] = 0;
  _$jscoverage['/video.js'].lineData[29] = 0;
  _$jscoverage['/video.js'].lineData[32] = 0;
  _$jscoverage['/video.js'].lineData[35] = 0;
  _$jscoverage['/video.js'].lineData[37] = 0;
  _$jscoverage['/video.js'].lineData[38] = 0;
  _$jscoverage['/video.js'].lineData[41] = 0;
  _$jscoverage['/video.js'].lineData[43] = 0;
  _$jscoverage['/video.js'].lineData[46] = 0;
  _$jscoverage['/video.js'].lineData[47] = 0;
  _$jscoverage['/video.js'].lineData[48] = 0;
  _$jscoverage['/video.js'].lineData[51] = 0;
  _$jscoverage['/video.js'].lineData[52] = 0;
  _$jscoverage['/video.js'].lineData[53] = 0;
  _$jscoverage['/video.js'].lineData[54] = 0;
  _$jscoverage['/video.js'].lineData[56] = 0;
  _$jscoverage['/video.js'].lineData[57] = 0;
  _$jscoverage['/video.js'].lineData[62] = 0;
  _$jscoverage['/video.js'].lineData[64] = 0;
  _$jscoverage['/video.js'].lineData[65] = 0;
  _$jscoverage['/video.js'].lineData[66] = 0;
  _$jscoverage['/video.js'].lineData[68] = 0;
  _$jscoverage['/video.js'].lineData[70] = 0;
  _$jscoverage['/video.js'].lineData[79] = 0;
  _$jscoverage['/video.js'].lineData[80] = 0;
  _$jscoverage['/video.js'].lineData[81] = 0;
  _$jscoverage['/video.js'].lineData[82] = 0;
  _$jscoverage['/video.js'].lineData[91] = 0;
  _$jscoverage['/video.js'].lineData[100] = 0;
  _$jscoverage['/video.js'].lineData[101] = 0;
  _$jscoverage['/video.js'].lineData[102] = 0;
  _$jscoverage['/video.js'].lineData[108] = 0;
  _$jscoverage['/video.js'].lineData[112] = 0;
  _$jscoverage['/video.js'].lineData[121] = 0;
}
if (! _$jscoverage['/video.js'].functionData) {
  _$jscoverage['/video.js'].functionData = [];
  _$jscoverage['/video.js'].functionData[0] = 0;
  _$jscoverage['/video.js'].functionData[1] = 0;
  _$jscoverage['/video.js'].functionData[2] = 0;
  _$jscoverage['/video.js'].functionData[3] = 0;
  _$jscoverage['/video.js'].functionData[4] = 0;
  _$jscoverage['/video.js'].functionData[5] = 0;
  _$jscoverage['/video.js'].functionData[6] = 0;
  _$jscoverage['/video.js'].functionData[7] = 0;
}
if (! _$jscoverage['/video.js'].branchData) {
  _$jscoverage['/video.js'].branchData = {};
  _$jscoverage['/video.js'].branchData['19'] = [];
  _$jscoverage['/video.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['25'] = [];
  _$jscoverage['/video.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['28'] = [];
  _$jscoverage['/video.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['37'] = [];
  _$jscoverage['/video.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['43'] = [];
  _$jscoverage['/video.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['48'] = [];
  _$jscoverage['/video.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['51'] = [];
  _$jscoverage['/video.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['52'] = [];
  _$jscoverage['/video.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['53'] = [];
  _$jscoverage['/video.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['56'] = [];
  _$jscoverage['/video.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['64'] = [];
  _$jscoverage['/video.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['66'] = [];
  _$jscoverage['/video.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/video.js'].branchData['67'] = [];
  _$jscoverage['/video.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['68'] = [];
  _$jscoverage['/video.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/video.js'].branchData['79'] = [];
  _$jscoverage['/video.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['81'] = [];
  _$jscoverage['/video.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['101'] = [];
  _$jscoverage['/video.js'].branchData['101'][1] = new BranchData();
}
_$jscoverage['/video.js'].branchData['101'][1].init(102, 10, 'selectedEl');
function visit19_101_1(result) {
  _$jscoverage['/video.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['81'][1].init(136, 40, 'getProvider(element.getAttribute("src"))');
function visit18_81_1(result) {
  _$jscoverage['/video.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['79'][1].init(30, 33, '!flashUtils.isFlashEmbed(element)');
function visit17_79_1(result) {
  _$jscoverage['/video.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['68'][2].init(50, 87, 'c.getAttribute("value") || c.getAttribute("VALUE")');
function visit16_68_2(result) {
  _$jscoverage['/video.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['68'][1].init(38, 100, 'getProvider(c.getAttribute("value") || c.getAttribute("VALUE"))');
function visit15_68_1(result) {
  _$jscoverage['/video.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['67'][1].init(57, 47, 'c.getAttribute("name").toLowerCase() == "movie"');
function visit14_67_1(result) {
  _$jscoverage['/video.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['66'][2].init(88, 21, 'c.nodeName == \'param\'');
function visit13_66_2(result) {
  _$jscoverage['/video.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['66'][1].init(88, 105, 'c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie"');
function visit12_66_1(result) {
  _$jscoverage['/video.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['64'][1].init(1040, 21, 'i < childNodes.length');
function visit11_64_1(result) {
  _$jscoverage['/video.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['56'][1].init(221, 48, 'getProvider(childNodes[i].getAttribute("src"))');
function visit10_56_1(result) {
  _$jscoverage['/video.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['53'][1].init(42, 41, '!flashUtils.isFlashEmbed(childNodes[i])');
function visit9_53_1(result) {
  _$jscoverage['/video.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['52'][1].init(38, 35, 'childNodes[i].nodeName == \'embed\'');
function visit8_52_1(result) {
  _$jscoverage['/video.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['51'][1].init(103, 21, 'i < childNodes.length');
function visit7_51_1(result) {
  _$jscoverage['/video.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['48'][1].init(167, 8, '!classId');
function visit6_48_1(result) {
  _$jscoverage['/video.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['43'][1].init(813, 2296, 'dataFilter && dataFilter.addRules({\n  tags: {\n  \'object\': function(element) {\n  var classId = element.getAttribute("classid"), i;\n  var childNodes = element.childNodes;\n  if (!classId) {\n    for (i = 0; i < childNodes.length; i++) {\n      if (childNodes[i].nodeName == \'embed\') {\n        if (!flashUtils.isFlashEmbed(childNodes[i])) {\n          return null;\n        }\n        if (getProvider(childNodes[i].getAttribute("src"))) {\n          return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n        }\n      }\n    }\n    return null;\n  }\n  for (i = 0; i < childNodes.length; i++) {\n    var c = childNodes[i];\n    if (c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie") {\n      if (getProvider(c.getAttribute("value") || c.getAttribute("VALUE"))) {\n        return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n      }\n    }\n  }\n}, \n  \'embed\': function(element) {\n  if (!flashUtils.isFlashEmbed(element)) {\n    return null;\n  }\n  if (getProvider(element.getAttribute("src"))) {\n    return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n  }\n}}}, 4)');
function visit5_43_1(result) {
  _$jscoverage['/video.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['37'][1].init(636, 21, 'videoCfg[\'providers\']');
function visit4_37_1(result) {
  _$jscoverage['/video.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['28'][1].init(68, 18, 'p[\'reg\'].test(url)');
function visit3_28_1(result) {
  _$jscoverage['/video.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['25'][1].init(37, 19, 'i < provider.length');
function visit2_25_1(result) {
  _$jscoverage['/video.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['19'][1].init(75, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit1_19_1(result) {
  _$jscoverage['/video.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].lineData[5]++;
KISSY.add("editor/plugin/video", function(S, Editor, flashUtils, FlashBaseClass, fakeObjects) {
  _$jscoverage['/video.js'].functionData[0]++;
  _$jscoverage['/video.js'].lineData[6]++;
  var CLS_VIDEO = "ke_video", TYPE_VIDEO = "video";
  _$jscoverage['/video.js'].lineData[9]++;
  function video(config) {
    _$jscoverage['/video.js'].functionData[1]++;
    _$jscoverage['/video.js'].lineData[10]++;
    this.config = config;
  }
  _$jscoverage['/video.js'].lineData[13]++;
  S.augment(video, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/video.js'].functionData[2]++;
  _$jscoverage['/video.js'].lineData[16]++;
  fakeObjects.init(editor);
  _$jscoverage['/video.js'].lineData[18]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit1_19_1(dataProcessor && dataProcessor.dataFilter);
  _$jscoverage['/video.js'].lineData[21]++;
  var provider = [];
  _$jscoverage['/video.js'].lineData[23]++;
  function getProvider(url) {
    _$jscoverage['/video.js'].functionData[3]++;
    _$jscoverage['/video.js'].lineData[24]++;
    for (var i = 0; visit2_25_1(i < provider.length); i++) {
      _$jscoverage['/video.js'].lineData[27]++;
      var p = provider[i];
      _$jscoverage['/video.js'].lineData[28]++;
      if (visit3_28_1(p['reg'].test(url))) {
        _$jscoverage['/video.js'].lineData[29]++;
        return p;
      }
    }
    _$jscoverage['/video.js'].lineData[32]++;
    return undefined;
  }
  _$jscoverage['/video.js'].lineData[35]++;
  var videoCfg = this.config;
  _$jscoverage['/video.js'].lineData[37]++;
  if (visit4_37_1(videoCfg['providers'])) {
    _$jscoverage['/video.js'].lineData[38]++;
    provider.push.apply(provider, videoCfg['providers']);
  }
  _$jscoverage['/video.js'].lineData[41]++;
  videoCfg.getProvider = getProvider;
  _$jscoverage['/video.js'].lineData[43]++;
  visit5_43_1(dataFilter && dataFilter.addRules({
  tags: {
  'object': function(element) {
  _$jscoverage['/video.js'].functionData[4]++;
  _$jscoverage['/video.js'].lineData[46]++;
  var classId = element.getAttribute("classid"), i;
  _$jscoverage['/video.js'].lineData[47]++;
  var childNodes = element.childNodes;
  _$jscoverage['/video.js'].lineData[48]++;
  if (visit6_48_1(!classId)) {
    _$jscoverage['/video.js'].lineData[51]++;
    for (i = 0; visit7_51_1(i < childNodes.length); i++) {
      _$jscoverage['/video.js'].lineData[52]++;
      if (visit8_52_1(childNodes[i].nodeName == 'embed')) {
        _$jscoverage['/video.js'].lineData[53]++;
        if (visit9_53_1(!flashUtils.isFlashEmbed(childNodes[i]))) {
          _$jscoverage['/video.js'].lineData[54]++;
          return null;
        }
        _$jscoverage['/video.js'].lineData[56]++;
        if (visit10_56_1(getProvider(childNodes[i].getAttribute("src")))) {
          _$jscoverage['/video.js'].lineData[57]++;
          return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
        }
      }
    }
    _$jscoverage['/video.js'].lineData[62]++;
    return null;
  }
  _$jscoverage['/video.js'].lineData[64]++;
  for (i = 0; visit11_64_1(i < childNodes.length); i++) {
    _$jscoverage['/video.js'].lineData[65]++;
    var c = childNodes[i];
    _$jscoverage['/video.js'].lineData[66]++;
    if (visit12_66_1(visit13_66_2(c.nodeName == 'param') && visit14_67_1(c.getAttribute("name").toLowerCase() == "movie"))) {
      _$jscoverage['/video.js'].lineData[68]++;
      if (visit15_68_1(getProvider(visit16_68_2(c.getAttribute("value") || c.getAttribute("VALUE"))))) {
        _$jscoverage['/video.js'].lineData[70]++;
        return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
      }
    }
  }
}, 
  'embed': function(element) {
  _$jscoverage['/video.js'].functionData[5]++;
  _$jscoverage['/video.js'].lineData[79]++;
  if (visit17_79_1(!flashUtils.isFlashEmbed(element))) {
    _$jscoverage['/video.js'].lineData[80]++;
    return null;
  }
  _$jscoverage['/video.js'].lineData[81]++;
  if (visit18_81_1(getProvider(element.getAttribute("src")))) {
    _$jscoverage['/video.js'].lineData[82]++;
    return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
  }
}}}, 4));
  _$jscoverage['/video.js'].lineData[91]++;
  var flashControl = new FlashBaseClass({
  editor: editor, 
  cls: CLS_VIDEO, 
  type: TYPE_VIDEO, 
  pluginConfig: this.config, 
  bubbleId: "video", 
  contextMenuId: "video", 
  contextMenuHandlers: {
  "\u89c6\u9891\u5c5e\u6027": function() {
  _$jscoverage['/video.js'].functionData[6]++;
  _$jscoverage['/video.js'].lineData[100]++;
  var selectedEl = this.get("editorSelectedEl");
  _$jscoverage['/video.js'].lineData[101]++;
  if (visit19_101_1(selectedEl)) {
    _$jscoverage['/video.js'].lineData[102]++;
    flashControl.show(selectedEl);
  }
}}});
  _$jscoverage['/video.js'].lineData[108]++;
  editor.addButton("video", {
  tooltip: "\u63d2\u5165\u89c6\u9891", 
  listeners: {
  click: function() {
  _$jscoverage['/video.js'].functionData[7]++;
  _$jscoverage['/video.js'].lineData[112]++;
  flashControl.show();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/video.js'].lineData[121]++;
  return video;
}, {
  requires: ['editor', './flash-common/utils', './flash-common/base-class', './fake-objects']});
