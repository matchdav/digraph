var Graph = require('..');
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
	it('#pathBetween should return a connected path if one exists',function(){
		var g = new Graph;
		var r = g.add('rabbit'),dog = g.add('dog');
		var lone = g.add('alone');
		g.connect(r,dog,'anger');
		should.exist(g.pathBetween);
		var path = g.pathBetween(r,dog);
		console.log('path is ',path);
		should.exist(path);
		(g.pathBetween(r,lone)).should.be.false;
	});
	it('#disconnect should unhook two vertexs',function(){

	});
	it('#cycle should detect cycles correctly',function(){
		var g = new Graph();
		var r = g.add('r');
		var b = g.add('b');
		g.connect(r,b,1);
		(g.cyclic(r)).should.be.false;
		g.connect(b,r,2);
		(g.cyclic(r)).should.not.be.false;
	});
	it('should be chainable',function(){
		var g = new Graph().add({name:'roger'});
	});

});
