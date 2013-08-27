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
  _$jscoverage['/editor/walker.js'].lineData[10] = 0;
  _$jscoverage['/editor/walker.js'].lineData[11] = 0;
  _$jscoverage['/editor/walker.js'].lineData[20] = 0;
  _$jscoverage['/editor/walker.js'].lineData[21] = 0;
  _$jscoverage['/editor/walker.js'].lineData[23] = 0;
  _$jscoverage['/editor/walker.js'].lineData[24] = 0;
  _$jscoverage['/editor/walker.js'].lineData[26] = 0;
  _$jscoverage['/editor/walker.js'].lineData[35] = 0;
  _$jscoverage['/editor/walker.js'].lineData[36] = 0;
  _$jscoverage['/editor/walker.js'].lineData[40] = 0;
  _$jscoverage['/editor/walker.js'].lineData[43] = 0;
  _$jscoverage['/editor/walker.js'].lineData[44] = 0;
  _$jscoverage['/editor/walker.js'].lineData[45] = 0;
  _$jscoverage['/editor/walker.js'].lineData[50] = 0;
  _$jscoverage['/editor/walker.js'].lineData[52] = 0;
  _$jscoverage['/editor/walker.js'].lineData[55] = 0;
  _$jscoverage['/editor/walker.js'].lineData[57] = 0;
  _$jscoverage['/editor/walker.js'].lineData[58] = 0;
  _$jscoverage['/editor/walker.js'].lineData[62] = 0;
  _$jscoverage['/editor/walker.js'].lineData[68] = 0;
  _$jscoverage['/editor/walker.js'].lineData[70] = 0;
  _$jscoverage['/editor/walker.js'].lineData[74] = 0;
  _$jscoverage['/editor/walker.js'].lineData[76] = 0;
  _$jscoverage['/editor/walker.js'].lineData[77] = 0;
  _$jscoverage['/editor/walker.js'].lineData[81] = 0;
  _$jscoverage['/editor/walker.js'].lineData[86] = 0;
  _$jscoverage['/editor/walker.js'].lineData[90] = 0;
  _$jscoverage['/editor/walker.js'].lineData[91] = 0;
  _$jscoverage['/editor/walker.js'].lineData[92] = 0;
  _$jscoverage['/editor/walker.js'].lineData[93] = 0;
  _$jscoverage['/editor/walker.js'].lineData[95] = 0;
  _$jscoverage['/editor/walker.js'].lineData[99] = 0;
  _$jscoverage['/editor/walker.js'].lineData[102] = 0;
  _$jscoverage['/editor/walker.js'].lineData[103] = 0;
  _$jscoverage['/editor/walker.js'].lineData[107] = 0;
  _$jscoverage['/editor/walker.js'].lineData[108] = 0;
  _$jscoverage['/editor/walker.js'].lineData[109] = 0;
  _$jscoverage['/editor/walker.js'].lineData[110] = 0;
  _$jscoverage['/editor/walker.js'].lineData[111] = 0;
  _$jscoverage['/editor/walker.js'].lineData[112] = 0;
  _$jscoverage['/editor/walker.js'].lineData[115] = 0;
  _$jscoverage['/editor/walker.js'].lineData[120] = 0;
  _$jscoverage['/editor/walker.js'].lineData[121] = 0;
  _$jscoverage['/editor/walker.js'].lineData[123] = 0;
  _$jscoverage['/editor/walker.js'].lineData[124] = 0;
  _$jscoverage['/editor/walker.js'].lineData[125] = 0;
  _$jscoverage['/editor/walker.js'].lineData[128] = 0;
  _$jscoverage['/editor/walker.js'].lineData[134] = 0;
  _$jscoverage['/editor/walker.js'].lineData[135] = 0;
  _$jscoverage['/editor/walker.js'].lineData[136] = 0;
  _$jscoverage['/editor/walker.js'].lineData[137] = 0;
  _$jscoverage['/editor/walker.js'].lineData[138] = 0;
  _$jscoverage['/editor/walker.js'].lineData[140] = 0;
  _$jscoverage['/editor/walker.js'].lineData[141] = 0;
  _$jscoverage['/editor/walker.js'].lineData[143] = 0;
  _$jscoverage['/editor/walker.js'].lineData[146] = 0;
  _$jscoverage['/editor/walker.js'].lineData[147] = 0;
  _$jscoverage['/editor/walker.js'].lineData[150] = 0;
  _$jscoverage['/editor/walker.js'].lineData[151] = 0;
  _$jscoverage['/editor/walker.js'].lineData[153] = 0;
  _$jscoverage['/editor/walker.js'].lineData[154] = 0;
  _$jscoverage['/editor/walker.js'].lineData[156] = 0;
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
  _$jscoverage['/editor/walker.js'].branchData['23'] = [];
  _$jscoverage['/editor/walker.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['35'] = [];
  _$jscoverage['/editor/walker.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['43'] = [];
  _$jscoverage['/editor/walker.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['50'] = [];
  _$jscoverage['/editor/walker.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['57'] = [];
  _$jscoverage['/editor/walker.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['57'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['57'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['62'] = [];
  _$jscoverage['/editor/walker.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['68'] = [];
  _$jscoverage['/editor/walker.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['71'] = [];
  _$jscoverage['/editor/walker.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['71'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['76'] = [];
  _$jscoverage['/editor/walker.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['76'][3] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['76'][4] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['81'] = [];
  _$jscoverage['/editor/walker.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['90'] = [];
  _$jscoverage['/editor/walker.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['92'] = [];
  _$jscoverage['/editor/walker.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['102'] = [];
  _$jscoverage['/editor/walker.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['107'] = [];
  _$jscoverage['/editor/walker.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['109'] = [];
  _$jscoverage['/editor/walker.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['111'] = [];
  _$jscoverage['/editor/walker.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['115'] = [];
  _$jscoverage['/editor/walker.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['123'] = [];
  _$jscoverage['/editor/walker.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['124'] = [];
  _$jscoverage['/editor/walker.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['128'] = [];
  _$jscoverage['/editor/walker.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['134'] = [];
  _$jscoverage['/editor/walker.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['136'] = [];
  _$jscoverage['/editor/walker.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['137'] = [];
  _$jscoverage['/editor/walker.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/walker.js'].branchData['140'] = [];
  _$jscoverage['/editor/walker.js'].branchData['140'][1] = new BranchData();
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
_$jscoverage['/editor/walker.js'].branchData['366'][2].init(48, 21, 'tail[0].nodeType == 3');
function visit1136_366_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['366'][1].init(47, 56, 'tail[0].nodeType == 3 && tailNbspRegex.test(tail.text())');
function visit1135_366_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['365'][2].init(219, 23, 'tail.nodeName() == "br"');
function visit1134_365_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['365'][1].init(200, 116, 'tail && (!UA.ie ? tail.nodeName() == "br" : tail[0].nodeType == 3 && tailNbspRegex.test(tail.text()))');
function visit1133_365_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['363'][1].init(73, 23, 'tail && toSkip(tail[0])');
function visit1132_363_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['354'][1].init(42, 67, 'name in dtd.$inline && !(name in dtd.$empty)');
function visit1131_354_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['353'][2].init(145, 18, 'node.nodeType == 1');
function visit1130_353_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['353'][1].init(39, 110, 'node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1129_353_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['352'][1].init(36, 150, 'isWhitespaces(node) || node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1128_352_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['351'][1].init(65, 187, 'isBookmark(node) || isWhitespaces(node) || node.nodeType == 1 && name in dtd.$inline && !(name in dtd.$empty)');
function visit1127_351_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['340'][2].init(64, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1126_340_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['340'][1].init(44, 64, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1125_340_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['339'][1].init(403, 109, 'whitespace(node) || node.nodeType == Dom.NodeType.ELEMENT_NODE && !node.offsetHeight');
function visit1124_339_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['322'][2].init(41, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit1123_322_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['322'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['322'][1].init(41, 91, 'node.nodeType == Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue)');
function visit1122_322_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['309'][1].init(389, 34, 'isBookmark || isBookmarkNode(node)');
function visit1121_309_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['306'][1].init(69, 77, '(parent = node.parentNode) && isBookmarkNode(parent)');
function visit1120_306_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['305'][2].init(135, 39, 'node.nodeType == Dom.NodeType.TEXT_NODE');
function visit1119_305_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['305'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['305'][1].init(135, 147, 'node.nodeType == Dom.NodeType.TEXT_NODE && (parent = node.parentNode) && isBookmarkNode(parent)');
function visit1118_305_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['298'][2].init(30, 28, 'Dom.nodeName(node) == \'span\'');
function visit1117_298_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['298'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['298'][1].init(30, 87, 'Dom.nodeName(node) == \'span\' && Dom.attr(node, \'_ke_bookmark\')');
function visit1116_298_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['282'][2].init(31, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1115_282_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['282'][1].init(31, 117, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_isBlockBoundary(node, customNodeNames)');
function visit1114_282_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['240'][1].init(86, 40, 'iterate.call(this, TRUE, TRUE) !== FALSE');
function visit1113_240_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['229'][1].init(25, 41, 'iterate.call(this, FALSE, TRUE) !== FALSE');
function visit1112_229_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['140'][1].init(232, 38, 'breakOnFalseRetFalse && self.evaluator');
function visit1111_140_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['137'][1].init(22, 21, '!breakOnFalseRetFalse');
function visit1110_137_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['136'][2].init(71, 33, 'self.evaluator(node[0]) !== FALSE');
function visit1109_136_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['136'][1].init(52, 52, '!self.evaluator || self.evaluator(node[0]) !== FALSE');
function visit1108_136_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['134'][1].init(4166, 19, 'node && !self._.end');
function visit1107_134_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['128'][1].init(31, 43, 'guard(range.startContainer, TRUE) === FALSE');
function visit1106_128_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['124'][1].init(26, 24, 'guard(node[0]) === FALSE');
function visit1105_124_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['123'][1].init(143, 11, 'node.length');
function visit1104_123_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['115'][1].init(31, 27, 'guard(node, TRUE) === FALSE');
function visit1103_115_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['111'][1].init(105, 24, 'guard(node[0]) === FALSE');
function visit1102_111_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['109'][1].init(66, 19, 'range.endOffset > 0');
function visit1101_109_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['107'][1].init(71, 3, 'rtl');
function visit1100_107_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['102'][1].init(2927, 12, 'self.current');
function visit1099_102_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['92'][1].init(22, 36, 'stopGuard(node, movingOut) === FALSE');
function visit1098_92_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['90'][1].init(2596, 9, 'userGuard');
function visit1097_90_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['81'][1].init(293, 18, 'node != blockerRTL');
function visit1096_81_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['76'][4].init(103, 28, 'Dom.nodeName(node) == "body"');
function visit1095_76_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['76'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['76'][3].init(83, 16, 'limitRTL == node');
function visit1094_76_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['76'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['76'][2].init(83, 48, 'limitRTL == node || Dom.nodeName(node) == "body"');
function visit1093_76_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['76'][1].init(69, 63, 'movingOut && (limitRTL == node || Dom.nodeName(node) == "body")');
function visit1092_76_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['71'][3].init(71, 21, 'range.startOffset > 0');
function visit1091_71_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['71'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['71'][2].init(71, 90, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1]');
function visit1090_71_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['71'][1].init(71, 98, '(range.startOffset > 0) && limitRTL.childNodes[range.startOffset - 1] || null');
function visit1089_71_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['68'][1].init(1654, 23, 'rtl && !self._.guardRTL');
function visit1088_68_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['62'][1].init(293, 18, 'node != blockerLTR');
function visit1087_62_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['57'][4].init(103, 28, 'Dom.nodeName(node) == "body"');
function visit1086_57_4(result) {
  _$jscoverage['/editor/walker.js'].branchData['57'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['57'][3].init(83, 16, 'limitLTR == node');
function visit1085_57_3(result) {
  _$jscoverage['/editor/walker.js'].branchData['57'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['57'][2].init(83, 48, 'limitLTR == node || Dom.nodeName(node) == "body"');
function visit1084_57_2(result) {
  _$jscoverage['/editor/walker.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['57'][1].init(69, 63, 'movingOut && (limitLTR == node || Dom.nodeName(node) == "body")');
function visit1083_57_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['50'][1].init(915, 24, '!rtl && !self._.guardLTR');
function visit1082_50_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['43'][1].init(267, 15, 'range.collapsed');
function visit1081_43_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['35'][1].init(456, 13, '!self._.start');
function visit1080_35_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].branchData['23'][1].init(92, 10, 'self._.end');
function visit1079_23_1(result) {
  _$jscoverage['/editor/walker.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/walker.js'].lineData[10]++;
KISSY.add("editor/walker", function(S, Editor) {
  _$jscoverage['/editor/walker.js'].functionData[0]++;
  _$jscoverage['/editor/walker.js'].lineData[11]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, dtd = Editor.XHTML_DTD, Node = S.Node;
  _$jscoverage['/editor/walker.js'].lineData[20]++;
  function iterate(rtl, breakOnFalseRetFalse) {
    _$jscoverage['/editor/walker.js'].functionData[1]++;
    _$jscoverage['/editor/walker.js'].lineData[21]++;
    var self = this;
    _$jscoverage['/editor/walker.js'].lineData[23]++;
    if (visit1079_23_1(self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[24]++;
      return NULL;
    }
    _$jscoverage['/editor/walker.js'].lineData[26]++;
    var node, range = self.range, guard, userGuard = self.guard, type = self.type, getSourceNodeFn = (rtl ? '_4e_previousSourceNode' : '_4e_nextSourceNode');
    _$jscoverage['/editor/walker.js'].lineData[35]++;
    if (visit1080_35_1(!self._.start)) {
      _$jscoverage['/editor/walker.js'].lineData[36]++;
      self._.start = 1;
      _$jscoverage['/editor/walker.js'].lineData[40]++;
      range.trim();
      _$jscoverage['/editor/walker.js'].lineData[43]++;
      if (visit1081_43_1(range.collapsed)) {
        _$jscoverage['/editor/walker.js'].lineData[44]++;
        self.end();
        _$jscoverage['/editor/walker.js'].lineData[45]++;
        return NULL;
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[50]++;
    if (visit1082_50_1(!rtl && !self._.guardLTR)) {
      _$jscoverage['/editor/walker.js'].lineData[52]++;
      var limitLTR = range.endContainer[0], blockerLTR = limitLTR.childNodes[range.endOffset];
      _$jscoverage['/editor/walker.js'].lineData[55]++;
      this._.guardLTR = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[2]++;
  _$jscoverage['/editor/walker.js'].lineData[57]++;
  if (visit1083_57_1(movingOut && (visit1084_57_2(visit1085_57_3(limitLTR == node) || visit1086_57_4(Dom.nodeName(node) == "body"))))) {
    _$jscoverage['/editor/walker.js'].lineData[58]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[62]++;
  return visit1087_62_1(node != blockerLTR);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[68]++;
    if (visit1088_68_1(rtl && !self._.guardRTL)) {
      _$jscoverage['/editor/walker.js'].lineData[70]++;
      var limitRTL = range.startContainer[0], blockerRTL = visit1089_71_1(visit1090_71_2((visit1091_71_3(range.startOffset > 0)) && limitRTL.childNodes[range.startOffset - 1]) || null);
      _$jscoverage['/editor/walker.js'].lineData[74]++;
      self._.guardRTL = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[3]++;
  _$jscoverage['/editor/walker.js'].lineData[76]++;
  if (visit1092_76_1(movingOut && (visit1093_76_2(visit1094_76_3(limitRTL == node) || visit1095_76_4(Dom.nodeName(node) == "body"))))) {
    _$jscoverage['/editor/walker.js'].lineData[77]++;
    return false;
  }
  _$jscoverage['/editor/walker.js'].lineData[81]++;
  return visit1096_81_1(node != blockerRTL);
};
    }
    _$jscoverage['/editor/walker.js'].lineData[86]++;
    var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;
    _$jscoverage['/editor/walker.js'].lineData[90]++;
    if (visit1097_90_1(userGuard)) {
      _$jscoverage['/editor/walker.js'].lineData[91]++;
      guard = function(node, movingOut) {
  _$jscoverage['/editor/walker.js'].functionData[4]++;
  _$jscoverage['/editor/walker.js'].lineData[92]++;
  if (visit1098_92_1(stopGuard(node, movingOut) === FALSE)) {
    _$jscoverage['/editor/walker.js'].lineData[93]++;
    return FALSE;
  }
  _$jscoverage['/editor/walker.js'].lineData[95]++;
  return userGuard(node, movingOut);
};
    } else {
      _$jscoverage['/editor/walker.js'].lineData[99]++;
      guard = stopGuard;
    }
    _$jscoverage['/editor/walker.js'].lineData[102]++;
    if (visit1099_102_1(self.current)) {
      _$jscoverage['/editor/walker.js'].lineData[103]++;
      node = this.current[getSourceNodeFn](FALSE, type, guard);
    } else {
      _$jscoverage['/editor/walker.js'].lineData[107]++;
      if (visit1100_107_1(rtl)) {
        _$jscoverage['/editor/walker.js'].lineData[108]++;
        node = range.endContainer;
        _$jscoverage['/editor/walker.js'].lineData[109]++;
        if (visit1101_109_1(range.endOffset > 0)) {
          _$jscoverage['/editor/walker.js'].lineData[110]++;
          node = new Node(node[0].childNodes[range.endOffset - 1]);
          _$jscoverage['/editor/walker.js'].lineData[111]++;
          if (visit1102_111_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[112]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[115]++;
          node = (visit1103_115_1(guard(node, TRUE) === FALSE)) ? NULL : node._4e_previousSourceNode(TRUE, type, guard, undefined);
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[120]++;
        node = range.startContainer;
        _$jscoverage['/editor/walker.js'].lineData[121]++;
        node = new Node(node[0].childNodes[range.startOffset]);
        _$jscoverage['/editor/walker.js'].lineData[123]++;
        if (visit1104_123_1(node.length)) {
          _$jscoverage['/editor/walker.js'].lineData[124]++;
          if (visit1105_124_1(guard(node[0]) === FALSE)) {
            _$jscoverage['/editor/walker.js'].lineData[125]++;
            node = NULL;
          }
        } else {
          _$jscoverage['/editor/walker.js'].lineData[128]++;
          node = (visit1106_128_1(guard(range.startContainer, TRUE) === FALSE)) ? NULL : range.startContainer._4e_nextSourceNode(TRUE, type, guard, undefined);
        }
      }
    }
    _$jscoverage['/editor/walker.js'].lineData[134]++;
    while (visit1107_134_1(node && !self._.end)) {
      _$jscoverage['/editor/walker.js'].lineData[135]++;
      self.current = node;
      _$jscoverage['/editor/walker.js'].lineData[136]++;
      if (visit1108_136_1(!self.evaluator || visit1109_136_2(self.evaluator(node[0]) !== FALSE))) {
        _$jscoverage['/editor/walker.js'].lineData[137]++;
        if (visit1110_137_1(!breakOnFalseRetFalse)) {
          _$jscoverage['/editor/walker.js'].lineData[138]++;
          return node;
        }
      } else {
        _$jscoverage['/editor/walker.js'].lineData[140]++;
        if (visit1111_140_1(breakOnFalseRetFalse && self.evaluator)) {
          _$jscoverage['/editor/walker.js'].lineData[141]++;
          return FALSE;
        }
      }
      _$jscoverage['/editor/walker.js'].lineData[143]++;
      node = node[getSourceNodeFn](FALSE, type, guard);
    }
    _$jscoverage['/editor/walker.js'].lineData[146]++;
    self.end();
    _$jscoverage['/editor/walker.js'].lineData[147]++;
    return self.current = NULL;
  }
  _$jscoverage['/editor/walker.js'].lineData[150]++;
  function iterateToLast(rtl) {
    _$jscoverage['/editor/walker.js'].functionData[5]++;
    _$jscoverage['/editor/walker.js'].lineData[151]++;
    var node, last = NULL;
    _$jscoverage['/editor/walker.js'].lineData[153]++;
    while (node = iterate.call(this, rtl)) {
      _$jscoverage['/editor/walker.js'].lineData[154]++;
      last = node;
    }
    _$jscoverage['/editor/walker.js'].lineData[156]++;
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
  return visit1112_229_1(iterate.call(this, FALSE, TRUE) !== FALSE);
}, 
  checkBackward: function() {
  _$jscoverage['/editor/walker.js'].functionData[11]++;
  _$jscoverage['/editor/walker.js'].lineData[240]++;
  return visit1113_240_1(iterate.call(this, TRUE, TRUE) !== FALSE);
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
  return !(visit1114_282_1(visit1115_282_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_isBlockBoundary(node, customNodeNames)));
};
}, 
  bookmark: function(contentOnly, isReject) {
  _$jscoverage['/editor/walker.js'].functionData[17]++;
  _$jscoverage['/editor/walker.js'].lineData[297]++;
  function isBookmarkNode(node) {
    _$jscoverage['/editor/walker.js'].functionData[18]++;
    _$jscoverage['/editor/walker.js'].lineData[298]++;
    return visit1116_298_1(visit1117_298_2(Dom.nodeName(node) == 'span') && Dom.attr(node, '_ke_bookmark'));
  }
  _$jscoverage['/editor/walker.js'].lineData[302]++;
  return function(node) {
  _$jscoverage['/editor/walker.js'].functionData[19]++;
  _$jscoverage['/editor/walker.js'].lineData[303]++;
  var isBookmark, parent;
  _$jscoverage['/editor/walker.js'].lineData[305]++;
  isBookmark = (visit1118_305_1(visit1119_305_2(node.nodeType == Dom.NodeType.TEXT_NODE) && visit1120_306_1((parent = node.parentNode) && isBookmarkNode(parent))));
  _$jscoverage['/editor/walker.js'].lineData[309]++;
  isBookmark = contentOnly ? isBookmark : visit1121_309_1(isBookmark || isBookmarkNode(node));
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
  var isWhitespace = visit1122_322_1(visit1123_322_2(node.nodeType == Dom.NodeType.TEXT_NODE) && !S.trim(node.nodeValue));
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
  var isInvisible = visit1124_339_1(whitespace(node) || visit1125_340_1(visit1126_340_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && !node.offsetHeight));
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
  return visit1127_351_1(isBookmark(node) || visit1128_352_1(isWhitespaces(node) || visit1129_353_1(visit1130_353_2(node.nodeType == 1) && visit1131_354_1(name in dtd.$inline && !(name in dtd.$empty)))));
};
  _$jscoverage['/editor/walker.js'].lineData[359]++;
  function getBogus(tail) {
    _$jscoverage['/editor/walker.js'].functionData[25]++;
    _$jscoverage['/editor/walker.js'].lineData[361]++;
    do {
      _$jscoverage['/editor/walker.js'].lineData[362]++;
      tail = tail._4e_previousSourceNode();
    } while (visit1132_363_1(tail && toSkip(tail[0])));
    _$jscoverage['/editor/walker.js'].lineData[365]++;
    if (visit1133_365_1(tail && (!UA.ie ? visit1134_365_2(tail.nodeName() == "br") : visit1135_366_1(visit1136_366_2(tail[0].nodeType == 3) && tailNbspRegex.test(tail.text()))))) {
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
}, {
  requires: ['./base', './utils', './dom', 'node']});
