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


const Resource: React.FC = () => {
    const [resource, setResource] = useState<undefined | Result>(undefined);
    const [loading, setLoading] = useState(true);

    let { id } = useParams();
    const url = `/api/resource/${id}`;

    useEffect(() => {
        secureRequest(url, "GET", {}).then( (data) => {
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

                if(result._source.filetype == "shapefile"){
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
        }).catch( (error) => {
            console.error(error)
        })


        // const fetchData = async () => {
        //     const res = await axios(url);
        //     const data = res.data as any;
        //     const result = data.hits.hits[0];
        //     if (result) {
        //         const filename = result._source.path;

        //         const tags: Tags = {}
        //         Object.keys(result._source.tags).forEach((tag: string) => {
        //             let tagList: string[] = result._source.tags[tag];
        //             let tagSet: Set<string> = new Set<string>(tagList);
        //             tagList = [...tagSet];
        //             tags[tag] = tagList;
        //         });

        //         const newResult: Result = {
        //             id: result._id,
        //             file: result._source.path,
        //             name: result._source.name,
        //             tags: tags,
        //             text: result._source.text,
        //             type: result._source.filetype,
        //         }

        //         if(result._source.filetype == "shapefile"){
        //             newResult.geojson = result._source.geojson
        //         }

        //         document.title = newResult.name;
        //         setResource(newResult);
        //         setLoading(false);
        //     }
        //     else {
        //         setLoading(false);
        //         setResource(undefined);
        //     }
        // };
        // fetchData();
    }, []);

    const renderHeader = () => {
        return (
            resource && resource.name && 
                <PageHeader onBack = { () => history.back() }style = {{ padding: 0 }} title = {resource.name} extra = {[
                    <Button key = {1} type="primary" size="large" href={`https://princeton-gerrymandering.s3.amazonaws.com/${resource && resource.file}`} icon={<DownloadOutlined />}>Download</Button>
                ]}></PageHeader>
        )
    }

    const renderTags = (tagName: string, color: string) => {
        const tagsList = resource && resource.tags && resource.tags[tagName] ? resource.tags[tagName] : [];
        const tags: { text: string; color: string; }[] = [];
        tagsList.forEach(tag => {
            tags.push({
                "text": tag,
                "color": color
            });
        });
        return (
            tags.map(
                (tag, index) => (
                    <Tag key={index} color={tag.color} style={{ margin: "5px !important" }}>{tag.text}</Tag>
                )
            )
        );
    }

    const renderTagsListItem = (tag: string) => {
        const colorMap: TagsMap = {
            "locations": "magenta",
            "orgs": "orange",
            "groups": "green",
            "time": "geekblue",
            "people": "purple"
        };

        const displayTags : TagsMap = {
            "locations": "Locations",
            "orgs": "Organizations",
            "groups": "Groups",
            "time": "Dates and Times",
            "people": "People",
        }

        if (resource && resource.tags && resource.tags[tag] && resource.tags[tag].length > 0) {
            return (
                <Collapse.Panel header = {displayTags[tag]} key = {tag}>
                    {renderTags(tag, colorMap[tag])}
                </Collapse.Panel>
            )
        }
        return null;
    }

    const renderTagsList = () => {
        const tagsToShow = ["locations", "people", "orgs"];
        const isFalsy = (elt: any) => elt.length == 0;
        const entries = resource && resource.tags && Object.entries(resource.tags) ? Object.entries(resource.tags).map(x => x[1]) : [];
        const noTags = entries.every(isFalsy);
        if (noTags) {
            return null;
        }
        return (
            <React.Fragment>
                <Collapse bordered = {true} expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
                    {tagsToShow.map(
                        tag => (
                            renderTagsListItem(tag)
                        )
                    )}
                </Collapse>
            </React.Fragment>
        );
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
                    <Divider style = {{ fontSize: 18, marginTop: 40 }}>
                        Document Tags
                        <AddTagsModal></AddTagsModal>
                    </Divider>
                        {renderTagsList()}
                    <Divider style = {{ fontSize: 18, marginTop: 40 }}>File Preview</Divider>
                    <FileViewer resource = {resource}></FileViewer>
                    <Divider style = {{ fontSize: 18, marginTop: 40 }} >Similar Files</Divider>
                    <SimilarCarousel />
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hoeffler Files</Footer>
        </Layout>
    );
}

export default Resource;
