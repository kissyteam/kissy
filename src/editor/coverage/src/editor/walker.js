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
if (! _$jscoverage['/editor/walker.js']) {
  _$jscoverage['/editor/walker.js'] = {};
  _$jscoverage['/editor/walker.js'].lineData = [];
  _$jscoverage['/editor/walker.js'].lineData[11] = 0;
  _$jscoverage['/editor/walker.js'].lineData[12] = 0;
  _$jscoverage['/editor/walker.js'].lineData[14] = 0;
  _$jscoverage['/editor/walker.js'].lineData[22] = 0;
  _$jscoverage['/editor/walker.js'].lineData[23] = 0;
  _$jscoverage['/editor/walker.js'].lineData[25] = 0;
  _$jscoverage['/editor/walker.js'].lineData[26] = 0;
  _$jscoverage['/editor/walker.js'].lineData[28] = 0;
  _$jscoverage['/editor/walker.js'].lineData[37] = 0;
  _$jscoverage['/editor/walker.js'].lineData[38] = 0;
  _$jscoverage['/editor/walker.js'].lineData[42] = 0;
  _$jscoverage['/editor/walker.js'].lineData[45] = 0;
  _$jscoverage['/editor/walker.js'].lineData[46] = 0;
  _$jscoverage['/editor/walker.js'].lineData[47] = 0;
  _$jscoverage['/editor/walker.js'].lineData[52] = 0;
  _$jscoverage['/editor/walker.js'].lineData[54] = 0;
  _$jscoverage['/editor/walker.js'].lineData[57] = 0;
  _$jscoverage['/editor/walker.js'].lineData[59] = 0;
  _$jscoverage['/editor/walker.js'].lineData[60] = 0;
  _$jscoverage['/editor/walker.js'].lineData[64] = 0;
  _$jscoverage['/editor/walker.js'].lineData[70] = 0;
  _$jscoverage['/editor/walker.js'].lineData[72] = 0;
  _$jscoverage['/editor/walker.js'].lineData[76] = 0;
  _$jscoverage['/editor/walker.js'].lineData[78] = 0;
  _$jscoverage['/editor/walker.js'].lineData[79] = 0;
  _$jscoverage['/editor/walker.js'].lineData[83] = 0;
  _$jscoverage['/editor/walker.js'].lineData[88] = 0;
  _$jscoverage['/editor/walker.js'].lineData[92] = 0;
  _$jscoverage['/editor/walker.js'].lineData[93] = 0;
  _$jscoverage['/editor/walker.js'].lineData[94] = 0;
  _$jscoverage['/editor/walker.js'].lineData[95] = 0;
  _$jscoverage['/editor/walker.js'].lineData[97] = 0;
  _$jscoverage['/editor/walker.js'].lineData[101] = 0;
  _$jscoverage['/editor/walker.js'].lineData[104] = 0;
  _$jscoverage['/editor/walker.js'].lineData[105] = 0;
  _$jscoverage['/editor/walker.js'].lineData[109] = 0;
  _$jscoverage['/editor/walker.js'].lineData[110] = 0;
  _$jscoverage['/editor/walker.js'].lineData[111] = 0;
  _$jscoverage['/editor/walker.js'].lineData[112] = 0;
  _$jscoverage['/editor/walker.js'].lineData[113] = 0;
  _$jscoverage['/editor/walker.js'].lineData[114] = 0;
  _$jscoverage['/editor/walker.js'].lineData[117] = 0;
  _$jscoverage['/editor/walker.js'].lineData[122] = 0;
  _$jscoverage['/editor/walker.js'].lineData[123] = 0;
  _$jscoverage['/editor/walker.js'].lineData[125] = 0;
  _$jscoverage['/editor/walker.js'].lineData[126] = 0;
  _$jscoverage['/editor/walker.js'].lineData[127] = 0;
  _$jscoverage['/editor/walker.js'].lineData[130] = 0;
  _$jscoverage['/editor/walker.js'].lineData[136] = 0;
  _$jscoverage['/editor/walker.js'].lineData[137] = 0;
  _$jscoverage['/editor/walker.js'].lineData[138] = 0;
  _$jscoverage['/editor/walker.js'].lineData[139] = 0;
  _$jscoverage['/editor/walker.js'].lineData[140] = 0;
  _$jscoverage['/editor/walker.js'].lineData[142] = 0;
  _$jscoverage['/editor/walker.js'].lineData[143] = 0;
  _$jscoverage['/editor/walker.js'].lineData[145] = 0;
  _$jscoverage['/editor/walker.js'].lineData[148] = 0;
  _$jscoverage['/editor/walker.js'].lineData[149] = 0;
  _$jscoverage['/editor/walker.js'].lineData[152] = 0;
  _$jscoverage['/editor/walker.js'].lineData[153] = 0;
  _$jscoverage['/editor/walker.js'].lineData[155] = 0;
  _$jscoverage['/editor/walker.js'].lineData[156] = 0;
  _$jscoverage['/editor/walker.js'].lineData[158] = 0;
  _$jscoverage['/editor/walker.js'].lineData[166] = 0;
  _$jscoverage['/editor/walker.js'].lineData[167] = 0;
  _$jscoverage['/editor/walker.js'].lineData[177] = 0;
  _$jscoverage['/editor/walker.js'].lineData[188] = 0;
  _$jscoverage['/editor/walker.js'].lineData[192] = 0;
  _$jscoverage['/editor/walker.js'].lineData[196] = 0;
  _$jscoverage['/editor/walker.js'].lineData[202] = 0;
  _$jscoverage['/editor/walker.js'].lineData[211] = 0;
  _$jscoverage['/editor/walker.js'].lineData[220] = 0;
  _$jscoverage['/editor/walker.js'].lineData[229] = 0;
  _$jscoverage['/editor/walker.js'].lineData[240] = 0;
  _$jscoverage['/editor/walker.js'].lineData[250] = 0;
  _$jscoverage['/editor/walker.js'].lineData[260] = 0;
  _$jscoverage['/editor/walker.js'].lineData[264] = 0;
  _$jscoverage['/editor/walker.js'].lineData[265] = 0;
  _$jscoverage['/editor/walker.js'].lineData[274] = 0;
  _$jscoverage['/editor/walker.js'].lineData[281] = 0;
  _$jscoverage['/editor/walker.js'].lineData[282] = 0;
  _$jscoverage['/editor/walker.js'].lineData[297] = 0;
  _$jscoverage['/editor/walker.js'].lineData[298] = 0;
  _$jscoverage['/editor/walker.js'].lineData[302] = 0;
  _$jscoverage['/editor/walker.js'].lineData[303] = 0;
  _$jscoverage['/editor/walker.js'].lineData[305] = 0;
  _$jscoverage['/editor/walker.js'].lineData[309] = 0;
  _$jscoverage['/editor/walker.js'].lineData[312] = 0;
  _$jscoverage['/editor/walker.js'].lineData[321] = 0;
  _$jscoverage['/editor/walker.js'].lineData[322] = 0;
  _$jscoverage['/editor/walker.js'].lineData[324] = 0;
  _$jscoverage['/editor/walker.js'].lineData[332] = 0;
  _$jscoverage['/editor/walker.js'].lineData[333] = 0;
  _$jscoverage['/editor/walker.js'].lineData[339] = 0;
  _$jscoverage['/editor/walker.js'].lineData[341] = 0;
  _$jscoverage['/editor/walker.js'].lineData[346] = 0;
  _$jscoverage['/editor/walker.js'].lineData[350] = 0;
  _$jscoverage['/editor/walker.js'].lineData[351] = 0;
  _$jscoverage['/editor/walker.js'].lineData[359] = 0;
  _$jscoverage['/editor/walker.js'].lineData[361] = 0;
  _$jscoverage['/editor/walker.js'].lineData[362] = 0;
  _$jscoverage['/editor/walker.js'].lineData[365] = 0;
  _$jscoverage['/editor/walker.js'].lineData[367] = 0;
  _$jscoverage['/editor/walker.js'].lineData[369] = 0;
  _$jscoverage['/editor/walker.js'].lineData[372] = 0;
  _$jscoverage['/editor/walker.js'].lineData[374] = 0;
  _$jscoverage['/editor/walker.js'].lineData[378] = 0;
  _$jscoverage['/editor/walker.js'].lineData[380] = 0;
}
if (! _$jscoverage['/editor/walker.js'].functionData) {
  _$jscoverage['/editor/walker.js'].functionData = [];
  _$jscoverage['/editor/walker.js'].functionData[0] = 0;
  _$jscoverage['/editor/walker.js'].functionData[1] = 0;
  _$jscoverage['/editor/walker.js'].functionData[2] = 0;
  _$jscoverage['/editor/walker.js'].functionData[3] = 0;
  _$jscoverage['/editor/walker.js'].functionData[4] = 0;
  _$jscoverage['/editor/walker.js'].functionData[5] = 0;
  _$jscoverage['/editor/walker.js'].functionData[6] = 0;
  _$jscoverage['/editor/walker.js'].functionData[7] = 0;
  _$jscoverage['/editor/walker.js'].functionData[8] = 0;
  _$jscoverage['/editor/walker.js'].functionData[9] = 0;
  _$jscoverage['/editor/walker.js'].functionData[10] = 0;
  _$jscoverage['/editor/walker.js'].functionData[11] = 0;
  _$jscoverage['/editor/walker.js'].functionData[12] = 0;
  _$jscoverage['/editor/walker.js'].functionData[13] = 0;
  _$jscoverage['/editor/walker.js'].functionData[14] = 0;
  _$jscoverage['/editor/walker.js'].functionData[15] = 0;
  _$jscoverage['/editor/walker.js'].functionData[16] = 0;
  _$jscoverage['/editor/walker.js'].functionData[17] = 0;
  _$jscoverage['/editor/walker.js'].functionData[18] = 0;
  _$jscoverage['/editor/walker.js'].functionData[19] = 0;
  _$jscoverage['/editor/walker.js'].functionData[20] = 0;
  _$jscoverage['/editor/walker.js'].functionData[21] = 0;
  _$jscoverage['/editor/walker.js'].functionData[22] = 0;
  _$jscoverage['/editor/walker.js'].functionData[23] = 0;
  _$jscoverage['/editor/walker.js'].functionData[24] = 0;
  _$jscoverage['/editor/walker.js'].functionData[25] = 0;
  _$jscoverage['/editor/walker.js'].functionData[26] = 0;
}
if (! _$jscoverage['/editor/walker.js'].branchData) {
  _$jscoverage['/editor/walker.js'].branchData = {};
  _$jscoverage['/editor/walker.js'].branchData['25'] = [];
  _$jscoverage['/editor/walker.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['37'] = [];
  _$jscoverage['/editor/walker.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['45'] = [];
  _$jscoverage['/editor/walker.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['52'] = [];
  _$jscoverage['/editor/walker.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'] = [];
  _$jscoverage['/editor/walker.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['59'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['64'] = [];
  _$jscoverage['/editor/walker.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['70'] = [];
  _$jscoverage['/editor/walker.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['73'] = [];
  _$jscoverage['/editor/walker.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['73'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'] = [];
  _$jscoverage['/editor/walker.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['78'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['83'] = [];
  _$jscoverage['/editor/walker.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['92'] = [];
  _$jscoverage['/editor/walker.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['94'] = [];
  _$jscoverage['/editor/walker.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['104'] = [];
  _$jscoverage['/editor/walker.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['109'] = [];
  _$jscoverage['/editor/walker.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['111'] = [];
  _$jscoverage['/editor/walker.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['113'] = [];
  _$jscoverage['/editor/walker.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['117'] = [];
  _$jscoverage['/editor/walker.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['125'] = [];
  _$jscoverage['/editor/walker.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['126'] = [];
  _$jscoverage['/editor/walker.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['130'] = [];
  _$jscoverage['/editor/walker.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['136'] = [];
  _$jscoverage['/editor/walker.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['138'] = [];
  _$jscoverage['/editor/walker.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['139'] = [];
  _$jscoverage['/editor/walker.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['142'] = [];
  _$jscoverage['/editor/walker.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['229'] = [];
  _$jscoverage['/editor/walker.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['240'] = [];
  _$jscoverage['/editor/walker.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['282'] = [];
  _$jscoverage['/editor/walker.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['298'] = [];
  _$jscoverage['/editor/walker.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['298'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['305'] = [];
  _$jscoverage['/editor/walker.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['305'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['306'] = [];
  _$jscoverage['/editor/walker.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['309'] = [];
  _$jscoverage['/editor/walker.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['322'] = [];
  _$jscoverage['/editor/walker.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['322'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['339'] = [];
  _$jscoverage['/editor/walker.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['340'] = [];
  _$jscoverage['/editor/walker.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['351'] = [];
  _$jscoverage['/editor/walker.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['352'] = [];
  _$jscoverage['/editor/walker.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['353'] = [];
  _$jscoverage['/editor/walker.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['354'] = [];
  _$jscoverage['/editor/walker.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['363'] = [];
  _$jscoverage['/editor/walker.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['365'] = [];
  _$jscoverage['/editor/walker.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['366'] = [];
  _$jscoverage['/editor/walker.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['366'][2] = new BranchData();
}
_$jscoverage['/editor/walker.js'].branchData['366'][2].init(47, 21, 'tail[0].nodeType == 3');
function visit1140_366_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['366'][1].init(46, 56, 'tail[0].nodeType == 3 && tailNbspRegex.test(tail.text())');
function visit1139_366_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['365'][2].init(213, 23, 'tail.nodeName() == "br"');
function visit1138_365_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['365'][1].init(194, 115, 'tail && (!UA.ie ? tail.nodeName() == "br" : tail[0].nodeType == 3 && tailNbspRegex.test(tail.text()))');
function visit1137_365_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['363'][1].init(71, 23, 'tail && toSkip(tail[0])');
function visit1136_363_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['354'][1].init(41, 66, 'name in dtd.$inline && !(name in dtd.$empty)');
function visit1135_354_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['353'][2].init(141, 18, 'node.nodeType == 1');
function visit1134_353_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['353'][1].init(38, 108, 'node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1133_353_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['352'][1].init(35, 147, 'isWhitespaces(node) || node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1132_352_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['351'][1].init(63, 183, 'isBookmark(node) || isWhitespaces(node) || node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1131_351_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['340'][2].init(63, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1130_340_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['340'][1].init(43, 64, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1129_340_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['339'][1].init(397, 108, 'whitespace(node) || node.nodeType == Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1128_339_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['322'][2].init(40, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit1127_322_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['322'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['322'][1].init(40, 90, 'node.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit1126_322_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['309'][1].init(382, 34, 'isBookmark || isBookmarkNode(node)');
function visit1125_309_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['306'][1].init(68, 76, '(parent = node.parentNode) && isBookmarkNode(parent)');
function visit1124_306_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['305'][2].init(132, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit1123_305_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['305'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['305'][1].init(132, 145, 'node.nodeType == Dom.NodeType.TEXT_NODE && (parent = node.parentNode) && isBookmarkNode(parent)');
function visit1122_305_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['298'][2].init(29, 28, 'Dom.nodeName(node) == \'span\'');
function visit1121_298_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['298'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['298'][1].init(29, 86, 'Dom.nodeName(node) == \'span\' && Dom.attr(node, \'_ke_bookmark\')');
function visit1120_298_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['282'][2].init(30, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1119_282_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['282'][1].init(30, 116, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_isBlockBoundary(node, customNodeNames)');
function visit1118_282_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['240'][1].init(84, 40, 'iterate.call(this, TRUE, TRUE) !== FALSE');
function visit1117_240_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['229'][1].init(24, 41, 'iterate.call(this, FALSE, TRUE) !== FALSE');
function visit1116_229_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['142'][1].init(226, 38, 'breakOnFalseRetFalse && self.evaluator');
function visit1115_142_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['139'][1].init(21, 21, '!breakOnFalseRetFalse');
function visit1114_139_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['138'][2].init(69, 33, 'self.evaluator(node[0]) !== FALSE');
function visit1113_138_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['138'][1].init(50, 52, '!self.evaluator || self.evaluator(node[0]) !== FALSE');
function visit1112_138_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['136'][1].init(4052, 19, 'node && !self._.end');
function visit1111_136_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['130'][1].init(30, 43, 'guard(range.startContainer, TRUE) === FALSE');
function visit1110_130_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['126'][1].init(25, 24, 'guard(node[0]) === FALSE');
function visit1109_126_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['125'][1].init(139, 11, 'node.length');
function visit1108_125_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['117'][1].init(30, 27, 'guard(node, TRUE) === FALSE');
function visit1107_117_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['113'][1].init(103, 24, 'guard(node[0]) === FALSE');
function visit1106_113_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['111'][1].init(64, 19, 'range.endOffset > 0');
function visit1105_111_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['109'][1].init(68, 3, 'rtl');
function visit1104_109_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['104'][1].init(2845, 12, 'self.current');
function visit1103_104_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['94'][1].init(21, 36, 'stopGuard(node, movingOut) === FALSE');
function visit1102_94_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['92'][1].init(2526, 9, 'userGuard');
function visit1101_92_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['83'][1].init(286, 18, 'node != blockerRTL');
function visit1100_83_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][4].init(101, 28, 'Dom.nodeName(node) == "body"');
function visit1099_78_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][3].init(81, 16, 'limitRTL == node');
function visit1098_78_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][2].init(81, 48, 'limitRTL == node || Dom.nodeName(node) == "body"');
function visit1097_78_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['78'][1].init(67, 63, 'movingOut && (limitRTL == node || Dom.nodeName(node) == "body")');
function visit1096_78_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['73'][3].init(70, 21, 'range.startOffset > 0');
function visit1095_73_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['73'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['73'][2].init(70, 89, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1]');
function visit1094_73_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['73'][1].init(70, 97, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1] || null');
function visit1093_73_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['70'][1].init(1606, 23, 'rtl && !self._.guardRTL');
function visit1092_70_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['64'][1].init(286, 18, 'node != blockerLTR');
function visit1091_64_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][4].init(101, 28, 'Dom.nodeName(node) == "body"');
function visit1090_59_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][3].init(81, 16, 'limitLTR == node');
function visit1089_59_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][2].init(81, 48, 'limitLTR == node || Dom.nodeName(node) == "body"');
function visit1088_59_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['59'][1].init(67, 63, 'movingOut && (limitLTR == node || Dom.nodeName(node) == "body")');
function visit1087_59_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['52'][1].init(885, 24, '!rtl && !self._.guardLTR');
function visit1086_52_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['45'][1].init(259, 15, 'range.collapsed');
function visit1085_45_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['37'][1].init(441, 13, '!self._.start');
function visit1084_37_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['25'][1].init(89, 10, 'self._.end');
function visit1083_25_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].lineData[11]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/walker.js'].functionData[0]++;
  _$jscoverage['/editor/walker.js'].lineData[12]++;
  var Editor = require('./base');
  _$jscoverage['/editor/walker.js'].lineData[14]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, dtd = Editor.XHTML_DTD, Node = require('node');
  _$jscoverage['/editor/walker.js'].lineData[22]++;
  function iterate(rtl, breakOnFalseRetFalse) {
    _$jscoverage['/editor/walker.js'].functionData[1]++;
    _$jscoverage['/editor/walker.js'].lineData[23]++;
    var self = this;
    _$jscoverage['/editor/walker.js'].lineData[25]++;
    if (visit1083_25_1(self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[26]++;
      return NULL;
    }
    _$jscoverage['/editor/walker.js'].lineData[28]++;
    var node, range = self.range, guard, userGuard = self.guard, type = self.type, getSourceNodeFn = (rtl ? '_4e_previousSourceNode' : '_4e_nextSourceNode');
    _$jscoverage['/editor/walker.js'].lineData[37]++;
    if (visit1084_37_1(!self._.start)) {
      _$jscoverage['/editor/walker.js'].lineData[38]++;
      self._.start = 1;
      _$jscoverage['/editor/walker.js'].lineData[42]++;
      range.trim();
      _$jscoverage['/editor/walker.js'].lineData[45]++;
      if (visit1085_45_1(range.collapsed)) {
        _$jscoverage['/editor/walker.js'].lineData[46]++;
        self.end();
        _$jscoverage['/editor/walker.js'].lineData[47]++;
        return NULL;
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[52]++;
    if (visit1086_52_1(!rtl && !self._.guardLTR)) {
      _$jscoverage['/editor/walker.js'].lineData[54]++;
      var limitLTR = range.endContainer[0], blockerLTR = limitLTR.childNodes[range.endOffset];
      _$jscoverage['/editor/walker.js'].lineData[57]++;
      this._.guardLTR = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[2]++;
  _$jscoverage['/editor/walker.js'].lineData[59]++;
  if (visit1087_59_1(movingOut && (visit1088_59_2(visit1089_59_3(limitLTR == node) || visit1090_59_4(Dom.nodeName(node) == "body"))))) {
    _$jscoverage['/editor/walker.js'].lineData[60]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[64]++;
  return visit1091_64_1(node != blockerLTR);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[70]++;
    if (visit1092_70_1(rtl && !self._.guardRTL)) {
      _$jscoverage['/editor/walker.js'].lineData[72]++;
      var limitRTL = range.startContainer[0], blockerRTL = visit1093_73_1(visit1094_73_2((visit1095_73_3(range.startOffset > 0)) && limitRTL.childNodes[range.startOffset - 1]) || null);
      _$jscoverage['/editor/walker.js'].lineData[76]++;
      self._.guardRTL = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[3]++;
  _$jscoverage['/editor/walker.js'].lineData[78]++;
  if (visit1096_78_1(movingOut && (visit1097_78_2(visit1098_78_3(limitRTL == node) || visit1099_78_4(Dom.nodeName(node) == "body"))))) {
    _$jscoverage['/editor/walker.js'].lineData[79]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[83]++;
  return visit1100_83_1(node != blockerRTL);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[88]++;
    var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;
    _$jscoverage['/editor/walker.js'].lineData[92]++;
    if (visit1101_92_1(userGuard)) {
      _$jscoverage['/editor/walker.js'].lineData[93]++;
      guard = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[4]++;
  _$jscoverage['/editor/walker.js'].lineData[94]++;
  if (visit1102_94_1(stopGuard(node, movingOut) === FALSE)) {
    _$jscoverage['/editor/walker.js'].lineData[95]++;
    return FALSE;
  }
  _$jscoverage['/editor/walker.js'].lineData[97]++;
  return userGuard(node, movingOut);
};
    } else {
      _$jscoverage['/editor/walker.js'].lineData[101]++;
      guard = stopGuard;
    }
    _$jscoverage['/editor/walker.js'].lineData[104]++;
    if (visit1103_104_1(self.current)) {
      _$jscoverage['/editor/walker.js'].lineData[105]++;
      node = this.current[getSourceNodeFn](FALSE, type, guard);
    } else {
      _$jscoverage['/editor/walker.js'].lineData[109]++;
      if (visit1104_109_1(rtl)) {
        _$jscoverage['/editor/walker.js'].lineData[110]++;
        node = range.endContainer;
        _$jscoverage['/editor/walker.js'].lineData[111]++;
        if (visit1105_111_1(range.endOffset > 0)) {
          _$jscoverage['/editor/walker.js'].lineData[112]++;
          node = new Node(node[0].childNodes[range.endOffset - 1]);
          _$jscoverage['/editor/walker.js'].lineData[113]++;
          if (visit1106_113_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[114]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[117]++;
          node = (visit1107_117_1(guard(node, TRUE) === FALSE)) ? NULL : node._4e_previousSourceNode(TRUE, type, guard, undefined);
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[122]++;
        node = range.startContainer;
        _$jscoverage['/editor/walker.js'].lineData[123]++;
        node = new Node(node[0].childNodes[range.startOffset]);
        _$jscoverage['/editor/walker.js'].lineData[125]++;
        if (visit1108_125_1(node.length)) {
          _$jscoverage['/editor/walker.js'].lineData[126]++;
          if (visit1109_126_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[127]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[130]++;
          node = (visit1110_130_1(guard(range.startContainer, TRUE) === FALSE)) ? NULL : range.startContainer._4e_nextSourceNode(TRUE, type, guard, undefined);
        }
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[136]++;
    while (visit1111_136_1(node && !self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[137]++;
      self.current = node;
      _$jscoverage['/editor/walker.js'].lineData[138]++;
      if (visit1112_138_1(!self.evaluator || visit1113_138_2(self.evaluator(node[0]) !== FALSE))) {
        _$jscoverage['/editor/walker.js'].lineData[139]++;
        if (visit1114_139_1(!breakOnFalseRetFalse)) {
          _$jscoverage['/editor/walker.js'].lineData[140]++;
          return node;
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[142]++;
        if (visit1115_142_1(breakOnFalseRetFalse && self.evaluator)) {
          _$jscoverage['/editor/walker.js'].lineData[143]++;
          return FALSE;
        }
      }
      _$jscoverage['/editor/walker.js'].lineData[145]++;
      node = node[getSourceNodeFn](FALSE, type, guard);
    }
    _$jscoverage['/editor/walker.js'].lineData[148]++;
    self.end();
    _$jscoverage['/editor/walker.js'].lineData[149]++;
    return self.current = NULL;
  }
  _$jscoverage['/editor/walker.js'].lineData[152]++;
  function iterateToLast(rtl) {
    _$jscoverage['/editor/walker.js'].functionData[5]++;
    _$jscoverage['/editor/walker.js'].lineData[153]++;
    var node, last = NULL;
    _$jscoverage['/editor/walker.js'].lineData[155]++;
    while (node = iterate.call(this, rtl)) {
      _$jscoverage['/editor/walker.js'].lineData[156]++;
      last = node;
    }
    _$jscoverage['/editor/walker.js'].lineData[158]++;
    return last;
  }
  _$jscoverage['/editor/walker.js'].lineData[166]++;
  function Walker(range) {
    _$jscoverage['/editor/walker.js'].functionData[6]++;
    _$jscoverage['/editor/walker.js'].lineData[167]++;
    this.range = range;
    _$jscoverage['/editor/walker.js'].lineData[177]++;
    this.evaluator = NULL;
    _$jscoverage['/editor/walker.js'].lineData[188]++;
    this.guard = NULL;
    _$jscoverage['/editor/walker.js'].lineData[192]++;
    this._ = {};
  }
  _$jscoverage['/editor/walker.js'].lineData[196]++;
  S.augment(Walker, {
  end: function() {
  _$jscoverage['/editor/walker.js'].functionData[7]++;
  _$jscoverage['/editor/walker.js'].lineData[202]++;
  this._.end = 1;
}, 
  next: function() {
  _$jscoverage['/editor/walker.js'].functionData[8]++;
  _$jscoverage['/editor/walker.js'].lineData[211]++;
  return iterate.call(this);
}, 
  previous: function() {
  _$jscoverage['/editor/walker.js'].functionData[9]++;
  _$jscoverage['/editor/walker.js'].lineData[220]++;
  return iterate.call(this, TRUE);
}, 
  checkForward: function() {
  _$jscoverage['/editor/walker.js'].functionData[10]++;
  _$jscoverage['/editor/walker.js'].lineData[229]++;
  return visit1116_229_1(iterate.call(this, FALSE, TRUE) !== FALSE);
}, 
  checkBackward: function() {
  _$jscoverage['/editor/walker.js'].functionData[11]++;
  _$jscoverage['/editor/walker.js'].lineData[240]++;
  return visit1117_240_1(iterate.call(this, TRUE, TRUE) !== FALSE);
}, 
  lastForward: function() {
  _$jscoverage['/editor/walker.js'].functionData[12]++;
  _$jscoverage['/editor/walker.js'].lineData[250]++;
  return iterateToLast.call(this);
}, 
  lastBackward: function() {
  _$jscoverage['/editor/walker.js'].functionData[13]++;
  _$jscoverage['/editor/walker.js'].lineData[260]++;
  return iterateToLast.call(this, TRUE);
}, 
  reset: function() {
  _$jscoverage['/editor/walker.js'].functionData[14]++;
  _$jscoverage['/editor/walker.js'].lineData[264]++;
  delete this.current;
  _$jscoverage['/editor/walker.js'].lineData[265]++;
  this._ = {};
}, 
  _iterator: iterate});
  _$jscoverage['/editor/walker.js'].lineData[274]++;
  S.mix(Walker, {
  blockBoundary: function(customNodeNames) {
  _$jscoverage['/editor/walker.js'].functionData[15]++;
  _$jscoverage['/editor/walker.js'].lineData[281]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[16]++;
  _$jscoverage['/editor/walker.js'].lineData[282]++;
  return !(visit1118_282_1(visit1119_282_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_isBlockBoundary(node, customNodeNames)));
};
}, 
  bookmark: function(contentOnly, isReject) {
  _$jscoverage['/editor/walker.js'].functionData[17]++;
  _$jscoverage['/editor/walker.js'].lineData[297]++;
  function isBookmarkNode(node) {
    _$jscoverage['/editor/walker.js'].functionData[18]++;
    _$jscoverage['/editor/walker.js'].lineData[298]++;
    return visit1120_298_1(visit1121_298_2(Dom.nodeName(node) == 'span') && Dom.attr(node, '_ke_bookmark'));
  }
  _$jscoverage['/editor/walker.js'].lineData[302]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[19]++;
  _$jscoverage['/editor/walker.js'].lineData[303]++;
  var isBookmark, parent;
  _$jscoverage['/editor/walker.js'].lineData[305]++;
  isBookmark = (visit1122_305_1(visit1123_305_2(node.nodeType == Dom.NodeType.TEXT_NODE) && visit1124_306_1((parent = node.parentNode) && isBookmarkNode(parent))));
  _$jscoverage['/editor/walker.js'].lineData[309]++;
  isBookmark = contentOnly ? isBookmark : visit1125_309_1(isBookmark || isBookmarkNode(node));
  _$jscoverage['/editor/walker.js'].lineData[312]++;
  return !!(isReject ^ isBookmark);
};
}, 
  whitespaces: function(isReject) {
  _$jscoverage['/editor/walker.js'].functionData[20]++;
  _$jscoverage['/editor/walker.js'].lineData[321]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[21]++;
  _$jscoverage['/editor/walker.js'].lineData[322]++;
  var isWhitespace = visit1126_322_1(visit1127_322_2(node.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue));
  _$jscoverage['/editor/walker.js'].lineData[324]++;
  return !!(isReject ^ isWhitespace);
};
}, 
  invisible: function(isReject) {
  _$jscoverage['/editor/walker.js'].functionData[22]++;
  _$jscoverage['/editor/walker.js'].lineData[332]++;
  var whitespace = Walker.whitespaces();
  _$jscoverage['/editor/walker.js'].lineData[333]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[23]++;
  _$jscoverage['/editor/walker.js'].lineData[339]++;
  var isInvisible = visit1128_339_1(whitespace(node) || visit1129_340_1(visit1130_340_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && !node.offsetHeight));
  _$jscoverage['/editor/walker.js'].lineData[341]++;
  return !!(isReject ^ isInvisible);
};
}});
  _$jscoverage['/editor/walker.js'].lineData[346]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/, isWhitespaces = Walker.whitespaces(), isBookmark = Walker.bookmark(), toSkip = function(node) {
  _$jscoverage['/editor/walker.js'].functionData[24]++;
  _$jscoverage['/editor/walker.js'].lineData[350]++;
  var name = Dom.nodeName(node);
  _$jscoverage['/editor/walker.js'].lineData[351]++;
  return visit1131_351_1(isBookmark(node) || visit1132_352_1(isWhitespaces(node) || visit1133_353_1(visit1134_353_2(node.nodeType == 1) && visit1135_354_1(name in dtd.$inline && !(name in dtd.$empty)))));
};
  _$jscoverage['/editor/walker.js'].lineData[359]++;
  function getBogus(tail) {
    _$jscoverage['/editor/walker.js'].functionData[25]++;
    _$jscoverage['/editor/walker.js'].lineData[361]++;
    do {
      _$jscoverage['/editor/walker.js'].lineData[362]++;
      tail = tail._4e_previousSourceNode();
    } while (visit1136_363_1(tail && toSkip(tail[0])));
    _$jscoverage['/editor/walker.js'].lineData[365]++;
    if (visit1137_365_1(tail && (!UA.ie ? visit1138_365_2(tail.nodeName() == "br") : visit1139_366_1(visit1140_366_2(tail[0].nodeType == 3) && tailNbspRegex.test(tail.text()))))) {
      _$jscoverage['/editor/walker.js'].lineData[367]++;
      return tail[0];
    }
    _$jscoverage['/editor/walker.js'].lineData[369]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[372]++;
  Editor.Utils.injectDom({
  _4e_getBogus: function(el) {
  _$jscoverage['/editor/walker.js'].functionData[26]++;
  _$jscoverage['/editor/walker.js'].lineData[374]++;
  return getBogus(new Node(el));
}});
  _$jscoverage['/editor/walker.js'].lineData[378]++;
  Editor.Walker = Walker;
  _$jscoverage['/editor/walker.js'].lineData[380]++;
  return Walker;
});
