import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import { List } from 'antd';
import SearchResultsItem from "../components/SearchResultsItem";

interface Tags {
    locations: string[];
    orgs: string[];
    groups: string[];
    time: string[];
}

interface Result {
    id: number;
    file: string;
    name: string;
    tags: Tags;
    text: string;
    type: string;
}

interface SearchResultsListProps {
    results?: Result[]
    showResults: boolean
};

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results = [], showResults}: SearchResultsListProps) => {

    const searchResult = showResults ?
    (
      <List
        itemLayout="vertical"
        size="large"
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
    ) : null;

    return searchResult;
};

export default SearchResultsList;
