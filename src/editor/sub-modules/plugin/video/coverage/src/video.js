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
  _$jscoverage['/video.js'].lineData[6] = 0;
  _$jscoverage['/video.js'].lineData[7] = 0;
  _$jscoverage['/video.js'].lineData[10] = 0;
  _$jscoverage['/video.js'].lineData[11] = 0;
  _$jscoverage['/video.js'].lineData[14] = 0;
  _$jscoverage['/video.js'].lineData[17] = 0;
  _$jscoverage['/video.js'].lineData[19] = 0;
  _$jscoverage['/video.js'].lineData[22] = 0;
  _$jscoverage['/video.js'].lineData[24] = 0;
  _$jscoverage['/video.js'].lineData[25] = 0;
  _$jscoverage['/video.js'].lineData[28] = 0;
  _$jscoverage['/video.js'].lineData[29] = 0;
  _$jscoverage['/video.js'].lineData[30] = 0;
  _$jscoverage['/video.js'].lineData[33] = 0;
  _$jscoverage['/video.js'].lineData[36] = 0;
  _$jscoverage['/video.js'].lineData[38] = 0;
  _$jscoverage['/video.js'].lineData[39] = 0;
  _$jscoverage['/video.js'].lineData[42] = 0;
  _$jscoverage['/video.js'].lineData[44] = 0;
  _$jscoverage['/video.js'].lineData[47] = 0;
  _$jscoverage['/video.js'].lineData[48] = 0;
  _$jscoverage['/video.js'].lineData[49] = 0;
  _$jscoverage['/video.js'].lineData[52] = 0;
  _$jscoverage['/video.js'].lineData[53] = 0;
  _$jscoverage['/video.js'].lineData[54] = 0;
  _$jscoverage['/video.js'].lineData[55] = 0;
  _$jscoverage['/video.js'].lineData[57] = 0;
  _$jscoverage['/video.js'].lineData[58] = 0;
  _$jscoverage['/video.js'].lineData[63] = 0;
  _$jscoverage['/video.js'].lineData[65] = 0;
  _$jscoverage['/video.js'].lineData[66] = 0;
  _$jscoverage['/video.js'].lineData[67] = 0;
  _$jscoverage['/video.js'].lineData[69] = 0;
  _$jscoverage['/video.js'].lineData[71] = 0;
  _$jscoverage['/video.js'].lineData[80] = 0;
  _$jscoverage['/video.js'].lineData[81] = 0;
  _$jscoverage['/video.js'].lineData[82] = 0;
  _$jscoverage['/video.js'].lineData[83] = 0;
  _$jscoverage['/video.js'].lineData[92] = 0;
  _$jscoverage['/video.js'].lineData[101] = 0;
  _$jscoverage['/video.js'].lineData[102] = 0;
  _$jscoverage['/video.js'].lineData[103] = 0;
  _$jscoverage['/video.js'].lineData[109] = 0;
  _$jscoverage['/video.js'].lineData[113] = 0;
  _$jscoverage['/video.js'].lineData[122] = 0;
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
  _$jscoverage['/video.js'].branchData['20'] = [];
  _$jscoverage['/video.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['26'] = [];
  _$jscoverage['/video.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['29'] = [];
  _$jscoverage['/video.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['38'] = [];
  _$jscoverage['/video.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['44'] = [];
  _$jscoverage['/video.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['49'] = [];
  _$jscoverage['/video.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['52'] = [];
  _$jscoverage['/video.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['53'] = [];
  _$jscoverage['/video.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['54'] = [];
  _$jscoverage['/video.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['57'] = [];
  _$jscoverage['/video.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['65'] = [];
  _$jscoverage['/video.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['67'] = [];
  _$jscoverage['/video.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/video.js'].branchData['68'] = [];
  _$jscoverage['/video.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['69'] = [];
  _$jscoverage['/video.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/video.js'].branchData['80'] = [];
  _$jscoverage['/video.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['82'] = [];
  _$jscoverage['/video.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['102'] = [];
  _$jscoverage['/video.js'].branchData['102'][1] = new BranchData();
}
_$jscoverage['/video.js'].branchData['102'][1].init(102, 10, 'selectedEl');
function visit19_102_1(result) {
  _$jscoverage['/video.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['82'][1].init(136, 40, 'getProvider(element.getAttribute("src"))');
function visit18_82_1(result) {
  _$jscoverage['/video.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['80'][1].init(30, 33, '!flashUtils.isFlashEmbed(element)');
function visit17_80_1(result) {
  _$jscoverage['/video.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['69'][2].init(50, 87, 'c.getAttribute("value") || c.getAttribute("VALUE")');
function visit16_69_2(result) {
  _$jscoverage['/video.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['69'][1].init(38, 100, 'getProvider(c.getAttribute("value") || c.getAttribute("VALUE"))');
function visit15_69_1(result) {
  _$jscoverage['/video.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['68'][1].init(57, 47, 'c.getAttribute("name").toLowerCase() == "movie"');
function visit14_68_1(result) {
  _$jscoverage['/video.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['67'][2].init(88, 21, 'c.nodeName == \'param\'');
function visit13_67_2(result) {
  _$jscoverage['/video.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['67'][1].init(88, 105, 'c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie"');
function visit12_67_1(result) {
  _$jscoverage['/video.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['65'][1].init(1040, 21, 'i < childNodes.length');
function visit11_65_1(result) {
  _$jscoverage['/video.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['57'][1].init(221, 48, 'getProvider(childNodes[i].getAttribute("src"))');
function visit10_57_1(result) {
  _$jscoverage['/video.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['54'][1].init(42, 41, '!flashUtils.isFlashEmbed(childNodes[i])');
function visit9_54_1(result) {
  _$jscoverage['/video.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['53'][1].init(38, 35, 'childNodes[i].nodeName == \'embed\'');
function visit8_53_1(result) {
  _$jscoverage['/video.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['52'][1].init(103, 21, 'i < childNodes.length');
function visit7_52_1(result) {
  _$jscoverage['/video.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['49'][1].init(167, 8, '!classId');
function visit6_49_1(result) {
  _$jscoverage['/video.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['44'][1].init(813, 2296, 'dataFilter && dataFilter.addRules({\n  tags: {\n  \'object\': function(element) {\n  var classId = element.getAttribute("classid"), i;\n  var childNodes = element.childNodes;\n  if (!classId) {\n    for (i = 0; i < childNodes.length; i++) {\n      if (childNodes[i].nodeName == \'embed\') {\n        if (!flashUtils.isFlashEmbed(childNodes[i])) {\n          return null;\n        }\n        if (getProvider(childNodes[i].getAttribute("src"))) {\n          return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n        }\n      }\n    }\n    return null;\n  }\n  for (i = 0; i < childNodes.length; i++) {\n    var c = childNodes[i];\n    if (c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie") {\n      if (getProvider(c.getAttribute("value") || c.getAttribute("VALUE"))) {\n        return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n      }\n    }\n  }\n}, \n  \'embed\': function(element) {\n  if (!flashUtils.isFlashEmbed(element)) {\n    return null;\n  }\n  if (getProvider(element.getAttribute("src"))) {\n    return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n  }\n}}}, 4)');
function visit5_44_1(result) {
  _$jscoverage['/video.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['38'][1].init(636, 21, 'videoCfg[\'providers\']');
function visit4_38_1(result) {
  _$jscoverage['/video.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['29'][1].init(68, 18, 'p[\'reg\'].test(url)');
function visit3_29_1(result) {
  _$jscoverage['/video.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['26'][1].init(37, 19, 'i < provider.length');
function visit2_26_1(result) {
  _$jscoverage['/video.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['20'][1].init(75, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit1_20_1(result) {
  _$jscoverage['/video.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].lineData[6]++;
KISSY.add("editor/plugin/video", function(S, Editor, flashUtils, FlashBaseClass, fakeObjects) {
  _$jscoverage['/video.js'].functionData[0]++;
  _$jscoverage['/video.js'].lineData[7]++;
  var CLS_VIDEO = "ke_video", TYPE_VIDEO = "video";
  _$jscoverage['/video.js'].lineData[10]++;
  function video(config) {
    _$jscoverage['/video.js'].functionData[1]++;
    _$jscoverage['/video.js'].lineData[11]++;
    this.config = config;
  }
  _$jscoverage['/video.js'].lineData[14]++;
  S.augment(video, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/video.js'].functionData[2]++;
  _$jscoverage['/video.js'].lineData[17]++;
  fakeObjects.init(editor);
  _$jscoverage['/video.js'].lineData[19]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit1_20_1(dataProcessor && dataProcessor.dataFilter);
  _$jscoverage['/video.js'].lineData[22]++;
  var provider = [];
  _$jscoverage['/video.js'].lineData[24]++;
  function getProvider(url) {
    _$jscoverage['/video.js'].functionData[3]++;
    _$jscoverage['/video.js'].lineData[25]++;
    for (var i = 0; visit2_26_1(i < provider.length); i++) {
      _$jscoverage['/video.js'].lineData[28]++;
      var p = provider[i];
      _$jscoverage['/video.js'].lineData[29]++;
      if (visit3_29_1(p['reg'].test(url))) {
        _$jscoverage['/video.js'].lineData[30]++;
        return p;
      }
    }
    _$jscoverage['/video.js'].lineData[33]++;
    return undefined;
  }
  _$jscoverage['/video.js'].lineData[36]++;
  var videoCfg = this.config;
  _$jscoverage['/video.js'].lineData[38]++;
  if (visit4_38_1(videoCfg['providers'])) {
    _$jscoverage['/video.js'].lineData[39]++;
    provider.push.apply(provider, videoCfg['providers']);
  }
  _$jscoverage['/video.js'].lineData[42]++;
  videoCfg.getProvider = getProvider;
  _$jscoverage['/video.js'].lineData[44]++;
  visit5_44_1(dataFilter && dataFilter.addRules({
  tags: {
  'object': function(element) {
  _$jscoverage['/video.js'].functionData[4]++;
  _$jscoverage['/video.js'].lineData[47]++;
  var classId = element.getAttribute("classid"), i;
  _$jscoverage['/video.js'].lineData[48]++;
  var childNodes = element.childNodes;
  _$jscoverage['/video.js'].lineData[49]++;
  if (visit6_49_1(!classId)) {
    _$jscoverage['/video.js'].lineData[52]++;
    for (i = 0; visit7_52_1(i < childNodes.length); i++) {
      _$jscoverage['/video.js'].lineData[53]++;
      if (visit8_53_1(childNodes[i].nodeName == 'embed')) {
        _$jscoverage['/video.js'].lineData[54]++;
        if (visit9_54_1(!flashUtils.isFlashEmbed(childNodes[i]))) {
          _$jscoverage['/video.js'].lineData[55]++;
          return null;
        }
        _$jscoverage['/video.js'].lineData[57]++;
        if (visit10_57_1(getProvider(childNodes[i].getAttribute("src")))) {
          _$jscoverage['/video.js'].lineData[58]++;
          return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
        }
      }
    }
    _$jscoverage['/video.js'].lineData[63]++;
    return null;
  }
  _$jscoverage['/video.js'].lineData[65]++;
  for (i = 0; visit11_65_1(i < childNodes.length); i++) {
    _$jscoverage['/video.js'].lineData[66]++;
    var c = childNodes[i];
    _$jscoverage['/video.js'].lineData[67]++;
    if (visit12_67_1(visit13_67_2(c.nodeName == 'param') && visit14_68_1(c.getAttribute("name").toLowerCase() == "movie"))) {
      _$jscoverage['/video.js'].lineData[69]++;
      if (visit15_69_1(getProvider(visit16_69_2(c.getAttribute("value") || c.getAttribute("VALUE"))))) {
        _$jscoverage['/video.js'].lineData[71]++;
        return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
      }
    }
  }
}, 
  'embed': function(element) {
  _$jscoverage['/video.js'].functionData[5]++;
  _$jscoverage['/video.js'].lineData[80]++;
  if (visit17_80_1(!flashUtils.isFlashEmbed(element))) {
    _$jscoverage['/video.js'].lineData[81]++;
    return null;
  }
  _$jscoverage['/video.js'].lineData[82]++;
  if (visit18_82_1(getProvider(element.getAttribute("src")))) {
    _$jscoverage['/video.js'].lineData[83]++;
    return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
  }
}}}, 4));
  _$jscoverage['/video.js'].lineData[92]++;
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
  _$jscoverage['/video.js'].lineData[101]++;
  var selectedEl = this.get("editorSelectedEl");
  _$jscoverage['/video.js'].lineData[102]++;
  if (visit19_102_1(selectedEl)) {
    _$jscoverage['/video.js'].lineData[103]++;
    flashControl.show(selectedEl);
  }
}}});
  _$jscoverage['/video.js'].lineData[109]++;
  editor.addButton("video", {
  tooltip: "\u63d2\u5165\u89c6\u9891", 
  listeners: {
  click: function() {
  _$jscoverage['/video.js'].functionData[7]++;
  _$jscoverage['/video.js'].lineData[113]++;
  flashControl.show();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/video.js'].lineData[122]++;
  return video;
}, {
  requires: ['editor', './flash-common/utils', './flash-common/base-class', './fake-objects']});
