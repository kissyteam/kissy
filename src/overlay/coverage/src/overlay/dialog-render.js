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
if (! _$jscoverage['/overlay/dialog-render.js']) {
  _$jscoverage['/overlay/dialog-render.js'] = {};
  _$jscoverage['/overlay/dialog-render.js'].lineData = [];
  _$jscoverage['/overlay/dialog-render.js'].lineData[6] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[7] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[8] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[10] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[11] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[12] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[15] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[17] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[24] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[32] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[36] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[40] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[43] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[47] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[51] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[55] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[65] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[68] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[71] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[74] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[77] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[80] = 0;
  _$jscoverage['/overlay/dialog-render.js'].lineData[81] = 0;
}
if (! _$jscoverage['/overlay/dialog-render.js'].functionData) {
  _$jscoverage['/overlay/dialog-render.js'].functionData = [];
  _$jscoverage['/overlay/dialog-render.js'].functionData[0] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[1] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[2] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[3] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[4] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[5] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[6] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[7] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[8] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[9] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[10] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[11] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[12] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[13] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[14] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[15] = 0;
  _$jscoverage['/overlay/dialog-render.js'].functionData[16] = 0;
}
if (! _$jscoverage['/overlay/dialog-render.js'].branchData) {
  _$jscoverage['/overlay/dialog-render.js'].branchData = {};
  _$jscoverage['/overlay/dialog-render.js'].branchData['81'] = [];
  _$jscoverage['/overlay/dialog-render.js'].branchData['81'][1] = new BranchData();
}
_$jscoverage['/overlay/dialog-render.js'].branchData['81'][1].init(99, 23, 'footer && footer.html()');
function visit5_81_1(result) {
  _$jscoverage['/overlay/dialog-render.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/dialog-render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[0]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[7]++;
  var OverlayRender = require('./overlay-render');
  _$jscoverage['/overlay/dialog-render.js'].lineData[8]++;
  var DialogTpl = require('./dialog-xtpl');
  _$jscoverage['/overlay/dialog-render.js'].lineData[10]++;
  function _setStdModRenderContent(self, part, v) {
    _$jscoverage['/overlay/dialog-render.js'].functionData[1]++;
    _$jscoverage['/overlay/dialog-render.js'].lineData[11]++;
    part = self.control.get(part);
    _$jscoverage['/overlay/dialog-render.js'].lineData[12]++;
    part.html(v);
  }
  _$jscoverage['/overlay/dialog-render.js'].lineData[15]++;
  return OverlayRender.extend({
  beforeCreateDom: function(renderData) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[2]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[17]++;
  S.mix(renderData.elAttrs, {
  role: 'dialog', 
  'aria-labelledby': 'ks-stdmod-header-' + this.control.get('id')});
}, 
  createDom: function() {
  _$jscoverage['/overlay/dialog-render.js'].functionData[3]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[24]++;
  this.fillChildrenElsBySelectors({
  header: '#ks-stdmod-header-{id}', 
  body: '#ks-stdmod-body-{id}', 
  footer: '#ks-stdmod-footer-{id}'});
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/overlay/dialog-render.js'].functionData[4]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[32]++;
  return this.control.get('body');
}, 
  '_onSetBodyStyle': function(v) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[5]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[36]++;
  this.control.get('body').css(v);
}, 
  '_onSetHeaderStyle': function(v) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[6]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[40]++;
  this.control.get('header').css(v);
}, 
  '_onSetFooterStyle': function(v) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[7]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[43]++;
  this.control.get('footer').css(v);
}, 
  '_onSetBodyContent': function(v) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[8]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[47]++;
  _setStdModRenderContent(this, 'body', v);
}, 
  '_onSetHeaderContent': function(v) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[9]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[51]++;
  _setStdModRenderContent(this, 'header', v);
}, 
  '_onSetFooterContent': function(v) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[10]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[55]++;
  _setStdModRenderContent(this, 'footer', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: DialogTpl}}, 
  HTML_PARSER: {
  header: function(el) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[11]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[65]++;
  return el.one('.' + this.getBaseCssClass('header'));
}, 
  body: function(el) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[12]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[68]++;
  return el.one('.' + this.getBaseCssClass('body'));
}, 
  footer: function(el) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[13]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[71]++;
  return el.one('.' + this.getBaseCssClass('footer'));
}, 
  headerContent: function(el) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[14]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[74]++;
  return el.one('.' + this.getBaseCssClass('header')).html();
}, 
  bodyContent: function(el) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[15]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[77]++;
  return el.one('.' + this.getBaseCssClass('body')).html();
}, 
  footerContent: function(el) {
  _$jscoverage['/overlay/dialog-render.js'].functionData[16]++;
  _$jscoverage['/overlay/dialog-render.js'].lineData[80]++;
  var footer = el.one('.' + this.getBaseCssClass('footer'));
  _$jscoverage['/overlay/dialog-render.js'].lineData[81]++;
  return visit5_81_1(footer && footer.html());
}}});
});
