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
if (! _$jscoverage['/html-parser/writer/filter.js']) {
  _$jscoverage['/html-parser/writer/filter.js'] = {};
  _$jscoverage['/html-parser/writer/filter.js'].lineData = [];
  _$jscoverage['/html-parser/writer/filter.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[193] = 0;
}
if (! _$jscoverage['/html-parser/writer/filter.js'].functionData) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData = [];
  _$jscoverage['/html-parser/writer/filter.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[16] = 0;
}
if (! _$jscoverage['/html-parser/writer/filter.js'].branchData) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData = {};
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['46'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['52'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['52'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['54'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['68'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['68'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['72'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['76'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['105'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['109'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['150'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['152'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['154'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['168'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['170'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['174'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['178'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['178'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['182'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['182'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/filter.js'].branchData['182'][1].init(481, 11, '!el.tagName');
function visit402_182_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['178'][2].init(296, 10, 'ret !== el');
function visit401_178_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['178'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['178'][1].init(289, 17, 'ret && ret !== el');
function visit400_178_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['174'][1].init(91, 36, '(ret = element[filter](el)) === false');
function visit399_174_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['172'][1].init(74, 15, 'element[filter]');
function visit398_172_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['170'][1].init(74, 15, 'j < tags.length');
function visit397_170_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['168'][1].init(161, 18, 'i < filters.length');
function visit396_168_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['154'][1].init(199, 7, 't === 8');
function visit395_154_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['152'][1].init(124, 7, 't === 3');
function visit394_152_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['150'][1].init(50, 7, 't === 1');
function visit393_150_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['109'][1].init(60, 6, 'holder');
function visit392_109_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['105'][1].init(24, 14, 'priority || 10');
function visit391_105_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['76'][1].init(297, 23, 'typeof ret === \'string\'');
function visit390_76_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['72'][2].init(128, 58, '(ret = item[name].call(null, attrNode.value, el)) === false');
function visit389_72_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['72'][1].init(113, 73, 'item[name] && (ret = item[name].call(null, attrNode.value, el)) === false');
function visit388_72_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['68'][2].init(32, 14, 'i < arr.length');
function visit387_68_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['68'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['68'][1].init(25, 21, 'arr && i < arr.length');
function visit386_68_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['55'][1].init(25, 19, 'el.toHtml() === ret');
function visit385_55_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['54'][1].init(85, 23, 'typeof ret === \'string\'');
function visit384_54_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['52'][3].init(221, 10, 'ret !== el');
function visit383_52_3(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['52'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['52'][2].init(214, 17, 'ret && ret !== el');
function visit382_52_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['52'][1].init(208, 23, 'el && ret && ret !== el');
function visit381_52_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['48'][1].init(51, 39, '(ret = item.apply(null, args)) === false');
function visit380_48_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['46'][2].init(54, 14, 'i < arr.length');
function visit379_46_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['46'][1].init(47, 21, 'arr && i < arr.length');
function visit378_46_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['34'][2].init(32, 14, 'i < arr.length');
function visit377_34_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['34'][1].init(25, 21, 'arr && i < arr.length');
function visit376_34_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1].init(17, 19, 'arr[i].priority > p');
function visit375_26_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['25'][2].init(32, 14, 'i < arr.length');
function visit374_25_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['25'][1].init(25, 21, 'arr && i < arr.length');
function visit373_25_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[12]++;
  function Filter() {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[14]++;
    this.tagNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[15]++;
    this.attributeNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[16]++;
    this.tags = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[17]++;
    this.comment = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[18]++;
    this.text = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[19]++;
    this.cdata = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[20]++;
    this.attributes = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[21]++;
    this.root = [];
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[24]++;
  function findIndexToInsert(arr, p) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[25]++;
    for (var i = 0; visit373_25_1(arr && visit374_25_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[26]++;
      if (visit375_26_1(arr[i].priority > p)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[27]++;
        return i;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[30]++;
    return arr.length;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[33]++;
  function filterName(arr, v) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[34]++;
    for (var i = 0; visit376_34_1(arr && visit377_34_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[35]++;
      var items = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[37]++;
      S.each(items, function(item) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[38]++;
  v = v.replace(item[0], item[1]);
});
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[41]++;
    return v;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[44]++;
  function filterFn(arr, args, el) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[45]++;
    var item, i, ret;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[46]++;
    for (i = 0; visit378_46_1(arr && visit379_46_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[47]++;
      item = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[48]++;
      if (visit380_48_1((ret = item.apply(null, args)) === false)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[49]++;
        return false;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[52]++;
      if (visit381_52_1(el && visit382_52_2(ret && visit383_52_3(ret !== el)))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[54]++;
        if (visit384_54_1(typeof ret === 'string')) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[55]++;
          if (visit385_55_1(el.toHtml() === ret)) {
            _$jscoverage['/html-parser/writer/filter.js'].lineData[56]++;
            return el;
          }
          _$jscoverage['/html-parser/writer/filter.js'].lineData[58]++;
          el.nodeValue = ret;
          _$jscoverage['/html-parser/writer/filter.js'].lineData[59]++;
          ret = el;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[61]++;
        return this.onNode(ret);
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[64]++;
    return el;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[67]++;
  function filterAttr(arr, attrNode, el, _default) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[68]++;
    for (var i = 0; visit386_68_1(arr && visit387_68_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[69]++;
      var item = arr[i].value, ret, name = attrNode.name;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[72]++;
      if (visit388_72_1(item[name] && visit389_72_2((ret = item[name].call(null, attrNode.value, el)) === false))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[73]++;
        return ret;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[76]++;
      if (visit390_76_1(typeof ret === 'string')) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[77]++;
        attrNode.value = ret;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[80]++;
    return _default;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[83]++;
  Filter.prototype = {
  constructor: Filter, 
  addRules: function(rules, priority) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[105]++;
  priority = visit391_105_1(priority || 10);
  _$jscoverage['/html-parser/writer/filter.js'].lineData[106]++;
  for (var r in rules) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[108]++;
    var holder = this[r];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[109]++;
    if (visit392_109_1(holder)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[110]++;
      var index = findIndexToInsert(holder, priority);
      _$jscoverage['/html-parser/writer/filter.js'].lineData[111]++;
      holder.splice(index, 0, {
  value: rules[r], 
  priority: priority});
    }
  }
}, 
  onTagName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[125]++;
  return filterName(this.tagNames, v);
}, 
  onAttributeName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[129]++;
  return filterName(this.attributeNames, v);
}, 
  onText: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[133]++;
  return filterFn.call(this, this.text, [el.toHtml(), el], el);
}, 
  onCData: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[11]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[137]++;
  return filterFn.call(this, this.cdata, [el.toHtml(), el], el);
}, 
  onAttribute: function(attrNode, el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[12]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[141]++;
  return filterAttr(this.attributes, attrNode, el, attrNode);
}, 
  onComment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[145]++;
  return filterFn.call(this, this.comment, [el.toHtml(), el], el);
}, 
  onNode: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[149]++;
  var t = el.nodeType;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[150]++;
  if (visit393_150_1(t === 1)) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[151]++;
    return this.onTag(el);
  } else {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[152]++;
    if (visit394_152_1(t === 3)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[153]++;
      return this.onText(el);
    } else {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[154]++;
      if (visit395_154_1(t === 8)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[155]++;
        return this.onComment(el);
      }
    }
  }
}, 
  onFragment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[160]++;
  return filterFn.call(this, this.root, [el], el);
}, 
  onTag: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[165]++;
  var filters = ['^', el.tagName, '$'], tags = this.tags, ret;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[168]++;
  for (var i = 0; visit396_168_1(i < filters.length); i++) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[169]++;
    var filter = filters[i];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[170]++;
    for (var j = 0; visit397_170_1(j < tags.length); j++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[171]++;
      var element = tags[j].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[172]++;
      if (visit398_172_1(element[filter])) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[174]++;
        if (visit399_174_1((ret = element[filter](el)) === false)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[175]++;
          return false;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[178]++;
        if (visit400_178_1(ret && visit401_178_2(ret !== el))) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[179]++;
          return this.onNode(ret);
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[182]++;
        if (visit402_182_1(!el.tagName)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[183]++;
          return el;
        }
      }
    }
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[188]++;
  return el;
}};
  _$jscoverage['/html-parser/writer/filter.js'].lineData[193]++;
  return Filter;
});
