import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import { Filter, TagsMap } from "../types/interfaces"

import { List, Avatar, Tag } from 'antd';

interface FilterListProps {
    filters: Filter[]
    updateFilters: (filters: Array<Filter>) => void
}

const FilterList: React.FC<FilterListProps> = ({ filters, updateFilters }: FilterListProps) => {
    const filterDisplayNameMap = {
        "contains_not" : "does not contain",
        "contains" : "contains"
    }

    const displayTags : TagsMap = {
        "locations": "Locations",
        "orgs": "Organizations",
        "groups": "Groups",
        "time": "Dates and Times",
        "people": "People"
    }

    const colorMap: TagsMap = {
        "locations": "magenta",
        "orgs": "orange",
        "groups": "green",
        "time": "geekblue",
        "people": "purple",
    };

    const removeFilter = (e, index: number) => {
        e.preventDefault();
        const filtersCopy : Array<Filter> = [...filters];
        filtersCopy.splice(index, 1) 
        updateFilters( filtersCopy );
    }

    const tagList = filters.map((filter, index) => (
        <Tag key={index} closable onClose = {(e) => removeFilter(e, index)} color={colorMap[filter.attribute]} style={{ margin: "5px !important" }}>
            {displayTags[filter.attribute]} {filterDisplayNameMap[filter.filter]} {filter.value}
        </Tag>
    ))

    return (
        <List.Item.Meta
            title={""}
            description={tagList}
        />
    )
}

export default FilterList;