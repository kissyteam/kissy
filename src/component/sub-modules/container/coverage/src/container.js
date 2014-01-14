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
if (! _$jscoverage['/container.js']) {
  _$jscoverage['/container.js'] = {};
  _$jscoverage['/container.js'].lineData = [];
  _$jscoverage['/container.js'].lineData[6] = 0;
  _$jscoverage['/container.js'].lineData[7] = 0;
  _$jscoverage['/container.js'].lineData[8] = 0;
  _$jscoverage['/container.js'].lineData[10] = 0;
  _$jscoverage['/container.js'].lineData[11] = 0;
  _$jscoverage['/container.js'].lineData[12] = 0;
  _$jscoverage['/container.js'].lineData[16] = 0;
  _$jscoverage['/container.js'].lineData[19] = 0;
  _$jscoverage['/container.js'].lineData[21] = 0;
  _$jscoverage['/container.js'].lineData[23] = 0;
  _$jscoverage['/container.js'].lineData[25] = 0;
  _$jscoverage['/container.js'].lineData[26] = 0;
  _$jscoverage['/container.js'].lineData[28] = 0;
  _$jscoverage['/container.js'].lineData[34] = 0;
  _$jscoverage['/container.js'].lineData[35] = 0;
  _$jscoverage['/container.js'].lineData[36] = 0;
  _$jscoverage['/container.js'].lineData[43] = 0;
  _$jscoverage['/container.js'].lineData[44] = 0;
  _$jscoverage['/container.js'].lineData[47] = 0;
  _$jscoverage['/container.js'].lineData[49] = 0;
  _$jscoverage['/container.js'].lineData[51] = 0;
  _$jscoverage['/container.js'].lineData[52] = 0;
  _$jscoverage['/container.js'].lineData[55] = 0;
  _$jscoverage['/container.js'].lineData[56] = 0;
  _$jscoverage['/container.js'].lineData[57] = 0;
  _$jscoverage['/container.js'].lineData[62] = 0;
  _$jscoverage['/container.js'].lineData[73] = 0;
  _$jscoverage['/container.js'].lineData[77] = 0;
  _$jscoverage['/container.js'].lineData[81] = 0;
  _$jscoverage['/container.js'].lineData[87] = 0;
  _$jscoverage['/container.js'].lineData[93] = 0;
  _$jscoverage['/container.js'].lineData[97] = 0;
  _$jscoverage['/container.js'].lineData[101] = 0;
  _$jscoverage['/container.js'].lineData[105] = 0;
  _$jscoverage['/container.js'].lineData[108] = 0;
  _$jscoverage['/container.js'].lineData[109] = 0;
  _$jscoverage['/container.js'].lineData[114] = 0;
  _$jscoverage['/container.js'].lineData[117] = 0;
  _$jscoverage['/container.js'].lineData[118] = 0;
  _$jscoverage['/container.js'].lineData[135] = 0;
  _$jscoverage['/container.js'].lineData[137] = 0;
  _$jscoverage['/container.js'].lineData[138] = 0;
  _$jscoverage['/container.js'].lineData[140] = 0;
  _$jscoverage['/container.js'].lineData[144] = 0;
  _$jscoverage['/container.js'].lineData[148] = 0;
  _$jscoverage['/container.js'].lineData[151] = 0;
  _$jscoverage['/container.js'].lineData[153] = 0;
  _$jscoverage['/container.js'].lineData[160] = 0;
  _$jscoverage['/container.js'].lineData[167] = 0;
  _$jscoverage['/container.js'].lineData[168] = 0;
  _$jscoverage['/container.js'].lineData[169] = 0;
  _$jscoverage['/container.js'].lineData[170] = 0;
  _$jscoverage['/container.js'].lineData[171] = 0;
  _$jscoverage['/container.js'].lineData[172] = 0;
  _$jscoverage['/container.js'].lineData[173] = 0;
  _$jscoverage['/container.js'].lineData[174] = 0;
  _$jscoverage['/container.js'].lineData[177] = 0;
  _$jscoverage['/container.js'].lineData[178] = 0;
  _$jscoverage['/container.js'].lineData[180] = 0;
  _$jscoverage['/container.js'].lineData[182] = 0;
  _$jscoverage['/container.js'].lineData[184] = 0;
  _$jscoverage['/container.js'].lineData[189] = 0;
  _$jscoverage['/container.js'].lineData[205] = 0;
  _$jscoverage['/container.js'].lineData[206] = 0;
  _$jscoverage['/container.js'].lineData[208] = 0;
  _$jscoverage['/container.js'].lineData[223] = 0;
  _$jscoverage['/container.js'].lineData[226] = 0;
  _$jscoverage['/container.js'].lineData[227] = 0;
  _$jscoverage['/container.js'].lineData[229] = 0;
  _$jscoverage['/container.js'].lineData[238] = 0;
  _$jscoverage['/container.js'].lineData[239] = 0;
  _$jscoverage['/container.js'].lineData[247] = 0;
  _$jscoverage['/container.js'].lineData[249] = 0;
  _$jscoverage['/container.js'].lineData[250] = 0;
  _$jscoverage['/container.js'].lineData[251] = 0;
  _$jscoverage['/container.js'].lineData[267] = 0;
  _$jscoverage['/container.js'].lineData[271] = 0;
  _$jscoverage['/container.js'].lineData[272] = 0;
  _$jscoverage['/container.js'].lineData[273] = 0;
  _$jscoverage['/container.js'].lineData[274] = 0;
  _$jscoverage['/container.js'].lineData[275] = 0;
  _$jscoverage['/container.js'].lineData[276] = 0;
  _$jscoverage['/container.js'].lineData[279] = 0;
  _$jscoverage['/container.js'].lineData[282] = 0;
  _$jscoverage['/container.js'].lineData[285] = 0;
  _$jscoverage['/container.js'].lineData[286] = 0;
  _$jscoverage['/container.js'].lineData[287] = 0;
  _$jscoverage['/container.js'].lineData[288] = 0;
}
if (! _$jscoverage['/container.js'].functionData) {
  _$jscoverage['/container.js'].functionData = [];
  _$jscoverage['/container.js'].functionData[0] = 0;
  _$jscoverage['/container.js'].functionData[1] = 0;
  _$jscoverage['/container.js'].functionData[2] = 0;
  _$jscoverage['/container.js'].functionData[3] = 0;
  _$jscoverage['/container.js'].functionData[4] = 0;
  _$jscoverage['/container.js'].functionData[5] = 0;
  _$jscoverage['/container.js'].functionData[6] = 0;
  _$jscoverage['/container.js'].functionData[7] = 0;
  _$jscoverage['/container.js'].functionData[8] = 0;
  _$jscoverage['/container.js'].functionData[9] = 0;
  _$jscoverage['/container.js'].functionData[10] = 0;
  _$jscoverage['/container.js'].functionData[11] = 0;
  _$jscoverage['/container.js'].functionData[12] = 0;
  _$jscoverage['/container.js'].functionData[13] = 0;
  _$jscoverage['/container.js'].functionData[14] = 0;
  _$jscoverage['/container.js'].functionData[15] = 0;
  _$jscoverage['/container.js'].functionData[16] = 0;
}
if (! _$jscoverage['/container.js'].branchData) {
  _$jscoverage['/container.js'].branchData = {};
  _$jscoverage['/container.js'].branchData['25'] = [];
  _$jscoverage['/container.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['43'] = [];
  _$jscoverage['/container.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['49'] = [];
  _$jscoverage['/container.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['51'] = [];
  _$jscoverage['/container.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['55'] = [];
  _$jscoverage['/container.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['93'] = [];
  _$jscoverage['/container.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['108'] = [];
  _$jscoverage['/container.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['117'] = [];
  _$jscoverage['/container.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['137'] = [];
  _$jscoverage['/container.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['170'] = [];
  _$jscoverage['/container.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['171'] = [];
  _$jscoverage['/container.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['173'] = [];
  _$jscoverage['/container.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['177'] = [];
  _$jscoverage['/container.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['205'] = [];
  _$jscoverage['/container.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['226'] = [];
  _$jscoverage['/container.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['239'] = [];
  _$jscoverage['/container.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['249'] = [];
  _$jscoverage['/container.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['250'] = [];
  _$jscoverage['/container.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['271'] = [];
  _$jscoverage['/container.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['273'] = [];
  _$jscoverage['/container.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['274'] = [];
  _$jscoverage['/container.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['285'] = [];
  _$jscoverage['/container.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['287'] = [];
  _$jscoverage['/container.js'].branchData['287'][1] = new BranchData();
}
_$jscoverage['/container.js'].branchData['287'][1].init(63, 11, 'c.isControl');
function visit26_287_1(result) {
  _$jscoverage['/container.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['285'][1].init(111, 12, 'i < v.length');
function visit25_285_1(result) {
  _$jscoverage['/container.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['274'][1].init(47, 46, 'defaultChildCfg || self.get(\'defaultChildCfg\')');
function visit24_274_1(result) {
  _$jscoverage['/container.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['273'][1].init(63, 12, '!c.isControl');
function visit23_273_1(result) {
  _$jscoverage['/container.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['271'][1].init(172, 12, 'i < v.length');
function visit22_271_1(result) {
  _$jscoverage['/container.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['250'][1].init(21, 19, 'children[i].destroy');
function visit21_250_1(result) {
  _$jscoverage['/container.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['249'][1].init(93, 19, 'i < children.length');
function visit20_249_1(result) {
  _$jscoverage['/container.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['239'][1].init(69, 23, 'children[index] || null');
function visit19_239_1(result) {
  _$jscoverage['/container.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['226'][1].init(126, 12, 'i < t.length');
function visit18_226_1(result) {
  _$jscoverage['/container.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['205'][1].init(17, 21, 'destroy === undefined');
function visit17_205_1(result) {
  _$jscoverage['/container.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['177'][1].init(21, 8, 'elBefore');
function visit16_177_1(result) {
  _$jscoverage['/container.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['173'][1].init(49, 31, 'cEl.parentNode !== domContentEl');
function visit15_173_1(result) {
  _$jscoverage['/container.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['171'][1].init(423, 17, 'c.get(\'rendered\')');
function visit14_171_1(result) {
  _$jscoverage['/container.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['170'][1].init(364, 41, 'domContentEl.children[childIndex] || null');
function visit13_170_1(result) {
  _$jscoverage['/container.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['137'][1].init(95, 19, 'index === undefined');
function visit12_137_1(result) {
  _$jscoverage['/container.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['117'][1].init(122, 19, 'i < children.length');
function visit11_117_1(result) {
  _$jscoverage['/container.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['108'][1].init(122, 19, 'i < children.length');
function visit10_108_1(result) {
  _$jscoverage['/container.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['93'][1].init(589, 38, 'defaultChildCfg.prefixCls || prefixCls');
function visit9_93_1(result) {
  _$jscoverage['/container.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['55'][1].init(17, 24, 'c.get && (cDOMEl = c.el)');
function visit8_55_1(result) {
  _$jscoverage['/container.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['51'][1].init(48, 9, 'c.destroy');
function visit7_51_1(result) {
  _$jscoverage['/container.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['49'][1].init(339, 7, 'destroy');
function visit6_49_1(result) {
  _$jscoverage['/container.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['43'][1].init(221, 12, 'index !== -1');
function visit5_43_1(result) {
  _$jscoverage['/container.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['25'][1].init(314, 20, 'self.get(\'rendered\')');
function visit4_25_1(result) {
  _$jscoverage['/container.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/container.js'].functionData[0]++;
  _$jscoverage['/container.js'].lineData[7]++;
  var Control = require('component/control');
  _$jscoverage['/container.js'].lineData[8]++;
  var ContainerRender = require('./container/render');
  _$jscoverage['/container.js'].lineData[10]++;
  function defAddChild(e) {
    _$jscoverage['/container.js'].functionData[1]++;
    _$jscoverage['/container.js'].lineData[11]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[12]++;
    var c = e.component, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[16]++;
    children.splice(index, 0, c);
    _$jscoverage['/container.js'].lineData[19]++;
    children = self.get('children');
    _$jscoverage['/container.js'].lineData[21]++;
    c = children[index];
    _$jscoverage['/container.js'].lineData[23]++;
    c.setInternal('parent', self);
    _$jscoverage['/container.js'].lineData[25]++;
    if (visit4_25_1(self.get('rendered'))) {
      _$jscoverage['/container.js'].lineData[26]++;
      self.renderChild(index);
    }
    _$jscoverage['/container.js'].lineData[28]++;
    self.fire('afterAddChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[34]++;
  function defRemoveChild(e) {
    _$jscoverage['/container.js'].functionData[2]++;
    _$jscoverage['/container.js'].lineData[35]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[36]++;
    var c = e.component, cDOMParentEl, cDOMEl, destroy = e.destroy, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[43]++;
    if (visit5_43_1(index !== -1)) {
      _$jscoverage['/container.js'].lineData[44]++;
      children.splice(index, 1);
    }
    _$jscoverage['/container.js'].lineData[47]++;
    c.setInternal('parent', null);
    _$jscoverage['/container.js'].lineData[49]++;
    if (visit6_49_1(destroy)) {
      _$jscoverage['/container.js'].lineData[51]++;
      if (visit7_51_1(c.destroy)) {
        _$jscoverage['/container.js'].lineData[52]++;
        c.destroy();
      }
    } else {
      _$jscoverage['/container.js'].lineData[55]++;
      if (visit8_55_1(c.get && (cDOMEl = c.el))) {
        _$jscoverage['/container.js'].lineData[56]++;
        if ((cDOMParentEl = cDOMEl.parentNode)) {
          _$jscoverage['/container.js'].lineData[57]++;
          cDOMParentEl.removeChild(cDOMEl);
        }
      }
    }
    _$jscoverage['/container.js'].lineData[62]++;
    self.fire('afterRemoveChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[73]++;
  return Control.extend({
  isContainer: true, 
  initializer: function() {
  _$jscoverage['/container.js'].functionData[3]++;
  _$jscoverage['/container.js'].lineData[77]++;
  var self = this, prefixCls = self.get('prefixCls'), defaultChildCfg = self.get('defaultChildCfg');
  _$jscoverage['/container.js'].lineData[81]++;
  self.publish('beforeAddChild', {
  defaultFn: defAddChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[87]++;
  self.publish('beforeRemoveChild', {
  defaultFn: defRemoveChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[93]++;
  defaultChildCfg.prefixCls = visit9_93_1(defaultChildCfg.prefixCls || prefixCls);
}, 
  createDom: function() {
  _$jscoverage['/container.js'].functionData[4]++;
  _$jscoverage['/container.js'].lineData[97]++;
  this.createChildren();
}, 
  renderUI: function() {
  _$jscoverage['/container.js'].functionData[5]++;
  _$jscoverage['/container.js'].lineData[101]++;
  this.renderChildren();
}, 
  renderChildren: function() {
  _$jscoverage['/container.js'].functionData[6]++;
  _$jscoverage['/container.js'].lineData[105]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[108]++;
  for (i = 0; visit10_108_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[109]++;
    self.renderChild(i);
  }
}, 
  createChildren: function() {
  _$jscoverage['/container.js'].functionData[7]++;
  _$jscoverage['/container.js'].lineData[114]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[117]++;
  for (i = 0; visit11_117_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[118]++;
    self.createChild(i);
  }
}, 
  addChild: function(c, index) {
  _$jscoverage['/container.js'].functionData[8]++;
  _$jscoverage['/container.js'].lineData[135]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[137]++;
  if (visit12_137_1(index === undefined)) {
    _$jscoverage['/container.js'].lineData[138]++;
    index = children.length;
  }
  _$jscoverage['/container.js'].lineData[140]++;
  self.fire('beforeAddChild', {
  component: c, 
  index: index});
  _$jscoverage['/container.js'].lineData[144]++;
  return children[index];
}, 
  renderChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[9]++;
  _$jscoverage['/container.js'].lineData[148]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[151]++;
  self.createChild(childIndex).render();
  _$jscoverage['/container.js'].lineData[153]++;
  self.fire('afterRenderChild', {
  component: children[childIndex], 
  index: childIndex});
}, 
  createChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[10]++;
  _$jscoverage['/container.js'].lineData[160]++;
  var self = this, c, elBefore, domContentEl, children = self.get('children'), cEl, contentEl;
  _$jscoverage['/container.js'].lineData[167]++;
  c = children[childIndex];
  _$jscoverage['/container.js'].lineData[168]++;
  contentEl = self.view.getChildrenContainerEl();
  _$jscoverage['/container.js'].lineData[169]++;
  domContentEl = contentEl[0];
  _$jscoverage['/container.js'].lineData[170]++;
  elBefore = visit13_170_1(domContentEl.children[childIndex] || null);
  _$jscoverage['/container.js'].lineData[171]++;
  if (visit14_171_1(c.get('rendered'))) {
    _$jscoverage['/container.js'].lineData[172]++;
    cEl = c.el;
    _$jscoverage['/container.js'].lineData[173]++;
    if (visit15_173_1(cEl.parentNode !== domContentEl)) {
      _$jscoverage['/container.js'].lineData[174]++;
      domContentEl.insertBefore(cEl, elBefore);
    }
  } else {
    _$jscoverage['/container.js'].lineData[177]++;
    if (visit16_177_1(elBefore)) {
      _$jscoverage['/container.js'].lineData[178]++;
      c.set('elBefore', elBefore);
    } else {
      _$jscoverage['/container.js'].lineData[180]++;
      c.set('render', contentEl);
    }
    _$jscoverage['/container.js'].lineData[182]++;
    c.create();
  }
  _$jscoverage['/container.js'].lineData[184]++;
  self.fire('afterCreateChild', {
  component: c, 
  index: childIndex});
  _$jscoverage['/container.js'].lineData[189]++;
  return c;
}, 
  removeChild: function(c, destroy) {
  _$jscoverage['/container.js'].functionData[11]++;
  _$jscoverage['/container.js'].lineData[205]++;
  if (visit17_205_1(destroy === undefined)) {
    _$jscoverage['/container.js'].lineData[206]++;
    destroy = true;
  }
  _$jscoverage['/container.js'].lineData[208]++;
  this.fire('beforeRemoveChild', {
  component: c, 
  index: S.indexOf(c, this.get('children')), 
  destroy: destroy});
}, 
  removeChildren: function(destroy) {
  _$jscoverage['/container.js'].functionData[12]++;
  _$jscoverage['/container.js'].lineData[223]++;
  var self = this, i, t = [].concat(self.get('children'));
  _$jscoverage['/container.js'].lineData[226]++;
  for (i = 0; visit18_226_1(i < t.length); i++) {
    _$jscoverage['/container.js'].lineData[227]++;
    self.removeChild(t[i], destroy);
  }
  _$jscoverage['/container.js'].lineData[229]++;
  return self;
}, 
  getChildAt: function(index) {
  _$jscoverage['/container.js'].functionData[13]++;
  _$jscoverage['/container.js'].lineData[238]++;
  var children = this.get('children');
  _$jscoverage['/container.js'].lineData[239]++;
  return visit19_239_1(children[index] || null);
}, 
  destructor: function() {
  _$jscoverage['/container.js'].functionData[14]++;
  _$jscoverage['/container.js'].lineData[247]++;
  var i, children = this.get('children');
  _$jscoverage['/container.js'].lineData[249]++;
  for (i = 0; visit20_249_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[250]++;
    if (visit21_250_1(children[i].destroy)) {
      _$jscoverage['/container.js'].lineData[251]++;
      children[i].destroy();
    }
  }
}}, {
  ATTRS: {
  children: {
  value: [], 
  getter: function(v) {
  _$jscoverage['/container.js'].functionData[15]++;
  _$jscoverage['/container.js'].lineData[267]++;
  var defaultChildCfg = null, i, c, self = this;
  _$jscoverage['/container.js'].lineData[271]++;
  for (i = 0; visit22_271_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[272]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[273]++;
    if (visit23_273_1(!c.isControl)) {
      _$jscoverage['/container.js'].lineData[274]++;
      defaultChildCfg = visit24_274_1(defaultChildCfg || self.get('defaultChildCfg'));
      _$jscoverage['/container.js'].lineData[275]++;
      S.mix(c, defaultChildCfg, false);
      _$jscoverage['/container.js'].lineData[276]++;
      v[i] = this.createComponent(c);
    }
  }
  _$jscoverage['/container.js'].lineData[279]++;
  return v;
}, 
  setter: function(v) {
  _$jscoverage['/container.js'].functionData[16]++;
  _$jscoverage['/container.js'].lineData[282]++;
  var i, c;
  _$jscoverage['/container.js'].lineData[285]++;
  for (i = 0; visit25_285_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[286]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[287]++;
    if (visit26_287_1(c.isControl)) {
      _$jscoverage['/container.js'].lineData[288]++;
      c.setInternal('parent', this);
    }
  }
}}, 
  defaultChildCfg: {
  value: {}}, 
  xrender: {
  value: ContainerRender}}, 
  name: 'container'});
});
