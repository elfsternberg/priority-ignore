chai = require('chai')
chai.should()

fs = require('fs')

zombie = require('zombie')
browser = new zombie.Browser()

describe 'Initialization', ->
    it 'should load the home page', (done) ->
        console.log("Will it bleed?")
        browser.visit 'http://127.0.0.1:8081/index.html', (error, browser, status) ->
            if error then console.log(error)
            browser.text('title').should.be.equal('Priority / Ignore')
            done()
