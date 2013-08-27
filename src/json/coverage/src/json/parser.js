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
if (! _$jscoverage['/json/parser.js']) {
  _$jscoverage['/json/parser.js'] = {};
  _$jscoverage['/json/parser.js'].lineData = [];
  _$jscoverage['/json/parser.js'].lineData[3] = 0;
  _$jscoverage['/json/parser.js'].lineData[5] = 0;
  _$jscoverage['/json/parser.js'].lineData[14] = 0;
  _$jscoverage['/json/parser.js'].lineData[16] = 0;
  _$jscoverage['/json/parser.js'].lineData[32] = 0;
  _$jscoverage['/json/parser.js'].lineData[34] = 0;
  _$jscoverage['/json/parser.js'].lineData[41] = 0;
  _$jscoverage['/json/parser.js'].lineData[44] = 0;
  _$jscoverage['/json/parser.js'].lineData[47] = 0;
  _$jscoverage['/json/parser.js'].lineData[63] = 0;
  _$jscoverage['/json/parser.js'].lineData[65] = 0;
  _$jscoverage['/json/parser.js'].lineData[72] = 0;
  _$jscoverage['/json/parser.js'].lineData[76] = 0;
  _$jscoverage['/json/parser.js'].lineData[90] = 0;
  _$jscoverage['/json/parser.js'].lineData[93] = 0;
  _$jscoverage['/json/parser.js'].lineData[94] = 0;
  _$jscoverage['/json/parser.js'].lineData[95] = 0;
  _$jscoverage['/json/parser.js'].lineData[96] = 0;
  _$jscoverage['/json/parser.js'].lineData[97] = 0;
  _$jscoverage['/json/parser.js'].lineData[98] = 0;
  _$jscoverage['/json/parser.js'].lineData[100] = 0;
  _$jscoverage['/json/parser.js'].lineData[101] = 0;
  _$jscoverage['/json/parser.js'].lineData[104] = 0;
  _$jscoverage['/json/parser.js'].lineData[107] = 0;
  _$jscoverage['/json/parser.js'].lineData[110] = 0;
  _$jscoverage['/json/parser.js'].lineData[113] = 0;
  _$jscoverage['/json/parser.js'].lineData[116] = 0;
  _$jscoverage['/json/parser.js'].lineData[121] = 0;
  _$jscoverage['/json/parser.js'].lineData[122] = 0;
  _$jscoverage['/json/parser.js'].lineData[124] = 0;
  _$jscoverage['/json/parser.js'].lineData[125] = 0;
  _$jscoverage['/json/parser.js'].lineData[128] = 0;
  _$jscoverage['/json/parser.js'].lineData[130] = 0;
  _$jscoverage['/json/parser.js'].lineData[131] = 0;
  _$jscoverage['/json/parser.js'].lineData[133] = 0;
  _$jscoverage['/json/parser.js'].lineData[136] = 0;
  _$jscoverage['/json/parser.js'].lineData[140] = 0;
  _$jscoverage['/json/parser.js'].lineData[141] = 0;
  _$jscoverage['/json/parser.js'].lineData[142] = 0;
  _$jscoverage['/json/parser.js'].lineData[143] = 0;
  _$jscoverage['/json/parser.js'].lineData[146] = 0;
  _$jscoverage['/json/parser.js'].lineData[147] = 0;
  _$jscoverage['/json/parser.js'].lineData[149] = 0;
  _$jscoverage['/json/parser.js'].lineData[153] = 0;
  _$jscoverage['/json/parser.js'].lineData[155] = 0;
  _$jscoverage['/json/parser.js'].lineData[156] = 0;
  _$jscoverage['/json/parser.js'].lineData[158] = 0;
  _$jscoverage['/json/parser.js'].lineData[161] = 0;
  _$jscoverage['/json/parser.js'].lineData[170] = 0;
  _$jscoverage['/json/parser.js'].lineData[172] = 0;
  _$jscoverage['/json/parser.js'].lineData[173] = 0;
  _$jscoverage['/json/parser.js'].lineData[176] = 0;
  _$jscoverage['/json/parser.js'].lineData[177] = 0;
  _$jscoverage['/json/parser.js'].lineData[178] = 0;
  _$jscoverage['/json/parser.js'].lineData[181] = 0;
  _$jscoverage['/json/parser.js'].lineData[182] = 0;
  _$jscoverage['/json/parser.js'].lineData[183] = 0;
  _$jscoverage['/json/parser.js'].lineData[184] = 0;
  _$jscoverage['/json/parser.js'].lineData[186] = 0;
  _$jscoverage['/json/parser.js'].lineData[192] = 0;
  _$jscoverage['/json/parser.js'].lineData[194] = 0;
  _$jscoverage['/json/parser.js'].lineData[197] = 0;
  _$jscoverage['/json/parser.js'].lineData[199] = 0;
  _$jscoverage['/json/parser.js'].lineData[201] = 0;
  _$jscoverage['/json/parser.js'].lineData[202] = 0;
  _$jscoverage['/json/parser.js'].lineData[203] = 0;
  _$jscoverage['/json/parser.js'].lineData[204] = 0;
  _$jscoverage['/json/parser.js'].lineData[206] = 0;
  _$jscoverage['/json/parser.js'].lineData[208] = 0;
  _$jscoverage['/json/parser.js'].lineData[209] = 0;
  _$jscoverage['/json/parser.js'].lineData[211] = 0;
  _$jscoverage['/json/parser.js'].lineData[212] = 0;
  _$jscoverage['/json/parser.js'].lineData[215] = 0;
  _$jscoverage['/json/parser.js'].lineData[220] = 0;
  _$jscoverage['/json/parser.js'].lineData[221] = 0;
  _$jscoverage['/json/parser.js'].lineData[224] = 0;
  _$jscoverage['/json/parser.js'].lineData[229] = 0;
  _$jscoverage['/json/parser.js'].lineData[245] = 0;
  _$jscoverage['/json/parser.js'].lineData[246] = 0;
  _$jscoverage['/json/parser.js'].lineData[268] = 0;
  _$jscoverage['/json/parser.js'].lineData[271] = 0;
  _$jscoverage['/json/parser.js'].lineData[274] = 0;
  _$jscoverage['/json/parser.js'].lineData[277] = 0;
  _$jscoverage['/json/parser.js'].lineData[280] = 0;
  _$jscoverage['/json/parser.js'].lineData[283] = 0;
  _$jscoverage['/json/parser.js'].lineData[286] = 0;
  _$jscoverage['/json/parser.js'].lineData[289] = 0;
  _$jscoverage['/json/parser.js'].lineData[292] = 0;
  _$jscoverage['/json/parser.js'].lineData[295] = 0;
  _$jscoverage['/json/parser.js'].lineData[296] = 0;
  _$jscoverage['/json/parser.js'].lineData[299] = 0;
  _$jscoverage['/json/parser.js'].lineData[302] = 0;
  _$jscoverage['/json/parser.js'].lineData[305] = 0;
  _$jscoverage['/json/parser.js'].lineData[311] = 0;
  _$jscoverage['/json/parser.js'].lineData[312] = 0;
  _$jscoverage['/json/parser.js'].lineData[313] = 0;
  _$jscoverage['/json/parser.js'].lineData[316] = 0;
  _$jscoverage['/json/parser.js'].lineData[317] = 0;
  _$jscoverage['/json/parser.js'].lineData[320] = 0;
  _$jscoverage['/json/parser.js'].lineData[323] = 0;
  _$jscoverage['/json/parser.js'].lineData[326] = 0;
  _$jscoverage['/json/parser.js'].lineData[498] = 0;
  _$jscoverage['/json/parser.js'].lineData[500] = 0;
  _$jscoverage['/json/parser.js'].lineData[512] = 0;
  _$jscoverage['/json/parser.js'].lineData[514] = 0;
  _$jscoverage['/json/parser.js'].lineData[516] = 0;
  _$jscoverage['/json/parser.js'].lineData[518] = 0;
  _$jscoverage['/json/parser.js'].lineData[519] = 0;
  _$jscoverage['/json/parser.js'].lineData[522] = 0;
  _$jscoverage['/json/parser.js'].lineData[523] = 0;
  _$jscoverage['/json/parser.js'].lineData[524] = 0;
  _$jscoverage['/json/parser.js'].lineData[528] = 0;
  _$jscoverage['/json/parser.js'].lineData[530] = 0;
  _$jscoverage['/json/parser.js'].lineData[531] = 0;
  _$jscoverage['/json/parser.js'].lineData[533] = 0;
  _$jscoverage['/json/parser.js'].lineData[534] = 0;
  _$jscoverage['/json/parser.js'].lineData[535] = 0;
  _$jscoverage['/json/parser.js'].lineData[538] = 0;
  _$jscoverage['/json/parser.js'].lineData[539] = 0;
  _$jscoverage['/json/parser.js'].lineData[540] = 0;
  _$jscoverage['/json/parser.js'].lineData[543] = 0;
  _$jscoverage['/json/parser.js'].lineData[547] = 0;
  _$jscoverage['/json/parser.js'].lineData[549] = 0;
  _$jscoverage['/json/parser.js'].lineData[552] = 0;
  _$jscoverage['/json/parser.js'].lineData[555] = 0;
  _$jscoverage['/json/parser.js'].lineData[557] = 0;
  _$jscoverage['/json/parser.js'].lineData[561] = 0;
  _$jscoverage['/json/parser.js'].lineData[570] = 0;
  _$jscoverage['/json/parser.js'].lineData[572] = 0;
  _$jscoverage['/json/parser.js'].lineData[573] = 0;
  _$jscoverage['/json/parser.js'].lineData[576] = 0;
  _$jscoverage['/json/parser.js'].lineData[577] = 0;
  _$jscoverage['/json/parser.js'].lineData[580] = 0;
  _$jscoverage['/json/parser.js'].lineData[581] = 0;
  _$jscoverage['/json/parser.js'].lineData[583] = 0;
  _$jscoverage['/json/parser.js'].lineData[586] = 0;
  _$jscoverage['/json/parser.js'].lineData[587] = 0;
  _$jscoverage['/json/parser.js'].lineData[588] = 0;
  _$jscoverage['/json/parser.js'].lineData[591] = 0;
  _$jscoverage['/json/parser.js'].lineData[593] = 0;
  _$jscoverage['/json/parser.js'].lineData[595] = 0;
  _$jscoverage['/json/parser.js'].lineData[597] = 0;
  _$jscoverage['/json/parser.js'].lineData[599] = 0;
  _$jscoverage['/json/parser.js'].lineData[603] = 0;
  _$jscoverage['/json/parser.js'].lineData[608] = 0;
  _$jscoverage['/json/parser.js'].lineData[611] = 0;
}
if (! _$jscoverage['/json/parser.js'].functionData) {
  _$jscoverage['/json/parser.js'].functionData = [];
  _$jscoverage['/json/parser.js'].functionData[0] = 0;
  _$jscoverage['/json/parser.js'].functionData[1] = 0;
  _$jscoverage['/json/parser.js'].functionData[2] = 0;
  _$jscoverage['/json/parser.js'].functionData[3] = 0;
  _$jscoverage['/json/parser.js'].functionData[4] = 0;
  _$jscoverage['/json/parser.js'].functionData[5] = 0;
  _$jscoverage['/json/parser.js'].functionData[6] = 0;
  _$jscoverage['/json/parser.js'].functionData[7] = 0;
  _$jscoverage['/json/parser.js'].functionData[8] = 0;
  _$jscoverage['/json/parser.js'].functionData[9] = 0;
  _$jscoverage['/json/parser.js'].functionData[10] = 0;
  _$jscoverage['/json/parser.js'].functionData[11] = 0;
  _$jscoverage['/json/parser.js'].functionData[12] = 0;
  _$jscoverage['/json/parser.js'].functionData[13] = 0;
  _$jscoverage['/json/parser.js'].functionData[14] = 0;
  _$jscoverage['/json/parser.js'].functionData[15] = 0;
  _$jscoverage['/json/parser.js'].functionData[16] = 0;
  _$jscoverage['/json/parser.js'].functionData[17] = 0;
  _$jscoverage['/json/parser.js'].functionData[18] = 0;
  _$jscoverage['/json/parser.js'].functionData[19] = 0;
  _$jscoverage['/json/parser.js'].functionData[20] = 0;
  _$jscoverage['/json/parser.js'].functionData[21] = 0;
  _$jscoverage['/json/parser.js'].functionData[22] = 0;
  _$jscoverage['/json/parser.js'].functionData[23] = 0;
  _$jscoverage['/json/parser.js'].functionData[24] = 0;
  _$jscoverage['/json/parser.js'].functionData[25] = 0;
  _$jscoverage['/json/parser.js'].functionData[26] = 0;
  _$jscoverage['/json/parser.js'].functionData[27] = 0;
  _$jscoverage['/json/parser.js'].functionData[28] = 0;
  _$jscoverage['/json/parser.js'].functionData[29] = 0;
  _$jscoverage['/json/parser.js'].functionData[30] = 0;
  _$jscoverage['/json/parser.js'].functionData[31] = 0;
}
if (! _$jscoverage['/json/parser.js'].branchData) {
  _$jscoverage['/json/parser.js'].branchData = {};
  _$jscoverage['/json/parser.js'].branchData['95'] = [];
  _$jscoverage['/json/parser.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['96'] = [];
  _$jscoverage['/json/parser.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['97'] = [];
  _$jscoverage['/json/parser.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['100'] = [];
  _$jscoverage['/json/parser.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['122'] = [];
  _$jscoverage['/json/parser.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['124'] = [];
  _$jscoverage['/json/parser.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['130'] = [];
  _$jscoverage['/json/parser.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['133'] = [];
  _$jscoverage['/json/parser.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['140'] = [];
  _$jscoverage['/json/parser.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['146'] = [];
  _$jscoverage['/json/parser.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['155'] = [];
  _$jscoverage['/json/parser.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['158'] = [];
  _$jscoverage['/json/parser.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['172'] = [];
  _$jscoverage['/json/parser.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['176'] = [];
  _$jscoverage['/json/parser.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['178'] = [];
  _$jscoverage['/json/parser.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['179'] = [];
  _$jscoverage['/json/parser.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['180'] = [];
  _$jscoverage['/json/parser.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['181'] = [];
  _$jscoverage['/json/parser.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['183'] = [];
  _$jscoverage['/json/parser.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['202'] = [];
  _$jscoverage['/json/parser.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['203'] = [];
  _$jscoverage['/json/parser.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['211'] = [];
  _$jscoverage['/json/parser.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['286'] = [];
  _$jscoverage['/json/parser.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['518'] = [];
  _$jscoverage['/json/parser.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['522'] = [];
  _$jscoverage['/json/parser.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['528'] = [];
  _$jscoverage['/json/parser.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['530'] = [];
  _$jscoverage['/json/parser.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['533'] = [];
  _$jscoverage['/json/parser.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['562'] = [];
  _$jscoverage['/json/parser.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['563'] = [];
  _$jscoverage['/json/parser.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['564'] = [];
  _$jscoverage['/json/parser.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['572'] = [];
  _$jscoverage['/json/parser.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['576'] = [];
  _$jscoverage['/json/parser.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['580'] = [];
  _$jscoverage['/json/parser.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/json/parser.js'].branchData['586'] = [];
  _$jscoverage['/json/parser.js'].branchData['586'][1] = new BranchData();
}
_$jscoverage['/json/parser.js'].branchData['586'][1].init(996, 3, 'len');
function visit43_586_1(result) {
  _$jscoverage['/json/parser.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['580'][1].init(841, 17, 'ret !== undefined');
function visit42_580_1(result) {
  _$jscoverage['/json/parser.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['576'][1].init(729, 13, 'reducedAction');
function visit41_576_1(result) {
  _$jscoverage['/json/parser.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['572'][1].init(587, 7, 'i < len');
function visit40_572_1(result) {
  _$jscoverage['/json/parser.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['564'][1].init(248, 31, 'production.rhs || production[1]');
function visit39_564_1(result) {
  _$jscoverage['/json/parser.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['563'][1].init(178, 34, 'production.action || production[2]');
function visit38_563_1(result) {
  _$jscoverage['/json/parser.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['562'][1].init(105, 34, 'production.symbol || production[0]');
function visit37_562_1(result) {
  _$jscoverage['/json/parser.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['533'][1].init(86, 18, 'tableAction[state]');
function visit36_533_1(result) {
  _$jscoverage['/json/parser.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['530'][1].init(488, 7, '!action');
function visit35_530_1(result) {
  _$jscoverage['/json/parser.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['528'][1].init(419, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit34_528_1(result) {
  _$jscoverage['/json/parser.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['522'][1].init(206, 7, '!symbol');
function visit33_522_1(result) {
  _$jscoverage['/json/parser.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['518'][1].init(122, 7, '!symbol');
function visit32_518_1(result) {
  _$jscoverage['/json/parser.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['286'][1].init(21, 18, 'this.$1 === \'true\'');
function visit31_286_1(result) {
  _$jscoverage['/json/parser.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['211'][1].init(1243, 3, 'ret');
function visit30_211_1(result) {
  _$jscoverage['/json/parser.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['203'][1].init(956, 16, 'ret == undefined');
function visit29_203_1(result) {
  _$jscoverage['/json/parser.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['202'][1].init(902, 27, 'action && action.call(self)');
function visit28_202_1(result) {
  _$jscoverage['/json/parser.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['183'][1].init(76, 5, 'lines');
function visit27_183_1(result) {
  _$jscoverage['/json/parser.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['181'][1].init(229, 23, 'm = input.match(regexp)');
function visit26_181_1(result) {
  _$jscoverage['/json/parser.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['180'][2].init(133, 20, 'rule[2] || undefined');
function visit25_180_2(result) {
  _$jscoverage['/json/parser.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['180'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit24_180_1(result) {
  _$jscoverage['/json/parser.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['179'][1].init(65, 21, 'rule.token || rule[0]');
function visit23_179_1(result) {
  _$jscoverage['/json/parser.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['178'][1].init(65, 22, 'rule.regexp || rule[1]');
function visit22_178_1(result) {
  _$jscoverage['/json/parser.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['176'][1].init(403, 16, 'i < rules.length');
function visit21_176_1(result) {
  _$jscoverage['/json/parser.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['172'][1].init(289, 6, '!input');
function visit20_172_1(result) {
  _$jscoverage['/json/parser.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['158'][1].init(166, 47, 'stateMap[s] || (stateMap[s] = (++self.stateId))');
function visit19_158_1(result) {
  _$jscoverage['/json/parser.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['155'][1].init(91, 9, '!stateMap');
function visit18_155_1(result) {
  _$jscoverage['/json/parser.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['146'][1].init(418, 16, 'reverseSymbolMap');
function visit17_146_1(result) {
  _$jscoverage['/json/parser.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['140'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit16_140_1(result) {
  _$jscoverage['/json/parser.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['133'][1].init(169, 50, 'symbolMap[t] || (symbolMap[t] = (++self.symbolId))');
function visit15_133_1(result) {
  _$jscoverage['/json/parser.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['130'][1].init(93, 10, '!symbolMap');
function visit14_130_1(result) {
  _$jscoverage['/json/parser.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['124'][1].init(522, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit13_124_1(result) {
  _$jscoverage['/json/parser.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['122'][1].init(316, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit12_122_1(result) {
  _$jscoverage['/json/parser.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['100'][1].init(235, 30, 'S.inArray(currentState, state)');
function visit11_100_1(result) {
  _$jscoverage['/json/parser.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['97'][1].init(26, 36, 'currentState == Lexer.STATIC.INITIAL');
function visit10_97_1(result) {
  _$jscoverage['/json/parser.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['96'][1].init(68, 6, '!state');
function visit9_96_1(result) {
  _$jscoverage['/json/parser.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].branchData['95'][1].init(30, 15, 'r.state || r[3]');
function visit8_95_1(result) {
  _$jscoverage['/json/parser.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/json/parser.js'].lineData[3]++;
KISSY.add("json/parser", function() {
  _$jscoverage['/json/parser.js'].functionData[0]++;
  _$jscoverage['/json/parser.js'].lineData[5]++;
  var parser = {}, S = KISSY, GrammarConst = {
  'SHIFT_TYPE': 1, 
  'REDUCE_TYPE': 2, 
  'ACCEPT_TYPE': 0, 
  'TYPE_INDEX': 0, 
  'PRODUCTION_INDEX': 1, 
  'TO_INDEX': 2};
  _$jscoverage['/json/parser.js'].lineData[14]++;
  var Lexer = function(cfg) {
  _$jscoverage['/json/parser.js'].functionData[1]++;
  _$jscoverage['/json/parser.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/json/parser.js'].lineData[32]++;
  self.rules = [];
  _$jscoverage['/json/parser.js'].lineData[34]++;
  S.mix(self, cfg);
  _$jscoverage['/json/parser.js'].lineData[41]++;
  self.resetInput(self.input);
};
  _$jscoverage['/json/parser.js'].lineData[44]++;
  Lexer.prototype = {
  'constructor': function(cfg) {
  _$jscoverage['/json/parser.js'].functionData[2]++;
  _$jscoverage['/json/parser.js'].lineData[47]++;
  var self = this;
  _$jscoverage['/json/parser.js'].lineData[63]++;
  self.rules = [];
  _$jscoverage['/json/parser.js'].lineData[65]++;
  S.mix(self, cfg);
  _$jscoverage['/json/parser.js'].lineData[72]++;
  self.resetInput(self.input);
}, 
  'resetInput': function(input) {
  _$jscoverage['/json/parser.js'].functionData[3]++;
  _$jscoverage['/json/parser.js'].lineData[76]++;
  S.mix(this, {
  input: input, 
  matched: "", 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: "", 
  text: "", 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  'getCurrentRules': function() {
  _$jscoverage['/json/parser.js'].functionData[4]++;
  _$jscoverage['/json/parser.js'].lineData[90]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/json/parser.js'].lineData[93]++;
  currentState = self.mapState(currentState);
  _$jscoverage['/json/parser.js'].lineData[94]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/json/parser.js'].functionData[5]++;
  _$jscoverage['/json/parser.js'].lineData[95]++;
  var state = visit8_95_1(r.state || r[3]);
  _$jscoverage['/json/parser.js'].lineData[96]++;
  if (visit9_96_1(!state)) {
    _$jscoverage['/json/parser.js'].lineData[97]++;
    if (visit10_97_1(currentState == Lexer.STATIC.INITIAL)) {
      _$jscoverage['/json/parser.js'].lineData[98]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/json/parser.js'].lineData[100]++;
    if (visit11_100_1(S.inArray(currentState, state))) {
      _$jscoverage['/json/parser.js'].lineData[101]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/json/parser.js'].lineData[104]++;
  return rules;
}, 
  'pushState': function(state) {
  _$jscoverage['/json/parser.js'].functionData[6]++;
  _$jscoverage['/json/parser.js'].lineData[107]++;
  this.stateStack.push(state);
}, 
  'popState': function() {
  _$jscoverage['/json/parser.js'].functionData[7]++;
  _$jscoverage['/json/parser.js'].lineData[110]++;
  return this.stateStack.pop();
}, 
  'getStateStack': function() {
  _$jscoverage['/json/parser.js'].functionData[8]++;
  _$jscoverage['/json/parser.js'].lineData[113]++;
  return this.stateStack;
}, 
  'showDebugInfo': function() {
  _$jscoverage['/json/parser.js'].functionData[9]++;
  _$jscoverage['/json/parser.js'].lineData[116]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/json/parser.js'].lineData[121]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/json/parser.js'].lineData[122]++;
  var past = (visit12_122_1(matched.length > DEBUG_CONTEXT_LIMIT) ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "), next = match + input;
  _$jscoverage['/json/parser.js'].lineData[124]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit13_124_1(next.length > DEBUG_CONTEXT_LIMIT) ? "..." : "");
  _$jscoverage['/json/parser.js'].lineData[125]++;
  return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
}, 
  'mapSymbol': function(t) {
  _$jscoverage['/json/parser.js'].functionData[10]++;
  _$jscoverage['/json/parser.js'].lineData[128]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/json/parser.js'].lineData[130]++;
  if (visit14_130_1(!symbolMap)) {
    _$jscoverage['/json/parser.js'].lineData[131]++;
    return t;
  }
  _$jscoverage['/json/parser.js'].lineData[133]++;
  return visit15_133_1(symbolMap[t] || (symbolMap[t] = (++self.symbolId)));
}, 
  'mapReverseSymbol': function(rs) {
  _$jscoverage['/json/parser.js'].functionData[11]++;
  _$jscoverage['/json/parser.js'].lineData[136]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/json/parser.js'].lineData[140]++;
  if (visit16_140_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/json/parser.js'].lineData[141]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/json/parser.js'].lineData[142]++;
    for (i in symbolMap) {
      _$jscoverage['/json/parser.js'].lineData[143]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/json/parser.js'].lineData[146]++;
  if (visit17_146_1(reverseSymbolMap)) {
    _$jscoverage['/json/parser.js'].lineData[147]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/json/parser.js'].lineData[149]++;
    return rs;
  }
}, 
  'mapState': function(s) {
  _$jscoverage['/json/parser.js'].functionData[12]++;
  _$jscoverage['/json/parser.js'].lineData[153]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/json/parser.js'].lineData[155]++;
  if (visit18_155_1(!stateMap)) {
    _$jscoverage['/json/parser.js'].lineData[156]++;
    return s;
  }
  _$jscoverage['/json/parser.js'].lineData[158]++;
  return visit19_158_1(stateMap[s] || (stateMap[s] = (++self.stateId)));
}, 
  'lex': function() {
  _$jscoverage['/json/parser.js'].functionData[13]++;
  _$jscoverage['/json/parser.js'].lineData[161]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/json/parser.js'].lineData[170]++;
  self.match = self.text = "";
  _$jscoverage['/json/parser.js'].lineData[172]++;
  if (visit20_172_1(!input)) {
    _$jscoverage['/json/parser.js'].lineData[173]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/json/parser.js'].lineData[176]++;
  for (i = 0; visit21_176_1(i < rules.length); i++) {
    _$jscoverage['/json/parser.js'].lineData[177]++;
    rule = rules[i];
    _$jscoverage['/json/parser.js'].lineData[178]++;
    var regexp = visit22_178_1(rule.regexp || rule[1]), token = visit23_179_1(rule.token || rule[0]), action = visit24_180_1(rule.action || visit25_180_2(rule[2] || undefined));
    _$jscoverage['/json/parser.js'].lineData[181]++;
    if (visit26_181_1(m = input.match(regexp))) {
      _$jscoverage['/json/parser.js'].lineData[182]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/json/parser.js'].lineData[183]++;
      if (visit27_183_1(lines)) {
        _$jscoverage['/json/parser.js'].lineData[184]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/json/parser.js'].lineData[186]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/json/parser.js'].lineData[192]++;
      var match;
      _$jscoverage['/json/parser.js'].lineData[194]++;
      match = self.match = m[0];
      _$jscoverage['/json/parser.js'].lineData[197]++;
      self.matches = m;
      _$jscoverage['/json/parser.js'].lineData[199]++;
      self.text = match;
      _$jscoverage['/json/parser.js'].lineData[201]++;
      self.matched += match;
      _$jscoverage['/json/parser.js'].lineData[202]++;
      ret = visit28_202_1(action && action.call(self));
      _$jscoverage['/json/parser.js'].lineData[203]++;
      if (visit29_203_1(ret == undefined)) {
        _$jscoverage['/json/parser.js'].lineData[204]++;
        ret = token;
      } else {
        _$jscoverage['/json/parser.js'].lineData[206]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/json/parser.js'].lineData[208]++;
      input = input.slice(match.length);
      _$jscoverage['/json/parser.js'].lineData[209]++;
      self.input = input;
      _$jscoverage['/json/parser.js'].lineData[211]++;
      if (visit30_211_1(ret)) {
        _$jscoverage['/json/parser.js'].lineData[212]++;
        return ret;
      } else {
        _$jscoverage['/json/parser.js'].lineData[215]++;
        return self.lex();
      }
    }
  }
  _$jscoverage['/json/parser.js'].lineData[220]++;
  S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
  _$jscoverage['/json/parser.js'].lineData[221]++;
  return undefined;
}};
  _$jscoverage['/json/parser.js'].lineData[224]++;
  Lexer.STATIC = {
  'INITIAL': 'I', 
  'DEBUG_CONTEXT_LIMIT': 20, 
  'END_TAG': '$EOF'};
  _$jscoverage['/json/parser.js'].lineData[229]++;
  var lexer = new Lexer({
  'rules': [[2, /^"(\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\u[0-9a-zA-Z]{4}|[^\\"\x00-\x1f])*"/, 0], [0, /^[\t\r\n\x20]/, 0], [3, /^,/, 0], [4, /^:/, 0], [5, /^\[/, 0], [6, /^\]/, 0], [7, /^\{/, 0], [8, /^\}/, 0], [9, /^-?\d+(?:\.\d+)?(?:e-?\d+)?/i, 0], [10, /^true|false/, 0], [11, /^null/, 0], [12, /^./, 0]]});
  _$jscoverage['/json/parser.js'].lineData[245]++;
  parser.lexer = lexer;
  _$jscoverage['/json/parser.js'].lineData[246]++;
  lexer.symbolMap = {
  '$EOF': 1, 
  'STRING': 2, 
  'COMMA': 3, 
  'COLON': 4, 
  'LEFT_BRACKET': 5, 
  'RIGHT_BRACKET': 6, 
  'LEFT_BRACE': 7, 
  'RIGHT_BRACE': 8, 
  'NUMBER': 9, 
  'BOOLEAN': 10, 
  'NULL': 11, 
  'INVALID': 12, 
  '$START': 13, 
  'json': 14, 
  'value': 15, 
  'object': 16, 
  'array': 17, 
  'elementList': 18, 
  'member': 19, 
  'memberList': 20};
  _$jscoverage['/json/parser.js'].lineData[268]++;
  parser.productions = [[13, [14]], [14, [15], function() {
  _$jscoverage['/json/parser.js'].functionData[14]++;
  _$jscoverage['/json/parser.js'].lineData[271]++;
  return this.$1;
}], [15, [2], function() {
  _$jscoverage['/json/parser.js'].functionData[15]++;
  _$jscoverage['/json/parser.js'].lineData[274]++;
  return this.yy.unQuote(this.$1);
}], [15, [9], function() {
  _$jscoverage['/json/parser.js'].functionData[16]++;
  _$jscoverage['/json/parser.js'].lineData[277]++;
  return parseFloat(this.$1);
}], [15, [16], function() {
  _$jscoverage['/json/parser.js'].functionData[17]++;
  _$jscoverage['/json/parser.js'].lineData[280]++;
  return this.$1;
}], [15, [17], function() {
  _$jscoverage['/json/parser.js'].functionData[18]++;
  _$jscoverage['/json/parser.js'].lineData[283]++;
  return this.$1;
}], [15, [10], function() {
  _$jscoverage['/json/parser.js'].functionData[19]++;
  _$jscoverage['/json/parser.js'].lineData[286]++;
  return visit31_286_1(this.$1 === 'true');
}], [15, [11], function() {
  _$jscoverage['/json/parser.js'].functionData[20]++;
  _$jscoverage['/json/parser.js'].lineData[289]++;
  return null;
}], [18, [15], function() {
  _$jscoverage['/json/parser.js'].functionData[21]++;
  _$jscoverage['/json/parser.js'].lineData[292]++;
  return [this.$1];
}], [18, [18, 3, 15], function() {
  _$jscoverage['/json/parser.js'].functionData[22]++;
  _$jscoverage['/json/parser.js'].lineData[295]++;
  this.$1[this.$1.length] = this.$3;
  _$jscoverage['/json/parser.js'].lineData[296]++;
  return this.$1;
}], [17, [5, 6], function() {
  _$jscoverage['/json/parser.js'].functionData[23]++;
  _$jscoverage['/json/parser.js'].lineData[299]++;
  return [];
}], [17, [5, 18, 6], function() {
  _$jscoverage['/json/parser.js'].functionData[24]++;
  _$jscoverage['/json/parser.js'].lineData[302]++;
  return this.$2;
}], [19, [2, 4, 15], function() {
  _$jscoverage['/json/parser.js'].functionData[25]++;
  _$jscoverage['/json/parser.js'].lineData[305]++;
  return {
  key: this.yy.unQuote(this.$1), 
  value: this.$3};
}], [20, [19], function() {
  _$jscoverage['/json/parser.js'].functionData[26]++;
  _$jscoverage['/json/parser.js'].lineData[311]++;
  var ret = {};
  _$jscoverage['/json/parser.js'].lineData[312]++;
  ret[this.$1.key] = this.$1.value;
  _$jscoverage['/json/parser.js'].lineData[313]++;
  return ret;
}], [20, [20, 3, 19], function() {
  _$jscoverage['/json/parser.js'].functionData[27]++;
  _$jscoverage['/json/parser.js'].lineData[316]++;
  this.$1[this.$3.key] = this.$3.value;
  _$jscoverage['/json/parser.js'].lineData[317]++;
  return this.$1;
}], [16, [7, 8], function() {
  _$jscoverage['/json/parser.js'].functionData[28]++;
  _$jscoverage['/json/parser.js'].lineData[320]++;
  return {};
}], [16, [7, 20, 8], function() {
  _$jscoverage['/json/parser.js'].functionData[29]++;
  _$jscoverage['/json/parser.js'].lineData[323]++;
  return this.$2;
}]];
  _$jscoverage['/json/parser.js'].lineData[326]++;
  parser.table = {
  'gotos': {
  '0': {
  '14': 7, 
  '15': 8, 
  '16': 9, 
  '17': 10}, 
  '2': {
  '15': 12, 
  '16': 9, 
  '17': 10, 
  '18': 13}, 
  '3': {
  '19': 16, 
  '20': 17}, 
  '18': {
  '15': 23, 
  '16': 9, 
  '17': 10}, 
  '20': {
  '15': 24, 
  '16': 9, 
  '17': 10}, 
  '21': {
  '19': 25}}, 
  'action': {
  '0': {
  '2': [1, 0, 1], 
  '5': [1, 0, 2], 
  '7': [1, 0, 3], 
  '9': [1, 0, 4], 
  '10': [1, 0, 5], 
  '11': [1, 0, 6]}, 
  '1': {
  '1': [2, 2, 0], 
  '3': [2, 2, 0], 
  '6': [2, 2, 0], 
  '8': [2, 2, 0]}, 
  '2': {
  '2': [1, 0, 1], 
  '5': [1, 0, 2], 
  '6': [1, 0, 11], 
  '7': [1, 0, 3], 
  '9': [1, 0, 4], 
  '10': [1, 0, 5], 
  '11': [1, 0, 6]}, 
  '3': {
  '2': [1, 0, 14], 
  '8': [1, 0, 15]}, 
  '4': {
  '1': [2, 3, 0], 
  '3': [2, 3, 0], 
  '6': [2, 3, 0], 
  '8': [2, 3, 0]}, 
  '5': {
  '1': [2, 6, 0], 
  '3': [2, 6, 0], 
  '6': [2, 6, 0], 
  '8': [2, 6, 0]}, 
  '6': {
  '1': [2, 7, 0], 
  '3': [2, 7, 0], 
  '6': [2, 7, 0], 
  '8': [2, 7, 0]}, 
  '7': {
  '1': [0, 0, 0]}, 
  '8': {
  '1': [2, 1, 0]}, 
  '9': {
  '1': [2, 4, 0], 
  '3': [2, 4, 0], 
  '6': [2, 4, 0], 
  '8': [2, 4, 0]}, 
  '10': {
  '1': [2, 5, 0], 
  '3': [2, 5, 0], 
  '6': [2, 5, 0], 
  '8': [2, 5, 0]}, 
  '11': {
  '1': [2, 10, 0], 
  '3': [2, 10, 0], 
  '6': [2, 10, 0], 
  '8': [2, 10, 0]}, 
  '12': {
  '3': [2, 8, 0], 
  '6': [2, 8, 0]}, 
  '13': {
  '3': [1, 0, 18], 
  '6': [1, 0, 19]}, 
  '14': {
  '4': [1, 0, 20]}, 
  '15': {
  '1': [2, 15, 0], 
  '3': [2, 15, 0], 
  '6': [2, 15, 0], 
  '8': [2, 15, 0]}, 
  '16': {
  '3': [2, 13, 0], 
  '8': [2, 13, 0]}, 
  '17': {
  '3': [1, 0, 21], 
  '8': [1, 0, 22]}, 
  '18': {
  '2': [1, 0, 1], 
  '5': [1, 0, 2], 
  '7': [1, 0, 3], 
  '9': [1, 0, 4], 
  '10': [1, 0, 5], 
  '11': [1, 0, 6]}, 
  '19': {
  '1': [2, 11, 0], 
  '3': [2, 11, 0], 
  '6': [2, 11, 0], 
  '8': [2, 11, 0]}, 
  '20': {
  '2': [1, 0, 1], 
  '5': [1, 0, 2], 
  '7': [1, 0, 3], 
  '9': [1, 0, 4], 
  '10': [1, 0, 5], 
  '11': [1, 0, 6]}, 
  '21': {
  '2': [1, 0, 14]}, 
  '22': {
  '1': [2, 16, 0], 
  '3': [2, 16, 0], 
  '6': [2, 16, 0], 
  '8': [2, 16, 0]}, 
  '23': {
  '3': [2, 9, 0], 
  '6': [2, 9, 0]}, 
  '24': {
  '3': [2, 12, 0], 
  '8': [2, 12, 0]}, 
  '25': {
  '3': [2, 14, 0], 
  '8': [2, 14, 0]}}};
  _$jscoverage['/json/parser.js'].lineData[498]++;
  parser.parse = function parse(input) {
  _$jscoverage['/json/parser.js'].functionData[30]++;
  _$jscoverage['/json/parser.js'].lineData[500]++;
  var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], stack = [0];
  _$jscoverage['/json/parser.js'].lineData[512]++;
  lexer.resetInput(input);
  _$jscoverage['/json/parser.js'].lineData[514]++;
  while (1) {
    _$jscoverage['/json/parser.js'].lineData[516]++;
    state = stack[stack.length - 1];
    _$jscoverage['/json/parser.js'].lineData[518]++;
    if (visit32_518_1(!symbol)) {
      _$jscoverage['/json/parser.js'].lineData[519]++;
      symbol = lexer.lex();
    }
    _$jscoverage['/json/parser.js'].lineData[522]++;
    if (visit33_522_1(!symbol)) {
      _$jscoverage['/json/parser.js'].lineData[523]++;
      S.log("it is not a valid input: " + input, "error");
      _$jscoverage['/json/parser.js'].lineData[524]++;
      return false;
    }
    _$jscoverage['/json/parser.js'].lineData[528]++;
    action = visit34_528_1(tableAction[state] && tableAction[state][symbol]);
    _$jscoverage['/json/parser.js'].lineData[530]++;
    if (visit35_530_1(!action)) {
      _$jscoverage['/json/parser.js'].lineData[531]++;
      var expected = [], error;
      _$jscoverage['/json/parser.js'].lineData[533]++;
      if (visit36_533_1(tableAction[state])) {
        _$jscoverage['/json/parser.js'].lineData[534]++;
        S.each(tableAction[state], function(_, symbol) {
  _$jscoverage['/json/parser.js'].functionData[31]++;
  _$jscoverage['/json/parser.js'].lineData[535]++;
  expected.push(self.lexer.mapReverseSymbol(symbol));
});
      }
      _$jscoverage['/json/parser.js'].lineData[538]++;
      error = "Syntax error at line " + lexer.lineNumber + ":\n" + lexer.showDebugInfo() + "\n" + "expect " + expected.join(", ");
      _$jscoverage['/json/parser.js'].lineData[539]++;
      S.error(error);
      _$jscoverage['/json/parser.js'].lineData[540]++;
      return false;
    }
    _$jscoverage['/json/parser.js'].lineData[543]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/json/parser.js'].lineData[547]++;
        stack.push(symbol);
        _$jscoverage['/json/parser.js'].lineData[549]++;
        valueStack.push(lexer.text);
        _$jscoverage['/json/parser.js'].lineData[552]++;
        stack.push(action[GrammarConst.TO_INDEX]);
        _$jscoverage['/json/parser.js'].lineData[555]++;
        symbol = null;
        _$jscoverage['/json/parser.js'].lineData[557]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/json/parser.js'].lineData[561]++;
        var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit37_562_1(production.symbol || production[0]), reducedAction = visit38_563_1(production.action || production[2]), reducedRhs = visit39_564_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret = undefined, $$ = valueStack[valueStack.length - len];
        _$jscoverage['/json/parser.js'].lineData[570]++;
        self.$$ = $$;
        _$jscoverage['/json/parser.js'].lineData[572]++;
        for (; visit40_572_1(i < len); i++) {
          _$jscoverage['/json/parser.js'].lineData[573]++;
          self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
        }
        _$jscoverage['/json/parser.js'].lineData[576]++;
        if (visit41_576_1(reducedAction)) {
          _$jscoverage['/json/parser.js'].lineData[577]++;
          ret = reducedAction.call(self);
        }
        _$jscoverage['/json/parser.js'].lineData[580]++;
        if (visit42_580_1(ret !== undefined)) {
          _$jscoverage['/json/parser.js'].lineData[581]++;
          $$ = ret;
        } else {
          _$jscoverage['/json/parser.js'].lineData[583]++;
          $$ = self.$$;
        }
        _$jscoverage['/json/parser.js'].lineData[586]++;
        if (visit43_586_1(len)) {
          _$jscoverage['/json/parser.js'].lineData[587]++;
          stack = stack.slice(0, -1 * len * 2);
          _$jscoverage['/json/parser.js'].lineData[588]++;
          valueStack = valueStack.slice(0, -1 * len);
        }
        _$jscoverage['/json/parser.js'].lineData[591]++;
        stack.push(reducedSymbol);
        _$jscoverage['/json/parser.js'].lineData[593]++;
        valueStack.push($$);
        _$jscoverage['/json/parser.js'].lineData[595]++;
        var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
        _$jscoverage['/json/parser.js'].lineData[597]++;
        stack.push(newState);
        _$jscoverage['/json/parser.js'].lineData[599]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/json/parser.js'].lineData[603]++;
        return $$;
    }
  }
  _$jscoverage['/json/parser.js'].lineData[608]++;
  return undefined;
};
  _$jscoverage['/json/parser.js'].lineData[611]++;
  return parser;
  ;
});
