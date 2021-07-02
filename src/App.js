import React, { Children, Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './App.css';
import 'font-awesome/css/font-awesome.min.css'
import { sortBy } from 'lodash';
import classNames from 'classnames';

const largeColumn = {
  width: '40%',
};

const mediumColumn = {
  width: '30%',
};

const smallColumn = {
  width: '10%',
};

const margin = {
  marginTop: '250px',
  marginBottom: '150px',
}

const big = {
  fontSize : '250%',
}

const small = {
  fontSize: '100%',
}

const Loading = () =>
  <i className="fa fa-spinner fa-spin" alt="Loading" style={{...big, ...margin}}></i>

const ArrowDown = () =>
  <i class="fa fa-arrow-down" alt="ArrowDown" style={small}></i>

const ArrowUp = () =>
  <i class="fa fa-arrow-up" alt="ArrowUp" style={small}></i>

const DEFALT_QUERY = 'redux';
const DEFAULT_HPP = 50;
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
  _isMounted = false;

  constructor(props){
    super(props);

    this.state = {
      results : null,
      searchKey : '',
      searchTerm : DEFALT_QUERY,
      error : null,
      isLoading : false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchTerm = this.onSearchTerm.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories(searchTerm, page = 0){
    this.setState({ isLoading: true });
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
  }

  onSearchSubmit(event){
    const { searchTerm } = this.state;
    this.setState({ searchKey : searchTerm });

    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories( searchTerm );
    }

    event.preventDefault();
  }

  setSearchTopStories(result){
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({ 
      results : {
        ...results,
        [searchKey] : { hits : updatedHits, page }
      },
      isLoading: false
    });
  }

  onDismiss(id){
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotID = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotID);
    
    this.setState({
      results : {
        ...results,
        [searchKey] : { hits : updatedHits, page }
      }
    });
  }

  onSearchTerm(event){
    this.setState({searchTerm : event.target.value});
  }

  componentDidMount(){
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey : searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillMount(){
    this._isMounted = false;
  }

  render(){
    const {
      searchTerm,
      results,
      searchKey,
      error,
      isLoading,
    } = this.state;

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (results &&
      results[searchKey] &&
      results[searchKey].hits) || [];

    return (
      <div className='page'>
        <div className='interactions'>
          <Search
            value = {searchTerm}
            onChange = {this.onSearchTerm}
            onSubmit = {this.onSearchSubmit}
          >
            Search
          </Search>
          { error
          ? <div className='interactions'>
              <h1 style={margin}><center>Something went wrong</center></h1>
            </div> 
            : results &&
            <Table 
              list = {list}
              onDismiss = {this.onDismiss}
            />
          }
          <div className="interactions">
            { error ? null : isLoading
            ? <Loading />
            : <button 
              onClick = {() => this.fetchSearchTopStories(searchKey, page + 1)}>
              More
            </button>}
          </div>
        </div>
      </div>
    );
  }
}

const Search = ({ value, onChange, onSubmit, children }) => {
  let input;
  return(
    <form onSubmit={onSubmit}>
      <input 
        type = "text"
        value = {value}
        onChange = {onChange}
        ref = {( node ) => { input = node; }}
      />
      <button type="submit">
        {children}
      </button>
    </form>
  );
}
    
class Table extends Component { 
  constructor(props){
    super(props);
    this.state = { 
      sortKey: 'NONE',
      isSortReverse: false,
    };
    
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey){
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render(){
  const {
    list,
    onDismiss, 
  } = this.props;

  const {
    sortKey,
    isSortReverse,
  } = this.state;

  const sortedList = SORTS[sortKey](list);
  const reversedSortedList = isSortReverse
        ? sortedList.reverse()
        : sortedList;

  return(
    <div className='table'> 
      <div className='table-header'>
        <span style={{ width:'40%' }}>
          <Sort
            sortKey = {'TITLE'}
            onSort = {this.onSort}
            activSortKey = {sortKey}
            isSortReverse = {isSortReverse}
          >
            TITLE
          </Sort>
        </span>
        <span style={{ width:'30%' }}>
          <Sort
            sortKey = {'AUTHOR'}
            onSort = {this.onSort}
            activSortKey = {sortKey}
            isSortReverse = {isSortReverse}
          >
            AUTHOR
          </Sort>
        </span>
        <span style={{ width:'10%' }}>
          <Sort
            sortKey = {'COMMENTS'}
            onSort = {this.onSort}
            activSortKey = {sortKey}
            isSortReverse = {isSortReverse}
          >
            COMMENTS
          </Sort>
        </span>
        <span style={{ width:'10%' }}>
          <Sort
            sortKey = {'POINTS'}
            onSort = {this.onSort}
            activSortKey = {sortKey}
            isSortReverse = {isSortReverse}
          >
            POINTS
          </Sort>
        </span>
        <span style={{ width:'10%' }}>
          Archive
        </span>
      </div>
      {reversedSortedList.map( item => 
        <div key={ item.objectID } className='table-row'> 
          <span style={ largeColumn }> 
            <a href={ item.url }>{ item.title }</a> 
          </span> 
          <span style={ mediumColumn }>{ item.author }</span> 
          <span style={ smallColumn }>{ item.num_comments }</span> 
          <span style={ smallColumn }>{ item.points }</span> 
          <span> 
            <Button 
              onClick={ () => onDismiss( item.objectID )}
              className = 'button-inline' 
            >
              Dismiss 
            </Button> 
          </span> 
        </div>
      )}
    </div>);
  }
}

const Button = ({ onClick, className = '', children }) =>
  <button 
    onClick = { onClick }
    className = { className }
    type = "button"
  >
    { children }
  </button>

const Sort = ({ sortKey, onSort, children, activSortKey, isSortReverse }) => {
  const status = sortKey === activSortKey;
  const sortClass = classNames(
    'button-inline',
    { 'button-active' : status }
  );
  
  const arrow = isSortReverse ? <ArrowDown /> : <ArrowUp />;

  const result = status ? 
    <Button
        onClick={() => onSort(sortKey)}
        className={sortClass}
    >
        {children}
        {arrow}
    </Button>
    :
    <Button 
        onClick={() => onSort(sortKey)}
        className={sortClass}
    >
        {children}
    </Button>;
  return result;
}

Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default App;

export {
  Button,
  Search,
  Table,
};