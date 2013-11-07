should = require 'should'
ip = require '../lib'

describe 'Convert IP to country', ->

  it 'JP', ->
    ips = [ '59.156.223.124','183.77.253.88' ]
    ips.forEach (i) ->
      cc = ip.getCountryCode i
      cc.should.eql 'JP'
      country = ip.getCountry i
      country.name.en.should.eql 'Japan'

  it 'US', ->
    ips = [ '184.169.144.234' ]
    ips.forEach (i) ->
      cc = ip.getCountryCode i
      cc.should.eql 'US'
      country = ip.getCountry i
      country.name.en.should.eql 'United States'

  it 'CN', ->
    ips = [ '220.181.111.85', '123.125.114.144' ]
    ips.forEach (i) ->
      cc = ip.getCountryCode i
      cc.should.eql 'CN'
      country = ip.getCountry i
      country.name.en.should.eql 'China'

describe 'Convert country code to country name', ->

  it 'Country name in English', ->
    codes =
      'JP': 'Japan'
      'US': 'United States'
      'CA': 'Canada'
      '': null
      '11': null

    for key, value of codes
      name = ip.getCountryNameByCode key
      if (value)
        name.should.eql value
      else
        should.not.exists name

  it 'Country name in Japan', ->
    codes =
      'JP': '日本'
      'US': 'アメリカ'
      'CA': 'カナダ'
      '': null
      '11': null

    for key, value of codes
      name = ip.getCountryNameByCode key, 'ja'
      if (value)
        name.should.eql value
      else
        should.not.exists name

