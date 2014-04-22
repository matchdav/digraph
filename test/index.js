require('mocha');





(function(){
var chai = require('chai');	
chai.should();	
mocha.setup('bdd');

var Graph = require('digraph');
var Edge = Graph.Edge;
var Vertex = Graph.Vertex;	

describe('Graph(object)',function(){
	before(function(done){
		this.timeout(3000);
		done();
	})
	
	it('should exist',function(){
		var g = new Graph();
		g.should.exist;
	});
	it('should add vertices to the graph',function(){
		var g = new Graph();
		g.add('rabbit');
		g.__vertices.length.should.equal(1);
	});
	it('#size should be defined',function(){
		var g = new Graph;
		g.should.have.property('size');
	});
	it('#cycle should detect cycles correctly',function(){
		var g = new Graph();
		var r = new Vertex('r');
		var b = new Vertex('b');
		g.add(r).add(b);
		g.connect(r,b,1);
		(g.cyclic(r)).should.be.false;
		g.connect(b,r,2);
		(g.cyclic(r)).should.not.be.false;
	});
	it('should be chainable',function(){
		var g = new Graph();
		var h = g.add({name:'roger'});
		h.should.equal(g);

	});
	
	it('new Edge() should be instanceof Edge',function(){
		var e = new Edge;
		e.should.be.instanceof.Edge;
	});
		
});
describe('Vertex',function(){
	it('should have type Vertex.',function(){
		var v = new Vertex('angry bunny');
		v.should.not.be.null;
		v.should.be.instanceof.Vertex;
	});
	it('should have an id.',function(){
		var v = new Vertex('angry bunny');
		v.should.have.property('id');
	});
});

describe('Edge',function(){
	it('should be an Edge',function(){
		var v = new Vertex('v'),
			w = new Vertex('w'),
			e = new Edge(v,w,'white label');
		e.should.be.instanceof.Edge;
		e.should.have.property('source');
	});
});

mocha.run();
})();


