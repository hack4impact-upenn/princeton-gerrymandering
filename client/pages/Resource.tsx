import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Layout, Button, Spin, List, Typography, Tag, Collapse, PageHeader, Divider } from 'antd';
import { DownloadOutlined, UpOutlined, DownOutlined, CaretRightOutlined, PlusCircleOutlined } from '@ant-design/icons';
const { Content, Footer } = Layout;
import Navbar from "../components/Navbar";
import SimilarCarousel from "../components/SimilarCarousel";
import FileViewer from "../components/FileViewer";
import AddTagsModal from "../components/AddTagsModal";
import { Redirect } from 'react-router-dom';
import { Result, Tags, TagsMap } from "../types/interfaces"

import {
    useParams
} from "react-router-dom";

import PageNotFound from './PageNotFound';
import secureRequest from '../util/secureRequest';
import isAuthenticated from '../util/isAuthenticated';
import ResourceTagList from '../components/ResourceTagList';


const Resource: React.FC = () => {
    const [resource, setResource] = useState<undefined | Result>(undefined);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setAdmin] = useState(false)

    let { id } = useParams();
    const url = `/api/resource/${id}`;

    const loadResource = () => {
        secureRequest(url, "GET", {}).then((data) => {
            const result = data.hits.hits[0];
            if (result) {
                const filename = result._source.path;

                const tags: Tags = {}

                Object.keys(result._source.tags).forEach((tag: string) => {
                    let tagList: string[] = result._source.tags[tag];
                    let tagSet: Set<string> = new Set<string>(tagList);
                    tagList = [...tagSet];
                    tags[tag] = tagList;
                });

                const newResult: Result = {
                    id: result._id,
                    file: result._source.path,
                    name: result._source.name,
                    tags: tags,
                    text: result._source.text,
                    type: result._source.filetype,
                }

                if (result._source.filetype == "shapefile") {
                    newResult.geojson = result._source.geojson
                }

                document.title = newResult.name;
                setResource(newResult);
                setLoading(false);
            }
            else {
                setLoading(false);
                setResource(undefined);
            }
        }).catch((error) => {
            console.error(error)
        })
    }

    useEffect(() => {
        loadResource();
        (isAuthenticated() as any).then( (data ) => {
            setAdmin(data.admin)
        }).catch( (err) => {
            setAdmin(false);
        })
    }, []);

    const downloadFile = (id) => {
        secureRequest(`/api/resource/link/${id}`, "GET").then( (data) => {
            window.location = data.url
        }).catch( (error) => {
            console.log(error)
        })
    }

    const renderHeader = () => {
        return (
            resource && resource.name &&
            <PageHeader onBack={() => history.back()} style={{ padding: 0 }} title={resource.name} extra={[
                <Button key={1} type="primary" size="large" onClick = {() => downloadFile(resource.id)} icon={<DownloadOutlined />}>Download</Button>
            ]}></PageHeader>
        )
    }

    if (resource == null && !loading) {
        return <PageNotFound></PageNotFound>
    }

    return (
        <Layout>
            <Navbar></Navbar>
            <Content className="site-layout" style={{ padding: '50px', paddingBottom: 0, marginTop: 64 }}>
                <div className="site-layout-content" style={{ background: "#fff", padding: 50 }}>
                    {renderHeader()}
                    <Divider style={{ fontSize: 18, marginTop: 40 }}>
                        Document Tags
                        <AddTagsModal refresh = {loadResource} resourceId={id}></AddTagsModal>
                    </Divider>
                    <ResourceTagList refresh = {loadResource} resource = {resource} isAdmin = {isAdmin}></ResourceTagList>
                    <Divider style={{ fontSize: 18, marginTop: 40 }}>File Preview</Divider>
                    <FileViewer resource={resource}></FileViewer>
                    <Divider style={{ fontSize: 18, marginTop: 40 }} >Similar Files</Divider>
                    <SimilarCarousel />
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hoeffler Files</Footer>
        </Layout>
    );
}

export default Resource;
