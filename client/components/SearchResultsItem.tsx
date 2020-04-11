import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import { List, Avatar } from 'antd';
import Microlink from '@microlink/react'
import SearchResultsIcon from "../components/SearchResultsIcon";
import './SearchResultsItem.css';

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

interface SearchResultsItemProps {
    item: Result;
};

const SearchResultsItem: React.FC<SearchResultsItemProps> = ({ item }: SearchResultsItemProps) => {

    const avatarIcon = <SearchResultsIcon filetype={item.type} />;

    // const tagList = filters.map((filter, index) => (
    //   <FilterRow
    //     key={filter.id}
    //     id={filter.id}
    //     deleteRow={deleteFilterRow}
    //     updateRow={updateFilterRow}
    //     index={index}
    //     updateIsOr={updateIsOr}
    //     isOr={isOr}
    //     />)
    // );

    return (
      <List.Item
        key={item.id}
        extra={
           <Microlink size="large" url='https://instagram.com/p/Bu1-PpyHmCn/' />
        }
      >
        <List.Item.Meta
          avatar={<Avatar size={64} shape="square" icon={avatarIcon} />}
          title={<a href={item.file}>{item.name}</a>}
          description={item.text}
        />
        {item.text}
      </List.Item>
    )
};

export default SearchResultsItem;
