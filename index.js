/**
* @fileOverview A view renderer based on a simple configuration object.
* @author Keith Showalter {@link https://github.com/kshowalter}
* @version 0.1.0
*/


/** @module SimpleDOM */
var $ = require('simpledom');


var configChanged = function(newSpecs, oldSpecs){
  if( newSpecs !== oldSpecs ){
    return true;
  } else if( newSpecs.tag !== oldSpecs.tag ){
    return true;
  } else if( newSpecs.props !== oldSpecs.props ){
    return true;
  } else if( newSpecs.children !== oldSpecs.children ){
    return true;
  } else {
    return false;
  }
};

var mkNode = function(specs){

  specs.meta = specs.meta || {};
  var sdom;
  if( specs.constructor === Object ){ // CONFIG
    sdom = $(specs.tag, {namespaceURI: specs.meta.namespaceURI});
    if( specs.props ){
      for( var name in specs.props ){
        sdom.attr(name, specs.props[name]);
      }
    }
    if( specs.text ){
      sdom.text( specs.text );
    }
  } else if( specs.constructor.prototype === HTMLElement || specs instanceof SVGElement ) { // NODE ELEMENT
    sdom = specs;
  } else {
    console.warn('node specs not recognized:', specs);
    sdom = undefined;
  }
  return sdom;
};



//if( isSVG ){
//  props.xmlns = props.xmlns || 'http://www.w3.org/2000/svg';
//  props['xmlns:xlink'] = props['xmlns:xlink'] || 'http://www.w3.org/1999/xlink';
//}


/**
* mkDOM - Makes DOM Element from a ConfigDOM specs object
* @function
* @param  {object} specs ConfigDOM specs object
* @return {element} DOM Element
*/
var mkDOM = function mkDOM(newParentSpecs, newSpecs, oldParentSpecs, oldSpecs){
  //var _id = specs._id;
  //console.log(newParentSpecs.sdom.elem, newParentSpecs.sdom.elem.namespaceURI);
  //console.log(newParentSpecs, newSpecs, oldParentSpecs, oldSpecs);

  //console.log(newParentSpecs.sdom.elem, newParentSpecs.sdom.elem.namespaceURI, newSpecs.meta.namespaceURI);
  //var parent_id = _id.split('.').slice(0,-1).join('.');

  //var oldNode = this.elements[_id];
  //var newNode;

  //console.log('#specs ', newSpecs, oldSpecs);

  if( newSpecs && newSpecs.constructor === String ){ // TEXT NODE
    //sdom = document.createTextNode(specs);
    newSpecs = {
      tag: 'span',
      text: newSpecs
    };
  }


  var sdom;
  if ( newSpecs && !oldSpecs ) { // NEW
    sdom = mkNode(newSpecs);
    newSpecs.sdom = sdom;
    newParentSpecs.sdom.append(sdom);
  } else if( !newSpecs && oldSpecs ){ // DELETE
    oldParentSpecs.sdom.elem.removeChild(oldSpecs.sdom.elem);
  } else if( newSpecs && configChanged(newSpecs, oldSpecs) ){ // CHANGE
    oldParentSpecs.sdom.elem.removeChild(oldSpecs.sdom.elem);
    sdom = mkNode(newSpecs);
    newSpecs.sdom = sdom;
    newParentSpecs.sdom.append(sdom);
  } else if( newSpecs ){ // CHECK
    console.log('SAME');
  }

  var newLength = ( newSpecs && newSpecs.children && newSpecs.children.length ) || 0;
  var oldLength = ( oldSpecs && oldSpecs.children && oldSpecs.children.length ) || 0;

  for (var i = 0; i < newLength || i < oldLength; i++) {
    var oldChild = oldSpecs && oldSpecs.children && oldSpecs.children[i];
    var newChild = newSpecs && newSpecs.children && newSpecs.children[i];
    //var oldChild = ( oldSpecs && oldSpecs.children && oldSpecs.children[i] ) || undefined;
    //var newChild = ( newSpecs && newSpecs.children && newSpecs.children[i] ) || undefined;
    //console.log(newSpecs, newChild, oldSpecs, oldChild);
    var specs = mkDOM(newSpecs, newChild, oldSpecs, oldChild);
    if( newSpecs ){
      newSpecs.children = newSpecs.children || {};
      newSpecs.children[i] = specs;
    }
  }

  return newSpecs;
};



/**
* ConfigDOM constructor
* @exports test
* @constructor ConfigDOM
* @param  {string} id id of the parent element
* @return {object} ConfigDOM object
*/
module.exports = function(id){
  //module.exports = function(id){ // DOM id
  var C = {
    anchorID: id,
    specs: undefined,
    //elements: {
    //  'r': $(id)
    //},
    rootSDOM: $(id),
    rootSpecs: {
      sdom: $(id),
      meta: {}
    },
    load: function(newSpecs){
      if( ! newSpecs ){
        console.warn('specDOML: no specs provided');
        return false;
      }
      if( newSpecs.constructor === Object ){
        //newSpecs._id = 'r.0';
        this.specs = mkDOM(this.rootSpecs, newSpecs, this.rootSpecs, this.specs);
      } else if(newSpecs.constructor === Array ){
        for( var i = 0; i < newSpecs.length; i++ ){
          //newSpecs[i]._id = 'r.'+i;
          this.mkDOM(this.rootSpecs, newSpecs[i], this.rootSpecs, this.specs);
        }
      } else {
        console.log('Invalid DOM specs.');
      }
    }
  };


  return C;
};
