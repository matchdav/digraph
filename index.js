var Id = require('objectid'),
	each = require('each'),
	indexOf = require('indexof'),
	clone = require('clone'),
	find = require('find'),
	Emitter = require('emitter');

var colors = ['red','blue','green','yellow'];

/**
 * Vertex constructor
 * @param {Object} data any old data.
 */
function Vertex(data,name){
	this.id = data.id || Id();
	var label = name || data.label || false;
	if(label) this.label = label;
	else this.label = data;
	this.data = data;
	console.log('created vertex,',this);
	if(!this.__outbranches) this.__outbranches = [];
	if(!this.__inbranches) this.__inbranches = [];
}

Emitter(Vertex.prototype);

function isNode(n) {
	return n instanceof Vertex;
}
function isEdge(e) {
	return e instanceof Edge;
}

Vertex.prototype.findBranch = function(id) {
	var branches = this.branches();
	for (var i = branches.length - 1; i >= 0; i--) {
		if(branches[i].id===id){
			return branches[i];
		}
	};
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
	};
	return false;
};

Vertex.prototype.hasTransition = function(label) {
	for (var i = this.__outbranches.length - 1; i >= 0; i--) {
		if (this.__outbranches[i].label && this.__outbranches[i].label === label) return true;
	};
	return false;
}


/**
 * Edge constructor
 */

function Edge ( origin, destination, label , data) {
	this.__origin = origin;
	this.__destination = destination;
	this.__label = label;
	this.__data = data;
}

Emitter(Edge.prototype);

/*Return the starting vertext*/
Edge.prototype.source = Edge.prototype.origin = function(){
	return this.__origin;
};

/*Return the ending vertext*/
Edge.prototype.target = function(){
	return this.__destination;
};

Edge.prototype.label = function(){
	return this.__label;
}

/*return the label*/
Edge.prototype.data = function(){
	return this.__data;
};


/**
 * Graph constructor
 * @param {Object} options a hash of options
 */
function Graph(options){
	var key;
	this.__vertices=[];
	if(options && options.acyclic) {
		this.__acyclic = true;
		delete options.acyclic;
	}
	this.options = {};
	this.__edges = [];
	for(key in options) {
		this.options[key]=options[key];
	}
}

Emitter(Graph.prototype);

/**
 * type checking
 * @param  {Object}  g should be a graph?
 * @return {Boolean}   whether it is
 */
function isGraph(g){
	return g instanceof Graph;	
}


/**
 * Recursively visit vertexs and mark as visited
 * @param  {Graph} G the graph to search
 * @param  {Vertex} v Starting point (any will typically work)
 * @return {Graph}   the modified graph with visited vertices marked.
 * @api private
 */
function DFS(G, v) {
	var key, branches = v.branches(), n;
	var vertex = G.vertex(v.id);
	if(v.visited) { 
		v.visited++;
		return G;
	} 
	v.visited = 1;
	for(key in branches) {
		n = G.vertex(branches[key].id);
		DFS(G,n);
	}
	return G;
}

/**
 * Find a path between 2 vertexs in a graph
 * @param {Graph} G           the input graph
 * @param {Vertex} origin      
 * @param {Vertext} destination 
 */
function BFS(G, origin, destination) {
	var Q = [];
	var V = [];
	var intermediate, branches, vertex;
	Q.unshift(origin);
	V.push(origin);
	while(Q.length!==0) {
		intermediate = Q.shift();
		if(intermediate.id == destination.id) {
			return Path(V);
		} else {
			branches = intermediate.branches();
			for (var i = branches.length - 1; i >= 0; i--) {
				vertex = G.vertex(branches[i].id);
				if(indexOf(V,vertex) === -1) {
					V.push(vertex);
					Q.unshift(vertex);
				}
			};
		}
	}
	return false;
}


/**
 * Build a path from the list of vertices
 * @param {Array} vertices 
 */
function Path(vertices){
	var path = [], prev, next;
	for (var i = vertices.length - 1; i > 0; i--) {
		prev = vertices[i-1],next = vertices[i],label = prev.findBranch(next.id).label;
		var e = new Edge(prev.id, next.id, label); 
		path.unshift(e);
	};
	return path;
}

Graph.prototype.__acyclic = false;

Graph.prototype.add = function(obj, label) {
	var vertex;
	if(obj instanceof Vertex) vertex = obj;
	else vertex = new Vertex(obj);

	/*Ensure unique labels*/
	if(label) {
		var n; 
		if(! (n = this.findVertexByLabel(label)) ) {
			vertex.label = label;
		} else {
			console.error('The label \''+label+'\' is already taken.',n);	
		}
	}

	if (!this.has(vertex)) this.__vertices.push(vertex);
	this.emit('add:vertex',vertex);
	if(obj instanceof Vertex) return this;
	else return vertex;
};

Graph.prototype.adjacent = function (source, target) {
	if (!(this.has(source)&&this.has(target))) return false;
	return source.adjacentTo(target) || target.adjacentTo(source);
};


Graph.prototype.connect = function(source,target,label) {
	if( !(isNode(source) && isNode(target)) ) throw new Error('Graph#connect expects a source Vertex and a target Vertex.');
	if(!label) throw new Error('Graph#connect expects a valid label identifier.');
	source.branchOut(target, label);
	target.branchIn(source,label);
	if(this.edgeExists(source,target,label)) return this;
	var edge = new Edge(source,target,label);
	this.__edges.push(edge);
	this.emit('add:edge',edge);
	return this;
};

