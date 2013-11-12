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
if (! _$jscoverage['/html-parser/writer/beautify.js']) {
  _$jscoverage['/html-parser/writer/beautify.js'] = {};
  _$jscoverage['/html-parser/writer/beautify.js'].lineData = [];
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[102] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[194] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[201] = 0;
}
if (! _$jscoverage['/html-parser/writer/beautify.js'].functionData) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData = [];
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[11] = 0;
}
if (! _$jscoverage['/html-parser/writer/beautify.js'].branchData) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData = {};
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['80'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['89'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['93'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['94'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['106'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['115'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['116'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['129'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['133'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['137'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['148'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['150'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['154'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['163'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['167'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['174'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['177'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['186'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['193'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['193'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/beautify.js'].branchData['193'][1].init(18, 16, 'this.allowIndent');
function visit374_193_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['186'][1].init(18, 16, 'this.allowIndent');
function visit373_186_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['177'][1].init(107, 11, '!this.inPre');
function visit372_177_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['174'][1].init(18, 16, 'this.allowIndent');
function visit371_174_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['167'][1].init(608, 21, 'rules.breakAfterClose');
function visit370_167_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['163'][1].init(520, 17, 'tagName === "pre"');
function visit369_163_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1].init(315, 22, 'rules.breakBeforeClose');
function visit368_156_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['154'][1].init(233, 16, 'self.allowIndent');
function visit367_154_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['150'][1].init(141, 17, 'rules.allowIndent');
function visit366_150_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['148'][1].init(80, 25, 'self.rules[tagName] || {}');
function visit365_148_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1].init(448, 17, 'tagName === \'pre\'');
function visit364_140_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['137'][1].init(357, 20, 'rules.breakAfterOpen');
function visit363_137_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['133'][1].init(57, 17, 'rules.allowIndent');
function visit362_133_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['129'][1].init(111, 15, 'el.isSelfClosed');
function visit361_129_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['128'][1].init(67, 25, 'this.rules[tagName] || {}');
function visit360_128_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].init(193, 21, 'rules.breakBeforeOpen');
function visit359_118_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['116'][1].init(111, 16, 'this.allowIndent');
function visit358_116_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['115'][1].init(50, 25, 'this.rules[tagName] || {}');
function visit357_115_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['106'][1].init(18, 20, '!this.rules[tagName]');
function visit356_106_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['94'][1].init(26, 25, '!(/[\\r\\n\\t ]/.test(o[j]))');
function visit355_94_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['93'][1].init(287, 6, 'j >= 0');
function visit354_93_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['89'][1].init(52, 23, '!this.inPre && o.length');
function visit353_89_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['80'][1].init(18, 11, '!this.inPre');
function visit352_80_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].lineData[6]++;
KISSY.add("html-parser/writer/beautify", function(S, BasicWriter, dtd, Utils) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[8]++;
  function BeautifyWriter() {
    _$jscoverage['/html-parser/writer/beautify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[9]++;
    var self = this;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[10]++;
    BeautifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[13]++;
    self.inPre = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[14]++;
    self.indentChar = "\t";
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[15]++;
    self.indentLevel = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[18]++;
    self.allowIndent = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[19]++;
    self.rules = {};
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[21]++;
    for (var e in S.merge(dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent, {
  "select": 1, 
  "script": 1, 
  "style": 1})) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[34]++;
      self.setRules(e, {
  allowIndent: 1, 
  breakBeforeOpen: 1, 
  breakAfterOpen: 1, 
  breakBeforeClose: 1, 
  breakAfterClose: 1});
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[44]++;
    S.each(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], function(e) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[2]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[46]++;
  self.setRules(e, {
  allowIndent: 0, 
  breakAfterOpen: 0, 
  breakBeforeClose: 0});
});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[53]++;
    self.setRules('option', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[57]++;
    self.setRules('optiongroup', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[61]++;
    self.setRules('br', {
  breakAfterOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[65]++;
    self.setRules('title', {
  allowIndent: 0, 
  breakBeforeClose: 0, 
  breakAfterOpen: 0});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[72]++;
    self.setRules('pre', {
  breakAfterOpen: 1, 
  allowIndent: 0});
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[78]++;
  S.extend(BeautifyWriter, BasicWriter, {
  indentation: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[3]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[80]++;
  if (visit352_80_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[81]++;
    this.append(new Array(this.indentLevel + 1).join(this.indentChar));
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[84]++;
  this.allowIndent = 0;
}, 
  lineBreak: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[88]++;
  var o = this.output;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[89]++;
  if (visit353_89_1(!this.inPre && o.length)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[93]++;
    for (var j = o.length - 1; visit354_93_1(j >= 0); j--) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[94]++;
      if (visit355_94_1(!(/[\r\n\t ]/.test(o[j])))) {
        _$jscoverage['/html-parser/writer/beautify.js'].lineData[95]++;
        break;
      }
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[98]++;
    o.length = j + 1;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[99]++;
    this.append("\n");
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[102]++;
  this.allowIndent = 1;
}, 
  setRules: function(tagName, rule) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[5]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[106]++;
  if (visit356_106_1(!this.rules[tagName])) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[107]++;
    this.rules[tagName] = {};
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[109]++;
  S.mix(this.rules[tagName], rule);
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[6]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[114]++;
  var tagName = el.tagName, rules = visit357_115_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[116]++;
  if (visit358_116_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[117]++;
    this.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[118]++;
    if (visit359_118_1(rules.breakBeforeOpen)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[119]++;
      this.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[120]++;
      this.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[122]++;
  BeautifyWriter.superclass.openTag.apply(this, arguments);
}, 
  openTagClose: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[127]++;
  var tagName = el.tagName;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[128]++;
  var rules = visit360_128_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[129]++;
  if (visit361_129_1(el.isSelfClosed)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[130]++;
    this.append(" />");
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[132]++;
    this.append(">");
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[133]++;
    if (visit362_133_1(rules.allowIndent)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[134]++;
      this.indentLevel++;
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[137]++;
  if (visit363_137_1(rules.breakAfterOpen)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[138]++;
    this.lineBreak();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140]++;
  if (visit364_140_1(tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[141]++;
    this.inPre = 1;
  }
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[146]++;
  var self = this, tagName = el.tagName, rules = visit365_148_1(self.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[150]++;
  if (visit366_150_1(rules.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[151]++;
    self.indentLevel--;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[154]++;
  if (visit367_154_1(self.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[155]++;
    self.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[156]++;
    if (visit368_156_1(rules.breakBeforeClose)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[157]++;
      self.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[158]++;
      self.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[161]++;
  BeautifyWriter.superclass.closeTag.apply(self, arguments);
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[163]++;
  if (visit369_163_1(tagName === "pre")) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[164]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[167]++;
  if (visit370_167_1(rules.breakAfterClose)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[168]++;
    self.lineBreak();
  }
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[174]++;
  if (visit371_174_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[175]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[177]++;
  if (visit372_177_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[180]++;
    text = Utils.collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[182]++;
  this.append(text);
}, 
  comment: function(comment) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[186]++;
  if (visit373_186_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[187]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[189]++;
  this.append("<!--" + comment + "-->");
}, 
  cdata: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[11]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[193]++;
  if (visit374_193_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[194]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[196]++;
  this.append(S.trim(text));
}});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[201]++;
  return BeautifyWriter;
}, {
  requires: ['./basic', '../dtd', '../utils']});
