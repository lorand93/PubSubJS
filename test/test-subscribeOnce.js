'use strict';

var PubSubScId = require('../src/pubsub'),
    TestHelper = require('../test/helper'),
    assert = require('referee').assert,
    sinon = require('sinon');


describe( 'subscribeOnce method', function() {

    it( 'should return PubSubScId', function() {
        var func = function(){ return undefined; },
            message = TestHelper.getUniqueString(),
            pubSub = PubSubScId.subscribeOnce( message , func );
        assert.same( pubSub, PubSubScId );
    } );

    it( 'must be executed only once', function() {

        var topic = TestHelper.getUniqueString(),
            spy = sinon.spy();

        PubSubScId.subscribeOnce( topic, spy );
        for ( var i = 0; i < 3; i++ ) {
            PubSubScId.publishSync( topic, TestHelper.getUniqueString() );
        }

        assert( spy.calledOnce );

    } );

} );
