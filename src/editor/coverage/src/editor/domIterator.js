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
if (! _$jscoverage['/editor/domIterator.js']) {
  _$jscoverage['/editor/domIterator.js'] = {};
  _$jscoverage['/editor/domIterator.js'].lineData = [];
  _$jscoverage['/editor/domIterator.js'].lineData[9] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[10] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[25] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[26] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[27] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[28] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[29] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[30] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[33] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[34] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[36] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[39] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[41] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[55] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[58] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[61] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[64] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[67] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[68] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[73] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[75] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[78] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[81] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[82] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[84] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[85] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[86] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[87] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[92] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[96] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[97] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[98] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[99] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[100] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[101] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[106] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[107] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[108] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[112] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[115] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[116] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[118] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[119] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[122] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[126] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[131] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[132] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[134] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[137] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[138] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[139] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[142] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[143] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[144] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[149] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[150] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[154] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[155] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[158] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[161] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[163] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[164] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[165] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[168] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[169] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[171] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[174] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[177] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[178] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[183] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[184] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[185] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[189] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[193] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[194] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[195] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[197] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[198] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[199] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[200] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[203] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[204] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[205] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[206] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[211] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[212] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[214] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[215] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[219] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[220] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[224] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[226] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[227] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[228] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[229] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[232] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[233] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[235] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[237] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[242] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[243] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[245] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[247] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[248] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[250] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[251] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[253] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[257] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[259] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[262] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[263] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[267] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[269] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[270] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[273] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[276] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[282] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[287] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[288] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[289] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[290] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[291] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[292] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[293] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[297] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[299] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[301] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[302] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[304] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[307] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[314] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[315] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[319] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[323] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[324] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[327] = 0;
}
if (! _$jscoverage['/editor/domIterator.js'].functionData) {
  _$jscoverage['/editor/domIterator.js'].functionData = [];
  _$jscoverage['/editor/domIterator.js'].functionData[0] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[1] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[2] = 0;
  _$jscoverage['/editor/domIterator.js'].functionData[3] = 0;
}
if (! _$jscoverage['/editor/domIterator.js'].branchData) {
  _$jscoverage['/editor/domIterator.js'].branchData = {};
  _$jscoverage['/editor/domIterator.js'].branchData['26'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['36'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['67'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['75'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['92'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['93'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['94'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['98'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['100'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['106'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['126'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['131'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['134'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['137'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['139'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['139'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['149'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['154'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['161'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['163'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['174'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['177'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['183'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['189'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['189'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['193'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['194'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['197'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['199'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['211'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['219'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['219'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['224'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['226'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['227'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['237'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['237'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['238'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['239'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['240'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['243'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['243'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['245'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['253'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['257'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['276'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['287'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['289'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['290'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['292'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['297'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['302'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['302'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['302'][4] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['304'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['305'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['314'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['315'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['315'][1] = new BranchData();
}
_$jscoverage['/editor/domIterator.js'].branchData['315'][1].init(38, 32, 'isLast || block.equals(lastNode)');
function visit274_315_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['314'][1].init(12834, 16, '!self._.nextNode');
function visit273_314_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['305'][1].init(36, 93, 'lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit272_305_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['304'][1].init(119, 130, 'UA[\'ie\'] || lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit271_304_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['302'][4].init(274, 28, 'lastChild.nodeName() == \'br\'');
function visit270_302_4(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['302'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['302'][3].init(220, 50, 'lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit269_302_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['302'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['302'][2].init(220, 82, 'lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() == \'br\'');
function visit268_302_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['302'][1].init(204, 98, 'lastChild[0] && lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() == \'br\'');
function visit267_302_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['297'][1].init(11964, 12, 'removeLastBr');
function visit266_297_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['292'][2].init(180, 50, 'Dom.nodeName(previousSibling[0].lastChild) == \'br\'');
function visit265_292_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['292'][1].init(148, 82, 'previousSibling[0].lastChild && Dom.nodeName(previousSibling[0].lastChild) == \'br\'');
function visit264_292_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['290'][1].init(26, 34, 'previousSibling.nodeName() == \'br\'');
function visit263_290_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['289'][2].init(119, 56, 'previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit262_289_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['289'][1].init(97, 78, 'previousSibling[0] && previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit261_289_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['287'][1].init(11412, 16, 'removePreviousBr');
function visit260_287_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['276'][1].init(2629, 7, '!isLast');
function visit259_276_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['257'][1].init(222, 54, '!range.checkStartOfBlock() || !range.checkEndOfBlock()');
function visit258_257_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['253'][1].init(1452, 24, 'block.nodeName() != \'li\'');
function visit257_253_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['245'][1].init(121, 15, 'blockTag || \'p\'');
function visit256_245_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['243'][3].init(877, 24, 'block.nodeName() == \'li\'');
function visit255_243_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['243'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['243'][2].init(851, 50, 'self.enforceRealBlocks && block.nodeName() == \'li\'');
function visit254_243_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['243'][1].init(839, 64, '!block || (self.enforceRealBlocks && block.nodeName() == \'li\')');
function visit253_243_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['240'][1].init(65, 73, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit252_240_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['239'][1].init(47, 139, 'checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit251_239_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['238'][1].init(44, 187, '!self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit250_238_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['237'][2].init(532, 19, '!block || !block[0]');
function visit249_237_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['237'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['237'][1].init(532, 232, '(!block || !block[0]) && !self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit248_237_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['227'][1].init(22, 55, 'self._.docEndMarker && self._.docEndMarker._4e_remove()');
function visit247_227_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['226'][1].init(87, 6, '!range');
function visit246_226_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['224'][1].init(8233, 6, '!block');
function visit245_224_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['219'][2].init(4996, 19, 'closeRange && range');
function visit244_219_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['219'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['219'][1].init(4984, 33, 'isLast || (closeRange && range)');
function visit243_219_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['211'][1].init(4612, 11, 'includeNode');
function visit242_211_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['199'][1].init(87, 37, 'isLast || parentNode.equals(lastNode)');
function visit241_199_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['197'][2].init(127, 29, 'self.forceBrBreak && {\n  br: 1}');
function visit240_197_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['197'][1].init(96, 61, 'parentNode._4e_isBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit239_197_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['194'][1].init(29, 38, '!currentNode[0].nextSibling && !isLast');
function visit238_194_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['193'][1].init(3840, 20, 'range && !closeRange');
function visit237_193_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['189'][2].init(3592, 26, '!closeRange || includeNode');
function visit236_189_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['189'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['189'][1].init(3592, 60, '(!closeRange || includeNode) && currentNode.equals(lastNode)');
function visit235_189_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['183'][1].init(3326, 21, 'includeNode && !range');
function visit234_183_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['177'][1].init(184, 51, 'beginWhitespaceRegex.test(currentNode[0].nodeValue)');
function visit233_177_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['174'][1].init(2807, 49, 'currentNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit232_174_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['163'][1].init(112, 6, '!range');
function visit231_163_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['161'][1].init(100, 25, 'currentNode[0].firstChild');
function visit230_161_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['154'][1].init(255, 16, 'nodeName != \'br\'');
function visit229_154_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['149'][1].init(868, 5, 'range');
function visit228_149_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['139'][3].init(315, 16, 'nodeName != \'hr\'');
function visit227_139_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['139'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['139'][2].init(278, 53, '!currentNode[0].childNodes.length && nodeName != \'hr\'');
function visit226_139_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['139'][1].init(268, 63, '!range && !currentNode[0].childNodes.length && nodeName != \'hr\'');
function visit225_139_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['137'][1].init(166, 16, 'nodeName == \'br\'');
function visit224_137_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['134'][2].init(120, 29, 'self.forceBrBreak && {\n  br: 1}');
function visit223_134_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['134'][1].init(88, 62, 'currentNode._4e_isBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit222_134_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['131'][1].init(615, 12, '!includeNode');
function visit221_131_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['126'][1].init(376, 52, 'currentNode[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit220_126_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['106'][1].init(2078, 16, '!self._.lastNode');
function visit219_106_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['100'][1].init(119, 29, 'path.block || path.blockLimit');
function visit218_100_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['98'][1].init(180, 27, 'testRange.checkEndOfBlock()');
function visit217_98_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['94'][1].init(77, 108, '!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit216_94_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['93'][2].init(1306, 53, 'self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit215_93_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['93'][1].init(39, 186, 'self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit214_93_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['92'][1].init(1264, 226, 'self._.lastNode && self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit213_92_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['75'][1].init(294, 36, 'self.forceBrBreak || !self.enlargeBr');
function visit212_75_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['67'][1].init(482, 16, '!self._.lastNode');
function visit211_67_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['36'][1].init(301, 25, 'self._ || (self._ = {})');
function visit210_36_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['26'][1].init(14, 20, 'arguments.length < 1');
function visit209_26_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].lineData[9]++;
KISSY.add("editor/domIterator", function(S, Editor) {
  _$jscoverage['/editor/domIterator.js'].functionData[0]++;
  _$jscoverage['/editor/domIterator.js'].lineData[10]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Walker = Editor.Walker, KERange = Editor.Range, KER = Editor.RANGE, ElementPath = Editor.ElementPath, Node = S.Node, Dom = S.DOM;
  _$jscoverage['/editor/domIterator.js'].lineData[25]++;
  function Iterator(range) {
    _$jscoverage['/editor/domIterator.js'].functionData[1]++;
    _$jscoverage['/editor/domIterator.js'].lineData[26]++;
    if (visit209_26_1(arguments.length < 1)) {
      _$jscoverage['/editor/domIterator.js'].lineData[27]++;
      return;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[28]++;
    var self = this;
    _$jscoverage['/editor/domIterator.js'].lineData[29]++;
    self.range = range;
    _$jscoverage['/editor/domIterator.js'].lineData[30]++;
    self.forceBrBreak = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[33]++;
    self.enlargeBr = TRUE;
    _$jscoverage['/editor/domIterator.js'].lineData[34]++;
    self.enforceRealBlocks = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[36]++;
    visit210_36_1(self._ || (self._ = {}));
  }
  _$jscoverage['/editor/domIterator.js'].lineData[39]++;
  var beginWhitespaceRegex = /^[\r\n\t ]*$/;
  _$jscoverage['/editor/domIterator.js'].lineData[41]++;
  S.augment(Iterator, {
  getNextParagraph: function(blockTag) {
  _$jscoverage['/editor/domIterator.js'].functionData[2]++;
  _$jscoverage['/editor/domIterator.js'].lineData[55]++;
  var block, self = this;
  _$jscoverage['/editor/domIterator.js'].lineData[58]++;
  var range;
  _$jscoverage['/editor/domIterator.js'].lineData[61]++;
  var isLast;
  _$jscoverage['/editor/domIterator.js'].lineData[64]++;
  var removePreviousBr, removeLastBr;
  _$jscoverage['/editor/domIterator.js'].lineData[67]++;
  if (visit211_67_1(!self._.lastNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[68]++;
    range = self.range.clone();
    _$jscoverage['/editor/domIterator.js'].lineData[73]++;
    range.shrink(KER.SHRINK_ELEMENT, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[75]++;
    range.enlarge(visit212_75_1(self.forceBrBreak || !self.enlargeBr) ? KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);
    _$jscoverage['/editor/domIterator.js'].lineData[78]++;
    var walker = new Walker(range), ignoreBookmarkTextEvaluator = Walker.bookmark(TRUE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[81]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[82]++;
    self._.nextNode = walker.next();
    _$jscoverage['/editor/domIterator.js'].lineData[84]++;
    walker = new Walker(range);
    _$jscoverage['/editor/domIterator.js'].lineData[85]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[86]++;
    var lastNode = walker.previous();
    _$jscoverage['/editor/domIterator.js'].lineData[87]++;
    self._.lastNode = lastNode._4e_nextSourceNode(TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[92]++;
    if (visit213_92_1(self._.lastNode && visit214_93_1(visit215_93_2(self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE) && visit216_94_1(!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary())))) {
      _$jscoverage['/editor/domIterator.js'].lineData[96]++;
      var testRange = new KERange(range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[97]++;
      testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/domIterator.js'].lineData[98]++;
      if (visit217_98_1(testRange.checkEndOfBlock())) {
        _$jscoverage['/editor/domIterator.js'].lineData[99]++;
        var path = new ElementPath(testRange.endContainer);
        _$jscoverage['/editor/domIterator.js'].lineData[100]++;
        var lastBlock = visit218_100_1(path.block || path.blockLimit);
        _$jscoverage['/editor/domIterator.js'].lineData[101]++;
        self._.lastNode = lastBlock._4e_nextSourceNode(TRUE);
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[106]++;
    if (visit219_106_1(!self._.lastNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[107]++;
      self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
      _$jscoverage['/editor/domIterator.js'].lineData[108]++;
      Dom.insertAfter(self._.lastNode[0], lastNode[0]);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[112]++;
    range = NULL;
  }
  _$jscoverage['/editor/domIterator.js'].lineData[115]++;
  var currentNode = self._.nextNode;
  _$jscoverage['/editor/domIterator.js'].lineData[116]++;
  lastNode = self._.lastNode;
  _$jscoverage['/editor/domIterator.js'].lineData[118]++;
  self._.nextNode = NULL;
  _$jscoverage['/editor/domIterator.js'].lineData[119]++;
  while (currentNode) {
    _$jscoverage['/editor/domIterator.js'].lineData[122]++;
    var closeRange = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[126]++;
    var includeNode = (visit220_126_1(currentNode[0].nodeType != Dom.NodeType.ELEMENT_NODE)), continueFromSibling = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[131]++;
    if (visit221_131_1(!includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[132]++;
      var nodeName = currentNode.nodeName();
      _$jscoverage['/editor/domIterator.js'].lineData[134]++;
      if (visit222_134_1(currentNode._4e_isBlockBoundary(visit223_134_2(self.forceBrBreak && {
  br: 1})))) {
        _$jscoverage['/editor/domIterator.js'].lineData[137]++;
        if (visit224_137_1(nodeName == 'br')) {
          _$jscoverage['/editor/domIterator.js'].lineData[138]++;
          includeNode = TRUE;
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[139]++;
          if (visit225_139_1(!range && visit226_139_2(!currentNode[0].childNodes.length && visit227_139_3(nodeName != 'hr')))) {
            _$jscoverage['/editor/domIterator.js'].lineData[142]++;
            block = currentNode;
            _$jscoverage['/editor/domIterator.js'].lineData[143]++;
            isLast = currentNode.equals(lastNode);
            _$jscoverage['/editor/domIterator.js'].lineData[144]++;
            break;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[149]++;
        if (visit228_149_1(range)) {
          _$jscoverage['/editor/domIterator.js'].lineData[150]++;
          range.setEndAt(currentNode, KER.POSITION_BEFORE_START);
          _$jscoverage['/editor/domIterator.js'].lineData[154]++;
          if (visit229_154_1(nodeName != 'br')) {
            _$jscoverage['/editor/domIterator.js'].lineData[155]++;
            self._.nextNode = currentNode;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[158]++;
        closeRange = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[161]++;
        if (visit230_161_1(currentNode[0].firstChild)) {
          _$jscoverage['/editor/domIterator.js'].lineData[163]++;
          if (visit231_163_1(!range)) {
            _$jscoverage['/editor/domIterator.js'].lineData[164]++;
            range = new KERange(self.range.document);
            _$jscoverage['/editor/domIterator.js'].lineData[165]++;
            range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
          }
          _$jscoverage['/editor/domIterator.js'].lineData[168]++;
          currentNode = new Node(currentNode[0].firstChild);
          _$jscoverage['/editor/domIterator.js'].lineData[169]++;
          continue;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[171]++;
        includeNode = TRUE;
      }
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[174]++;
      if (visit232_174_1(currentNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/domIterator.js'].lineData[177]++;
        if (visit233_177_1(beginWhitespaceRegex.test(currentNode[0].nodeValue))) {
          _$jscoverage['/editor/domIterator.js'].lineData[178]++;
          includeNode = FALSE;
        }
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[183]++;
    if (visit234_183_1(includeNode && !range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[184]++;
      range = new KERange(self.range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[185]++;
      range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[189]++;
    isLast = visit235_189_1((visit236_189_2(!closeRange || includeNode)) && currentNode.equals(lastNode));
    _$jscoverage['/editor/domIterator.js'].lineData[193]++;
    if (visit237_193_1(range && !closeRange)) {
      _$jscoverage['/editor/domIterator.js'].lineData[194]++;
      while (visit238_194_1(!currentNode[0].nextSibling && !isLast)) {
        _$jscoverage['/editor/domIterator.js'].lineData[195]++;
        var parentNode = currentNode.parent();
        _$jscoverage['/editor/domIterator.js'].lineData[197]++;
        if (visit239_197_1(parentNode._4e_isBlockBoundary(visit240_197_2(self.forceBrBreak && {
  br: 1})))) {
          _$jscoverage['/editor/domIterator.js'].lineData[198]++;
          closeRange = TRUE;
          _$jscoverage['/editor/domIterator.js'].lineData[199]++;
          isLast = visit241_199_1(isLast || parentNode.equals(lastNode));
          _$jscoverage['/editor/domIterator.js'].lineData[200]++;
          break;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[203]++;
        currentNode = parentNode;
        _$jscoverage['/editor/domIterator.js'].lineData[204]++;
        includeNode = TRUE;
        _$jscoverage['/editor/domIterator.js'].lineData[205]++;
        isLast = currentNode.equals(lastNode);
        _$jscoverage['/editor/domIterator.js'].lineData[206]++;
        continueFromSibling = TRUE;
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[211]++;
    if (visit242_211_1(includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[212]++;
      range.setEndAt(currentNode, KER.POSITION_AFTER_END);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[214]++;
    currentNode = currentNode._4e_nextSourceNode(continueFromSibling, NULL, lastNode);
    _$jscoverage['/editor/domIterator.js'].lineData[215]++;
    isLast = !currentNode;
    _$jscoverage['/editor/domIterator.js'].lineData[219]++;
    if (visit243_219_1(isLast || (visit244_219_2(closeRange && range)))) {
      _$jscoverage['/editor/domIterator.js'].lineData[220]++;
      break;
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[224]++;
  if (visit245_224_1(!block)) {
    _$jscoverage['/editor/domIterator.js'].lineData[226]++;
    if (visit246_226_1(!range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[227]++;
      visit247_227_1(self._.docEndMarker && self._.docEndMarker._4e_remove());
      _$jscoverage['/editor/domIterator.js'].lineData[228]++;
      self._.nextNode = NULL;
      _$jscoverage['/editor/domIterator.js'].lineData[229]++;
      return NULL;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[232]++;
    var startPath = new ElementPath(range.startContainer);
    _$jscoverage['/editor/domIterator.js'].lineData[233]++;
    var startBlockLimit = startPath.blockLimit, checkLimits = {
  div: 1, 
  th: 1, 
  td: 1};
    _$jscoverage['/editor/domIterator.js'].lineData[235]++;
    block = startPath.block;
    _$jscoverage['/editor/domIterator.js'].lineData[237]++;
    if (visit248_237_1((visit249_237_2(!block || !block[0])) && visit250_238_1(!self.enforceRealBlocks && visit251_239_1(checkLimits[startBlockLimit.nodeName()] && visit252_240_1(range.checkStartOfBlock() && range.checkEndOfBlock()))))) {
      _$jscoverage['/editor/domIterator.js'].lineData[242]++;
      block = startBlockLimit;
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[243]++;
      if (visit253_243_1(!block || (visit254_243_2(self.enforceRealBlocks && visit255_243_3(block.nodeName() == 'li'))))) {
        _$jscoverage['/editor/domIterator.js'].lineData[245]++;
        block = new Node(self.range.document.createElement(visit256_245_1(blockTag || 'p')));
        _$jscoverage['/editor/domIterator.js'].lineData[247]++;
        block[0].appendChild(range.extractContents());
        _$jscoverage['/editor/domIterator.js'].lineData[248]++;
        block._4e_trim();
        _$jscoverage['/editor/domIterator.js'].lineData[250]++;
        range.insertNode(block);
        _$jscoverage['/editor/domIterator.js'].lineData[251]++;
        removePreviousBr = removeLastBr = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[253]++;
        if (visit257_253_1(block.nodeName() != 'li')) {
          _$jscoverage['/editor/domIterator.js'].lineData[257]++;
          if (visit258_257_1(!range.checkStartOfBlock() || !range.checkEndOfBlock())) {
            _$jscoverage['/editor/domIterator.js'].lineData[259]++;
            block = block.clone(FALSE);
            _$jscoverage['/editor/domIterator.js'].lineData[262]++;
            block[0].appendChild(range.extractContents());
            _$jscoverage['/editor/domIterator.js'].lineData[263]++;
            block._4e_trim();
            _$jscoverage['/editor/domIterator.js'].lineData[267]++;
            var splitInfo = range.splitBlock();
            _$jscoverage['/editor/domIterator.js'].lineData[269]++;
            removePreviousBr = !splitInfo.wasStartOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[270]++;
            removeLastBr = !splitInfo.wasEndOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[273]++;
            range.insertNode(block);
          }
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[276]++;
          if (visit259_276_1(!isLast)) {
            _$jscoverage['/editor/domIterator.js'].lineData[282]++;
            self._.nextNode = (block.equals(lastNode) ? NULL : range.getBoundaryNodes().endNode._4e_nextSourceNode(TRUE, NULL, lastNode));
          }
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[287]++;
  if (visit260_287_1(removePreviousBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[288]++;
    var previousSibling = new Node(block[0].previousSibling);
    _$jscoverage['/editor/domIterator.js'].lineData[289]++;
    if (visit261_289_1(previousSibling[0] && visit262_289_2(previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/domIterator.js'].lineData[290]++;
      if (visit263_290_1(previousSibling.nodeName() == 'br')) {
        _$jscoverage['/editor/domIterator.js'].lineData[291]++;
        previousSibling._4e_remove();
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[292]++;
        if (visit264_292_1(previousSibling[0].lastChild && visit265_292_2(Dom.nodeName(previousSibling[0].lastChild) == 'br'))) {
          _$jscoverage['/editor/domIterator.js'].lineData[293]++;
          Dom._4e_remove(previousSibling[0].lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[297]++;
  if (visit266_297_1(removeLastBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[299]++;
    var bookmarkGuard = Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[301]++;
    var lastChild = new Node(block[0].lastChild);
    _$jscoverage['/editor/domIterator.js'].lineData[302]++;
    if (visit267_302_1(lastChild[0] && visit268_302_2(visit269_302_3(lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit270_302_4(lastChild.nodeName() == 'br')))) {
      _$jscoverage['/editor/domIterator.js'].lineData[304]++;
      if (visit271_304_1(UA['ie'] || visit272_305_1(lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)))) {
        _$jscoverage['/editor/domIterator.js'].lineData[307]++;
        lastChild.remove();
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[314]++;
  if (visit273_314_1(!self._.nextNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[315]++;
    self._.nextNode = (visit274_315_1(isLast || block.equals(lastNode))) ? NULL : block._4e_nextSourceNode(TRUE, NULL, lastNode);
  }
  _$jscoverage['/editor/domIterator.js'].lineData[319]++;
  return block;
}});
  _$jscoverage['/editor/domIterator.js'].lineData[323]++;
  KERange.prototype.createIterator = function() {
  _$jscoverage['/editor/domIterator.js'].functionData[3]++;
  _$jscoverage['/editor/domIterator.js'].lineData[324]++;
  return new Iterator(this);
};
  _$jscoverage['/editor/domIterator.js'].lineData[327]++;
  return Iterator;
}, {
  requires: ['./base', './range', './elementPath', './walker', 'node']});
