import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Layout, Button, Spin, List, Typography, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
const { Content, Footer } = Layout;
import Navbar from "../components/Navbar";
import SimilarCarousel from "../components/SimilarCarousel";
import FileViewer from "../components/FileViewer";
import { Redirect } from 'react-router-dom';
import { Result, Tags, TagsMap } from "../types/interfaces"

import {
  useParams
} from "react-router-dom";
import PageNotFound from './PageNotFound';


const Resource : React.FC = () => {
    const [resource, setResource] = useState<undefined|Result>(undefined);
    const [loading, setLoading] = useState(true);
    let { id } = useParams();
    const url = `/api/resource/${id}`;

    useEffect(() => {
      const fetchData = async () => {
        const res = await axios(url);
        const data = res.data as any;
        const result = data.hits.hits[0];
        if (result) {
          const filename = result._source.path;
          const file_ext = filename.split(".").slice(-1)[0]

          const tags : Tags = {}
          Object.keys(result._source.tags).forEach( (tag : string) => {
              let tagList : string[] = result._source.tags[tag];
              let tagSet : Set<string> = new Set<string>(tagList);
              tagList = [...tagSet];
              tags[tag] = tagList;
          });

          const newResult : Result = {
              id: result._id,
              file: result._source.path,
              name: result._source.name,
              tags: tags,
              text: result._source.text,
              type: file_ext,
          }
          document.title = newResult.name;
          setResource(newResult);
          setLoading(false);
        }
        else {
          setLoading(false);
          setResource(undefined);
        }
      };
      fetchData();
    }, []);

    const renderTitle = () => {
      return (
        resource && resource.name && <h1>{resource.name}</h1>
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
              <Tag key={index} color={tag.color} style={{margin: "5px !important"}}>{tag.text}</Tag>
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
        "people": "purple",
      };
      if (resource && resource.tags && resource.tags[tag] && resource.tags[tag].length > 0) {
        return (<List.Item key={tag}>
          <List.Item.Meta title={tag[0].toUpperCase() + tag.slice(1)} description={renderTags(tag, colorMap[tag])} />
        </List.Item>)
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
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Document Tags</h3>
          <List bordered>
            {tagsToShow.map(
              tag => (
                renderTagsListItem(tag)
              )
            )}
          </List>
        </React.Fragment>
      );
    }

    if (resource == null && !loading){
      return <PageNotFound></PageNotFound>
    }

    return (
      <Layout>
          <Navbar></Navbar>
          <Content className="site-layout" style={{ padding: '50px', paddingBottom: 0, marginTop: 64 }}>
            <div className="site-layout-content" style={{ background: "#fff", padding: 24 }}>
              {renderTitle()}
              <Button type="primary" size="large" href = {`https://princeton-gerrymandering.s3.amazonaws.com/${resource && resource.file}`} icon={<DownloadOutlined />}>Download</Button>
                {renderTagsList()}
              <FileViewer type={resource && resource.type} link={`https://princeton-gerrymandering.s3.amazonaws.com/${resource && resource.file}`}/>
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>Similar Resources</h3>
              <SimilarCarousel/>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>The Hoeffler Files</Footer>
      </Layout>
    );
}

export default Resource;
