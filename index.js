var Id = require('objectid'),
	each = require('each'),
	indexOf = require('indexof'),
	clone = require('clone'),
	find = require('find');



function GraphNode(data){
	var id = data.id || new Id();
	var label = data.label || false;
	if(label) this.label = label;
	if(data.id) data.id = undefined;
	this.id = id;
	this.data = data;
	if(!this.__branches) this.__branches = [];
}

function isNode(n) {
	return n instanceof GraphNode;
}

GraphNode.prototype.branch = function (target, transition) {
	var branch = clone(target);
	delete branch.__branches;
	branch.id = target.id;
	branch.transition = transition;
	if(!transition || !transition instanceof String) {
		throw new Error('GraphNode#path expects a transition.');
	}
	if(!target instanceof GraphNode) {
		throw new Error('GraphNode#path Expects a GraphNode.');
	}
	if(!this.hasTransition(transition)) {
		this.__branches.push(branch);
	} else {
		console.error('Could not add ',target,'transition already exists.');
	}
	return this;
};

GraphNode.prototype.fanout = function(){
	return this.branches().length;
};

GraphNode.prototype.branches = function() {
	return this.__branches;
};

GraphNode.prototype.adjacentTo = function(target) {
	if (!isNode(target)) return false;
	for (var i = this.__branches.length - 1; i >= 0; i--) {
		if(this.__branches[i].id === target.id) return target;
	};
	return false;
};

GraphNode.prototype.hasTransition = function(transition) {
	for (var i = this.__branches.length - 1; i >= 0; i--) {
		if (this.__branches[i].transition && this.__branches[i].transition === transition) return true;
	};
	return false;
}




/**
 * Graph constructor
 */
function Graph(options){
	var key;
	this.nodes=[];
	if(options && options.acyclic) {
		this.__acyclic = true;
		delete options.acyclic;
	}
	this.options = {};
	for(key in options) {
		this.options[key]=options[key];
	}
}

/**
 * type checking
 * @param  {Object}  g should be a graph?
 * @return {Boolean}   whether it is
 */
function isGraph(g){
	return g instanceof Graph;	
}


/**
 * Recursively visit nodes and mark as visited
 * @param  {Graph} G the graph to search
 * @param  {GraphNode} v Starting point (any will typically work)
 * @return {Graph}   the modified graph with visited vertices marked.
 */
function dfs(G, v) {
	var key, branches = v.branches(), n;
	var node = G.node(v.id);
	if(v.visited) { 
		v.visited++;
		return G;
	}
	else {

	}
	v.visited = 1;
	for(key in branches) {
		n = G.node(branches[key].id);
		dfs(G,n);
	}
	return G;
}

function bfs(G,origin, destination) {
	var Q = [];
	var V = [];
	var intermediate, branches, node;
	Q.unshift(origin);
	V.push(origin);
	while(Q.length!==0) {
		intermediate = Q.shift();
		if(intermediate.id == destination.id) {
			return V;
		} else {
			branches = intermediate.branches();
			for (var i = branches.length - 1; i >= 0; i--) {
				node = G.node(branches[i].id);
				if(indexOf(V,node) === -1) {
					V.push(node);
					Q.unshift(node);
				}
			};
		}
	}
	return false;
}





Graph.prototype.__acyclic = false;

Graph.prototype.add = function(obj, label) {
	var node;
	if(obj instanceof GraphNode) node = obj;
	else node = new GraphNode(obj);

	/*Ensure unique labels*/
	if(label) {
		var n; 
		if(!n = this.findByLabel(label)) {
			node.label = label;
		} else {
			console.error('The label \''+label+'\' is already taken.',n);	
		}
	}

	if (!this.has(node)) this.nodes.push(node);

	return node;
};

Graph.prototype.adjacent = function (source, target) {
	if (!(this.has(source)&&this.has(target))) return false;
	return source.adjacentTo(target) || target.adjacentTo(source);
};

Graph.prototype.connect = function(source,target,transition) {
	if( !(isNode(source) && isNode(target)) ) throw new Error('Graph#connect expects a source GraphNode and a target GraphNode.');
	if(!transition) throw new Error('Graph#connect expects a valid transition identifier.');
	source.branch(target, transition);
	return this;
};

Graph.prototype.cyclic = function(n) {
	var start = n || (this.nodes.length > 0 && this.nodes[0]);
	dfs(this,start);
	return start.visited > 1;
};

Graph.prototype.hasCycle = Graph.prototype.cyclic;

Graph.prototype.find = function (conditions) {
	return find(this.nodes, function(node){
		var i;
		for(i in conditions) {
			if(node[i]!=conditions[i]) {
				return false;
			}
		}
		return node;
	});
};

Graph.prototype.findByLabel = function(label) {
	return this.find({label:label});
};

Graph.prototype.has = function(node) {
	for (var i = this.nodes.length - 1; i >= 0; i--) {
		if(this.nodes[i].id === node.id) return node;
	};
	return false;
};


Graph.prototype.loopsAt = function(){
	for (var i = this.nodes.length - 1; i >= 0; i--) {
		if(this.nodes[i].visited && this.nodes[i].visited > 1 ) {
			return this.nodes[i];
		}
	};
	return undefined;
};

Graph.prototype.node = function(id) {
	for (var i = this.nodes.length - 1; i >= 0; i--) {
		if(this.nodes[i].id === id) return this.nodes[i];
	};
	return false;
};

Graph.prototype.pathBetween = function ( a, b ) {
	this.untraverse();
	return bfs(this,a,b);
};

Graph.prototype.remove = function(node) {
	var id = node.id;
	if(!id) return console.error('node does not exist');
	for (var i = this.nodes.length - 1; i >= 0; i--) {
		var branches = this.nodes[i].branches();
		for (var i = branches.length - 1; i >= 0; i--) {
			if (branches[i].id ===id) {
				branches.splice(i,1);
			}
		};
		var key = indexOf(this.nodes,node);
		this.nodes.splice(key, 1);
	};
};

Graph.prototype.size = function() {
	return this.nodes.length;
};

Graph.prototype.toJSON = function() {
	return JSON.stringify(this);
};

Graph.prototype.untraverse = function() {
	for (var i = this.nodes.length - 1; i >= 0; i--) {
		this.nodes[i].visited = false;
	};
	return this;
};

module.exports = Graph;