var should  = require('should')
  , PubSub  = require('../../lib/pubsub')
  , ltx     = require('ltx')
  , helper  = require('../helper')

describe('Publish-Subscribe', function() {

    var pubsub, socket, xmpp, manager

    before(function() {
        socket = new helper.Eventer()
        xmpp = new helper.Eventer()
        manager = {
            socket: socket,
            client: xmpp,
            trackId: function(id, callback) {
                this.callback = callback
            },
            makeCallback: function(error, data) {
                this.callback(error, data)
            }
        }
        pubsub = new PubSub()
        pubsub.init(manager)
    })

    describe('Subscribe', function() {

        it('Errors if no \'to\' key provided', function(done) {
            var request = {}
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing 'to' key")
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.emit('xmpp.pubsub.subscribe', request, callback)
        })

        it('Errors if no \'node\' key provided', function(done) {
            var request = { to: 'pubsub.shakespeare.lit' }
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing 'node' key")
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.emit('xmpp.pubsub.subscribe', request, callback)
        })

        it('Sends expected stanza', function(done) {
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.to.should.equal(request.to)
                stanza.attrs.type.should.equal('set')
                stanza.attrs.id.should.exist
                stanza.getChild('pubsub', pubsub.NS_PUBSUB).should.exist
                var pubsubElement = stanza.getChild('pubsub')
                pubsubElement.getChild('subscribe').should.exist
                pubsubElement.getChild('subscribe').attrs.node
                    .should.equal(request.node)
                done()
            })
            socket.emit('xmpp.pubsub.subscribe', request)
        })

        it('Handles an error stanza response', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('iq-error'))
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'cancel',
                    condition: 'error-condition'
                })
                done()
            }
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            socket.emit(
                'xmpp.pubsub.subscribe',
                request,
                callback
            )
        })

        it('Handles basic success response', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('subscribe-basic'))
            })
            var callback = function(error, success) {
                should.not.exist(error)
                success.subscription.should.equal('subscribed')
                done()
            }
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            socket.emit(
                'xmpp.pubsub.subscribe',
                request,
                callback
            )
        })

        it('Handles success response with subscription id', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('subscribe-subid'))
            })
            var callback = function(error, success) {
                should.not.exist(error)
                success.id.should.equal('123456')
                done()
            }
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            socket.emit(
                'xmpp.pubsub.subscribe',
                request,
                callback
            )
        }) 

        it('Handles configuration required', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('subscribe-options'))
            })
            var callback = function(error, success) {
                should.not.exist(error)
                success.configuration.required.should.be.true
                done()
            }
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            socket.emit(
                'xmpp.pubsub.subscribe',
                request,
                callback
            )
        })

    })

    describe('Unsubscribe', function() {

        it('Errors if no \'to\' key provided', function(done) {
            var request = {}
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing 'to' key")
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.emit('xmpp.pubsub.unsubscribe', request, callback)
        })

        it('Errors if no \'node\' key provided', function(done) {
            var request = { to: 'pubsub.shakespeare.lit' }
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing 'node' key")
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.emit('xmpp.pubsub.unsubscribe', request, callback)
        })

        it('Sends expected stanza', function(done) {
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.to.should.equal(request.to)
                stanza.attrs.type.should.equal('set')
                stanza.attrs.id.should.exist
                stanza.getChild('pubsub', pubsub.NS_PUBSUB).should.exist
                var pubsubElement = stanza.getChild('pubsub')
                pubsubElement.getChild('unsubscribe').should.exist
                pubsubElement.getChild('unsubscribe').attrs.node
                    .should.equal(request.node)
                done()
            })
            socket.emit('xmpp.pubsub.unsubscribe', request)
        })

        it('Sends expected stanza when \'subscription id\'', function(done) {
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night',
                id: '123456'
            }
            xmpp.once('stanza', function(stanza) {
                stanza.getChild('pubsub')
                    .getChild('unsubscribe')
                    .attrs.subid.should.equal('123456')
                done()
            })
            socket.emit('xmpp.pubsub.unsubscribe', request)
        })

        it('Handles an error stanza response', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('iq-error'))
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'cancel',
                    condition: 'error-condition'
                })
                done()
            }
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            socket.emit(
                'xmpp.pubsub.unsubscribe',
                request,
                callback
            )
        })

        it('Handles success response', function(done) {
            xmpp.once('stanza', function(stanza) {
                manager.makeCallback(helper.getStanza('iq-result'))
            })
            var callback = function(error, success) {
                should.not.exist(error)
                success.should.be.true
                done()
            }
            var request = {
                to: 'pubsub.shakespeare.lit',
                node: 'twelfth night'
            }
            socket.emit(
                'xmpp.pubsub.unsubscribe',
                request,
                callback
            )
        })

    })

    describe('Get node subscriptions', function() {

        it('Errors if missing \'to\' key', function(done) {
            var request = {}
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal("Missing 'to' key")
                error.request.should.eql(request)
                xmpp.removeAllListeners('stanza')
                done()
            }
            socket.emit('xmpp.pubsub.subscriptions', request, callback)
        })

        it('Errors if node subs requested and no owner', function(done) {
            done('Not implemented')
        })

        it('Sends expected stanza for node owner', function(done) {
            done('Not implemented')
        })

        it('Sends expected stanza for user subscriptions', function(done) {
            done('Not implemented')
        })

        it('Handles error stanza response', function(done) {
            done('Not implemented')
        })

        it('Sends a list of subscriptions', function(done) {
            done('Not implemented')
        })

    })

})
