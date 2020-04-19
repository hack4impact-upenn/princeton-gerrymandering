import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Layout, Button, Spin, List, Typography, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
const { Content, Footer } = Layout;
import Navbar from "../components/Navbar";
import SimilarCarousel from "../components/SimilarCarousel";
import { Redirect } from 'react-router-dom';

import {
  useParams
} from "react-router-dom";
import PageNotFound from './PageNotFound';

interface Tags {
    [propName: string]: string[];
}

interface TagsMap {
    [propName: string]: string;
}

interface Result {
    id: string;
    file: string;
    name: string;
    tags: Tags;
    text: string;
    type: string;
}

const Resource : React.FC = () => {
    const [resource, setResource] = useState<null|Result>(null);
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
          setResource(null);
        }
      };
      fetchData();
    }, []);

    const renderTitle = () => {
      return (
        resource && resource.name && <h1>{resource.name}</h1>
      )
    }
    const renderTagsItem = (tagName: string, color: string) => {
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

    const renderTags = () => {
      const tagsToShow = ["locations", "people", "orgs"];
      const colorMap: TagsMap = {
        "locations": "magenta",
        "orgs": "orange",
        "groups": "green",
        "time": "geekblue",
        "people": "purple",
      };
      return (
        tagsToShow.map(
          tag => (
            <List.Item key={tag}>
              <List.Item.Meta title={tag.toUpperCase()} description={renderTagsItem(tag, colorMap[tag])} />
            </List.Item>
          )
        )
      );
    }

    if(resource == null && !loading){
      return <PageNotFound></PageNotFound>
    }

    return (
      <Layout>
          <Navbar></Navbar>
          <Content className="site-layout" style={{ padding: '50px', paddingBottom: 0, marginTop: 64 }}>
            <div className="site-layout-content" style={{ background: "#fff", padding: 24 }}>
              {renderTitle()}
              <Button type="primary" size="large" href = {`https://princeton-gerrymandering.s3.amazonaws.com/${resource && resource.file}`} icon={<DownloadOutlined />}>Download</Button>
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>Document Tags</h3>
              <List bordered>
                {renderTags()}
              </List>
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>Similar Resources</h3>
              <SimilarCarousel/>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>The Hoeffler Files</Footer>
      </Layout>
    );
}

export default Resource;
