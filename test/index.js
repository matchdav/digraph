var Graph = require('..');
var should = require('should');

describe('Graph(object)',function(){
	it('should exist',function(){
		var g = new Graph();
		should.exist(g);
	});
	it('should add nodes to the graph',function(){
		var g = new Graph();
		g.add('rabbit');
		g.nodes.length.should.equal(1);
	});
	it('#size should be defined',function(){
		var g = new Graph;
		g.should.have.property('size');
	});
	it('#pathBetween should return a connected path if one exists',function(){
		var g = new Graph;
		var r = g.add('rabbit'),dog = g.add('dog');
		var lone = g.add('alone');
		g.connect(r,dog,'anger');
		should.exist(g.pathBetween);
		should.exist(g.pathBetween(r,dog));
		(g.pathBetween(r,lone)).should.be.false;
	});
});
