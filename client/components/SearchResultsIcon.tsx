import React from 'react';
import ReactDOM from 'react-dom'
import Icon, { FileTextOutlined, createFromIconfontCN } from '@ant-design/icons';

interface SearchResultsIconProps {
    filetype: string;
};

const SearchResultsIcon: React.FC<SearchResultsIconProps> = ({ filetype }: SearchResultsIconProps) => {

  const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
  });

  const renderComponent = () => {
    switch(filetype) {
      case "doc":
      case "docx":
      break;
        return <FileTextOutlined />;
      default:
        return <FileTextOutlined/>;
    }
  }

  return (
    <React.Fragment>
      {renderComponent()}
    </React.Fragment>);

};

export default SearchResultsIcon;
