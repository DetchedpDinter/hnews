import React from "react";
import ReactDOM from 'react-dom';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'; 
import App, { Search, Button, Table } from './App';
import renderer from "react-test-renderer";

Enzyme.configure({ adapter: new Adapter() });

describe('App', () => {
  it('render without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  
  test('has a valid snapshot', () => {
    const component = renderer.create(
      <App />
    );
  
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Search', () => {
  it('render without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search>Search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  
  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Search>Search</Search>
    );
    
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Button', () => {
  it('render without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button>Give me more</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button>Give me more</Button>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Table', () => {
  const props = { 
    list: [ 
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' }, 
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' }, 
    ],
  };

  it('render without crashing', () => {
    const div = document.createElement('div');
    
    ReactDOM.render(<Table { ...props } />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table { ...props } />
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows two items in the list', () => {
    const element = shallow(
      <Table {...props} />
    );

    expect(element.find('.table-row').length).toBe(2);
  });
});