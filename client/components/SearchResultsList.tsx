import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import { List, Spin } from 'antd';
import SearchResultsItem from "../components/SearchResultsItem";

interface Tags {
    [propName: string]: string[];
}

interface Result {
    id: string;
    file: string;
    name: string;
    tags: Tags;
    text: string;
    type: string;
}

interface SearchResultsListProps {
    results?: Result[]
    showResults: boolean
    resultsLoaded: boolean
};

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results = [], showResults, resultsLoaded}: SearchResultsListProps) => {

    const searchResult = showResults ?
    (
      <Spin size = "large" tip = "Loading..." spinning = {!resultsLoaded}>
      <List
        itemLayout="horizontal"
        size="small"
        pagination={{
          onChange: page => {
            console.log(page);
          },
          pageSize: 3,
        }}
        dataSource={results}
        renderItem={item => (
          <SearchResultsItem item={item}/>
        )}
      />
      </Spin>
    ) : null;

    return searchResult;
};

export default SearchResultsList;
