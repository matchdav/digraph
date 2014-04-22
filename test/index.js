var Graph = require('..');
var Edge = Graph.Edge;
var Vertex = Graph.Vertex;
var should = require('should');

describe('Graph(object)',function(){
	it('should exist',function(){
		var g = new Graph();
		should.exist(g);
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
	it('Vertex(object) should have type Vertex.',function(){
		var v = new Vertex('angry bunny');
		should.exist(v);
	});
	
});
