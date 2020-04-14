import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'

import { Layout, Menu, Modal, Select, Input, Button, Space } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';

import SubMenu from 'antd/lib/menu/SubMenu';

import useWindowSize from "../util/useWindowSize";
import { Link } from 'react-router-dom';
const { Option } = Select;
import '../css/FilterRow.css';

interface FilterRowProps {
    id: number;
    index: number;
    deleteRow: (index: number) => void;
    updateRow: (index: number, attribute: string, input:string) => void;
    updateIsOr: (or: boolean) => void;
    isOr: boolean;
    oneRow?: boolean;
};


const FilterRow: React.FC<FilterRowProps> = ({ id, index, deleteRow, updateRow, updateIsOr, isOr, oneRow=false }: FilterRowProps) => {
    const [attribute, setAttribute] = useState("");
    const [filter, setFilter] = useState("");
    const [value, setValue] = useState("");

    const updateAttribute = (attribute: string) => {
        setAttribute(attribute);
        updateRow(id, "attribute", attribute);
    }

    const updateFilter = (filter: string) => {
        setFilter(filter);
        updateRow(id, "filter", filter);
    }

    const updateValue = (value: string) => {
        setValue(value);
        updateRow(id, "value", value);
    }

    const renderAndOr = () => {
      if (index == 0) {
        if (oneRow) {
          return null;
        }
        else {
          return (
            <div style={{ width: 80 }}></div>
          );
        }
      }
      else if (index == 1) {
        const defaultValue = isOr ? "or" : "and";
        return (
          <Select
            onChange={(e) => updateIsOr( e.toString() === "or" )}
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
      <Space style={{ width: '100%', marginBottom:8}}>
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
        >
          <Option value="locations">Locations</Option>
          <Option value="people">People</Option>
          <Option value="orgs">Organizations</Option>
        </Select>
        <Select
          placeholder="Select a filter"
          onChange={(e) => updateFilter(e.toString())}
          style={{ minWidth: 168 }}
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
        <Input placeholder="Value" onChange={(e) => updateValue(e.target.value)} style={{ width: '100%' }}/>
        <Button type="primary" icon={<CloseOutlined />} onClick={(e) => deleteRow(id)}/>
      </Space>
    );
}

export default FilterRow
