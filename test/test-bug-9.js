'use strict';

var PubSubScId = require('../src/pubsub'),
    assert = require('referee').assert,
    sinon = require('sinon');

/**
 *	This is a test proving that bug 9 has been fixed.
 *	See https://github.com/mroderick/PubSubJS/issues/9
 */
describe( 'Bug 9, publish method', function() {
    it('should notify all subscribers in a hierarchy', function( done ){
        var subscriber1 = sinon.spy(),
            subscriber2 = sinon.spy(),
            subscriber3 = sinon.spy(),
            clock = sinon.useFakeTimers();

        PubSubScId.subscribe( 'a.b.c', subscriber1 );
        PubSubScId.subscribe( 'a.b', subscriber2 );
        PubSubScId.subscribe( 'a', subscriber3 );

        PubSubScId.publish( 'a.b.c.d' );

        clock.tick(1);

        assert( subscriber1.calledOnce );
        assert( subscriber2.calledOnce );
        assert( subscriber3.calledOnce );

        done();
        clock.restore();
    });

    it('should notify individual subscribers, even when there are no subscribers further up', function( done ){

        var rootTopic = 'a.b.c',
            subscriber = sinon.spy(),
            clock = sinon.useFakeTimers();

        PubSubScId.subscribe(rootTopic, subscriber);
        PubSubScId.publish(rootTopic + '.d');

        clock.tick(1);

        assert( subscriber.calledOnce );

        done();
        clock.restore();
    });
});
