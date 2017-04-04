var Emitter = require('component-emitter'),
    Id = require('lodash.uniqueid');

/**
 * Edge constructor
 */

function Edge ( origin, destination, label , data) {
    this.__origin = origin;
    this.__destination = destination;
    this.__labels = [label];
    this.__label = label;
    this.__data = data;
}

Emitter(Edge.prototype);

/**
 * Add a label to the edge
 * @param {String} label
 */
Edge.prototype.addLabel = function(label) {
    if(!this.hasLabel(label)) {
        this.__labels.push(label);
    }
    return this;
};

/*getters*/
/*sometimes I forget what things are called.  I need a lot of aliases eh.  */
Edge.prototype.source = Edge.prototype.origin = function(){
    return this.__origin;
};
Edge.prototype.destination = Edge.prototype.target = Edge.prototype.sink = function(){
    return this.__destination;
};

Edge.prototype.label = function(){
    if(this.__label) return this.__label;
    var labels = this.__labels;
    if(labels.length===1) return labels.pop();
    else if (labels.length>1) return labels.join(', ');
    else return false;
};

Edge.prototype.data = function(){
    return this.__data;
};

/**
 * Does the label exist
 * @param  {String}  label
 * @return {Boolean}
 */
Edge.prototype.hasLabel = function(label) {
    for (var i = 0; i < this.__labels.length; i++) {
        if(this.__labels[i]==label) return true;
    }
    return false;
};


module.exports = Edge;
