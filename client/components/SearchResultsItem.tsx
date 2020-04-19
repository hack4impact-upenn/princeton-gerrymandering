import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import { List, Avatar, Tag } from 'antd';
import SearchResultsIcon from "../components/SearchResultsIcon";
import '../css/SearchResultsItem.css';

interface Tags {
    [propName: string]: string[];
}

interface TagsMap {
    [propName: string]: string;
}

interface Result {
    id: string;
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

    const tagsToShow = ["locations", "people", "orgs"];

    const avatarIcon = <SearchResultsIcon filetype={item.type} />;
    const colorMap: TagsMap = {
      "locations": "magenta",
      "orgs": "orange",
      "groups": "green",
      "time": "geekblue",
      "people": "purple",

    };
    const tags: { text: string; color: string; }[] = [];
    Object.keys(item.tags).forEach(element => {
      if (tagsToShow.includes(element)) {
        item.tags[element].forEach(tag => {
          tags.push({
            "text": tag,
            "color": colorMap[element]
          });
        });
      };
    });
    const tagList = tags.map((tag, index) => (
      <Tag key={index} color={tag.color} style={{margin: "5px !important"}}>{tag.text}</Tag>)
    );

    return (
      <List.Item
        key={item.id}
      >
        <List.Item.Meta
          avatar={<Avatar size={64} style={{ textAlign: "center" }} shape="square" icon={avatarIcon} />}
          title={<a href={`resource/${item.id}`}>{item.name}</a>}
          description={tagList}
        />
      </List.Item>
    )
};

export default SearchResultsItem;
