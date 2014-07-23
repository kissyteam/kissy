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
  _$jscoverage['/io/form-serializer.js'].lineData[13] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[14] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[17] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[29] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[34] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[35] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[38] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[39] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[42] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[44] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[58] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[59] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[63] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[64] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[68] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[69] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[71] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[74] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[75] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[76] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[77] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[79] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[81] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[83] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[85] = 0;
  _$jscoverage['/io/form-serializer.js'].lineData[88] = 0;
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
}
if (! _$jscoverage['/io/form-serializer.js'].branchData) {
  _$jscoverage['/io/form-serializer.js'].branchData = {};
  _$jscoverage['/io/form-serializer.js'].branchData['30'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['44'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['46'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['49'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['51'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['63'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['68'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['75'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/io/form-serializer.js'].branchData['79'] = [];
  _$jscoverage['/io/form-serializer.js'].branchData['79'][1] = new BranchData();
}
_$jscoverage['/io/form-serializer.js'].branchData['79'][1].init(599, 14, '!S.isArray(vs)');
function visit35_79_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['75'][1].init(472, 16, 'vs === undefined');
function visit34_75_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['68'][1].init(255, 14, 'S.isArray(val)');
function visit33_68_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['63'][1].init(142, 12, 'val === null');
function visit32_63_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['51'][1].init(83, 117, 'rselectTextarea.test(el.nodeName) || rinput.test(el.type)');
function visit31_51_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['49'][1].init(-1, 201, 'el.checked || rselectTextarea.test(el.nodeName) || rinput.test(el.type)');
function visit30_49_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['46'][1].init(58, 336, '!el.disabled && (el.checked || rselectTextarea.test(el.nodeName) || rinput.test(el.type))');
function visit29_46_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['44'][1].init(47, 395, 'el.name && !el.disabled && (el.checked || rselectTextarea.test(el.nodeName) || rinput.test(el.type))');
function visit28_44_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].branchData['30'][1].init(84, 23, 'serializeArray || false');
function visit27_30_1(result) {
  _$jscoverage['/io/form-serializer.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/form-serializer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/form-serializer.js'].functionData[0]++;
  _$jscoverage['/io/form-serializer.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/io/form-serializer.js'].lineData[8]++;
  var rselectTextarea = /^(?:select|textarea)/i, rCRLF = /\r?\n/g, FormSerializer, rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
  _$jscoverage['/io/form-serializer.js'].lineData[13]++;
  function normalizeCRLF(v) {
    _$jscoverage['/io/form-serializer.js'].functionData[1]++;
    _$jscoverage['/io/form-serializer.js'].lineData[14]++;
    return v.replace(rCRLF, '\r\n');
  }
  _$jscoverage['/io/form-serializer.js'].lineData[17]++;
  FormSerializer = {
  serialize: function(forms, serializeArray) {
  _$jscoverage['/io/form-serializer.js'].functionData[2]++;
  _$jscoverage['/io/form-serializer.js'].lineData[29]++;
  return S.param(FormSerializer.getFormData(forms), undefined, undefined, visit27_30_1(serializeArray || false));
}, 
  getFormData: function(forms) {
  _$jscoverage['/io/form-serializer.js'].functionData[3]++;
  _$jscoverage['/io/form-serializer.js'].lineData[34]++;
  var elements = [], data = {};
  _$jscoverage['/io/form-serializer.js'].lineData[35]++;
  S.each(Dom.query(forms), function(el) {
  _$jscoverage['/io/form-serializer.js'].functionData[4]++;
  _$jscoverage['/io/form-serializer.js'].lineData[38]++;
  var subs = el.elements ? S.makeArray(el.elements) : [el];
  _$jscoverage['/io/form-serializer.js'].lineData[39]++;
  elements.push.apply(elements, subs);
});
  _$jscoverage['/io/form-serializer.js'].lineData[42]++;
  elements = S.filter(elements, function(el) {
  _$jscoverage['/io/form-serializer.js'].functionData[5]++;
  _$jscoverage['/io/form-serializer.js'].lineData[44]++;
  return visit28_44_1(el.name && visit29_46_1(!el.disabled && (visit30_49_1(el.checked || visit31_51_1(rselectTextarea.test(el.nodeName) || rinput.test(el.type))))));
});
  _$jscoverage['/io/form-serializer.js'].lineData[58]++;
  S.each(elements, function(el) {
  _$jscoverage['/io/form-serializer.js'].functionData[6]++;
  _$jscoverage['/io/form-serializer.js'].lineData[59]++;
  var val = Dom.val(el), vs;
  _$jscoverage['/io/form-serializer.js'].lineData[63]++;
  if (visit32_63_1(val === null)) {
    _$jscoverage['/io/form-serializer.js'].lineData[64]++;
    return;
  }
  _$jscoverage['/io/form-serializer.js'].lineData[68]++;
  if (visit33_68_1(S.isArray(val))) {
    _$jscoverage['/io/form-serializer.js'].lineData[69]++;
    val = S.map(val, normalizeCRLF);
  } else {
    _$jscoverage['/io/form-serializer.js'].lineData[71]++;
    val = normalizeCRLF(val);
  }
  _$jscoverage['/io/form-serializer.js'].lineData[74]++;
  vs = data[el.name];
  _$jscoverage['/io/form-serializer.js'].lineData[75]++;
  if (visit34_75_1(vs === undefined)) {
    _$jscoverage['/io/form-serializer.js'].lineData[76]++;
    data[el.name] = val;
    _$jscoverage['/io/form-serializer.js'].lineData[77]++;
    return;
  }
  _$jscoverage['/io/form-serializer.js'].lineData[79]++;
  if (visit35_79_1(!S.isArray(vs))) {
    _$jscoverage['/io/form-serializer.js'].lineData[81]++;
    vs = data[el.name] = [vs];
  }
  _$jscoverage['/io/form-serializer.js'].lineData[83]++;
  vs.push.apply(vs, S.makeArray(val));
});
  _$jscoverage['/io/form-serializer.js'].lineData[85]++;
  return data;
}};
  _$jscoverage['/io/form-serializer.js'].lineData[88]++;
  return FormSerializer;
});
