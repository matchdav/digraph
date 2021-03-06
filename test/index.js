var Graph = require('..'),
    Vertex = Graph.Vertex,
    Edge = Graph.Edge,
    G = new Graph();

describe('Vertex', function () {
    var a = new Vertex('a');
    it('should generate ids', function () {
        a.should.have.property('id');
    });
    it('should have no edges', function () {
        a.fanin().should.equal(0);
        a.fanout().should.equal(0);
    });
});
describe('Edge', function () {
    it('should connect vertices just fine.', function () {
        var cat = new Vertex('cat'),
            dog = new Vertex('dog');
        var interaction = new Edge(cat, dog, 'scratch');
        interaction.should.exist;
        interaction.source().should.equal(cat);
        interaction.target().should.equal(dog);
    });
});
describe('Graph', function () {

    it('#add should create a vertex', function () {
        var rabbit = G.add('rabbit');
        rabbit.should.be.instanceof.Vertex;
    });

    var newt = G.add('newt');
    var fox = G.add('fox');
    var badger = G.add('badger');

    it('should preserve order and size', function () {
        G.connect(fox, badger, 'chases');
        G.order().should.equal(4);
        G.size().should.equal(1);
    });
    it('should chain', function () {
        var size = G.size();
        var a = G.add(new Vertex('hyena'));
        a.should.be.instanceof.Graph;
        a.size().should.equal(G.size());
    });
});
describe('Graph(object)', function () {
    before(function (done) {
        this.timeout(3000);
        done();
    })
    it('should exist', function () {
        var g = new Graph();
        g.should.exist;
    });
    it('should add vertices to the graph', function () {
        var g = new Graph();
        g.add('rabbit');
        g.__vertices.length.should.equal(1);
    });
    it('#size should be defined', function () {
        var g = new Graph;
        g.should.have.property('size');
    });
    it('#cycle should detect cycles correctly', function () {
        var g = new Graph();
        var r = new Vertex('r');
        var b = new Vertex('b');
        g.add(r).add(b);
        g.connect(r, b, 1);
        (g.cyclic(r)).should.be.false;
        g.connect(b, r, 2);
        (g.cyclic(r)).should.not.be.false;
    });
});
