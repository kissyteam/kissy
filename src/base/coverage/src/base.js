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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[48] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[294] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[321] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[323] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[391] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[396] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[404] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[423] = 0;
  _$jscoverage['/base.js'].lineData[424] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['18'] = [];
  _$jscoverage['/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['24'] = [];
  _$jscoverage['/base.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['25'] = [];
  _$jscoverage['/base.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['29'] = [];
  _$jscoverage['/base.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['86'] = [];
  _$jscoverage['/base.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['106'] = [];
  _$jscoverage['/base.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['112'] = [];
  _$jscoverage['/base.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['115'] = [];
  _$jscoverage['/base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['120'] = [];
  _$jscoverage['/base.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['123'] = [];
  _$jscoverage['/base.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['123'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'] = [];
  _$jscoverage['/base.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'] = [];
  _$jscoverage['/base.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'] = [];
  _$jscoverage['/base.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['159'] = [];
  _$jscoverage['/base.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['163'] = [];
  _$jscoverage['/base.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['164'] = [];
  _$jscoverage['/base.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['167'] = [];
  _$jscoverage['/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['197'] = [];
  _$jscoverage['/base.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'] = [];
  _$jscoverage['/base.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['211'] = [];
  _$jscoverage['/base.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['293'] = [];
  _$jscoverage['/base.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['298'] = [];
  _$jscoverage['/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['299'] = [];
  _$jscoverage['/base.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['305'] = [];
  _$jscoverage['/base.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['311'] = [];
  _$jscoverage['/base.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['322'] = [];
  _$jscoverage['/base.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['330'] = [];
  _$jscoverage['/base.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['340'] = [];
  _$jscoverage['/base.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['353'] = [];
  _$jscoverage['/base.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['357'] = [];
  _$jscoverage['/base.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['360'] = [];
  _$jscoverage['/base.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['394'] = [];
  _$jscoverage['/base.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['403'] = [];
  _$jscoverage['/base.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['413'] = [];
  _$jscoverage['/base.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['414'] = [];
  _$jscoverage['/base.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['415'] = [];
  _$jscoverage['/base.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['422'] = [];
  _$jscoverage['/base.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['422'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['423'] = [];
  _$jscoverage['/base.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['424'] = [];
  _$jscoverage['/base.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['429'] = [];
  _$jscoverage['/base.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['430'] = [];
  _$jscoverage['/base.js'].branchData['430'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['430'][1].init(36, 10, 'args || []');
function visit49_430_1(result) {
  _$jscoverage['/base.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['429'][1].init(214, 2, 'fn');
function visit48_429_1(result) {
  _$jscoverage['/base.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['424'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit47_424_1(result) {
  _$jscoverage['/base.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['423'][1].init(29, 7, 'i < len');
function visit46_423_1(result) {
  _$jscoverage['/base.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['422'][2].init(36, 31, 'extensions && extensions.length');
function visit45_422_2(result) {
  _$jscoverage['/base.js'].branchData['422'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['422'][1].init(30, 37, 'len = extensions && extensions.length');
function visit44_422_1(result) {
  _$jscoverage['/base.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['415'][1].init(17, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit43_415_1(result) {
  _$jscoverage['/base.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['414'][1].init(29, 7, 'i < len');
function visit42_414_1(result) {
  _$jscoverage['/base.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['413'][1].init(98, 20, 'len = plugins.length');
function visit41_413_1(result) {
  _$jscoverage['/base.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['403'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit40_403_1(result) {
  _$jscoverage['/base.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['394'][1].init(85, 16, 'e.target == self');
function visit39_394_1(result) {
  _$jscoverage['/base.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['360'][1].init(207, 13, 'px[h] || noop');
function visit38_360_1(result) {
  _$jscoverage['/base.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['357'][1].init(83, 48, 'proto.hasOwnProperty(h) && !px.hasOwnProperty(h)');
function visit37_357_1(result) {
  _$jscoverage['/base.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['353'][1].init(172, 26, 'extensions.length && hooks');
function visit36_353_1(result) {
  _$jscoverage['/base.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['340'][1].init(2022, 19, 'sx.extend || extend');
function visit35_340_1(result) {
  _$jscoverage['/base.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['330'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit34_330_1(result) {
  _$jscoverage['/base.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['322'][1].init(52, 17, 'attrs[name] || {}');
function visit33_322_1(result) {
  _$jscoverage['/base.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['311'][1].init(25, 3, 'ext');
function visit32_311_1(result) {
  _$jscoverage['/base.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['305'][1].init(479, 17, 'extensions.length');
function visit31_305_1(result) {
  _$jscoverage['/base.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['299'][1].init(219, 8, 'px || {}');
function visit30_299_1(result) {
  _$jscoverage['/base.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['298'][1].init(192, 8, 'sx || {}');
function visit29_298_1(result) {
  _$jscoverage['/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['293'][1].init(17, 22, '!S.isArray(extensions)');
function visit28_293_1(result) {
  _$jscoverage['/base.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['211'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit27_211_1(result) {
  _$jscoverage['/base.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][1].init(141, 14, 'pluginId == id');
function visit26_198_1(result) {
  _$jscoverage['/base.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['197'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit25_197_2(result) {
  _$jscoverage['/base.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['197'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit24_197_1(result) {
  _$jscoverage['/base.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(640, 5, '!keep');
function visit23_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(29, 11, 'p != plugin');
function visit22_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['167'][1].init(161, 18, 'pluginId != plugin');
function visit21_167_1(result) {
  _$jscoverage['/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit20_166_2(result) {
  _$jscoverage['/base.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit19_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['164'][1].init(25, 8, 'isString');
function visit18_164_1(result) {
  _$jscoverage['/base.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['163'][1].init(61, 6, 'plugin');
function visit17_163_1(result) {
  _$jscoverage['/base.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['159'][1].init(73, 25, 'typeof plugin == \'string\'');
function visit16_159_1(result) {
  _$jscoverage['/base.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][1].init(180, 27, 'plugin[\'pluginInitializer\']');
function visit15_143_1(result) {
  _$jscoverage['/base.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit14_139_1(result) {
  _$jscoverage['/base.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit13_124_1(result) {
  _$jscoverage['/base.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['123'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit12_123_2(result) {
  _$jscoverage['/base.js'].branchData['123'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['123'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit11_123_1(result) {
  _$jscoverage['/base.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['120'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit10_120_1(result) {
  _$jscoverage['/base.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['115'][1].init(25, 22, 'attributeName in attrs');
function visit9_115_1(result) {
  _$jscoverage['/base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit8_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['112'][1].init(379, 13, 'i < cs.length');
function visit7_112_1(result) {
  _$jscoverage['/base.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['106'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit6_106_1(result) {
  _$jscoverage['/base.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['86'][1].init(65, 7, 'self[m]');
function visit5_86_1(result) {
  _$jscoverage['/base.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['29'][1].init(532, 7, 'reverse');
function visit4_29_1(result) {
  _$jscoverage['/base.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['25'][1].init(366, 7, 'reverse');
function visit3_25_1(result) {
  _$jscoverage['/base.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['24'][1].init(297, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit2_24_1(result) {
  _$jscoverage['/base.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['18'][1].init(54, 7, 'reverse');
function visit1_18_1(result) {
  _$jscoverage['/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/base.js'].lineData[8]++;
  var Attribute = module.require('attribute');
  _$jscoverage['/base.js'].lineData[10]++;
  var ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop;
  _$jscoverage['/base.js'].lineData[14]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[15]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[16]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[17]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[18]++;
  if (visit1_18_1(reverse)) {
    _$jscoverage['/base.js'].lineData[19]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[21]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[24]++;
  var extensions = visit2_24_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[25]++;
  if (visit3_25_1(reverse)) {
    _$jscoverage['/base.js'].lineData[26]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[28]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[29]++;
  if (visit4_29_1(reverse)) {
    _$jscoverage['/base.js'].lineData[30]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[32]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[48]++;
  var Base = Attribute.extend({
  constructor: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[50]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[51]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/base.js'].lineData[53]++;
  var listeners = self.get("listeners");
  _$jscoverage['/base.js'].lineData[54]++;
  for (var n in listeners) {
    _$jscoverage['/base.js'].lineData[55]++;
    self.on(n, listeners[n]);
  }
  _$jscoverage['/base.js'].lineData[58]++;
  self.initializer();
  _$jscoverage['/base.js'].lineData[60]++;
  constructPlugins(self);
  _$jscoverage['/base.js'].lineData[61]++;
  callPluginsMethod.call(self, 'pluginInitializer');
  _$jscoverage['/base.js'].lineData[63]++;
  self.bindInternal();
  _$jscoverage['/base.js'].lineData[65]++;
  self.syncInternal();
}, 
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[80]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[84]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[85]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[86]++;
    if (visit5_86_1(self[m])) {
      _$jscoverage['/base.js'].lineData[88]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[98]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[104]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[105]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[106]++;
    c = visit6_106_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[109]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[112]++;
  for (i = 0; visit7_112_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[113]++;
    var ATTRS = visit8_113_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[114]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[115]++;
      if (visit9_115_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[116]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[118]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[120]++;
        if (visit10_120_1((onSetMethod = self[onSetMethodName]) && visit11_123_1(visit12_123_2(attrs[attributeName].sync !== 0) && visit13_124_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[125]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[138]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[139]++;
  if (visit14_139_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[140]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[143]++;
  if (visit15_143_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[144]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[146]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[147]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[157]++;
  var plugins = [], self = this, isString = visit16_159_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[161]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[162]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[163]++;
  if (visit17_163_1(plugin)) {
    _$jscoverage['/base.js'].lineData[164]++;
    if (visit18_164_1(isString)) {
      _$jscoverage['/base.js'].lineData[166]++;
      pluginId = visit19_166_1(visit20_166_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[167]++;
      if (visit21_167_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[168]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[169]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[172]++;
      if (visit22_172_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[173]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[174]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[179]++;
  if (visit23_179_1(!keep)) {
    _$jscoverage['/base.js'].lineData[180]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[184]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[185]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[194]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[195]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[197]++;
  var pluginId = visit24_197_1(visit25_197_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[198]++;
  if (visit26_198_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[199]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[200]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[202]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[204]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[210]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[211]++;
  if (visit27_211_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[212]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[213]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[214]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[215]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[216]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[221]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[293]++;
  if (visit28_293_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[294]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[295]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[296]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[298]++;
  sx = visit29_298_1(sx || {});
  _$jscoverage['/base.js'].lineData[299]++;
  px = visit30_299_1(px || {});
  _$jscoverage['/base.js'].lineData[300]++;
  var SubClass = Attribute.extend.call(this, px, sx);
  _$jscoverage['/base.js'].lineData[301]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[303]++;
  baseAddMembers.call(SubClass, {});
  _$jscoverage['/base.js'].lineData[305]++;
  if (visit31_305_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[306]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[310]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[311]++;
  if (visit32_311_1(ext)) {
    _$jscoverage['/base.js'].lineData[321]++;
    S.each(ext.ATTRS, function(v, name) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[322]++;
  var av = attrs[name] = visit33_322_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[323]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[326]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[328]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[330]++;
      if (visit34_330_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[331]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[336]++;
    SubClass.ATTRS = attrs;
    _$jscoverage['/base.js'].lineData[337]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[338]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[340]++;
  SubClass.extend = visit35_340_1(sx.extend || extend);
  _$jscoverage['/base.js'].lineData[341]++;
  SubClass.addMembers = baseAddMembers;
  _$jscoverage['/base.js'].lineData[342]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[346]++;
  var addMembers = Base.addMembers;
  _$jscoverage['/base.js'].lineData[348]++;
  function baseAddMembers(px) {
    _$jscoverage['/base.js'].functionData[16]++;
    _$jscoverage['/base.js'].lineData[349]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[350]++;
    var extensions = SubClass.__extensions__, hooks = SubClass.__hooks__, proto = SubClass.prototype;
    _$jscoverage['/base.js'].lineData[353]++;
    if (visit36_353_1(extensions.length && hooks)) {
      _$jscoverage['/base.js'].lineData[355]++;
      for (var h in hooks) {
        _$jscoverage['/base.js'].lineData[357]++;
        if (visit37_357_1(proto.hasOwnProperty(h) && !px.hasOwnProperty(h))) {
          _$jscoverage['/base.js'].lineData[358]++;
          continue;
        }
        _$jscoverage['/base.js'].lineData[360]++;
        px[h] = visit38_360_1(px[h] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[363]++;
    return addMembers.call(SubClass, px);
  }
  _$jscoverage['/base.js'].lineData[390]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[17]++;
    _$jscoverage['/base.js'].lineData[391]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[394]++;
    if (visit39_394_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[395]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[396]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[400]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[18]++;
    _$jscoverage['/base.js'].lineData[401]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[402]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[403]++;
  if (visit40_403_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[404]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[409]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[410]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[413]++;
    if (visit41_413_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[414]++;
      for (var i = 0; visit42_414_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[415]++;
        visit43_415_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[420]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[421]++;
    var len;
    _$jscoverage['/base.js'].lineData[422]++;
    if (visit44_422_1(len = visit45_422_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[423]++;
      for (var i = 0; visit46_423_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[424]++;
        var fn = visit47_424_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[429]++;
        if (visit48_429_1(fn)) {
          _$jscoverage['/base.js'].lineData[430]++;
          fn.apply(self, visit49_430_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[436]++;
  return Base;
});
