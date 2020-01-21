'use strict';

var PubSubScId = require('../src/pubsub'),
    TestHelper = require('./helper'),
    refute = require('referee').refute,
    sinon = require('sinon');

describe('clearAllSubscriptions method', function () {
    it('must clear all subscriptions', function () {
        var topic = TestHelper.getUniqueString(),
            spy1 = sinon.spy(),
            spy2 = sinon.spy();

        PubSubScId.subscribe(topic, spy1);
        PubSubScId.subscribe(topic, spy2);

        PubSubScId.clearAllSubscriptions();

        PubSubScId.publishSync(topic, TestHelper.getUniqueString());

        refute(spy1.called);
        refute(spy2.called);
    });
});
