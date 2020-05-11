import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import axios, { AxiosResponse, AxiosError } from 'axios';

import { Layout, Breadcrumb, Row, Col, Input, Button } from 'antd';
const { Search } = Input;
const { Content, Footer } = Layout;

import { FilterOutlined } from "@ant-design/icons";
import Navbar from "../components/Navbar";
import FilterModal from "../components/FilterModal";
import SearchResultsList from "../components/SearchResultsList";
import Banner from "../assets/banner.svg";
import { Result, Tags, Filter } from "../types/interfaces.d.ts"

interface PostQuery {
    query: string;
    filters: Array<Filter>;
    isOr: boolean;
    page: number;
    pageSize: number;
}


const Home: React.FC = () => {
    document.title = "The Hofeller Files"

    const [isModalShowing, setModalShowing] = useState(false);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [query, setQuery] = useState("");
    const [isOr, setIsOr] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [results, setResults] = useState<Result[]>([]);

    const [totalResults, setTotalResults] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [page, setPage] = useState(1)

    const search = (values : any, page_ : number, pageSize_ : number) => {
        setLoaded(false);
        setShowResults(true);
        axios.post<PostQuery>("/api/search", {
            query,
            filters,
            isOr,
            page: page_,
            pageSize: pageSize_
        }).then( (res) => {
            const data = res.data as any;
            const hits = data.hits.hits

            setTotalResults(data.hits.total.value);

            const results : Result[] = []
            hits.forEach( (document : any) => {
                const filename = document._source.path;
                const file_ext = filename.split(".").slice(-1)[0]


                const tags : Tags = {}
                Object.keys(document._source.tags).forEach( (tag : string) => {
                    let tagList : string[] = document._source.tags[tag];
                    let tagSet : Set<string> = new Set<string>(tagList);
                    tagList = [...tagSet];
                    tags[tag] = tagList.slice(0, 8);
                });

                const newResult : Result = {
                    id: document._id,
                    file: document._source.path,
                    name: document._source.name,
                    tags: tags,
                    text: document._source.text,
                    type: file_ext
                }
                results.push(newResult);
            });
            setLoaded(true);
            setResults(results);

        }).catch( (err) => {
            console.log(err)
        })
    };

    useEffect(() => {
      if( showResults ){
        setPage(1);
        search(query, page, pageSize);
      }
    }, [filters])

    const closeModal = () => {
      setModalShowing(false);
    };

    const updateFilters = (filters: Array<Filter>) => {
      setFilters(filters);
    }

    const updateIsOr = (or: boolean) => {
      setIsOr(or);
    }

    // Want to make it only load the ones needed instead of all for performance
    const onPageChange = (newPage: number, newPageSize: number | undefined) => {
      console.log(newPageSize);
      setPage(newPage);
      if(typeof newPageSize !== undefined){
        setPageSize(newPageSize || 10);
      }
      search(query, newPage, newPageSize || 10);
    }

    return (
        <Layout>
            <Navbar></Navbar>
            <Content className="site-layout" style={{ padding: '50px', paddingBottom: 0, marginTop: 64 }}>
              <div className="site-layout-content" style={{ background: "#fff", padding: 24 }}>
                <Search placeholder="Search for files..." onSearch={(values) => search(values, page, pageSize)} onChange={(e) => setQuery(e.target.value)} size="large" enterButton />
                <Button type="link" style={{ padding: "10px 10px 10px 0" }} onClick={() => setModalShowing(true)}><FilterOutlined></FilterOutlined>Filter Results</Button>
                <FilterModal show={isModalShowing} onClose={closeModal} updateFilters={updateFilters} updateIsOr={updateIsOr} isOr={isOr}/>
                <SearchResultsList pageSize = {pageSize} page = {page} showResults={showResults} results={results} resultsLoaded = {loaded} onPageChange = {onPageChange} totalResults = {totalResults}></SearchResultsList>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hofeller Files</Footer>
        </Layout>
    );
};

export default Home;
