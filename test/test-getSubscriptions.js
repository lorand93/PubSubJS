'use strict';

var PubSubScId = require('../src/pubsub'),
    TestHelper = require('./helper'),
    assert = require('referee').assert,
    sinon = require('sinon');

describe('getSubscriptions method', function () {
    it('must be length eq 0', function () {
        var topic = TestHelper.getUniqueString(),
            spy1 = sinon.spy();

        PubSubScId.subscribe(topic, spy1);

        var subscriptions = PubSubScId.getSubscriptions(topic).length;

        assert.equals(subscriptions,1);
    });

});
