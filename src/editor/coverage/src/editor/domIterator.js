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
  _$jscoverage['/editor/domIterator.js'].lineData[10] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[11] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[12] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[13] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[14] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[15] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[16] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[29] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[30] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[31] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[32] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[33] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[34] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[37] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[38] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[40] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[43] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[45] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[59] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[62] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[65] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[68] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[71] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[72] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[77] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[79] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[82] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[85] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[86] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[88] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[89] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[90] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[91] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[96] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[99] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[100] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[101] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[102] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[103] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[104] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[109] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[110] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[111] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[115] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[118] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[119] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[121] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[122] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[125] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[129] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[134] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[135] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[137] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[140] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[141] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[142] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[145] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[146] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[147] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[152] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[153] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[157] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[158] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[161] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[164] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[166] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[167] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[168] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[171] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[172] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[174] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[177] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[180] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[181] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[186] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[187] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[188] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[192] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[196] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[197] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[198] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[200] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[201] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[202] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[203] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[206] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[207] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[208] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[209] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[214] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[215] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[217] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[218] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[222] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[223] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[227] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[229] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[230] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[231] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[232] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[235] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[236] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[238] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[240] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[245] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[246] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[248] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[250] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[251] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[253] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[254] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[256] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[260] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[262] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[265] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[266] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[270] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[272] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[273] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[276] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[279] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[285] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[290] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[291] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[292] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[293] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[294] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[295] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[296] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[300] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[302] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[304] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[305] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[307] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[310] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[317] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[318] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[322] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[331] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[332] = 0;
  _$jscoverage['/editor/domIterator.js'].lineData[335] = 0;
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
  _$jscoverage['/editor/domIterator.js'].branchData['30'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['40'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['71'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['79'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['96'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['97'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['97'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['101'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['103'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['109'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['129'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['134'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['137'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['140'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['142'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['142'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['142'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['152'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['157'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['164'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['166'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['177'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['180'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['186'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['192'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['196'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['197'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['200'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['202'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['214'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['222'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['227'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['229'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['230'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['240'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['241'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['242'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['243'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['246'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['246'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['248'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['256'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['260'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['279'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['290'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['292'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['293'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['295'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['295'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['300'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['305'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['305'][2] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['305'][3] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['305'][4] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['307'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['308'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['317'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor/domIterator.js'].branchData['318'] = [];
  _$jscoverage['/editor/domIterator.js'].branchData['318'][1] = new BranchData();
}
_$jscoverage['/editor/domIterator.js'].branchData['318'][1].init(37, 32, 'isLast || block.equals(lastNode)');
function visit274_318_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['317'][1].init(12558, 16, '!self._.nextNode');
function visit273_317_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['308'][1].init(35, 92, 'lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit272_308_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['307'][1].init(117, 128, 'UA[\'ie\'] || lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)');
function visit271_307_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['305'][4].init(269, 28, 'lastChild.nodeName() == \'br\'');
function visit270_305_4(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['305'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['305'][3].init(215, 50, 'lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit269_305_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['305'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['305'][2].init(215, 82, 'lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() == \'br\'');
function visit268_305_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['305'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['305'][1].init(199, 98, 'lastChild[0] && lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE && lastChild.nodeName() == \'br\'');
function visit267_305_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['300'][1].init(11705, 12, 'removeLastBr');
function visit266_300_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['295'][2].init(177, 50, 'Dom.nodeName(previousSibling[0].lastChild) == \'br\'');
function visit265_295_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['295'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['295'][1].init(145, 82, 'previousSibling[0].lastChild && Dom.nodeName(previousSibling[0].lastChild) == \'br\'');
function visit264_295_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['293'][1].init(25, 34, 'previousSibling.nodeName() == \'br\'');
function visit263_293_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['292'][2].init(117, 56, 'previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit262_292_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['292'][1].init(95, 78, 'previousSibling[0] && previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit261_292_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['290'][1].init(11163, 16, 'removePreviousBr');
function visit260_290_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['279'][1].init(2580, 7, '!isLast');
function visit259_279_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['260'][1].init(218, 54, '!range.checkStartOfBlock() || !range.checkEndOfBlock()');
function visit258_260_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['256'][1].init(1426, 24, 'block.nodeName() != \'li\'');
function visit257_256_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['248'][1].init(119, 15, 'blockTag || \'p\'');
function visit256_248_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['246'][3].init(861, 24, 'block.nodeName() == \'li\'');
function visit255_246_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['246'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['246'][2].init(835, 50, 'self.enforceRealBlocks && block.nodeName() == \'li\'');
function visit254_246_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['246'][1].init(823, 64, '!block || (self.enforceRealBlocks && block.nodeName() == \'li\')');
function visit253_246_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['243'][1].init(64, 72, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit252_243_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['242'][1].init(46, 137, 'checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit251_242_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['241'][1].init(43, 184, '!self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit250_241_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['240'][2].init(522, 19, '!block || !block[0]');
function visit249_240_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['240'][1].init(522, 228, '(!block || !block[0]) && !self.enforceRealBlocks && checkLimits[startBlockLimit.nodeName()] && range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit248_240_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['230'][1].init(21, 55, 'self._.docEndMarker && self._.docEndMarker._4e_remove()');
function visit247_230_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['229'][1].init(85, 6, '!range');
function visit246_229_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['227'][1].init(8044, 6, '!block');
function visit245_227_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['222'][2].init(4898, 19, 'closeRange && range');
function visit244_222_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['222'][1].init(4886, 33, 'isLast || (closeRange && range)');
function visit243_222_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['214'][1].init(4522, 11, 'includeNode');
function visit242_214_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['202'][1].init(85, 37, 'isLast || parentNode.equals(lastNode)');
function visit241_202_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['200'][2].init(124, 30, 'self.forceBrBreak && {\n  br: 1}');
function visit240_200_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['200'][1].init(93, 62, 'parentNode._4e_isBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit239_200_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['197'][1].init(28, 38, '!currentNode[0].nextSibling && !isLast');
function visit238_197_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['196'][1].init(3767, 20, 'range && !closeRange');
function visit237_196_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['192'][2].init(3523, 26, '!closeRange || includeNode');
function visit236_192_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['192'][1].init(3523, 60, '(!closeRange || includeNode) && currentNode.equals(lastNode)');
function visit235_192_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['186'][1].init(3263, 21, 'includeNode && !range');
function visit234_186_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['180'][1].init(181, 51, 'beginWhitespaceRegex.test(currentNode[0].nodeValue)');
function visit233_180_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['177'][1].init(2753, 49, 'currentNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit232_177_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['166'][1].init(110, 6, '!range');
function visit231_166_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['164'][1].init(98, 25, 'currentNode[0].firstChild');
function visit230_164_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['157'][1].init(250, 16, 'nodeName != \'br\'');
function visit229_157_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['152'][1].init(853, 5, 'range');
function visit228_152_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['142'][3].init(310, 16, 'nodeName != \'hr\'');
function visit227_142_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['142'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['142'][2].init(273, 53, '!currentNode[0].childNodes.length && nodeName != \'hr\'');
function visit226_142_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['142'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['142'][1].init(263, 63, '!range && !currentNode[0].childNodes.length && nodeName != \'hr\'');
function visit225_142_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['140'][1].init(163, 16, 'nodeName == \'br\'');
function visit224_140_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['137'][2].init(117, 30, 'self.forceBrBreak && {\n  br: 1}');
function visit223_137_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['137'][1].init(85, 63, 'currentNode._4e_isBlockBoundary(self.forceBrBreak && {\n  br: 1})');
function visit222_137_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['134'][1].init(603, 12, '!includeNode');
function visit221_134_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['129'][1].init(369, 52, 'currentNode[0].nodeType != Dom.NodeType.ELEMENT_NODE');
function visit220_129_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['109'][1].init(2019, 16, '!self._.lastNode');
function visit219_109_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['103'][1].init(117, 29, 'path.block || path.blockLimit');
function visit218_103_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['101'][1].init(177, 27, 'testRange.checkEndOfBlock()');
function visit217_101_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['97'][3].init(56, 107, '!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit216_97_3(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['97'][2].init(1280, 53, 'self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE');
function visit215_97_2(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['97'][1].init(38, 164, 'self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit214_97_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['96'][1].init(1239, 203, 'self._.lastNode && self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE && !S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary()');
function visit213_96_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['79'][1].init(286, 36, 'self.forceBrBreak || !self.enlargeBr');
function visit212_79_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['71'][1].init(468, 16, '!self._.lastNode');
function visit211_71_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['40'][1].init(290, 25, 'self._ || (self._ = {})');
function visit210_40_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].branchData['30'][1].init(13, 20, 'arguments.length < 1');
function visit209_30_1(result) {
  _$jscoverage['/editor/domIterator.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/domIterator.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/domIterator.js'].functionData[0]++;
  _$jscoverage['/editor/domIterator.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/domIterator.js'].lineData[12]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/domIterator.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/domIterator.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/domIterator.js'].lineData[15]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/domIterator.js'].lineData[16]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, KER = Editor.RangeType, Dom = S.DOM;
  _$jscoverage['/editor/domIterator.js'].lineData[29]++;
  function Iterator(range) {
    _$jscoverage['/editor/domIterator.js'].functionData[1]++;
    _$jscoverage['/editor/domIterator.js'].lineData[30]++;
    if (visit209_30_1(arguments.length < 1)) {
      _$jscoverage['/editor/domIterator.js'].lineData[31]++;
      return;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[32]++;
    var self = this;
    _$jscoverage['/editor/domIterator.js'].lineData[33]++;
    self.range = range;
    _$jscoverage['/editor/domIterator.js'].lineData[34]++;
    self.forceBrBreak = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[37]++;
    self.enlargeBr = TRUE;
    _$jscoverage['/editor/domIterator.js'].lineData[38]++;
    self.enforceRealBlocks = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[40]++;
    visit210_40_1(self._ || (self._ = {}));
  }
  _$jscoverage['/editor/domIterator.js'].lineData[43]++;
  var beginWhitespaceRegex = /^[\r\n\t ]*$/;
  _$jscoverage['/editor/domIterator.js'].lineData[45]++;
  S.augment(Iterator, {
  getNextParagraph: function(blockTag) {
  _$jscoverage['/editor/domIterator.js'].functionData[2]++;
  _$jscoverage['/editor/domIterator.js'].lineData[59]++;
  var block, self = this;
  _$jscoverage['/editor/domIterator.js'].lineData[62]++;
  var range;
  _$jscoverage['/editor/domIterator.js'].lineData[65]++;
  var isLast;
  _$jscoverage['/editor/domIterator.js'].lineData[68]++;
  var removePreviousBr, removeLastBr;
  _$jscoverage['/editor/domIterator.js'].lineData[71]++;
  if (visit211_71_1(!self._.lastNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[72]++;
    range = self.range.clone();
    _$jscoverage['/editor/domIterator.js'].lineData[77]++;
    range.shrink(KER.SHRINK_ELEMENT, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[79]++;
    range.enlarge(visit212_79_1(self.forceBrBreak || !self.enlargeBr) ? KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);
    _$jscoverage['/editor/domIterator.js'].lineData[82]++;
    var walker = new Walker(range), ignoreBookmarkTextEvaluator = Walker.bookmark(TRUE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[85]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[86]++;
    self._.nextNode = walker.next();
    _$jscoverage['/editor/domIterator.js'].lineData[88]++;
    walker = new Walker(range);
    _$jscoverage['/editor/domIterator.js'].lineData[89]++;
    walker.evaluator = ignoreBookmarkTextEvaluator;
    _$jscoverage['/editor/domIterator.js'].lineData[90]++;
    var lastNode = walker.previous();
    _$jscoverage['/editor/domIterator.js'].lineData[91]++;
    self._.lastNode = lastNode._4e_nextSourceNode(TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[96]++;
    if (visit213_96_1(self._.lastNode && visit214_97_1(visit215_97_2(self._.lastNode[0].nodeType == Dom.NodeType.TEXT_NODE) && visit216_97_3(!S.trim(self._.lastNode[0].nodeValue) && self._.lastNode.parent()._4e_isBlockBoundary())))) {
      _$jscoverage['/editor/domIterator.js'].lineData[99]++;
      var testRange = new KERange(range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[100]++;
      testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
      _$jscoverage['/editor/domIterator.js'].lineData[101]++;
      if (visit217_101_1(testRange.checkEndOfBlock())) {
        _$jscoverage['/editor/domIterator.js'].lineData[102]++;
        var path = new ElementPath(testRange.endContainer);
        _$jscoverage['/editor/domIterator.js'].lineData[103]++;
        var lastBlock = visit218_103_1(path.block || path.blockLimit);
        _$jscoverage['/editor/domIterator.js'].lineData[104]++;
        self._.lastNode = lastBlock._4e_nextSourceNode(TRUE);
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[109]++;
    if (visit219_109_1(!self._.lastNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[110]++;
      self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
      _$jscoverage['/editor/domIterator.js'].lineData[111]++;
      Dom.insertAfter(self._.lastNode[0], lastNode[0]);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[115]++;
    range = NULL;
  }
  _$jscoverage['/editor/domIterator.js'].lineData[118]++;
  var currentNode = self._.nextNode;
  _$jscoverage['/editor/domIterator.js'].lineData[119]++;
  lastNode = self._.lastNode;
  _$jscoverage['/editor/domIterator.js'].lineData[121]++;
  self._.nextNode = NULL;
  _$jscoverage['/editor/domIterator.js'].lineData[122]++;
  while (currentNode) {
    _$jscoverage['/editor/domIterator.js'].lineData[125]++;
    var closeRange = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[129]++;
    var includeNode = (visit220_129_1(currentNode[0].nodeType != Dom.NodeType.ELEMENT_NODE)), continueFromSibling = FALSE;
    _$jscoverage['/editor/domIterator.js'].lineData[134]++;
    if (visit221_134_1(!includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[135]++;
      var nodeName = currentNode.nodeName();
      _$jscoverage['/editor/domIterator.js'].lineData[137]++;
      if (visit222_137_1(currentNode._4e_isBlockBoundary(visit223_137_2(self.forceBrBreak && {
  br: 1})))) {
        _$jscoverage['/editor/domIterator.js'].lineData[140]++;
        if (visit224_140_1(nodeName == 'br')) {
          _$jscoverage['/editor/domIterator.js'].lineData[141]++;
          includeNode = TRUE;
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[142]++;
          if (visit225_142_1(!range && visit226_142_2(!currentNode[0].childNodes.length && visit227_142_3(nodeName != 'hr')))) {
            _$jscoverage['/editor/domIterator.js'].lineData[145]++;
            block = currentNode;
            _$jscoverage['/editor/domIterator.js'].lineData[146]++;
            isLast = currentNode.equals(lastNode);
            _$jscoverage['/editor/domIterator.js'].lineData[147]++;
            break;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[152]++;
        if (visit228_152_1(range)) {
          _$jscoverage['/editor/domIterator.js'].lineData[153]++;
          range.setEndAt(currentNode, KER.POSITION_BEFORE_START);
          _$jscoverage['/editor/domIterator.js'].lineData[157]++;
          if (visit229_157_1(nodeName != 'br')) {
            _$jscoverage['/editor/domIterator.js'].lineData[158]++;
            self._.nextNode = currentNode;
          }
        }
        _$jscoverage['/editor/domIterator.js'].lineData[161]++;
        closeRange = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[164]++;
        if (visit230_164_1(currentNode[0].firstChild)) {
          _$jscoverage['/editor/domIterator.js'].lineData[166]++;
          if (visit231_166_1(!range)) {
            _$jscoverage['/editor/domIterator.js'].lineData[167]++;
            range = new KERange(self.range.document);
            _$jscoverage['/editor/domIterator.js'].lineData[168]++;
            range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
          }
          _$jscoverage['/editor/domIterator.js'].lineData[171]++;
          currentNode = new Node(currentNode[0].firstChild);
          _$jscoverage['/editor/domIterator.js'].lineData[172]++;
          continue;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[174]++;
        includeNode = TRUE;
      }
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[177]++;
      if (visit232_177_1(currentNode[0].nodeType == Dom.NodeType.TEXT_NODE)) {
        _$jscoverage['/editor/domIterator.js'].lineData[180]++;
        if (visit233_180_1(beginWhitespaceRegex.test(currentNode[0].nodeValue))) {
          _$jscoverage['/editor/domIterator.js'].lineData[181]++;
          includeNode = FALSE;
        }
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[186]++;
    if (visit234_186_1(includeNode && !range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[187]++;
      range = new KERange(self.range.document);
      _$jscoverage['/editor/domIterator.js'].lineData[188]++;
      range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[192]++;
    isLast = visit235_192_1((visit236_192_2(!closeRange || includeNode)) && currentNode.equals(lastNode));
    _$jscoverage['/editor/domIterator.js'].lineData[196]++;
    if (visit237_196_1(range && !closeRange)) {
      _$jscoverage['/editor/domIterator.js'].lineData[197]++;
      while (visit238_197_1(!currentNode[0].nextSibling && !isLast)) {
        _$jscoverage['/editor/domIterator.js'].lineData[198]++;
        var parentNode = currentNode.parent();
        _$jscoverage['/editor/domIterator.js'].lineData[200]++;
        if (visit239_200_1(parentNode._4e_isBlockBoundary(visit240_200_2(self.forceBrBreak && {
  br: 1})))) {
          _$jscoverage['/editor/domIterator.js'].lineData[201]++;
          closeRange = TRUE;
          _$jscoverage['/editor/domIterator.js'].lineData[202]++;
          isLast = visit241_202_1(isLast || parentNode.equals(lastNode));
          _$jscoverage['/editor/domIterator.js'].lineData[203]++;
          break;
        }
        _$jscoverage['/editor/domIterator.js'].lineData[206]++;
        currentNode = parentNode;
        _$jscoverage['/editor/domIterator.js'].lineData[207]++;
        includeNode = TRUE;
        _$jscoverage['/editor/domIterator.js'].lineData[208]++;
        isLast = currentNode.equals(lastNode);
        _$jscoverage['/editor/domIterator.js'].lineData[209]++;
        continueFromSibling = TRUE;
      }
    }
    _$jscoverage['/editor/domIterator.js'].lineData[214]++;
    if (visit242_214_1(includeNode)) {
      _$jscoverage['/editor/domIterator.js'].lineData[215]++;
      range.setEndAt(currentNode, KER.POSITION_AFTER_END);
    }
    _$jscoverage['/editor/domIterator.js'].lineData[217]++;
    currentNode = currentNode._4e_nextSourceNode(continueFromSibling, NULL, lastNode);
    _$jscoverage['/editor/domIterator.js'].lineData[218]++;
    isLast = !currentNode;
    _$jscoverage['/editor/domIterator.js'].lineData[222]++;
    if (visit243_222_1(isLast || (visit244_222_2(closeRange && range)))) {
      _$jscoverage['/editor/domIterator.js'].lineData[223]++;
      break;
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[227]++;
  if (visit245_227_1(!block)) {
    _$jscoverage['/editor/domIterator.js'].lineData[229]++;
    if (visit246_229_1(!range)) {
      _$jscoverage['/editor/domIterator.js'].lineData[230]++;
      visit247_230_1(self._.docEndMarker && self._.docEndMarker._4e_remove());
      _$jscoverage['/editor/domIterator.js'].lineData[231]++;
      self._.nextNode = NULL;
      _$jscoverage['/editor/domIterator.js'].lineData[232]++;
      return NULL;
    }
    _$jscoverage['/editor/domIterator.js'].lineData[235]++;
    var startPath = new ElementPath(range.startContainer);
    _$jscoverage['/editor/domIterator.js'].lineData[236]++;
    var startBlockLimit = startPath.blockLimit, checkLimits = {
  div: 1, 
  th: 1, 
  td: 1};
    _$jscoverage['/editor/domIterator.js'].lineData[238]++;
    block = startPath.block;
    _$jscoverage['/editor/domIterator.js'].lineData[240]++;
    if (visit248_240_1((visit249_240_2(!block || !block[0])) && visit250_241_1(!self.enforceRealBlocks && visit251_242_1(checkLimits[startBlockLimit.nodeName()] && visit252_243_1(range.checkStartOfBlock() && range.checkEndOfBlock()))))) {
      _$jscoverage['/editor/domIterator.js'].lineData[245]++;
      block = startBlockLimit;
    } else {
      _$jscoverage['/editor/domIterator.js'].lineData[246]++;
      if (visit253_246_1(!block || (visit254_246_2(self.enforceRealBlocks && visit255_246_3(block.nodeName() == 'li'))))) {
        _$jscoverage['/editor/domIterator.js'].lineData[248]++;
        block = new Node(self.range.document.createElement(visit256_248_1(blockTag || 'p')));
        _$jscoverage['/editor/domIterator.js'].lineData[250]++;
        block[0].appendChild(range.extractContents());
        _$jscoverage['/editor/domIterator.js'].lineData[251]++;
        block._4e_trim();
        _$jscoverage['/editor/domIterator.js'].lineData[253]++;
        range.insertNode(block);
        _$jscoverage['/editor/domIterator.js'].lineData[254]++;
        removePreviousBr = removeLastBr = TRUE;
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[256]++;
        if (visit257_256_1(block.nodeName() != 'li')) {
          _$jscoverage['/editor/domIterator.js'].lineData[260]++;
          if (visit258_260_1(!range.checkStartOfBlock() || !range.checkEndOfBlock())) {
            _$jscoverage['/editor/domIterator.js'].lineData[262]++;
            block = block.clone(FALSE);
            _$jscoverage['/editor/domIterator.js'].lineData[265]++;
            block[0].appendChild(range.extractContents());
            _$jscoverage['/editor/domIterator.js'].lineData[266]++;
            block._4e_trim();
            _$jscoverage['/editor/domIterator.js'].lineData[270]++;
            var splitInfo = range.splitBlock();
            _$jscoverage['/editor/domIterator.js'].lineData[272]++;
            removePreviousBr = !splitInfo.wasStartOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[273]++;
            removeLastBr = !splitInfo.wasEndOfBlock;
            _$jscoverage['/editor/domIterator.js'].lineData[276]++;
            range.insertNode(block);
          }
        } else {
          _$jscoverage['/editor/domIterator.js'].lineData[279]++;
          if (visit259_279_1(!isLast)) {
            _$jscoverage['/editor/domIterator.js'].lineData[285]++;
            self._.nextNode = (block.equals(lastNode) ? NULL : range.getBoundaryNodes().endNode._4e_nextSourceNode(TRUE, NULL, lastNode));
          }
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[290]++;
  if (visit260_290_1(removePreviousBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[291]++;
    var previousSibling = new Node(block[0].previousSibling);
    _$jscoverage['/editor/domIterator.js'].lineData[292]++;
    if (visit261_292_1(previousSibling[0] && visit262_292_2(previousSibling[0].nodeType == Dom.NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/domIterator.js'].lineData[293]++;
      if (visit263_293_1(previousSibling.nodeName() == 'br')) {
        _$jscoverage['/editor/domIterator.js'].lineData[294]++;
        previousSibling._4e_remove();
      } else {
        _$jscoverage['/editor/domIterator.js'].lineData[295]++;
        if (visit264_295_1(previousSibling[0].lastChild && visit265_295_2(Dom.nodeName(previousSibling[0].lastChild) == 'br'))) {
          _$jscoverage['/editor/domIterator.js'].lineData[296]++;
          Dom._4e_remove(previousSibling[0].lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[300]++;
  if (visit266_300_1(removeLastBr)) {
    _$jscoverage['/editor/domIterator.js'].lineData[302]++;
    var bookmarkGuard = Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/domIterator.js'].lineData[304]++;
    var lastChild = new Node(block[0].lastChild);
    _$jscoverage['/editor/domIterator.js'].lineData[305]++;
    if (visit267_305_1(lastChild[0] && visit268_305_2(visit269_305_3(lastChild[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit270_305_4(lastChild.nodeName() == 'br')))) {
      _$jscoverage['/editor/domIterator.js'].lineData[307]++;
      if (visit271_307_1(UA['ie'] || visit272_308_1(lastChild.prev(bookmarkGuard, 1) || lastChild.next(bookmarkGuard, 1)))) {
        _$jscoverage['/editor/domIterator.js'].lineData[310]++;
        lastChild.remove();
      }
    }
  }
  _$jscoverage['/editor/domIterator.js'].lineData[317]++;
  if (visit273_317_1(!self._.nextNode)) {
    _$jscoverage['/editor/domIterator.js'].lineData[318]++;
    self._.nextNode = (visit274_318_1(isLast || block.equals(lastNode))) ? NULL : block._4e_nextSourceNode(TRUE, NULL, lastNode);
  }
  _$jscoverage['/editor/domIterator.js'].lineData[322]++;
  return block;
}});
  _$jscoverage['/editor/domIterator.js'].lineData[331]++;
  KERange.prototype.createIterator = function() {
  _$jscoverage['/editor/domIterator.js'].functionData[3]++;
  _$jscoverage['/editor/domIterator.js'].lineData[332]++;
  return new Iterator(this);
};
  _$jscoverage['/editor/domIterator.js'].lineData[335]++;
  return Iterator;
});
