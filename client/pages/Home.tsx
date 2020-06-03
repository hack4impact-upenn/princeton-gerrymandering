import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import axios, { AxiosResponse, AxiosError } from 'axios';

import { Layout, Breadcrumb, Row, Col, Input, Button, Card, Tag } from 'antd';
const { Search } = Input;
const { Content, Footer } = Layout;

import { FilterOutlined } from "@ant-design/icons";
import Navbar from "../components/Navbar";
import FilterModal from "../components/FilterModal";
import SearchResultsList from "../components/SearchResultsList";
import FilterList from "../components/FilterList";
import Banner from "../assets/banner.svg";
import { Result, Tags, Filter } from "../types/interfaces"
import queryString from 'query-string'
import { RouteComponentProps } from 'react-router-dom';
import RelevancyGraph from '../components/RelevancyGraph';

interface PostQuery {
    query: string;
    filters: Array<Filter>;
    isOr: boolean;
    page: number;
    pageSize: number;
}

const Home: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
    let page_size_param : number = 5;
    let page_param : number = 1;
    let query_param : string = "";
    let filters_param : Filter[] = [];

    try {
        const params = queryString.parse(props.location.search);
        filters_param = params.filters == undefined ? [] : JSON.parse(decodeURIComponent(params.filters as string));
        query_param = params.query == undefined ? "" : params.query as string
        page_param = params.page == undefined ? 1 : parseInt(params.page as string);
        page_size_param = params.pageSize == undefined ? 5 : parseInt(params.pageSize as string);
    } catch {

    }

    document.title = "The Hofeller Files"

    const [isModalShowing, setModalShowing] = useState(false);
    const [filters, setFilters] = useState<Filter[]>(filters_param)
    const [query, setQuery] = useState(query_param);
    const [isOr, setIsOr] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [results, setResults] = useState<Result[]>([]);

    const [totalResults, setTotalResults] = useState(0);
    const [pageSize, setPageSize] = useState(page_size_param);
    const [page, setPage] = useState(page_param)

    const search = (values: any, page_: number, pageSize_: number) => {
        
        history.pushState({
            filters,
            query,
            page,
            pageSize
        }, "The Hofeller Files", "?" + queryString.stringify({
            filters: encodeURIComponent(JSON.stringify(filters)),
            query,
            page,
            pageSize
        }))

        setLoaded(false);
        setShowResults(true);
        axios.post<PostQuery>("/api/search", {
            query,
            filters,
            isOr,
            page: page_,
            pageSize: pageSize_
        }).then((res) => {
            const data = res.data as any;
            const hits = data.hits.hits

            setTotalResults(data.hits.total.value);

            const results: Result[] = []
            hits.forEach((document: any) => {
                const filename = document._source.path;
                const file_ext = filename.split(".").slice(-1)[0]


                const tags: Tags = {}
                Object.keys(document._source.tags).forEach((tag: string) => {
                    let tagList: string[] = document._source.tags[tag];
                    let tagSet: Set<string> = new Set<string>(tagList);
                    tagList = [...tagSet];
                    tags[tag] = tagList.slice(0, 8);
                });

                const newResult: Result = {
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

        }).catch((err) => {
            console.log(err)
        })
    };

    useEffect(() => {
        if(query_param != ""){
            search({}, page, pageSize);
        }
    }, [])

    useEffect(() => {
        if (showResults) {
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
        setPage(newPage);
        if (typeof newPageSize !== undefined) {
            setPageSize(newPageSize || 10);
        }
        search(query, newPage, newPageSize || 10);
    }

    return (
        <Layout>
            <Navbar></Navbar>
            <Content className="site-layout" style={{ padding: 0, paddingBottom: 0, marginTop: 64 }}>
                <Row style = {{backgroundColor: "#376996"}}>
                    <Col xs = {24} sm = {24} md = {24} lg = {16} xl = {16} style = {{padding: 20}}>
                        <RelevancyGraph width = {400}></RelevancyGraph>
                        <p style ={{ position: "absolute", color: "white", bottom: 0}}>A few of the 15000 files</p>
                    </Col>
                    <Col xs = {24} sm = {24} md = {24} lg = {8} xl = {8} style = {{padding: "60px 60px 60px 0"}}>
                        <Card>
                        More than a year after his death, a cache of computer files saved on the hard drives of Thomas Hofeller, a prominent Republican redistricting strategist, is becoming public. Republican state lawmakers in North Carolina fought in court to keep copies of these maps, spreadsheets and other documents from entering the public record. But some files have already come to light in recent months through court filings and news reports.
                        <br/><br/>
                        {/* They have been cited as evidence of gerrymandering that got political maps thrown out in North Carolina, and they have raised questions about Hofeller's role in the Trump administration's failed push for a census citizenship question.<br></br> */}
                       
                        Search files by keywords, filtering by <Tag color = "magenta">location</Tag>, <Tag color = "orange">organizations</Tag>, and <Tag color = "purple">people</Tag>. Documents have been tagged with semantic information, and also will provide links to relevant files.
                        </Card>
                    </Col>
                </Row>
                <div className="site-layout-content" style={{ background: "#fff", padding: 74 }}>
                    <Search defaultValue={query} placeholder="Search for files..." onSearch={(values) => search(values, page, pageSize)} onChange={(e) => setQuery(e.target.value)} size="large" enterButton />
                    <Button type="link" style={{ padding: "10px 10px 10px 0" }} onClick={() => setModalShowing(true)}><FilterOutlined></FilterOutlined>Filter Results</Button>
                    <FilterList filters={filters} updateFilters={updateFilters}></FilterList>
                    <FilterModal filters={filters} show={isModalShowing} onClose={closeModal} updateFilters={updateFilters} updateIsOr={updateIsOr} isOr={isOr} />
                    <SearchResultsList pageSize={pageSize} page={page} showResults={showResults} results={results} resultsLoaded={loaded} onPageChange={onPageChange} totalResults={totalResults}></SearchResultsList>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hofeller Files</Footer>
        </Layout>
    );
};

export default Home;
