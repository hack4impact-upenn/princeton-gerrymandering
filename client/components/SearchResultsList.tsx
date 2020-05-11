import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import { List, Spin, Pagination } from 'antd';
import SearchResultsItem from "../components/SearchResultsItem";
import { Result, Tags } from "../types/interfaces"

interface SearchResultsListProps {
    results?: Result[]
    showResults: boolean
    resultsLoaded: boolean,
    totalResults: number,
    page: number,
    pageSize: number,
    onPageChange: (page: number, pageSize: number | undefined) => void
};

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results = [], showResults, totalResults, resultsLoaded, onPageChange, page, pageSize }: SearchResultsListProps) => {

    const searchResult = showResults ?
    (
      <Spin size = "large" tip = "Loading..." spinning = {!resultsLoaded}>
        <List
          itemLayout="horizontal"
          size="small"
          dataSource={results}
          renderItem={item => (
            <SearchResultsItem item={item}/>
          )}
        />
        { resultsLoaded &&
          <Pagination
            current={page}
            onShowSizeChange = {onPageChange}
            onChange = {onPageChange}
            pageSize = {pageSize}
            pageSizeOptions = {['5', '10', '20', '50']}
            style = {{ marginTop: "10px"}}
            total = {totalResults}
            showSizeChanger
          />
        }
      </Spin>
    ) : null;

    return searchResult;
};

export default SearchResultsList;
