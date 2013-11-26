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
if (! _$jscoverage['/tree/node.js']) {
  _$jscoverage['/tree/node.js'] = {};
  _$jscoverage['/tree/node.js'].lineData = [];
  _$jscoverage['/tree/node.js'].lineData[6] = 0;
  _$jscoverage['/tree/node.js'].lineData[7] = 0;
  _$jscoverage['/tree/node.js'].lineData[8] = 0;
  _$jscoverage['/tree/node.js'].lineData[9] = 0;
  _$jscoverage['/tree/node.js'].lineData[11] = 0;
  _$jscoverage['/tree/node.js'].lineData[19] = 0;
  _$jscoverage['/tree/node.js'].lineData[21] = 0;
  _$jscoverage['/tree/node.js'].lineData[22] = 0;
  _$jscoverage['/tree/node.js'].lineData[23] = 0;
  _$jscoverage['/tree/node.js'].lineData[28] = 0;
  _$jscoverage['/tree/node.js'].lineData[29] = 0;
  _$jscoverage['/tree/node.js'].lineData[35] = 0;
  _$jscoverage['/tree/node.js'].lineData[45] = 0;
  _$jscoverage['/tree/node.js'].lineData[47] = 0;
  _$jscoverage['/tree/node.js'].lineData[48] = 0;
  _$jscoverage['/tree/node.js'].lineData[53] = 0;
  _$jscoverage['/tree/node.js'].lineData[54] = 0;
  _$jscoverage['/tree/node.js'].lineData[59] = 0;
  _$jscoverage['/tree/node.js'].lineData[60] = 0;
  _$jscoverage['/tree/node.js'].lineData[65] = 0;
  _$jscoverage['/tree/node.js'].lineData[66] = 0;
  _$jscoverage['/tree/node.js'].lineData[71] = 0;
  _$jscoverage['/tree/node.js'].lineData[72] = 0;
  _$jscoverage['/tree/node.js'].lineData[77] = 0;
  _$jscoverage['/tree/node.js'].lineData[78] = 0;
  _$jscoverage['/tree/node.js'].lineData[80] = 0;
  _$jscoverage['/tree/node.js'].lineData[82] = 0;
  _$jscoverage['/tree/node.js'].lineData[87] = 0;
  _$jscoverage['/tree/node.js'].lineData[88] = 0;
  _$jscoverage['/tree/node.js'].lineData[89] = 0;
  _$jscoverage['/tree/node.js'].lineData[91] = 0;
  _$jscoverage['/tree/node.js'].lineData[94] = 0;
  _$jscoverage['/tree/node.js'].lineData[97] = 0;
  _$jscoverage['/tree/node.js'].lineData[98] = 0;
  _$jscoverage['/tree/node.js'].lineData[101] = 0;
  _$jscoverage['/tree/node.js'].lineData[102] = 0;
  _$jscoverage['/tree/node.js'].lineData[105] = 0;
  _$jscoverage['/tree/node.js'].lineData[109] = 0;
  _$jscoverage['/tree/node.js'].lineData[113] = 0;
  _$jscoverage['/tree/node.js'].lineData[114] = 0;
  _$jscoverage['/tree/node.js'].lineData[116] = 0;
  _$jscoverage['/tree/node.js'].lineData[117] = 0;
  _$jscoverage['/tree/node.js'].lineData[118] = 0;
  _$jscoverage['/tree/node.js'].lineData[119] = 0;
  _$jscoverage['/tree/node.js'].lineData[121] = 0;
  _$jscoverage['/tree/node.js'].lineData[125] = 0;
  _$jscoverage['/tree/node.js'].lineData[129] = 0;
  _$jscoverage['/tree/node.js'].lineData[130] = 0;
  _$jscoverage['/tree/node.js'].lineData[132] = 0;
  _$jscoverage['/tree/node.js'].lineData[133] = 0;
  _$jscoverage['/tree/node.js'].lineData[134] = 0;
  _$jscoverage['/tree/node.js'].lineData[135] = 0;
  _$jscoverage['/tree/node.js'].lineData[137] = 0;
  _$jscoverage['/tree/node.js'].lineData[144] = 0;
  _$jscoverage['/tree/node.js'].lineData[148] = 0;
  _$jscoverage['/tree/node.js'].lineData[152] = 0;
  _$jscoverage['/tree/node.js'].lineData[153] = 0;
  _$jscoverage['/tree/node.js'].lineData[154] = 0;
  _$jscoverage['/tree/node.js'].lineData[155] = 0;
  _$jscoverage['/tree/node.js'].lineData[157] = 0;
  _$jscoverage['/tree/node.js'].lineData[158] = 0;
  _$jscoverage['/tree/node.js'].lineData[160] = 0;
  _$jscoverage['/tree/node.js'].lineData[167] = 0;
  _$jscoverage['/tree/node.js'].lineData[168] = 0;
  _$jscoverage['/tree/node.js'].lineData[170] = 0;
  _$jscoverage['/tree/node.js'].lineData[171] = 0;
  _$jscoverage['/tree/node.js'].lineData[176] = 0;
  _$jscoverage['/tree/node.js'].lineData[177] = 0;
  _$jscoverage['/tree/node.js'].lineData[178] = 0;
  _$jscoverage['/tree/node.js'].lineData[182] = 0;
  _$jscoverage['/tree/node.js'].lineData[183] = 0;
  _$jscoverage['/tree/node.js'].lineData[185] = 0;
  _$jscoverage['/tree/node.js'].lineData[193] = 0;
  _$jscoverage['/tree/node.js'].lineData[194] = 0;
  _$jscoverage['/tree/node.js'].lineData[195] = 0;
  _$jscoverage['/tree/node.js'].lineData[196] = 0;
  _$jscoverage['/tree/node.js'].lineData[204] = 0;
  _$jscoverage['/tree/node.js'].lineData[205] = 0;
  _$jscoverage['/tree/node.js'].lineData[206] = 0;
  _$jscoverage['/tree/node.js'].lineData[207] = 0;
  _$jscoverage['/tree/node.js'].lineData[284] = 0;
  _$jscoverage['/tree/node.js'].lineData[285] = 0;
  _$jscoverage['/tree/node.js'].lineData[286] = 0;
  _$jscoverage['/tree/node.js'].lineData[288] = 0;
  _$jscoverage['/tree/node.js'].lineData[315] = 0;
  _$jscoverage['/tree/node.js'].lineData[316] = 0;
  _$jscoverage['/tree/node.js'].lineData[317] = 0;
  _$jscoverage['/tree/node.js'].lineData[318] = 0;
  _$jscoverage['/tree/node.js'].lineData[322] = 0;
  _$jscoverage['/tree/node.js'].lineData[323] = 0;
  _$jscoverage['/tree/node.js'].lineData[324] = 0;
  _$jscoverage['/tree/node.js'].lineData[325] = 0;
  _$jscoverage['/tree/node.js'].lineData[326] = 0;
  _$jscoverage['/tree/node.js'].lineData[330] = 0;
  _$jscoverage['/tree/node.js'].lineData[331] = 0;
  _$jscoverage['/tree/node.js'].lineData[332] = 0;
  _$jscoverage['/tree/node.js'].lineData[333] = 0;
  _$jscoverage['/tree/node.js'].lineData[338] = 0;
  _$jscoverage['/tree/node.js'].lineData[339] = 0;
  _$jscoverage['/tree/node.js'].lineData[345] = 0;
  _$jscoverage['/tree/node.js'].lineData[348] = 0;
  _$jscoverage['/tree/node.js'].lineData[349] = 0;
  _$jscoverage['/tree/node.js'].lineData[351] = 0;
  _$jscoverage['/tree/node.js'].lineData[354] = 0;
  _$jscoverage['/tree/node.js'].lineData[355] = 0;
  _$jscoverage['/tree/node.js'].lineData[357] = 0;
  _$jscoverage['/tree/node.js'].lineData[358] = 0;
  _$jscoverage['/tree/node.js'].lineData[361] = 0;
  _$jscoverage['/tree/node.js'].lineData[365] = 0;
  _$jscoverage['/tree/node.js'].lineData[366] = 0;
  _$jscoverage['/tree/node.js'].lineData[367] = 0;
  _$jscoverage['/tree/node.js'].lineData[368] = 0;
  _$jscoverage['/tree/node.js'].lineData[370] = 0;
  _$jscoverage['/tree/node.js'].lineData[372] = 0;
  _$jscoverage['/tree/node.js'].lineData[376] = 0;
  _$jscoverage['/tree/node.js'].lineData[377] = 0;
  _$jscoverage['/tree/node.js'].lineData[380] = 0;
  _$jscoverage['/tree/node.js'].lineData[381] = 0;
  _$jscoverage['/tree/node.js'].lineData[385] = 0;
  _$jscoverage['/tree/node.js'].lineData[386] = 0;
  _$jscoverage['/tree/node.js'].lineData[387] = 0;
  _$jscoverage['/tree/node.js'].lineData[388] = 0;
  _$jscoverage['/tree/node.js'].lineData[390] = 0;
  _$jscoverage['/tree/node.js'].lineData[397] = 0;
  _$jscoverage['/tree/node.js'].lineData[398] = 0;
  _$jscoverage['/tree/node.js'].lineData[399] = 0;
  _$jscoverage['/tree/node.js'].lineData[403] = 0;
  _$jscoverage['/tree/node.js'].lineData[404] = 0;
  _$jscoverage['/tree/node.js'].lineData[405] = 0;
  _$jscoverage['/tree/node.js'].lineData[406] = 0;
  _$jscoverage['/tree/node.js'].lineData[407] = 0;
  _$jscoverage['/tree/node.js'].lineData[411] = 0;
  _$jscoverage['/tree/node.js'].lineData[412] = 0;
  _$jscoverage['/tree/node.js'].lineData[413] = 0;
  _$jscoverage['/tree/node.js'].lineData[415] = 0;
  _$jscoverage['/tree/node.js'].lineData[416] = 0;
  _$jscoverage['/tree/node.js'].lineData[417] = 0;
  _$jscoverage['/tree/node.js'].lineData[419] = 0;
  _$jscoverage['/tree/node.js'].lineData[424] = 0;
  _$jscoverage['/tree/node.js'].lineData[425] = 0;
  _$jscoverage['/tree/node.js'].lineData[426] = 0;
  _$jscoverage['/tree/node.js'].lineData[427] = 0;
  _$jscoverage['/tree/node.js'].lineData[430] = 0;
  _$jscoverage['/tree/node.js'].lineData[431] = 0;
  _$jscoverage['/tree/node.js'].lineData[432] = 0;
  _$jscoverage['/tree/node.js'].lineData[433] = 0;
}
if (! _$jscoverage['/tree/node.js'].functionData) {
  _$jscoverage['/tree/node.js'].functionData = [];
  _$jscoverage['/tree/node.js'].functionData[0] = 0;
  _$jscoverage['/tree/node.js'].functionData[1] = 0;
  _$jscoverage['/tree/node.js'].functionData[2] = 0;
  _$jscoverage['/tree/node.js'].functionData[3] = 0;
  _$jscoverage['/tree/node.js'].functionData[4] = 0;
  _$jscoverage['/tree/node.js'].functionData[5] = 0;
  _$jscoverage['/tree/node.js'].functionData[6] = 0;
  _$jscoverage['/tree/node.js'].functionData[7] = 0;
  _$jscoverage['/tree/node.js'].functionData[8] = 0;
  _$jscoverage['/tree/node.js'].functionData[9] = 0;
  _$jscoverage['/tree/node.js'].functionData[10] = 0;
  _$jscoverage['/tree/node.js'].functionData[11] = 0;
  _$jscoverage['/tree/node.js'].functionData[12] = 0;
  _$jscoverage['/tree/node.js'].functionData[13] = 0;
  _$jscoverage['/tree/node.js'].functionData[14] = 0;
  _$jscoverage['/tree/node.js'].functionData[15] = 0;
  _$jscoverage['/tree/node.js'].functionData[16] = 0;
  _$jscoverage['/tree/node.js'].functionData[17] = 0;
  _$jscoverage['/tree/node.js'].functionData[18] = 0;
  _$jscoverage['/tree/node.js'].functionData[19] = 0;
  _$jscoverage['/tree/node.js'].functionData[20] = 0;
  _$jscoverage['/tree/node.js'].functionData[21] = 0;
  _$jscoverage['/tree/node.js'].functionData[22] = 0;
  _$jscoverage['/tree/node.js'].functionData[23] = 0;
  _$jscoverage['/tree/node.js'].functionData[24] = 0;
  _$jscoverage['/tree/node.js'].functionData[25] = 0;
  _$jscoverage['/tree/node.js'].functionData[26] = 0;
  _$jscoverage['/tree/node.js'].functionData[27] = 0;
  _$jscoverage['/tree/node.js'].functionData[28] = 0;
}
if (! _$jscoverage['/tree/node.js'].branchData) {
  _$jscoverage['/tree/node.js'].branchData = {};
  _$jscoverage['/tree/node.js'].branchData['77'] = [];
  _$jscoverage['/tree/node.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['77'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['87'] = [];
  _$jscoverage['/tree/node.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['88'] = [];
  _$jscoverage['/tree/node.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['101'] = [];
  _$jscoverage['/tree/node.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['113'] = [];
  _$jscoverage['/tree/node.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['118'] = [];
  _$jscoverage['/tree/node.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['129'] = [];
  _$jscoverage['/tree/node.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['134'] = [];
  _$jscoverage['/tree/node.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['154'] = [];
  _$jscoverage['/tree/node.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['170'] = [];
  _$jscoverage['/tree/node.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['183'] = [];
  _$jscoverage['/tree/node.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['285'] = [];
  _$jscoverage['/tree/node.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['317'] = [];
  _$jscoverage['/tree/node.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['324'] = [];
  _$jscoverage['/tree/node.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['332'] = [];
  _$jscoverage['/tree/node.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['340'] = [];
  _$jscoverage['/tree/node.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['341'] = [];
  _$jscoverage['/tree/node.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['345'] = [];
  _$jscoverage['/tree/node.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['345'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['351'] = [];
  _$jscoverage['/tree/node.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['351'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['351'][4] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['357'] = [];
  _$jscoverage['/tree/node.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['367'] = [];
  _$jscoverage['/tree/node.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['380'] = [];
  _$jscoverage['/tree/node.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['387'] = [];
  _$jscoverage['/tree/node.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['398'] = [];
  _$jscoverage['/tree/node.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['405'] = [];
  _$jscoverage['/tree/node.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['412'] = [];
  _$jscoverage['/tree/node.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['416'] = [];
  _$jscoverage['/tree/node.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['430'] = [];
  _$jscoverage['/tree/node.js'].branchData['430'][1] = new BranchData();
}
_$jscoverage['/tree/node.js'].branchData['430'][1].init(177, 11, 'index < len');
function visit63_430_1(result) {
  _$jscoverage['/tree/node.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['416'][1].init(17, 27, 'typeof setDepth == \'number\'');
function visit62_416_1(result) {
  _$jscoverage['/tree/node.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['412'][1].init(13, 22, 'setDepth !== undefined');
function visit61_412_1(result) {
  _$jscoverage['/tree/node.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['405'][1].init(50, 4, 'tree');
function visit60_405_1(result) {
  _$jscoverage['/tree/node.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['398'][1].init(13, 21, 'self.get && self.view');
function visit59_398_1(result) {
  _$jscoverage['/tree/node.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['387'][1].init(287, 37, '!n && (parent = parent.get(\'parent\'))');
function visit58_387_1(result) {
  _$jscoverage['/tree/node.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['380'][1].init(93, 39, 'self.get("expanded") && children.length');
function visit57_380_1(result) {
  _$jscoverage['/tree/node.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['367'][1].init(45, 5, '!prev');
function visit56_367_1(result) {
  _$jscoverage['/tree/node.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['357'][1].init(92, 41, '!self.get("expanded") || !children.length');
function visit55_357_1(result) {
  _$jscoverage['/tree/node.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['351'][4].init(119, 20, 'isLeaf === undefined');
function visit54_351_4(result) {
  _$jscoverage['/tree/node.js'].branchData['351'][4].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['351'][3].init(119, 51, 'isLeaf === undefined && self.get("children").length');
function visit53_351_3(result) {
  _$jscoverage['/tree/node.js'].branchData['351'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['351'][2].init(98, 16, 'isLeaf === false');
function visit52_351_2(result) {
  _$jscoverage['/tree/node.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['351'][1].init(98, 73, 'isLeaf === false || (isLeaf === undefined && self.get("children").length)');
function visit51_351_1(result) {
  _$jscoverage['/tree/node.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['345'][2].init(246, 17, 'lastChild == self');
function visit50_345_2(result) {
  _$jscoverage['/tree/node.js'].branchData['345'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['345'][1].init(232, 31, '!lastChild || lastChild == self');
function visit49_345_1(result) {
  _$jscoverage['/tree/node.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['341'][1].init(113, 41, 'children && children[children.length - 1]');
function visit48_341_1(result) {
  _$jscoverage['/tree/node.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['340'][1].init(55, 32, 'parent && parent.get("children")');
function visit47_340_1(result) {
  _$jscoverage['/tree/node.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['332'][1].init(38, 17, 'e.target === self');
function visit46_332_1(result) {
  _$jscoverage['/tree/node.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['324'][1].init(38, 16, 'e.target == self');
function visit45_324_1(result) {
  _$jscoverage['/tree/node.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['317'][1].init(38, 16, 'e.target == self');
function visit44_317_1(result) {
  _$jscoverage['/tree/node.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['285'][1].init(65, 20, 'from && !from.isTree');
function visit43_285_1(result) {
  _$jscoverage['/tree/node.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['183'][1].init(58, 32, 'e && e.byPassSetTreeSelectedItem');
function visit42_183_1(result) {
  _$jscoverage['/tree/node.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['170'][1].init(155, 25, 'self === self.get(\'tree\')');
function visit41_170_1(result) {
  _$jscoverage['/tree/node.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['154'][1].init(231, 39, 'target.equals(self.get("expandIconEl"))');
function visit40_154_1(result) {
  _$jscoverage['/tree/node.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['134'][1].init(304, 11, 'index === 0');
function visit39_134_1(result) {
  _$jscoverage['/tree/node.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['129'][1].init(140, 7, '!parent');
function visit38_129_1(result) {
  _$jscoverage['/tree/node.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['118'][1].init(304, 28, 'index == siblings.length - 1');
function visit37_118_1(result) {
  _$jscoverage['/tree/node.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['113'][1].init(140, 7, '!parent');
function visit36_113_1(result) {
  _$jscoverage['/tree/node.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['101'][1].init(2126, 16, 'nodeToBeSelected');
function visit35_101_1(result) {
  _$jscoverage['/tree/node.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['88'][1].init(29, 9, '!expanded');
function visit34_88_1(result) {
  _$jscoverage['/tree/node.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['87'][2].init(62, 16, 'isLeaf === false');
function visit33_87_2(result) {
  _$jscoverage['/tree/node.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['87'][1].init(43, 35, 'children.length || isLeaf === false');
function visit32_87_1(result) {
  _$jscoverage['/tree/node.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['77'][3].init(74, 16, 'isLeaf === false');
function visit31_77_3(result) {
  _$jscoverage['/tree/node.js'].branchData['77'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['77'][2].init(55, 35, 'children.length || isLeaf === false');
function visit30_77_2(result) {
  _$jscoverage['/tree/node.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['77'][1].init(42, 49, 'expanded && (children.length || isLeaf === false)');
function visit29_77_1(result) {
  _$jscoverage['/tree/node.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/node.js'].functionData[0]++;
  _$jscoverage['/tree/node.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/node.js'].lineData[8]++;
  var Container = require('component/container');
  _$jscoverage['/tree/node.js'].lineData[9]++;
  var TreeNodeRender = require('./node-render');
  _$jscoverage['/tree/node.js'].lineData[11]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/tree/node.js'].lineData[19]++;
  return Container.extend({
  bindUI: function() {
  _$jscoverage['/tree/node.js'].functionData[1]++;
  _$jscoverage['/tree/node.js'].lineData[21]++;
  this.on('afterAddChild', onAddChild);
  _$jscoverage['/tree/node.js'].lineData[22]++;
  this.on('afterRemoveChild', onRemoveChild);
  _$jscoverage['/tree/node.js'].lineData[23]++;
  this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
}, 
  syncUI: function() {
  _$jscoverage['/tree/node.js'].functionData[2]++;
  _$jscoverage['/tree/node.js'].lineData[28]++;
  refreshCss(this);
  _$jscoverage['/tree/node.js'].lineData[29]++;
  syncAriaSetSize.call(this, {
  target: this});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[3]++;
  _$jscoverage['/tree/node.js'].lineData[35]++;
  var self = this, processed = true, tree = self.get("tree"), expanded = self.get("expanded"), nodeToBeSelected, isLeaf = self.get("isLeaf"), children = self.get("children"), keyCode = e.keyCode;
  _$jscoverage['/tree/node.js'].lineData[45]++;
  switch (keyCode) {
    case KeyCode.ENTER:
      _$jscoverage['/tree/node.js'].lineData[47]++;
      return self.handleClickInternal(e);
      _$jscoverage['/tree/node.js'].lineData[48]++;
      break;
    case KeyCode.HOME:
      _$jscoverage['/tree/node.js'].lineData[53]++;
      nodeToBeSelected = tree;
      _$jscoverage['/tree/node.js'].lineData[54]++;
      break;
    case KeyCode.END:
      _$jscoverage['/tree/node.js'].lineData[59]++;
      nodeToBeSelected = getLastVisibleDescendant(tree);
      _$jscoverage['/tree/node.js'].lineData[60]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/tree/node.js'].lineData[65]++;
      nodeToBeSelected = getPreviousVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[66]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/tree/node.js'].lineData[71]++;
      nodeToBeSelected = getNextVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[72]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/tree/node.js'].lineData[77]++;
      if (visit29_77_1(expanded && (visit30_77_2(children.length || visit31_77_3(isLeaf === false))))) {
        _$jscoverage['/tree/node.js'].lineData[78]++;
        self.set("expanded", false);
      } else {
        _$jscoverage['/tree/node.js'].lineData[80]++;
        nodeToBeSelected = self.get('parent');
      }
      _$jscoverage['/tree/node.js'].lineData[82]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/tree/node.js'].lineData[87]++;
      if (visit32_87_1(children.length || visit33_87_2(isLeaf === false))) {
        _$jscoverage['/tree/node.js'].lineData[88]++;
        if (visit34_88_1(!expanded)) {
          _$jscoverage['/tree/node.js'].lineData[89]++;
          self.set("expanded", true);
        } else {
          _$jscoverage['/tree/node.js'].lineData[91]++;
          nodeToBeSelected = children[0];
        }
      }
      _$jscoverage['/tree/node.js'].lineData[94]++;
      break;
    default:
      _$jscoverage['/tree/node.js'].lineData[97]++;
      processed = false;
      _$jscoverage['/tree/node.js'].lineData[98]++;
      break;
  }
  _$jscoverage['/tree/node.js'].lineData[101]++;
  if (visit35_101_1(nodeToBeSelected)) {
    _$jscoverage['/tree/node.js'].lineData[102]++;
    nodeToBeSelected.select();
  }
  _$jscoverage['/tree/node.js'].lineData[105]++;
  return processed;
}, 
  next: function() {
  _$jscoverage['/tree/node.js'].functionData[4]++;
  _$jscoverage['/tree/node.js'].lineData[109]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[113]++;
  if (visit36_113_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[114]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[116]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[117]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[118]++;
  if (visit37_118_1(index == siblings.length - 1)) {
    _$jscoverage['/tree/node.js'].lineData[119]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[121]++;
  return siblings[index + 1];
}, 
  prev: function() {
  _$jscoverage['/tree/node.js'].functionData[5]++;
  _$jscoverage['/tree/node.js'].lineData[125]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[129]++;
  if (visit38_129_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[130]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[132]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[133]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[134]++;
  if (visit39_134_1(index === 0)) {
    _$jscoverage['/tree/node.js'].lineData[135]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[137]++;
  return siblings[index - 1];
}, 
  select: function() {
  _$jscoverage['/tree/node.js'].functionData[6]++;
  _$jscoverage['/tree/node.js'].lineData[144]++;
  this.set('selected', true);
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[7]++;
  _$jscoverage['/tree/node.js'].lineData[148]++;
  var self = this, target = $(e.target), expanded = self.get("expanded"), tree = self.get("tree");
  _$jscoverage['/tree/node.js'].lineData[152]++;
  tree.focus();
  _$jscoverage['/tree/node.js'].lineData[153]++;
  self.callSuper(e);
  _$jscoverage['/tree/node.js'].lineData[154]++;
  if (visit40_154_1(target.equals(self.get("expandIconEl")))) {
    _$jscoverage['/tree/node.js'].lineData[155]++;
    self.set("expanded", !expanded);
  } else {
    _$jscoverage['/tree/node.js'].lineData[157]++;
    self.select();
    _$jscoverage['/tree/node.js'].lineData[158]++;
    self.fire("click");
  }
  _$jscoverage['/tree/node.js'].lineData[160]++;
  return true;
}, 
  createChildren: function() {
  _$jscoverage['/tree/node.js'].functionData[8]++;
  _$jscoverage['/tree/node.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[168]++;
  self.renderChildren.apply(self, arguments);
  _$jscoverage['/tree/node.js'].lineData[170]++;
  if (visit41_170_1(self === self.get('tree'))) {
    _$jscoverage['/tree/node.js'].lineData[171]++;
    updateSubTreeStatus(self, self, -1, 0);
  }
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node.js'].functionData[9]++;
  _$jscoverage['/tree/node.js'].lineData[176]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[177]++;
  refreshCss(self);
  _$jscoverage['/tree/node.js'].lineData[178]++;
  self.fire(v ? "expand" : "collapse");
}, 
  _onSetSelected: function(v, e) {
  _$jscoverage['/tree/node.js'].functionData[10]++;
  _$jscoverage['/tree/node.js'].lineData[182]++;
  var tree = this.get("tree");
  _$jscoverage['/tree/node.js'].lineData[183]++;
  if (visit42_183_1(e && e.byPassSetTreeSelectedItem)) {
  } else {
    _$jscoverage['/tree/node.js'].lineData[185]++;
    tree.set('selectedItem', v ? this : null);
  }
}, 
  expandAll: function() {
  _$jscoverage['/tree/node.js'].functionData[11]++;
  _$jscoverage['/tree/node.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[194]++;
  self.set("expanded", true);
  _$jscoverage['/tree/node.js'].lineData[195]++;
  S.each(self.get("children"), function(c) {
  _$jscoverage['/tree/node.js'].functionData[12]++;
  _$jscoverage['/tree/node.js'].lineData[196]++;
  c.expandAll();
});
}, 
  collapseAll: function() {
  _$jscoverage['/tree/node.js'].functionData[13]++;
  _$jscoverage['/tree/node.js'].lineData[204]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[205]++;
  self.set("expanded", false);
  _$jscoverage['/tree/node.js'].lineData[206]++;
  S.each(self.get("children"), function(c) {
  _$jscoverage['/tree/node.js'].functionData[14]++;
  _$jscoverage['/tree/node.js'].lineData[207]++;
  c.collapseAll();
});
}}, {
  ATTRS: {
  xrender: {
  value: TreeNodeRender}, 
  checkable: {
  value: false, 
  view: 1}, 
  handleMouseEvents: {
  value: false}, 
  isLeaf: {
  view: 1}, 
  expandIconEl: {}, 
  iconEl: {}, 
  selected: {
  view: 1}, 
  expanded: {
  sync: 0, 
  value: false, 
  view: 1}, 
  tooltip: {
  view: 1}, 
  tree: {
  getter: function() {
  _$jscoverage['/tree/node.js'].functionData[15]++;
  _$jscoverage['/tree/node.js'].lineData[284]++;
  var from = this;
  _$jscoverage['/tree/node.js'].lineData[285]++;
  while (visit43_285_1(from && !from.isTree)) {
    _$jscoverage['/tree/node.js'].lineData[286]++;
    from = from.get('parent');
  }
  _$jscoverage['/tree/node.js'].lineData[288]++;
  return from;
}}, 
  depth: {
  view: 1}, 
  focusable: {
  value: false}, 
  defaultChildCfg: {
  value: {
  xclass: 'tree-node'}}}, 
  xclass: 'tree-node'});
  _$jscoverage['/tree/node.js'].lineData[315]++;
  function onAddChild(e) {
    _$jscoverage['/tree/node.js'].functionData[16]++;
    _$jscoverage['/tree/node.js'].lineData[316]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[317]++;
    if (visit44_317_1(e.target == self)) {
      _$jscoverage['/tree/node.js'].lineData[318]++;
      updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[322]++;
  function onRemoveChild(e) {
    _$jscoverage['/tree/node.js'].functionData[17]++;
    _$jscoverage['/tree/node.js'].lineData[323]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[324]++;
    if (visit45_324_1(e.target == self)) {
      _$jscoverage['/tree/node.js'].lineData[325]++;
      recursiveSetDepth(self.get('tree'), e.component);
      _$jscoverage['/tree/node.js'].lineData[326]++;
      refreshCssForSelfAndChildren(self, e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[330]++;
  function syncAriaSetSize(e) {
    _$jscoverage['/tree/node.js'].functionData[18]++;
    _$jscoverage['/tree/node.js'].lineData[331]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[332]++;
    if (visit46_332_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[333]++;
      self.el.setAttribute('aria-setsize', self.get('children').length);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[338]++;
  function isNodeSingleOrLast(self) {
    _$jscoverage['/tree/node.js'].functionData[19]++;
    _$jscoverage['/tree/node.js'].lineData[339]++;
    var parent = self.get('parent'), children = visit47_340_1(parent && parent.get("children")), lastChild = visit48_341_1(children && children[children.length - 1]);
    _$jscoverage['/tree/node.js'].lineData[345]++;
    return visit49_345_1(!lastChild || visit50_345_2(lastChild == self));
  }
  _$jscoverage['/tree/node.js'].lineData[348]++;
  function isNodeLeaf(self) {
    _$jscoverage['/tree/node.js'].functionData[20]++;
    _$jscoverage['/tree/node.js'].lineData[349]++;
    var isLeaf = self.get("isLeaf");
    _$jscoverage['/tree/node.js'].lineData[351]++;
    return !(visit51_351_1(visit52_351_2(isLeaf === false) || (visit53_351_3(visit54_351_4(isLeaf === undefined) && self.get("children").length))));
  }
  _$jscoverage['/tree/node.js'].lineData[354]++;
  function getLastVisibleDescendant(self) {
    _$jscoverage['/tree/node.js'].functionData[21]++;
    _$jscoverage['/tree/node.js'].lineData[355]++;
    var children = self.get("children");
    _$jscoverage['/tree/node.js'].lineData[357]++;
    if (visit55_357_1(!self.get("expanded") || !children.length)) {
      _$jscoverage['/tree/node.js'].lineData[358]++;
      return self;
    }
    _$jscoverage['/tree/node.js'].lineData[361]++;
    return getLastVisibleDescendant(children[children.length - 1]);
  }
  _$jscoverage['/tree/node.js'].lineData[365]++;
  function getPreviousVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[22]++;
    _$jscoverage['/tree/node.js'].lineData[366]++;
    var prev = self.prev();
    _$jscoverage['/tree/node.js'].lineData[367]++;
    if (visit56_367_1(!prev)) {
      _$jscoverage['/tree/node.js'].lineData[368]++;
      prev = self.get('parent');
    } else {
      _$jscoverage['/tree/node.js'].lineData[370]++;
      prev = getLastVisibleDescendant(prev);
    }
    _$jscoverage['/tree/node.js'].lineData[372]++;
    return prev;
  }
  _$jscoverage['/tree/node.js'].lineData[376]++;
  function getNextVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[23]++;
    _$jscoverage['/tree/node.js'].lineData[377]++;
    var children = self.get("children"), n, parent;
    _$jscoverage['/tree/node.js'].lineData[380]++;
    if (visit57_380_1(self.get("expanded") && children.length)) {
      _$jscoverage['/tree/node.js'].lineData[381]++;
      return children[0];
    }
    _$jscoverage['/tree/node.js'].lineData[385]++;
    n = self.next();
    _$jscoverage['/tree/node.js'].lineData[386]++;
    parent = self;
    _$jscoverage['/tree/node.js'].lineData[387]++;
    while (visit58_387_1(!n && (parent = parent.get('parent')))) {
      _$jscoverage['/tree/node.js'].lineData[388]++;
      n = parent.next();
    }
    _$jscoverage['/tree/node.js'].lineData[390]++;
    return n;
  }
  _$jscoverage['/tree/node.js'].lineData[397]++;
  function refreshCss(self) {
    _$jscoverage['/tree/node.js'].functionData[24]++;
    _$jscoverage['/tree/node.js'].lineData[398]++;
    if (visit59_398_1(self.get && self.view)) {
      _$jscoverage['/tree/node.js'].lineData[399]++;
      self.view.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
    }
  }
  _$jscoverage['/tree/node.js'].lineData[403]++;
  function updateSubTreeStatus(self, c, depth, index) {
    _$jscoverage['/tree/node.js'].functionData[25]++;
    _$jscoverage['/tree/node.js'].lineData[404]++;
    var tree = self.get("tree");
    _$jscoverage['/tree/node.js'].lineData[405]++;
    if (visit60_405_1(tree)) {
      _$jscoverage['/tree/node.js'].lineData[406]++;
      recursiveSetDepth(tree, c, depth + 1);
      _$jscoverage['/tree/node.js'].lineData[407]++;
      refreshCssForSelfAndChildren(self, index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[411]++;
  function recursiveSetDepth(tree, c, setDepth) {
    _$jscoverage['/tree/node.js'].functionData[26]++;
    _$jscoverage['/tree/node.js'].lineData[412]++;
    if (visit61_412_1(setDepth !== undefined)) {
      _$jscoverage['/tree/node.js'].lineData[413]++;
      c.set("depth", setDepth);
    }
    _$jscoverage['/tree/node.js'].lineData[415]++;
    S.each(c.get("children"), function(child) {
  _$jscoverage['/tree/node.js'].functionData[27]++;
  _$jscoverage['/tree/node.js'].lineData[416]++;
  if (visit62_416_1(typeof setDepth == 'number')) {
    _$jscoverage['/tree/node.js'].lineData[417]++;
    recursiveSetDepth(tree, child, setDepth + 1);
  } else {
    _$jscoverage['/tree/node.js'].lineData[419]++;
    recursiveSetDepth(tree, child);
  }
});
  }
  _$jscoverage['/tree/node.js'].lineData[424]++;
  function refreshCssForSelfAndChildren(self, index) {
    _$jscoverage['/tree/node.js'].functionData[28]++;
    _$jscoverage['/tree/node.js'].lineData[425]++;
    refreshCss(self);
    _$jscoverage['/tree/node.js'].lineData[426]++;
    index = Math.max(0, index - 1);
    _$jscoverage['/tree/node.js'].lineData[427]++;
    var children = self.get('children'), c, len = children.length;
    _$jscoverage['/tree/node.js'].lineData[430]++;
    for (; visit63_430_1(index < len); index++) {
      _$jscoverage['/tree/node.js'].lineData[431]++;
      c = children[index];
      _$jscoverage['/tree/node.js'].lineData[432]++;
      refreshCss(c);
      _$jscoverage['/tree/node.js'].lineData[433]++;
      c.el.setAttribute("aria-posinset", index + 1);
    }
  }
});
