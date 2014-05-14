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
if (! _$jscoverage['/io/form-serializer.js']) {
  _$jscoverage['/io/form-serializer.js'] = {};
  _$jscoverage['/io/form-serializer.js'].lineData = [];
  _$jscoverage['/io/form-serializer.js'].lineData[6] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[7] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[8] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[9] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[14] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[15] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[18] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[30] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[35] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[36] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[39] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[40] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[43] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[45] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[59] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[60] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[64] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[65] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[69] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[70] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[72] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[75] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[76] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[77] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[78] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[80] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[82] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[84] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[86] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[91] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[92] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[93] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[94] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[96] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[99] = 0;
}
if (! _$jscoverage['/io/form-serializer.js'].functionData) {
  _$jscoverage['/io/form-serializer.js'].functionData = [];
  _$jscoverage['/io/form-serializer.js'].functionData[0] = 0;
  _$jscoverage['/io/form-serializer.js'].functionData[1] = 0;
  _$jscoverage['/io/form-serializer.js'].functionData[2] = 0;
  _$jscoverage['/io/form-serializer.js'].functionData[3] = 0;
  _$jscoverage['/io/form-serializer.js'].functionData[4] = 0;
  _$jscoverage['/io/form-serializer.js'].functionData[5] = 0;
  _$jscoverage['/io/form-serializer.js'].functionData[6] = 0;
  _$jscoverage['/io/form-serializer.js'].functionData[7] = 0;
}
if (! _$jscoverage['/io/form-serializer.js'].branchData) {
  _$jscoverage['/io/form-serializer.js'].branchData = {};
  _$jscoverage['/io/form-serializer.js'].branchData['31'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['45'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['47'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['50'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['52'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['64'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['69'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['76'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['80'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['93'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['93'][1] = new BranchData();
}
_$jscoverage['/io/form-serializer.js'].branchData['93'][1].init(49, 19, 'i < elements.length');
function visit34_93_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['80'][1].init(613, 23, 'vs && !util.isArray(vs)');
function visit33_80_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['76'][1].init(495, 3, '!vs');
function visit32_76_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['69'][1].init(265, 17, 'util.isArray(val)');
function visit31_69_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['64'][1].init(147, 12, 'val === null');
function visit30_64_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['52'][1].init(93, 127, 'rselectTextarea.test(el.nodeName) || rinput.test(el.type)');
function visit29_52_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['50'][1].init(-1, 221, 'el.checked || rselectTextarea.test(el.nodeName) || rinput.test(el.type)');
function visit28_50_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['47'][1].init(60, 360, '!el.disabled && (el.checked || rselectTextarea.test(el.nodeName) || rinput.test(el.type))');
function visit27_47_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['45'][1].init(49, 421, 'el.name && !el.disabled && (el.checked || rselectTextarea.test(el.nodeName) || rinput.test(el.type))');
function visit26_45_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['31'][1].init(84, 23, 'serializeArray || false');
function visit25_31_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/form-serializer.js'].functionData[0]++;
  _$jscoverage['/io/form-serializer.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/form-serializer.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/io/form-serializer.js'].lineData[9]++;
  var rselectTextarea = /^(?:select|textarea)/i, rCRLF = /\r?\n/g, FormSerializer, rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
  _$jscoverage['/io/form-serializer.js'].lineData[14]++;
  function normalizeCRLF(v) {
    _$jscoverage['/io/form-serializer.js'].functionData[1]++;
    _$jscoverage['/io/form-serializer.js'].lineData[15]++;
    return v.replace(rCRLF, '\r\n');
  }
  _$jscoverage['/io/form-serializer.js'].lineData[18]++;
  FormSerializer = {
  serialize: function(forms, serializeArray) {
  _$jscoverage['/io/form-serializer.js'].functionData[2]++;
  _$jscoverage['/io/form-serializer.js'].lineData[30]++;
  return util.param(FormSerializer.getFormData(forms), undefined, undefined, visit25_31_1(serializeArray || false));
}, 
  getFormData: function(forms) {
  _$jscoverage['/io/form-serializer.js'].functionData[3]++;
  _$jscoverage['/io/form-serializer.js'].lineData[35]++;
  var elements = [], data = {};
  _$jscoverage['/io/form-serializer.js'].lineData[36]++;
  util.each(Dom.query(forms), function(el) {
  _$jscoverage['/io/form-serializer.js'].functionData[4]++;
  _$jscoverage['/io/form-serializer.js'].lineData[39]++;
  var subs = el.elements ? elementsToArray(el.elements) : [el];
  _$jscoverage['/io/form-serializer.js'].lineData[40]++;
  elements.push.apply(elements, subs);
});
  _$jscoverage['/io/form-serializer.js'].lineData[43]++;
  elements = util.filter(elements, function(el) {
  _$jscoverage['/io/form-serializer.js'].functionData[5]++;
  _$jscoverage['/io/form-serializer.js'].lineData[45]++;
  return visit26_45_1(el.name && visit27_47_1(!el.disabled && (visit28_50_1(el.checked || visit29_52_1(rselectTextarea.test(el.nodeName) || rinput.test(el.type))))));
});
  _$jscoverage['/io/form-serializer.js'].lineData[59]++;
  util.each(elements, function(el) {
  _$jscoverage['/io/form-serializer.js'].functionData[6]++;
  _$jscoverage['/io/form-serializer.js'].lineData[60]++;
  var val = Dom.val(el), vs;
  _$jscoverage['/io/form-serializer.js'].lineData[64]++;
  if (visit30_64_1(val === null)) {
    _$jscoverage['/io/form-serializer.js'].lineData[65]++;
    return;
  }
  _$jscoverage['/io/form-serializer.js'].lineData[69]++;
  if (visit31_69_1(util.isArray(val))) {
    _$jscoverage['/io/form-serializer.js'].lineData[70]++;
    val = util.map(val, normalizeCRLF);
  } else {
    _$jscoverage['/io/form-serializer.js'].lineData[72]++;
    val = normalizeCRLF(val);
  }
  _$jscoverage['/io/form-serializer.js'].lineData[75]++;
  vs = data[el.name];
  _$jscoverage['/io/form-serializer.js'].lineData[76]++;
  if (visit32_76_1(!vs)) {
    _$jscoverage['/io/form-serializer.js'].lineData[77]++;
    data[el.name] = val;
    _$jscoverage['/io/form-serializer.js'].lineData[78]++;
    return;
  }
  _$jscoverage['/io/form-serializer.js'].lineData[80]++;
  if (visit33_80_1(vs && !util.isArray(vs))) {
    _$jscoverage['/io/form-serializer.js'].lineData[82]++;
    vs = data[el.name] = [vs];
  }
  _$jscoverage['/io/form-serializer.js'].lineData[84]++;
  vs.push.apply(vs, util.makeArray(val));
});
  _$jscoverage['/io/form-serializer.js'].lineData[86]++;
  return data;
}};
  _$jscoverage['/io/form-serializer.js'].lineData[91]++;
  function elementsToArray(elements) {
    _$jscoverage['/io/form-serializer.js'].functionData[7]++;
    _$jscoverage['/io/form-serializer.js'].lineData[92]++;
    var ret = [];
    _$jscoverage['/io/form-serializer.js'].lineData[93]++;
    for (var i = 0; visit34_93_1(i < elements.length); i++) {
      _$jscoverage['/io/form-serializer.js'].lineData[94]++;
      ret.push(elements[i]);
    }
    _$jscoverage['/io/form-serializer.js'].lineData[96]++;
    return ret;
  }
  _$jscoverage['/io/form-serializer.js'].lineData[99]++;
  return FormSerializer;
});
