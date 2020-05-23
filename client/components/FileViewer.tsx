import React from 'react';
import ReactDOM from 'react-dom'
import GeoJSONViewer from './GeoJSONViewer';
import { Result } from '../types/interfaces';
import { Empty } from 'antd';

interface FileViewerProps {
  resource: Result | undefined
};


const FileViewer: React.FC<FileViewerProps> = ({ resource }: FileViewerProps) => {
  let viewer;

  if (resource != undefined) {
    const link = `https://princeton-gerrymandering.s3.amazonaws.com/${resource && resource.file}`;
    const type = resource!.type;
    const microsoftPath = `https://view.officeapps.live.com/op/embed.aspx?src=${link}`;
    viewer = (type == "xlsx" || type == "xlsm")
      ? (<iframe src={microsoftPath} width='100%' height='540px' />)
      : (type == "doc" || type == "docx")
        ? (<iframe src={microsoftPath} width='100%' height='720px' />)
        : (type == "pdf")
          ? (<embed src={link} type="application/pdf" width="100%" height="720px" />)
          : (type == "shapefile" && resource.geojson != undefined)
            ? (<GeoJSONViewer source={resource!.geojson}></GeoJSONViewer>)
            : (type == ".gif" || type == ".png" || type == ".jpg")
              ? (<img src={link} width='100%'/>)
                : <Empty description = {"No File Preview Available"}></Empty>;
  }

  if (viewer) {
    return (
      <React.Fragment>
        {viewer}
      </React.Fragment>
    );
  }
  return null;
}

export default FileViewer