/**
 * Whether or not a cycle exists given a starting vertex.
 * @param  {Vertex} n 
 * @return {Boolean}   
 */
Graph.prototype.cyclic = function(n) {
	var start = n || (this.__vertices.length > 0 && this.__vertices[0]);
	DFS(this,start);
	return start.visited > 1;
};

/**
 * Remove edge, if it exists.
 * @param  {Vertex} a     
 * @param  {Vertex} b     
 * @param  {String} label 
 * @return {Graph}       
 */
Graph.prototype.disconnect = function(a,b,label){
	return this;
}


/**
 * whether or not the edge already exists.
 * @param  {Vertex} source vertex
 * @param  {Vertex} target vertex
 * @param  {String} label  the label of the transition
 * @return {Boolean}        
 */
Graph.prototype.edgeExists = function(origin,destination,label) {
	var edge;
	console.log('edge checking');
	for (var i = 0; i < this.__edges.length; i++) {
		edge = this.__edges[i];
		if(edge.__origin ===origin && edge.__destination ===destination && edge.__label ===label ) return true;
	};
	return false;
};

/**
 * Find a vertex with the given query
 * @param  {Object} conditions search query parameters
 * @return {Vertex}            Vertex or false.
 */
Graph.prototype.findVertex = function (conditions) {
	return find(this.__vertices, function(vertex){
		var i;
		for(i in conditions) {
			if(vertex[i]!=conditions[i]) {
				return false;
			}
		}
		return vertex;
	});
};

Graph.prototype.findVertexByLabel = function(label) {
	return this.findVertex({label:label});
};

Graph.prototype.findVertexById = function(id) {
	for (var i = this.__vertices.length - 1; i >= 0; i--) {
		if(this.__vertices[i].id === id) return this.__vertices[i];
	};
	return false;
};


/**
 * Whether the vertex is in the graph
 * @param  {Vertex}  vertex 
 * @return {Mixed}        truthy vertex or false.
 */
Graph.prototype.has = function(vertex) {
	for (var i = this.__vertices.length - 1; i >= 0; i--) {
		if(this.__vertices[i].id === vertex.id) return vertex;
	};
	return false;
};

Graph.prototype.hasCycle = Graph.prototype.cyclic;


/**
 * The vertex at which a path loops back, i.e. the start and end point of a cycle.
 * @return {Vertex}
 */
Graph.prototype.loopsAt = function(){
	for (var i = this.__vertices.length - 1; i >= 0; i--) {
		if(this.__vertices[i].visited && this.__vertices[i].visited > 1 ) {
			return this.__vertices[i];
		}
	};
	return undefined;
};

/**
 * The number of vertices in the graph
 * @return {Number} 
 */
Graph.prototype.order = function() {
	return this.__vertices.length;
};


/**
 * Return a path between a and b if it exists, otherwise return false.
 * @param  {Vertex} a starting vertex
 * @param  {Vertex} b final vertex
 * @return {Mixed}   an ordered array of edges, or false.
 */
Graph.prototype.pathBetween = function ( a, b ) {
	this.untraverse();
	return BFS(this,a,b);
};

/**
 * Find the vertex and remove it, if it exists.
 * @param  {Vertex} vertex 
 * @return {Graph}        the modified graph
 */
Graph.prototype.remove = function(vertex) {
	var id = vertex.id,target;
	if(!id) return console.error('vertex does not exist');
	for (var i = this.__vertices.length - 1; i >= 0; i--) {
		var outBranches = this.__vertices[i].outBranches();
		for (var i = outBranches.length - 1; i >= 0; i--) {
			if (outBranches[i].id ===id) {
				target = this.findVertexById(outBranches[i].id);
				this.removeEdge(vertex,target,outBranches[i].label);
				outBranches.splice(i,1);
			}
		};
		var key = indexOf(this.__vertices,vertex);
		this.__vertices.splice(key, 1);
	};
	return this;
};

/**
 * Find an edge and remove it.
 * @param  {Vertex} source 
 * @param  {Vertex} target 
 * @param  {String} label  the edge's label
 * @return {Graph}        
 */
Graph.prototype.removeEdge = function(source,target,label) {
	for (var j = 0; j < this.__edges.length; j++) {
		if (this.__edges[j].source()===source && this.__edges[j].target()===target && this.__edges[j].label()===label) {
			this.__edges.splice(j,1);
			return this;
		}
	}
	return this;
};

Graph.prototype.removeVertex = Graph.prototype.remove;


/**
 * the number of edges in the graph
 * @return {Number} 
 */
Graph.prototype.size = function(){
	return this.__edges.length;
}

/**
 * Data-serializable (typically for storage but whatever you like)
 * @return {Object} A JSON representation of the graph
 */
Graph.prototype.toJSON = function() {
	return JSON.parse(JSON.stringify(this));
};


/**
 * Remove all vertex and edge labels
 * @return {[type]} [description]
 */
Graph.prototype.untraverse = function() {
	for (var i = this.__vertices.length - 1; i >= 0; i--) {
		this.__vertices[i].visited = false;
		this.__vertices[i].color = undefined;
	};
	for (var j = 0; j < this.__edges.length; j++) {
		this.__edges[j].type = undefined;
	};
	return this;
};

Graph.prototype.vertex = Graph.prototype.findVertexById;


Graph.Edge = Edge;
Graph.Vertex = Vertex;

module.exports = Graph;
