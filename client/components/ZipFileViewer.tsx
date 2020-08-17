import React from 'react';
import ReactDOM from 'react-dom'

import { Tree } from 'antd';
const { DirectoryTree } = Tree;

interface AntTree {
    title: string;
    key: string;
    children: AntTree[]
}

interface ZipFileViewerProps {
    data: [AntTree]
}

const ZipFileViewer : React.FC<ZipFileViewerProps> = ({ data } : ZipFileViewerProps) => {
    return (
        <DirectoryTree
        defaultExpandAll
        treeData={ data }
    />
    )
}

export default ZipFileViewer