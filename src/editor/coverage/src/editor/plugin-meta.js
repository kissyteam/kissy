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
if (! _$jscoverage['/editor/plugin-meta.js']) {
  _$jscoverage['/editor/plugin-meta.js'] = {};
  _$jscoverage['/editor/plugin-meta.js'].lineData = [];
  _$jscoverage['/editor/plugin-meta.js'].lineData[3] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[4] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[6] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[10] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[14] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[18] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[22] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[26] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[30] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[34] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[38] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[42] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[46] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[50] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[54] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[58] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[62] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[66] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[70] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[74] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[78] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[82] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[86] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[90] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[94] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[98] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[102] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[106] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[110] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[114] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[118] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[122] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[126] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[130] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[134] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[138] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[142] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[146] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[150] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[154] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[158] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[162] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[166] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[170] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[174] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[178] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[182] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[186] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[190] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[194] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[198] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[202] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[206] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[210] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[214] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[218] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[222] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[226] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[230] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[234] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[238] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[242] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[246] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[250] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[254] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[258] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[262] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[266] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[270] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[274] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[278] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[282] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[286] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[290] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[294] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[298] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[302] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[306] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[310] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[314] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[318] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[322] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[326] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[330] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[334] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[338] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[342] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[346] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[350] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[354] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[358] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[363] = 0;
}
if (! _$jscoverage['/editor/plugin-meta.js'].functionData) {
  _$jscoverage['/editor/plugin-meta.js'].functionData = [];
  _$jscoverage['/editor/plugin-meta.js'].functionData[0] = 0;
  _$jscoverage['/editor/plugin-meta.js'].functionData[1] = 0;
  _$jscoverage['/editor/plugin-meta.js'].functionData[2] = 0;
}
if (! _$jscoverage['/editor/plugin-meta.js'].branchData) {
  _$jscoverage['/editor/plugin-meta.js'].branchData = {};
}
_$jscoverage['/editor/plugin-meta.js'].lineData[3]++;
KISSY.add(function() {
  _$jscoverage['/editor/plugin-meta.js'].functionData[0]++;
  _$jscoverage['/editor/plugin-meta.js'].lineData[4]++;
  (function(config, Features, UA) {
  _$jscoverage['/editor/plugin-meta.js'].functionData[1]++;
  _$jscoverage['/editor/plugin-meta.js'].lineData[6]++;
  config({
  'editor/plugin/back-color': {
  requires: ['editor/plugin/color/btn', 'editor/plugin/back-color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[10]++;
  config({
  'editor/plugin/back-color/cmd': {
  requires: ['editor/plugin/color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[14]++;
  config({
  'editor/plugin/bold': {
  requires: ['editor/plugin/font/ui', 'editor/plugin/bold/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[18]++;
  config({
  'editor/plugin/bold/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[22]++;
  config({
  'editor/plugin/bubble': {
  requires: ['overlay', 'editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[26]++;
  config({
  'editor/plugin/button': {
  requires: ['editor', 'button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[30]++;
  config({
  'editor/plugin/checkbox-source-area': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[34]++;
  config({
  'editor/plugin/code': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/dialog-loader']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[38]++;
  config({
  'editor/plugin/code/dialog': {
  requires: ['editor', 'menubutton', 'editor/plugin/dialog']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[42]++;
  config({
  'editor/plugin/color/btn': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/overlay', 'editor/plugin/dialog-loader']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[46]++;
  config({
  'editor/plugin/color/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[50]++;
  config({
  'editor/plugin/color/dialog': {
  requires: ['editor', 'editor/plugin/dialog']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[54]++;
  config({
  'editor/plugin/contextmenu': {
  requires: ['editor', 'menu', 'editor/plugin/focus-fix', 'event']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[58]++;
  config({
  'editor/plugin/dent-cmd': {
  requires: ['editor', 'editor/plugin/list-utils']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[62]++;
  config({
  'editor/plugin/dialog-loader': {
  requires: ['editor', 'overlay']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[66]++;
  config({
  'editor/plugin/dialog': {
  requires: ['editor', 'overlay', 'editor/plugin/focus-fix', 'dd/plugin/constrain', 'component/plugin/drag']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[70]++;
  config({
  'editor/plugin/draft': {
  requires: ['editor', 'json', 'event', 'editor/plugin/local-storage', 'overlay', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[74]++;
  config({
  'editor/plugin/drag-upload': {
  requires: ['editor', 'event']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[78]++;
  config({
  'editor/plugin/element-path': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[82]++;
  config({
  'editor/plugin/fake-objects': {
  requires: ['editor', 'html-parser']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[86]++;
  config({
  'editor/plugin/flash-bridge': {
  requires: ['editor', 'swf', 'event']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[90]++;
  config({
  'editor/plugin/flash-common/base-class': {
  requires: ['editor/plugin/flash-common/utils', 'base', 'editor', 'editor/plugin/dialog-loader', 'editor/plugin/bubble', 'editor/plugin/contextmenu']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[94]++;
  config({
  'editor/plugin/flash-common/utils': {
  requires: ['swf']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[98]++;
  config({
  'editor/plugin/flash': {
  requires: ['editor', 'editor/plugin/flash-common/base-class', 'editor/plugin/flash-common/utils', 'editor/plugin/fake-objects', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[102]++;
  config({
  'editor/plugin/flash/dialog': {
  requires: ['editor', 'editor/plugin/flash-common/utils', 'editor/plugin/dialog', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[106]++;
  config({
  'editor/plugin/focus-fix': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[110]++;
  config({
  'editor/plugin/font-family': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/font-family/cmd', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[114]++;
  config({
  'editor/plugin/font-family/cmd': {
  requires: ['editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[118]++;
  config({
  'editor/plugin/font-size': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/font-size/cmd', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[122]++;
  config({
  'editor/plugin/font-size/cmd': {
  requires: ['editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[126]++;
  config({
  'editor/plugin/font/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[130]++;
  config({
  'editor/plugin/font/ui': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[134]++;
  config({
  'editor/plugin/fore-color': {
  requires: ['editor/plugin/color/btn', 'editor/plugin/fore-color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[138]++;
  config({
  'editor/plugin/fore-color/cmd': {
  requires: ['editor/plugin/color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[142]++;
  config({
  'editor/plugin/heading': {
  requires: ['editor/plugin/menubutton', 'editor', 'editor/plugin/heading/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[146]++;
  config({
  'editor/plugin/heading/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[150]++;
  config({
  'editor/plugin/image': {
  requires: ['editor/plugin/button', 'editor', 'editor/plugin/bubble', 'editor/plugin/dialog-loader', 'editor/plugin/contextmenu']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[154]++;
  config({
  'editor/plugin/image/dialog': {
  requires: ['editor', 'io', 'editor/plugin/dialog', 'tabs', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[158]++;
  config({
  'editor/plugin/indent': {
  requires: ['editor', 'editor/plugin/indent/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[162]++;
  config({
  'editor/plugin/indent/cmd': {
  requires: ['editor/plugin/dent-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[166]++;
  config({
  'editor/plugin/italic': {
  requires: ['editor/plugin/font/ui', 'editor/plugin/italic/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[170]++;
  config({
  'editor/plugin/italic/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[174]++;
  config({
  'editor/plugin/justify-center': {
  requires: ['editor', 'editor/plugin/justify-center/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[178]++;
  config({
  'editor/plugin/justify-center/cmd': {
  requires: ['editor/plugin/justify-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[182]++;
  config({
  'editor/plugin/justify-cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[186]++;
  config({
  'editor/plugin/justify-left': {
  requires: ['editor', 'editor/plugin/justify-left/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[190]++;
  config({
  'editor/plugin/justify-left/cmd': {
  requires: ['editor/plugin/justify-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[194]++;
  config({
  'editor/plugin/justify-right': {
  requires: ['editor', 'editor/plugin/justify-right/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[198]++;
  config({
  'editor/plugin/justify-right/cmd': {
  requires: ['editor/plugin/justify-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[202]++;
  config({
  'editor/plugin/link': {
  requires: ['editor/plugin/button', 'editor/plugin/bubble', 'editor', 'editor/plugin/link/utils', 'editor/plugin/dialog-loader']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[206]++;
  config({
  'editor/plugin/link/dialog': {
  requires: ['editor', 'editor/plugin/dialog', 'editor/plugin/link/utils']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[210]++;
  config({
  'editor/plugin/link/utils': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[214]++;
  config({
  'editor/plugin/list-utils': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[218]++;
  config({
  'editor/plugin/list-utils/btn': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[222]++;
  config({
  'editor/plugin/list-utils/cmd': {
  requires: ['editor', 'editor/plugin/list-utils']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[226]++;
  config({
  'editor/plugin/local-storage': {
  requires: ['editor', 'overlay', 'editor/plugin/flash-bridge']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[230]++;
  config({
  'editor/plugin/maximize': {
  requires: ['editor/plugin/maximize/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[234]++;
  config({
  'editor/plugin/maximize/cmd': {
  requires: ['editor', 'event']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[238]++;
  config({
  'editor/plugin/menubutton': {
  requires: ['editor', 'menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[242]++;
  config({
  'editor/plugin/ordered-list': {
  requires: ['editor/plugin/list-utils/btn', 'editor/plugin/ordered-list/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[246]++;
  config({
  'editor/plugin/ordered-list/cmd': {
  requires: ['editor', 'editor/plugin/list-utils/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[250]++;
  config({
  'editor/plugin/outdent': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/outdent/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[254]++;
  config({
  'editor/plugin/outdent/cmd': {
  requires: ['editor', 'editor/plugin/dent-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[258]++;
  config({
  'editor/plugin/overlay': {
  requires: ['editor', 'overlay', 'editor/plugin/focus-fix']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[262]++;
  config({
  'editor/plugin/page-break': {
  requires: ['editor', 'editor/plugin/fake-objects', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[266]++;
  config({
  'editor/plugin/preview': {
  requires: ['editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[270]++;
  config({
  'editor/plugin/progressbar': {
  requires: ['base']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[274]++;
  config({
  'editor/plugin/remove-format': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/remove-format/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[278]++;
  config({
  'editor/plugin/remove-format/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[282]++;
  config({
  'editor/plugin/resize': {
  requires: ['dd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[286]++;
  config({
  'editor/plugin/separator': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[290]++;
  config({
  'editor/plugin/smiley': {
  requires: ['editor', 'editor/plugin/overlay', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[294]++;
  config({
  'editor/plugin/source-area': {
  requires: ['editor', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[298]++;
  config({
  'editor/plugin/strike-through': {
  requires: ['editor/plugin/font/ui', 'editor/plugin/strike-through/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[302]++;
  config({
  'editor/plugin/strike-through/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[306]++;
  config({
  'editor/plugin/table': {
  requires: ['editor', 'editor/plugin/dialog-loader', 'editor/plugin/contextmenu', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[310]++;
  config({
  'editor/plugin/table/dialog': {
  requires: ['editor', 'editor/plugin/dialog', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[314]++;
  config({
  'editor/plugin/underline': {
  requires: ['editor/plugin/font/ui', 'editor/plugin/underline/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[318]++;
  config({
  'editor/plugin/underline/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[322]++;
  config({
  'editor/plugin/undo': {
  requires: ['editor', 'editor/plugin/undo/btn', 'editor/plugin/undo/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[326]++;
  config({
  'editor/plugin/undo/btn': {
  requires: ['editor/plugin/button', 'editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[330]++;
  config({
  'editor/plugin/undo/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[334]++;
  config({
  'editor/plugin/unordered-list': {
  requires: ['editor/plugin/list-utils/btn', 'editor/plugin/unordered-list/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[338]++;
  config({
  'editor/plugin/unordered-list/cmd': {
  requires: ['editor', 'editor/plugin/list-utils/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[342]++;
  config({
  'editor/plugin/video': {
  requires: ['editor', 'editor/plugin/flash-common/utils', 'editor/plugin/flash-common/base-class', 'editor/plugin/fake-objects', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[346]++;
  config({
  'editor/plugin/video/dialog': {
  requires: ['editor', 'io', 'editor/plugin/flash/dialog', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[350]++;
  config({
  'editor/plugin/word-filter': {
  requires: ['html-parser']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[354]++;
  config({
  'editor/plugin/xiami-music': {
  requires: ['editor', 'editor/plugin/flash-common/base-class', 'editor/plugin/flash-common/utils', 'editor/plugin/fake-objects', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[358]++;
  config({
  'editor/plugin/xiami-music/dialog': {
  requires: ['editor', 'editor/plugin/flash/dialog', 'editor/plugin/menubutton']}});
})(function(c) {
  _$jscoverage['/editor/plugin-meta.js'].functionData[2]++;
  _$jscoverage['/editor/plugin-meta.js'].lineData[363]++;
  KISSY.config('modules', c);
}, KISSY.Features, KISSY.UA);
});
