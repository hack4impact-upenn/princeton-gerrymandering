import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'

import { Layout, Menu, Modal, Button } from 'antd';
import Icon, { MenuOutlined, PlusOutlined } from '@ant-design/icons';
import FilterRow from "../components/FilterRow";

import SubMenu from 'antd/lib/menu/SubMenu';

import useWindowSize from "../util/useWindowSize";
import { Link } from 'react-router-dom';
import { Filter } from "../types/interfaces"

interface FilterModalProps {
    onClose: () => void;
    show: boolean;
    updateFilters: (filters: Array<Filter>) => void;
    updateIsOr: (or: boolean) => void;
    isOr: boolean;
    filters: Array<Filter>
};

var id = 0;

const FilterModal: React.FC<FilterModalProps> = ({filters, show, onClose, updateFilters, updateIsOr, isOr}: FilterModalProps) => {
    const [isAnd, setIsAnd] = useState(false);

    const deleteFilterRow = (index: number) => {
        updateFilters(filters.filter(x => x.id != index))
    }

    const updateFilterRow = (index: number, attribute: string, input: string) => {
      const tempFilters = filters.map(
        function(x) {
          if (x.id == index) {
            x[attribute]=input;
          }
          return x;
        }
      );
      updateFilters(tempFilters)
    };

    const filterList = filters.map(
      (filter, index) => (
        <FilterRow
          key={filter.id}
          id={filter.id}
          deleteRow={deleteFilterRow}
          updateRow={updateFilterRow}
          index={index}
          updateIsOr={updateIsOr}
          isOr={isOr}
          />
        )
      );

    const handleOk = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      updateFilters(filters);
      onClose();
    };

    const addFilterRow = () => {
      const newFilter = {
        "attribute": "",
        "filter": "",
        "value": "",
        "id": id++
      }
      updateFilters([...filters, newFilter]);
    }

    const renderButton = () => {
      if (filters.length >= 5) {
        return (
          <Button onClick={addFilterRow} block disabled>
            Maximum 5 Filters
          </Button>
        );
      }
      else {
        return (
          <Button icon={<PlusOutlined />} onClick={addFilterRow} block>
            Add a filter
          </Button>
        );
      }
    }

    return (
      <Modal
          title="Filter Results"
          visible={show}
          onOk={handleOk}
          onCancel={onClose}
          width={720}
        >
        {filterList}
        {renderButton()}
       </Modal>
    );
}

export default FilterModal
