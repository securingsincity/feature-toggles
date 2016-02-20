// file: test/setup.js
const jsdom = require('jsdom');

declare var global: any;
declare var window: any;

// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access
global['document'] = jsdom.jsdom(
  '<!doctype html><html><body><div id="app"></div></body></html>'
);
global['window'] = global['document'].defaultView;
global.navigator = { userAgent: 'node.js' };

import * as _ from 'lodash';

import TestUtils = require('react-addons-test-utils');
import chai = require('chai');
import sinon = require('sinon');
const should = chai.should();

import Toggle = require('./toggle');

describe('toggle', () => {

  const initialToggles = {
    "myToggle1": true,
    "myToggle2": false,
    "myToggle3": true,
    "myToggle4": false,
    "myToggle5": true
  };

  before(() => {
    window.localStorage = {
      getItem(key) {
        return this.fields[key];
      },

      setItem(key, value) {
        this.fields[key] = String(value);
      },

      reset() {
        this.fields = {};
      },

      fields: {}
    }
  });

  afterEach(() => {
    window.localStorage.reset();
    Toggle.clear();
  });

  xit('should exist with accessible keys', () => {
    Toggle.should.have.all.keys(['clear', 'init', 'get', 'set', 'list', 'render', 'toggles']);
  });

  xit('should have an initializer', () => {
    Toggle.init(initialToggles).should.not.throw(Error);
    Toggle.toggles.should.equal(initialToggles);
    window.FEATURE_TOGGLES.should.deep.equal(initialToggles);
  });  

  xit('should throw an error if initialized without a toggle list', () => {
    Toggle.init()
      .should.throw('Must provide an initial feature toggle list');
  });

  xit('should still be initialized if re-required', () => {
    Toggle.init(initialToggles).should.not.throw(Error);
    Toggle.toggles.should.equal(initialToggles);
    const differentToggle = require('./toggle');
    differentToggle.toggles.should.deep.equal(initialToggles);
  });

  xit('should have a clearer', () => {
    Toggle.init();
    Toggle.toggles.should.equal(initialToggles);
    Toggle.clear();
    Toggle.toggles.should.be.empty();
  });

  xit('should have a getter', () => {
    Toggle.init(initialToggles);
    Toggle.get('myToggle1').should.be(true);
  });

  xit('should throw if getting a non-existent toggle', () => {
    Toggle.init(initialToggles);
    Toggle.get('notExist')
      .should.throw('Cannot get non-existent toggle "notExist".');
  });

  xit('should have a setter that uses localStorage', () => {
    Toggle.init(initialToggles);
    Toggle.set('myToggle2', true).should.be(undefined);
    window.localStorage.getItem('feature-myToggle2').should.be(undefined);
    Toggle.get('myToggle2').should.be(true);
    window.localStorage.getItem('feature-myToggle2').should.be('true');
  });

  xit('should throw if setting a non-existent toggle', () => {
    Toggle.init(initialToggles);
    Toggle.set('notExist', true)
      .should.throw('Cannot set non-existent toggle "notExist".');
  });

  xit('should throw if no toggle name provided', () => {
    Toggle.init(initialToggles);
    Toggle.set()
      .should.throw('Toggle.set() requires a toggle name and boolean value');
  });

  xit('should throw if no toggle value provided', () => {
    Toggle.init(initialToggles);
    Toggle.set('myToggle2')
      .should.throw('Toggle.set() requires a toggle name and boolean value');
  });

  xit('should throw if toggle value provided is not a boolean', () => {
    Toggle.init(initialToggles);
    Toggle.set('myToggle2', 'f')
      .should.throw('Toggle.set() requires a toggle name and boolean value');
    Toggle.set('myToggle2', 2)
      .should.throw('Toggle.set() requires a toggle name and boolean value');
    Toggle.set('myToggle2', 2.2)
      .should.throw('Toggle.set() requires a toggle name and boolean value');
    Toggle.set('myToggle2', null)
      .should.throw('Toggle.set() requires a toggle name and boolean value');
    Toggle.set('myToggle2', undefined)
      .should.throw('Toggle.set() requires a toggle name and boolean value');
    Toggle.set('myToggle2', () => {return true;})
      .should.throw('Toggle.set() requires a toggle name and boolean value');
  });

  xit('should have a lister', () => {
    Toggle.init(initialToggles);
    Toggle.list().should.deep.equal(initialToggles);
    let testToggles = _.clone(initialToggles);
    testToggles['myToggle3'] = false;
    Toggle.set('myToggle3', false);
    Toggle.toggles.should.deep.equal(testToggles);
    Toggle.list().should.deep.equal(testToggles);
  });

  xit('should render a toggle switcher', () => {
    Toggle.init(initialToggles);
    Toggle.render(document.getElementById('app'));
    const toggleElems = document.getElementsByClassName('feature-toggle');
    toggleElems.length.should.equal(5);
    // radio buttons for myToggle1
    toggleElems[0].textContent.should.contain('myToggle1');
    const toggleButtons1 = toggleElems[0].getElementsByTagName('input')
    toggleButtons1.length.should.equal(2);
    toggleButtons1[0].name.should.equal('myToggle1');
    toggleButtons1[0].type.should.equal('radio');
    toggleButtons1[0].value.should.equal('true');
    toggleButtons1[0].checked.should.equal(true);
    toggleButtons1[1].name.should.equal('myToggle1');
    toggleButtons1[1].type.should.equal('radio');
    toggleButtons1[1].value.should.equal('false');
    toggleButtons1[1].checked.should.equal(false);
    // radio buttons for myToggle2
    toggleElems[1].textContent.should.contain('myToggle2');
    const toggleButtons2 = toggleElems[1].getElementsByTagName('input')
    toggleButtons2.length.should.equal(2);
    toggleButtons2[0].name.should.equal('myToggle2');
    toggleButtons2[0].type.should.equal('radio');
    toggleButtons2[0].value.should.equal('true');
    toggleButtons2[0].checked.should.equal(false);
    toggleButtons2[1].name.should.equal('myToggle2');
    toggleButtons2[1].type.should.equal('radio');
    toggleButtons2[1].value.should.equal('false');
    toggleButtons2[1].checked.should.equal(true);
    // radio buttons for myToggle3
    toggleElems[2].textContent.should.contain('myToggle3');
    const toggleButtons3 = toggleElems[2].getElementsByTagName('input')
    toggleButtons3.length.should.equal(2);
    toggleButtons3[0].name.should.equal('myToggle3');
    toggleButtons3[0].type.should.equal('radio');
    toggleButtons3[0].value.should.equal('true');
    toggleButtons3[0].checked.should.equal(true);
    toggleButtons3[1].name.should.equal('myToggle3');
    toggleButtons3[1].type.should.equal('radio');
    toggleButtons3[1].value.should.equal('false');
    toggleButtons3[1].checked.should.equal(false);
    // radio buttons for myToggle4
    toggleElems[3].textContent.should.contain('myToggle4');
    const toggleButtons4 = toggleElems[3].getElementsByTagName('input')
    toggleButtons4.length.should.equal(2);
    toggleButtons4[0].name.should.equal('myToggle4');
    toggleButtons4[0].type.should.equal('radio');
    toggleButtons4[0].value.should.equal('true');
    toggleButtons4[0].checked.should.equal(false);
    toggleButtons4[1].name.should.equal('myToggle4');
    toggleButtons4[1].type.should.equal('radio');
    toggleButtons4[1].value.should.equal('false');
    toggleButtons4[1].checked.should.equal(true);
    // radio buttons for myToggle5
    toggleElems[4].textContent.should.contain('myToggle5');
    const toggleButtons5 = toggleElems[4].getElementsByTagName('input')
    toggleButtons5.length.should.equal(2);
    toggleButtons5[0].name.should.equal('myToggle5');
    toggleButtons5[0].type.should.equal('radio');
    toggleButtons5[0].value.should.equal('true');
    toggleButtons5[0].checked.should.equal(true);
    toggleButtons5[1].name.should.equal('myToggle5');
    toggleButtons5[1].type.should.equal('radio');
    toggleButtons5[1].value.should.equal('false');
    toggleButtons5[1].checked.should.equal(false);
  });

  xit('should trigger changes to toggles', () => {
    Toggle.init(initialToggles);
    Toggle.render(document.getElementById('app'));
    const toggleElems = document.getElementsByClassName('feature-toggle');
    // change selection to option 2
    const toggleButtons1 = toggleElems[0].getElementsByTagName('input')
    TestUtils.Simulate.change(toggleButtons1[1]);
    toggleButtons1[0].checked.should.equal(false);
    toggleButtons1[1].checked.should.equal(true);
    // change selection to option 1
    const toggleButtons2 = toggleElems[1].getElementsByTagName('input')
    TestUtils.Simulate.change(toggleButtons2[0]);
    toggleButtons2[0].checked.should.equal(true);
    toggleButtons2[1].checked.should.equal(false);
    // choose same selection to option 1
    const toggleButtons3 = toggleElems[2].getElementsByTagName('input')
    TestUtils.Simulate.change(toggleButtons2[1]);
    toggleButtons3[0].checked.should.equal(true);
    toggleButtons3[1].checked.should.equal(false);
    // choose same selection to option 2
    const toggleButtons4 = toggleElems[3].getElementsByTagName('input')
    TestUtils.Simulate.change(toggleButtons2[0]);
    toggleButtons4[0].checked.should.equal(false);
    toggleButtons4[1].checked.should.equal(true);

    Toggle.toggles.should.deep.equal({
      "myToggle1": false,
      "myToggle2": true,
      "myToggle3": true,
      "myToggle4": false,
      "myToggle5": true
    });
  });

  xit('should throw if not initialized', () => {
    Toggle.get('something')
      .should.throw('Toggles must be initialized via Toggle.init(initialToggles).');
    Toggle.set('something', true)
      .should.throw('Toggles must be initialized via Toggle.init(initialToggles).');
    Toggle.list()
      .should.throw('Toggles must be initialized via Toggle.init(initialToggles).');
    Toggle.render(document.getElementById('app'))
      .should.throw('Toggles must be initialized via Toggle.init(initialToggles).');
  });
});