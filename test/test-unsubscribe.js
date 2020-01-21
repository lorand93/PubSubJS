'use strict';

var PubSubScId = require('../src/pubsub'),
    TestHelper = require('../test/helper'),
    assert = require('referee').assert,
    refute = require('referee').refute,
    sinon = require('sinon');

describe( 'unsubscribe method', function() {
    it('should return token when succesful', function(){
        var func = function(){ return undefined; },
            message = TestHelper.getUniqueString(),
            token = PubSubScId.subscribe( message, func),
            result = PubSubScId.unsubscribe( token );

        assert.equals( result, token );
    });

    it('should return false when unsuccesful', function(){
        var unknownToken = 'my unknown token',
            result = PubSubScId.unsubscribe( unknownToken ),
            func = function(){ return undefined; },
            message = TestHelper.getUniqueString(),
            token = PubSubScId.subscribe( message, func );

        // first, let's try a completely unknown token
        assert.equals( result, false );

        // now let's try unsubscribing the same method twice
        PubSubScId.unsubscribe( token );
        assert.equals( PubSubScId.unsubscribe( token ), false );
    });

    it('with function argument should return true when succesful', function(){
        var func = function(){ return undefined; },
            message = TestHelper.getUniqueString(),
            result;

        PubSubScId.subscribe( message, func);
        result = PubSubScId.unsubscribe( func );

        assert.equals( result, true );
    });

    it('with function argument should return false when unsuccesful', function(){
        var func = function(){ return undefined; },
            message = TestHelper.getUniqueString(),
            unknownToken = 'my unknown token',
            result = PubSubScId.unsubscribe( unknownToken );

        // first, let's try a completely unknown token

        assert.equals( result, false );

        // now let's try unsubscribing the same method twice
        PubSubScId.subscribe( message, func );
        PubSubScId.subscribe( message, func );
        PubSubScId.subscribe( message, func );

        // unsubscribe once, this should remove all subscriptions for message
        PubSubScId.unsubscribe( func );

        // unsubscribe again
        assert.equals( PubSubScId.unsubscribe( func ), false );
    });

    it('with topic argument, must clear all exactly matched subscriptions', function(){
        var topic = TestHelper.getUniqueString(),
            spy1 = sinon.spy(),
            spy2 = sinon.spy();

        PubSubScId.subscribe(topic, spy1);
        PubSubScId.subscribe(topic, spy2);

        PubSubScId.unsubscribe(topic);

        PubSubScId.publishSync(topic, TestHelper.getUniqueString());

        refute(spy1.called);
        refute(spy2.called);
    });

    it('with topic argument, must only clear matched subscriptions', function(){
        var topic1 = TestHelper.getUniqueString(),
            topic2 = TestHelper.getUniqueString(),
            spy1 = sinon.spy(),
            spy2 = sinon.spy();

        PubSubScId.subscribe(topic1, spy1);
        PubSubScId.subscribe(topic2, spy2);

        PubSubScId.unsubscribe(topic1);

        PubSubScId.publishSync(topic1, TestHelper.getUniqueString());
        PubSubScId.publishSync(topic2, TestHelper.getUniqueString());

        refute(spy1.called);
        assert(spy2.called);
    });

    it('with topic argument, must clear all matched hierarchical subscriptions', function(){
        var topic = TestHelper.getUniqueString(),
            topicA = topic + '.a',
            topicB = topic + '.a.b',
            topicC = topic + '.a.b.c',
            spyA = sinon.spy(),
            spyB = sinon.spy(),
            spyC = sinon.spy();

        PubSubScId.subscribe(topicA, spyA);
        PubSubScId.subscribe(topicB, spyB);
        PubSubScId.subscribe(topicC, spyC);

        PubSubScId.unsubscribe(topicB);

        PubSubScId.publishSync(topicC, TestHelper.getUniqueString());

        assert(spyA.called);
        refute(spyB.called);
        refute(spyC.called);
    });

    it('with parent topic argument, must clear all child subscriptions', function() {
        var topic = TestHelper.getUniqueString(),
            topicA = topic + '.a',
            topicB = topic + '.a.b',
            topicC = topic + '.a.b.c',
            spyB = sinon.spy(),
            spyC = sinon.spy();

        // subscribe only to  children:
        PubSubScId.subscribe(topicB, spyB);
        PubSubScId.subscribe(topicC, spyC);

        // but unsubscribe from a parent:
        PubSubScId.unsubscribe(topicA);

        PubSubScId.publishSync(topicB, TestHelper.getUniqueString());
        PubSubScId.publishSync(topicC, TestHelper.getUniqueString());

        refute(spyB.called);
        refute(spyC.called);
    });

    it('must not throw exception when unsubscribing as part of publishing', function(){
        refute.exception(function(){
            var topic = TestHelper.getUniqueString(),
                sub1 = function(){
                    PubSubScId.unsubscribe(sub1);
                },
                sub2 = function(){ return undefined; };

            PubSubScId.subscribe( topic, sub1 );
            PubSubScId.subscribe( topic, sub2 );

            PubSubScId.publishSync( topic, 'hello world!' );
        });
    });
});
