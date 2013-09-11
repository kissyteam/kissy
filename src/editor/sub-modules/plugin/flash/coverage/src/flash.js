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
if (! _$jscoverage['/flash.js']) {
  _$jscoverage['/flash.js'] = {};
  _$jscoverage['/flash.js'].lineData = [];
  _$jscoverage['/flash.js'].lineData[6] = 0;
  _$jscoverage['/flash.js'].lineData[7] = 0;
  _$jscoverage['/flash.js'].lineData[10] = 0;
  _$jscoverage['/flash.js'].lineData[11] = 0;
  _$jscoverage['/flash.js'].lineData[14] = 0;
  _$jscoverage['/flash.js'].lineData[17] = 0;
  _$jscoverage['/flash.js'].lineData[19] = 0;
  _$jscoverage['/flash.js'].lineData[22] = 0;
  _$jscoverage['/flash.js'].lineData[25] = 0;
  _$jscoverage['/flash.js'].lineData[26] = 0;
  _$jscoverage['/flash.js'].lineData[27] = 0;
  _$jscoverage['/flash.js'].lineData[29] = 0;
  _$jscoverage['/flash.js'].lineData[30] = 0;
  _$jscoverage['/flash.js'].lineData[31] = 0;
  _$jscoverage['/flash.js'].lineData[32] = 0;
  _$jscoverage['/flash.js'].lineData[36] = 0;
  _$jscoverage['/flash.js'].lineData[40] = 0;
  _$jscoverage['/flash.js'].lineData[42] = 0;
  _$jscoverage['/flash.js'].lineData[46] = 0;
  _$jscoverage['/flash.js'].lineData[47] = 0;
  _$jscoverage['/flash.js'].lineData[50] = 0;
  _$jscoverage['/flash.js'].lineData[57] = 0;
  _$jscoverage['/flash.js'].lineData[66] = 0;
  _$jscoverage['/flash.js'].lineData[67] = 0;
  _$jscoverage['/flash.js'].lineData[68] = 0;
  _$jscoverage['/flash.js'].lineData[74] = 0;
  _$jscoverage['/flash.js'].lineData[76] = 0;
  _$jscoverage['/flash.js'].lineData[80] = 0;
  _$jscoverage['/flash.js'].lineData[88] = 0;
}
if (! _$jscoverage['/flash.js'].functionData) {
  _$jscoverage['/flash.js'].functionData = [];
  _$jscoverage['/flash.js'].functionData[0] = 0;
  _$jscoverage['/flash.js'].functionData[1] = 0;
  _$jscoverage['/flash.js'].functionData[2] = 0;
  _$jscoverage['/flash.js'].functionData[3] = 0;
  _$jscoverage['/flash.js'].functionData[4] = 0;
  _$jscoverage['/flash.js'].functionData[5] = 0;
  _$jscoverage['/flash.js'].functionData[6] = 0;
}
if (! _$jscoverage['/flash.js'].branchData) {
  _$jscoverage['/flash.js'].branchData = {};
  _$jscoverage['/flash.js'].branchData['11'] = [];
  _$jscoverage['/flash.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/flash.js'].branchData['26'] = [];
  _$jscoverage['/flash.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/flash.js'].branchData['29'] = [];
  _$jscoverage['/flash.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/flash.js'].branchData['30'] = [];
  _$jscoverage['/flash.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/flash.js'].branchData['31'] = [];
  _$jscoverage['/flash.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/flash.js'].branchData['46'] = [];
  _$jscoverage['/flash.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/flash.js'].branchData['67'] = [];
  _$jscoverage['/flash.js'].branchData['67'][1] = new BranchData();
}
_$jscoverage['/flash.js'].branchData['67'][1].init(102, 10, 'selectedEl');
function visit7_67_1(result) {
  _$jscoverage['/flash.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash.js'].branchData['46'][1].init(34, 32, 'flashUtils.isFlashEmbed(element)');
function visit6_46_1(result) {
  _$jscoverage['/flash.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash.js'].branchData['31'][1].init(46, 44, '!flashUtils.isFlashEmbed(childNodes[i][i])');
function visit5_31_1(result) {
  _$jscoverage['/flash.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash.js'].branchData['30'][1].init(42, 33, 'childNodes[i].nodeName == \'embed\'');
function visit4_30_1(result) {
  _$jscoverage['/flash.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash.js'].branchData['29'][1].init(179, 21, 'i < childNodes.length');
function visit3_29_1(result) {
  _$jscoverage['/flash.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash.js'].branchData['26'][1].init(113, 8, '!classId');
function visit2_26_1(result) {
  _$jscoverage['/flash.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash.js'].branchData['11'][1].init(24, 12, 'config || {}');
function visit1_11_1(result) {
  _$jscoverage['/flash.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash.js'].lineData[6]++;
KISSY.add("editor/plugin/flash", function(S, Editor, FlashBaseClass, flashUtils, fakeObjects) {
  _$jscoverage['/flash.js'].functionData[0]++;
  _$jscoverage['/flash.js'].lineData[7]++;
  var CLS_FLASH = 'ke_flash', TYPE_FLASH = 'flash';
  _$jscoverage['/flash.js'].lineData[10]++;
  function FlashPlugin(config) {
    _$jscoverage['/flash.js'].functionData[1]++;
    _$jscoverage['/flash.js'].lineData[11]++;
    this.config = visit1_11_1(config || {});
  }
  _$jscoverage['/flash.js'].lineData[14]++;
  S.augment(FlashPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/flash.js'].functionData[2]++;
  _$jscoverage['/flash.js'].lineData[17]++;
  fakeObjects.init(editor);
  _$jscoverage['/flash.js'].lineData[19]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = dataProcessor.dataFilter;
  _$jscoverage['/flash.js'].lineData[22]++;
  dataFilter.addRules({
  tags: {
  'object': function(element) {
  _$jscoverage['/flash.js'].functionData[3]++;
  _$jscoverage['/flash.js'].lineData[25]++;
  var classId = element.getAttribute("classid"), i;
  _$jscoverage['/flash.js'].lineData[26]++;
  if (visit2_26_1(!classId)) {
    _$jscoverage['/flash.js'].lineData[27]++;
    var childNodes = element.childNodes;
    _$jscoverage['/flash.js'].lineData[29]++;
    for (i = 0; visit3_29_1(i < childNodes.length); i++) {
      _$jscoverage['/flash.js'].lineData[30]++;
      if (visit4_30_1(childNodes[i].nodeName == 'embed')) {
        _$jscoverage['/flash.js'].lineData[31]++;
        if (visit5_31_1(!flashUtils.isFlashEmbed(childNodes[i][i]))) {
          _$jscoverage['/flash.js'].lineData[32]++;
          return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
        } else {
          _$jscoverage['/flash.js'].lineData[36]++;
          return null;
        }
      }
    }
    _$jscoverage['/flash.js'].lineData[40]++;
    return null;
  }
  _$jscoverage['/flash.js'].lineData[42]++;
  return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
}, 
  'embed': function(element) {
  _$jscoverage['/flash.js'].functionData[4]++;
  _$jscoverage['/flash.js'].lineData[46]++;
  if (visit6_46_1(flashUtils.isFlashEmbed(element))) {
    _$jscoverage['/flash.js'].lineData[47]++;
    return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
  } else {
    _$jscoverage['/flash.js'].lineData[50]++;
    return null;
  }
}}}, 5);
  _$jscoverage['/flash.js'].lineData[57]++;
  var flashControl = new FlashBaseClass({
  editor: editor, 
  cls: CLS_FLASH, 
  type: TYPE_FLASH, 
  pluginConfig: this.config, 
  bubbleId: "flash", 
  contextMenuId: 'flash', 
  contextMenuHandlers: {
  "Flash\u5c5e\u6027": function() {
  _$jscoverage['/flash.js'].functionData[5]++;
  _$jscoverage['/flash.js'].lineData[66]++;
  var selectedEl = this.get("editorSelectedEl");
  _$jscoverage['/flash.js'].lineData[67]++;
  if (visit7_67_1(selectedEl)) {
    _$jscoverage['/flash.js'].lineData[68]++;
    flashControl.show(selectedEl);
  }
}}});
  _$jscoverage['/flash.js'].lineData[74]++;
  this.flashControl = flashControl;
  _$jscoverage['/flash.js'].lineData[76]++;
  editor.addButton("flash", {
  tooltip: "\u63d2\u5165Flash", 
  listeners: {
  click: function() {
  _$jscoverage['/flash.js'].functionData[6]++;
  _$jscoverage['/flash.js'].lineData[80]++;
  flashControl.show();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/flash.js'].lineData[88]++;
  return FlashPlugin;
}, {
  requires: ['editor', './flash-common/base-class', './flash-common/utils', './fake-objects']});
