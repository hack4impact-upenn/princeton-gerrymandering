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
    const failedResult: Result[] = [{
        id: "0",
        file: 'Failed setSuggestion',
        name: "Error, File Not Found",
        tags: {
        },
        text: "Ant Design, a design language for background applications, is refined by Ant UED Team.",
        type: ""
    }]
    const [resource, setResource] = useState<undefined | Result>(undefined);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setAdmin] = useState(false)
    const [suggestion, setSuggestion] =  useState<Result[]>(failedResult);

    let { id } = useParams();
    const resourceUrl = `/api/resource/${id}`;
    const suggestionUrl =  `/api/suggest/${id}`;

    const loadResource = () => {
        secureRequest(resourceUrl, "GET", {}).then((data) => {
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
    const loadSuggestions = () => {
        secureRequest(suggestionUrl, "GET", {}).then((data) => {
            const listData : Result[] = [];
            var i;
            for (i = 0; i < data.recs.length; i++) {
                const resultJSON = JSON.parse(data.recs[i])
                const result = resultJSON.hits.hits[0];
                if (result) {
                    const tags: Tags = {}  
                    Object.keys(result._source.tags).forEach((tag: string) => {
                        let tagList: string[] = result._source.tags[tag];
                        let tagSet: Set<string> = new Set<string>(tagList);
                        tagList = [...tagSet];
                        tags[tag] = tagList;
                    });
                    const rec: Result = {
                        id: result._id,
                        file: result._source.path,
                        name: result._source.name,
                        tags: tags,
                        text: result._source.text,
                        type: result._source.filetype,
                    }
                    listData.push(rec);    
                    
                }
                else {
                    console.log("Failed Result")
                    const failedRec: Result = {
                        id: "0",
                        file: 'Error, File Not Found',
                        name: "Error, File Not Found",
                        tags: {
                        },
                        text: "Ant Design, a design language for background applications, is refined by Ant UED Team.",
                        type: ""
                      }
                    listData.push(failedRec);    
                }
            
            }
            setSuggestion(listData);
        }).catch((error) => {
            console.error(error)
        })
        
    }

    useEffect(() => {
        loadResource();
        loadSuggestions();
        (isAuthenticated() as any).then( (data ) => {
            setAdmin(data.admin)
        }).catch( (err) => {
            setAdmin(false);
        })
    }, []);

    const renderHeader = () => {
        return (
            resource && resource.name &&
            <PageHeader onBack={() => history.back()} style={{ padding: 0 }} title={resource.name} extra={[
                <Button key={1} type="primary" size="large" href={`https://hack4impact-hoffler-files.s3.us-east-2.amazonaws.com/${resource && resource.file}`} icon={<DownloadOutlined />}>Download</Button>
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
                    <SimilarCarousel suggestions = {suggestion} refresh = {loadSuggestions}></SimilarCarousel>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hoeffler Files</Footer>
        </Layout>
    );
}

export default Resource;
