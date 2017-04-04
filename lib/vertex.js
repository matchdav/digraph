var Emitter = require('component-emitter'),
    Id = require('lodash.uniqueid');


/**
 * Vertex constructor
 * @param {Object} data any old data.
 */
function Vertex ( data, name ) {

    this.id = data.id || Id();
    var label = name || data.label || false;
    if(label) this.label = label;
    else this.label = data;
    this.data = data;
    if(!this.__outbranches) this.__outbranches = [];
    if(!this.__inbranches) this.__inbranches = [];

}


Emitter(Vertex.prototype);



Vertex.prototype.findBranch = function(id) {
    var branches = this.branches();
    for (var i = branches.length - 1; i >= 0; i--) {
        if(branches[i].id===id){
            return branches[i];
        }
    }
};

Vertex.prototype.branchOut = function (target, label) {
    if(!label || !label instanceof String) {
        throw new Error('Vertex#path expects a label.');
    }
    if(!target instanceof Vertex) {
        throw new Error('Vertex#path Expects a Vertex.');
    }
    var branch = { id:target.id, label:target.label };
    if(!this.hasTransition(label)) {
        this.__outbranches.push(branch);
    } else {
        console.error('Could not add ',target,'label already exists.');
    }
    return this;
};

Vertex.prototype.branchIn = function (chaser, label) {
    if(!label || !label instanceof String) {
        throw new Error('Vertex#path expects a label.');
    }
    if(!chaser instanceof Vertex) {
        throw new Error('Vertex#path Expects a Vertex.');
    }
    var incoming = { id:chaser.id, label:chaser.label };
    this.__inbranches.push(incoming);
    return this;
};

Vertex.prototype.fanout = function(){
    return this.branches().length;
};
Vertex.prototype.fanin = function(){
    return this.incomings().length;
};

Vertex.prototype.outDegree = Vertex.prototype.fanout;

Vertex.prototype.branches = function() {
    return this.__outbranches;
};


Vertex.prototype.incomings = function() {
    return this.__inbranches;
};

Vertex.prototype.outBranches = Vertex.prototype.branches;
Vertex.prototype.inBranches = Vertex.prototype.incomings;

Vertex.prototype.adjacentTo = function(target) {
    if (!isNode(target)) return false;
    for (var i = this.__outbranches.length - 1; i >= 0; i--) {
        if(this.__outbranches[i].id === target.id) return target;
    }
    return false;
};

Vertex.prototype.hasTransition = function(label) {
    for (var i = this.__outbranches.length - 1; i >= 0; i--) {
        if (this.__outbranches[i].label && this.__outbranches[i].label === label) return true;
    }
    return false;
};

Vertex.prototype.unBranchIn = function ( source, label ) {
    var id = source.id || source;
    for (var i = 0; i < this.__inbranches.length; i++) {
        if(id === this.__inbranches[i].id) {
            this.__inbranches.splice(i,1);
            return this;
        }
    };
};

Vertex.prototype.unBranchOut = function (sink, label ) {
    var id = sink.id || sink;
    for (var i = 0; i < this.__outbranches.length; i++) {
        if(id === this.__outbranches[i].id) {
            this.__outbranches.splice(i,1);
            return this;
        }
    };
};


module.exports = Vertex;
