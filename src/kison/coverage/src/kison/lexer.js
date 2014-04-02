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
if (! _$jscoverage['/kison/lexer.js']) {
  _$jscoverage['/kison/lexer.js'] = {};
  _$jscoverage['/kison/lexer.js'].lineData = [];
  _$jscoverage['/kison/lexer.js'].lineData[6] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[7] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[9] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[10] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[13] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[20] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[36] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[38] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[45] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[48] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[54] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[58] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[73] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[77] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[79] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[81] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[82] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[83] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[84] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[86] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[88] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[92] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[99] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[100] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[101] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[104] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[105] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[108] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[110] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[111] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[112] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[114] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[117] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[119] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[121] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[123] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[125] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[126] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[127] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[130] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[131] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[133] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[138] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[139] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[140] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[143] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[144] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[147] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[150] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[152] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[155] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[156] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[157] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[161] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[165] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[169] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[170] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[172] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[173] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[174] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[175] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[176] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[178] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[179] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[182] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[186] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[190] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[194] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[198] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[203] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[205] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[209] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[211] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[215] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[217] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[218] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[221] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[225] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[229] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[230] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[231] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[232] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[236] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[237] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[239] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[244] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[246] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[247] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[249] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[253] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[262] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[264] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[265] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[268] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[269] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[271] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[275] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[276] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[277] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[278] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[280] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[288] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[290] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[293] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[295] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[297] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[298] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[299] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[300] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[302] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[304] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[305] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[307] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[308] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[311] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[318] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].functionData) {
  _$jscoverage['/kison/lexer.js'].functionData = [];
  _$jscoverage['/kison/lexer.js'].functionData[0] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[1] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[2] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[3] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[4] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[5] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[6] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[7] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[8] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[9] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[10] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[11] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[12] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[13] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[14] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[15] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[16] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[17] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[18] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['78'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['87'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['99'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['104'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['111'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['124'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['126'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['129'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['130'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['136'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['138'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['143'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['152'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['156'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['169'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['173'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['174'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['175'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['178'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['205'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['210'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['217'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['221'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['229'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['236'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['246'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['249'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['264'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['268'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['271'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['272'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['273'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['273'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['277'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['298'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['299'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['307'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['307'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['307'][1].init(1302, 3, 'ret');
function visit126_307_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['299'][1].init(1014, 17, 'ret === undefined');
function visit125_299_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['298'][1].init(960, 27, 'action && action.call(self)');
function visit124_298_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['277'][1].init(76, 5, 'lines');
function visit123_277_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['273'][2].init(133, 20, 'rule[2] || undefined');
function visit122_273_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['273'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['273'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit121_273_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['272'][1].init(65, 21, 'rule.token || rule[0]');
function visit120_272_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['271'][1].init(101, 22, 'rule.regexp || rule[1]');
function visit119_271_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['268'][1].init(403, 16, 'i < rules.length');
function visit118_268_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['264'][1].init(289, 6, '!input');
function visit117_264_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['249'][1].init(166, 55, 'stateMap[s] || (stateMap[s] = self.genShortId(\'state\'))');
function visit116_249_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['246'][1].init(91, 9, '!stateMap');
function visit115_246_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['236'][1].init(448, 16, 'reverseSymbolMap');
function visit114_236_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['229'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit113_229_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['221'][1].init(229, 58, 'symbolMap[t] || (symbolMap[t] = self.genShortId(\'symbol\'))');
function visit112_221_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['217'][1].init(93, 10, '!symbolMap');
function visit111_217_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['210'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit110_210_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['205'][1].init(348, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit109_205_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['178'][1].init(236, 30, 'S.inArray(currentState, state)');
function visit108_178_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['175'][1].init(26, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit107_175_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['174'][1].init(68, 6, '!state');
function visit106_174_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['173'][1].init(30, 15, 'r.state || r[3]');
function visit105_173_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['169'][1].init(184, 13, 'self.mapState');
function visit104_169_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['156'][1].init(155, 13, 'compressState');
function visit103_156_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['152'][1].init(2253, 31, 'compressState || compressSymbol');
function visit102_152_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['143'][1].init(715, 5, 'state');
function visit101_143_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['138'][1].init(477, 22, 'compressState && state');
function visit100_138_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['136'][1].init(105, 11, 'action || 0');
function visit99_136_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['130'][1].init(175, 5, 'token');
function visit98_130_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['129'][1].init(105, 12, 'v.token || 0');
function visit97_129_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['126'][1].init(56, 13, 'v && v.regexp');
function visit96_126_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['124'][1].init(54, 31, 'compressState || compressSymbol');
function visit95_124_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['111'][1].init(22, 73, 'name.match(/^(?:genCode|constructor|mapState|genShortId|getStateStack)$/)');
function visit94_111_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['104'][1].init(423, 13, 'compressState');
function visit93_104_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['99'][1].init(284, 14, 'compressSymbol');
function visit92_99_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['87'][1].init(192, 10, 'index >= 0');
function visit91_87_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['78'][1].init(191, 16, '!(field in self)');
function visit90_78_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/lexer.js'].lineData[9]++;
  function mapSymbolForCodeGen(t) {
    _$jscoverage['/kison/lexer.js'].functionData[1]++;
    _$jscoverage['/kison/lexer.js'].lineData[10]++;
    return this.symbolMap[t];
  }
  _$jscoverage['/kison/lexer.js'].lineData[13]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[20]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[36]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[38]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[45]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[48]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[54]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[58]++;
  S.mix(this, {
  input: input, 
  matched: '', 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: '', 
  text: '', 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genShortId: function(field) {
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[73]++;
  var base = 97, max = 122, interval = max - base + 1;
  _$jscoverage['/kison/lexer.js'].lineData[76]++;
  field += '__gen';
  _$jscoverage['/kison/lexer.js'].lineData[77]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[78]++;
  if (visit90_78_1(!(field in self))) {
    _$jscoverage['/kison/lexer.js'].lineData[79]++;
    self[field] = -1;
  }
  _$jscoverage['/kison/lexer.js'].lineData[81]++;
  var index = self[field] = self[field] + 1;
  _$jscoverage['/kison/lexer.js'].lineData[82]++;
  var ret = '';
  _$jscoverage['/kison/lexer.js'].lineData[83]++;
  do {
    _$jscoverage['/kison/lexer.js'].lineData[84]++;
    ret = String.fromCharCode(base + index % interval) + ret;
    _$jscoverage['/kison/lexer.js'].lineData[86]++;
    index = Math.floor(index / interval) - 1;
  } while (visit91_87_1(index >= 0));
  _$jscoverage['/kison/lexer.js'].lineData[88]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[92]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = ['/*jslint quotmark: false*/'], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[99]++;
  if (visit92_99_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[100]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[101]++;
    self.mapSymbol(STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[104]++;
  if (visit93_104_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[105]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[108]++;
  code.push('var Lexer = ' + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[110]++;
  var genPrototype = S.mix({}, Lexer.prototype, true, function(name, val) {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[111]++;
  if (visit94_111_1(name.match(/^(?:genCode|constructor|mapState|genShortId|getStateStack)$/))) {
    _$jscoverage['/kison/lexer.js'].lineData[112]++;
    return undefined;
  }
  _$jscoverage['/kison/lexer.js'].lineData[114]++;
  return val;
});
  _$jscoverage['/kison/lexer.js'].lineData[117]++;
  genPrototype.mapSymbol = mapSymbolForCodeGen;
  _$jscoverage['/kison/lexer.js'].lineData[119]++;
  code.push('Lexer.prototype= ' + serializeObject(genPrototype) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[121]++;
  code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[123]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit95_124_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[125]++;
  var ret;
  _$jscoverage['/kison/lexer.js'].lineData[126]++;
  if (visit96_126_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[127]++;
    var state = v.state, action = v.action, token = visit97_129_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[130]++;
    if (visit98_130_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[131]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[133]++;
    ret = [token, v.regexp, visit99_136_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[138]++;
    if (visit100_138_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[139]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[140]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[143]++;
    if (visit101_143_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[144]++;
      ret.push(state);
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[147]++;
  return ret;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[150]++;
  code.push('var lexer = new Lexer(' + newCfg + ');');
  _$jscoverage['/kison/lexer.js'].lineData[152]++;
  if (visit102_152_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[155]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[156]++;
    if (visit103_156_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[157]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[161]++;
  return code.join('\n');
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[165]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[169]++;
  if (visit104_169_1(self.mapState)) {
    _$jscoverage['/kison/lexer.js'].lineData[170]++;
    currentState = self.mapState(currentState);
  }
  _$jscoverage['/kison/lexer.js'].lineData[172]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[173]++;
  var state = visit105_173_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[174]++;
  if (visit106_174_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[175]++;
    if (visit107_175_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[176]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[178]++;
    if (visit108_178_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[179]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[182]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[186]++;
  this.stateStack.push(state);
}, 
  popState: function() {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[190]++;
  return this.stateStack.pop();
}, 
  getStateStack: function() {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[194]++;
  return this.stateStack;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[198]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[203]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[205]++;
  var past = (visit109_205_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[209]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit110_210_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/kison/lexer.js'].lineData[211]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[215]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[217]++;
  if (visit111_217_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[218]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[221]++;
  return visit112_221_1(symbolMap[t] || (symbolMap[t] = self.genShortId('symbol')));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[16]++;
  _$jscoverage['/kison/lexer.js'].lineData[225]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[229]++;
  if (visit113_229_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[230]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[231]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[232]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[236]++;
  if (visit114_236_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[237]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[239]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[17]++;
  _$jscoverage['/kison/lexer.js'].lineData[244]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[246]++;
  if (visit115_246_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[247]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[249]++;
  return visit116_249_1(stateMap[s] || (stateMap[s] = self.genShortId('state')));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[18]++;
  _$jscoverage['/kison/lexer.js'].lineData[253]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[262]++;
  self.match = self.text = '';
  _$jscoverage['/kison/lexer.js'].lineData[264]++;
  if (visit117_264_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[265]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[268]++;
  for (i = 0; visit118_268_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[269]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[271]++;
    var regexp = visit119_271_1(rule.regexp || rule[1]), token = visit120_272_1(rule.token || rule[0]), action = visit121_273_1(rule.action || visit122_273_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[275]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[276]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[277]++;
      if (visit123_277_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[278]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[280]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[288]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[290]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[293]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[295]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[297]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[298]++;
      ret = visit124_298_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[299]++;
      if (visit125_299_1(ret === undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[300]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[302]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[304]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[305]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[307]++;
      if (visit126_307_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[308]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[311]++;
        return self.lex();
      }
    }
  }
}};
  _$jscoverage['/kison/lexer.js'].lineData[318]++;
  return Lexer;
});
