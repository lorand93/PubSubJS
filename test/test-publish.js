'use strict';

var PubSubScId = require('../src/pubsub'),
    TestHelper = require('../test/helper'),
    assert = require('referee').assert,
    refute = require('referee').refute,
    sinon = require('sinon');

describe( 'publish method', function () {
    it('should return false if there are no subscribers', function(){
        var message = TestHelper.getUniqueString();
        assert.equals( PubSubScId.publish( message ), false );
    });

    it('should return true if there are subscribers to a message', function(){
        var message = TestHelper.getUniqueString(),
            func = function(){ return undefined; };

        PubSubScId.subscribe( message, func );
        assert( PubSubScId.publish( message ) );
    });

    it('should return false, when there are no longer any subscribers to a message', function(){
        var message = TestHelper.getUniqueString(),
            func = function(){ return undefined; },
            token = PubSubScId.subscribe(message, func);

        PubSubScId.unsubscribe(token);
        assert.equals( PubSubScId.publish(message), false );
    });

    it('should call all subscribers for a message exactly once', function(){
        var message = TestHelper.getUniqueString(),
            spy1 = sinon.spy(),
            spy2 = sinon.spy();

        PubSubScId.subscribe( message, spy1 );
        PubSubScId.subscribe( message, spy2 );

        PubSubScId.publishSync( message, 'my payload' ); // force sync here, easier to test

        assert( spy1.calledOnce );
        assert( spy2.calledOnce );
    });

    it('should call all ONLY subscribers of the published message', function(){
        var message1 = TestHelper.getUniqueString(),
            message2 = TestHelper.getUniqueString(),
            spy1 = sinon.spy(),
            spy2 = sinon.spy();

        PubSubScId.subscribe( message1, spy1 );
        PubSubScId.subscribe( message2, spy2 );

        PubSubScId.publishSync( message1, 'some payload' );

        // ensure the first subscriber IS called
        assert(	 spy1.called );
        // ensure the second subscriber IS NOT called
        assert.equals( spy2.callCount, 0 );
    });

    it('should call subscribers with message as first argument', function(){
        var message = TestHelper.getUniqueString(),
            spy = sinon.spy();

        PubSubScId.subscribe( message, spy );
        PubSubScId.publishSync( message, 'some payload' );

        assert( spy.calledWith( message ) );
    });

    it('should call subscribers with data as second argument', function(){
        var message = TestHelper.getUniqueString(),
            spy = sinon.spy(),
            data = TestHelper.getUniqueString();

        PubSubScId.subscribe( message, spy );
        PubSubScId.publishSync( message, data );

        assert( spy.calledWith( message, data ) );
    });

    it('should publish method asyncronously', function( done ){
        var message = TestHelper.getUniqueString(),
            spy = sinon.spy(),
            data = TestHelper.getUniqueString(),
            clock = sinon.useFakeTimers();

        PubSubScId.subscribe( message, spy );
        PubSubScId.publish( message, data );

        assert.equals( spy.callCount, 0 );
        clock.tick(1);
        assert.equals( spy.callCount, 1 );

        done();
        clock.restore();
    });

    it('publishSync method should allow syncronous publication', function(){
        var message = TestHelper.getUniqueString(),
            spy = sinon.spy(),
            data = TestHelper.getUniqueString();

        PubSubScId.subscribe( message, spy );
        PubSubScId.publishSync( message, data );

        assert.equals( spy.callCount, 1 );
    });

    it('should call all subscribers, even if there are exceptions', function( done ){
        var message = TestHelper.getUniqueString(),
            func1 = function(){
                throw('some error');
            },
            spy1 = sinon.spy(),
            spy2 = sinon.spy(),
            clock = sinon.useFakeTimers();

        PubSubScId.subscribe( message, func1 );
        PubSubScId.subscribe( message, spy1 );
        PubSubScId.subscribe( message, spy2 );

        assert.exception( function(){
            PubSubScId.publishSync( message, 'some data' );
            clock.tick(1);
        });

        assert( spy1.called );
        assert( spy2.called );

        done();
        clock.restore();
    });

    it('should fail immediately on exceptions when immediateExceptions is true', function(){
        var message = TestHelper.getUniqueString(),
            func1 = function(){
                throw('some error');
            },
            spy1 = sinon.spy(),
            spy2 = sinon.spy();


        PubSubScId.subscribe( message, func1 );
        PubSubScId.subscribe( message, spy1 );

        PubSubScId.immediateExceptions = true;

        assert.exception( function(){
            PubSubScId.publishSync( message, 'some data' );
        });

        refute( spy1.called );
        refute( spy2.called );

        // make sure we restore PubSubScId to it's original state
        delete PubSubScId.immediateExceptions;
    });

    it('should fail immediately on exceptions in namespaces when immediateExceptions is true',  function(){
        var func1 = function(){
                throw('some error');
            },
            spy1 = sinon.spy();

        PubSubScId.subscribe( 'buy', func1 );
        PubSubScId.subscribe( 'buy', spy1 );

        PubSubScId.immediateExceptions = true;

        assert.exception( function(){
            PubSubScId.publishSync( 'buy.tomatoes', 'some data' );
        });

        refute( spy1.called );

        // make sure we restore PubSubScId to it's original state
        delete PubSubScId.immediateExceptions;
    });

    it('should call all subscribers, even when there are unsubscriptions within', function(done){
        var topic = TestHelper.getUniqueString(),
            spy1 = sinon.spy(),
            func1 = function func1(){
                PubSubScId.unsubscribe(func1);
                spy1();
            },

            spy2 = sinon.spy(),
            func2 = function func2(){
                PubSubScId.unsubscribe(func2);
                spy2();
            },

            clock = sinon.useFakeTimers();

        PubSubScId.subscribe(topic, func1);
        PubSubScId.subscribe(topic, func2);

        PubSubScId.publish(topic, 'some data');
        clock.tick(1);

        assert(spy1.called, 'expected spy1 to be called');
        assert(spy2.called, 'expected spy2 to be called');

        clock.restore();
        done();
    });
});
