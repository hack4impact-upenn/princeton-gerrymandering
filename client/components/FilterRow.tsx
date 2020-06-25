import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'

import { Layout, Menu, Modal, Select, Input, Button, Space, AutoComplete } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';

import SubMenu from 'antd/lib/menu/SubMenu';

import useWindowSize from "../util/useWindowSize";
import { Link } from 'react-router-dom';
const { Option } = Select;
import '../css/FilterRow.css';
import { Filter } from "../types/interfaces"

import axios, { AxiosResponse, AxiosError } from 'axios';
import secureRequest from '../util/secureRequest';

interface SuggestedTagsQuery {
    type: string;
    query: string;
}

interface FilterRowProps {
    filters: Filter[]
    index: number;
    updateFilters: (filters: Filter[]) => void;
    updateIsOr: (isOr: boolean) => void;
    isOr: boolean
};


const FilterRow: React.FC<FilterRowProps> = ({ filters, index, updateFilters, updateIsOr, isOr }: FilterRowProps) => {
    const [attribute, setAttribute] = useState(filters[index].attribute);
    const [filter, setFilter] = useState("");
    const [value, setValue] = useState("");

    const [suggestedTags, setSuggestedTags] = useState<{ value: string }[]>([]);

    // updateFilters( filters.map( (filter, ind) => {
    //     if(index == ind){
    //         return {
    //             ...filter,
    //             filter:
    //         }
    //     } else {
    //         return filter;
    //     }
    // })

    const updateProperty = (attribute: string, input: string) => {
        updateFilters(filters.map( (filter, ind) => {
            if (ind == index) {
                filter[attribute] = input;
            }
            return filter;
        }
        ))
    };

    const updateAttribute = (attribute: string) => {
        setAttribute(attribute);
        updateProperty("attribute", attribute);
    }

    const updateFilter = (filter: string) => {
        setFilter(filter);
        updateProperty("filter", filter);
    }

    const updateValue = (value: string) => {
        setValue(value);

        secureRequest("/api/suggested_tags", "POST",    {
            type: attribute,
            query: value
        }).then((res) => {
            setSuggestedTags(res.tags.map((tag) => ({ value: tag })))
        }).catch((err) => {
            console.log(err)
        })

        // axios.post<SuggestedTagsQuery>("api/suggested_tags", {
        //     type: attribute,
        //     query: value
        // }).then((res) => {
        //     const data = res as any;
        //     console.log(data)
        //     setSuggestedTags(data.data.tags.map((tag) => ({ value: tag })))
        // }).catch((err) => {
        //     console.log(err)
        // })
        updateProperty("value", value);
    }

    const deleteRow = () => {
        updateFilters( filters.filter( (filter, ind) => ind != index ) )
    }

    const renderAndOr = () => {
        if (index == 0) {
            return (
                <div style={{ width: 80 }}></div>
            );
        }
        else if (index == 1) {
            const defaultValue = isOr ? "or" : "and";
            return (
                <Select
                    onChange={(e) => updateIsOr(e.toString() === "or")}
                    style={{ width: 80 }}
                    defaultValue={defaultValue}
                >
                    <Option value="and">And</Option>
                    <Option value="or">Or</Option>
                </Select>
            );
        }
        else {
            const text = isOr ? "Or" : "And";
            return (
                <div style={{ width: 80, paddingLeft: 12 }}>{text}</div>
            );
        }
    }

    return (
        <Space style={{ width: '100%', marginBottom: 8 }}>
            {renderAndOr()}
            <Select
                showSearch
                placeholder="Select an attribute"
                optionFilterProp="children"
                filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={(e) => updateAttribute(e.toString())}
                style={{ minWidth: 168 }}
                value={ filters[index].attribute }
            >
                <Option value="locations">Locations</Option>
                <Option value="people">People</Option>
                <Option value="orgs">Organizations</Option>
            </Select>
            <Select
                placeholder="Select a filter"
                onChange={(e) => updateFilter(e.toString())}
                style={{ minWidth: 168 }}
                value = {filters[index].filter }
            >
                {/* <Option value="is">Is</Option>
          <Option value="is_not">Is not</Option> */}
                <Option value="contains">Contains</Option>
                <Option value="contains_not">Does not contain</Option>
                {/* <Option value="starts_with">Starts with</Option>
          <Option value="ends_with">Ends with</Option>
          <Option value="empty">Is empty</Option>
          <Option value="empty_not">Is not empty</Option> */}
            </Select>
            <AutoComplete defaultValue = {filters[index].value} placeholder="Value" style={{ width: '100%' }} onSearch={updateValue} onSelect={updateValue} options={suggestedTags}></AutoComplete>
            <Button type="primary" icon={<CloseOutlined />} onClick={(e) => deleteRow()} />
        </Space>
    );
}

export default FilterRow
