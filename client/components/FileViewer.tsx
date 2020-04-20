import React from 'react';
import ReactDOM from 'react-dom'

interface FileViewerProps {
    type?: string;
    link: string;
};


const FileViewer: React.FC<FileViewerProps> = ({ type, link }: FileViewerProps) => {
    const microsoftPath = `https://view.officeapps.live.com/op/embed.aspx?src=${link}`;
    const viewer = (type == "xlsx" || type == "xlsm")
    ? (<iframe src={microsoftPath} width='100%' height='720px'/>)
    : (type == "doc" || type == "docx")
    ? (<iframe src={microsoftPath} width='100%' height='720px'/>)
    : (type == "pdf")
    ? (<embed src={link} type="application/pdf" width="100%" height="720px" />)
    : null;

    if (viewer) {
      return (
        <React.Fragment>
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>File Preview</h3>
          {viewer}
        </React.Fragment>
      );
    }
    return null;
}

export default FileViewer
