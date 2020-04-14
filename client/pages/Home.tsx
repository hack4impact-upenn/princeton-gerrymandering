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

interface Filter {
    attribute: string;
    filter: string;
    value: string;
}

interface Tags {
    [propName: string]: string[];
}

interface Result {
    id: string;
    file: string;
    name: string;
    tags: Tags;
    text: string;
    type: string;
}

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

    // const listData = [];
    // for (let i = 0; i < 11; i++) {
    //   listData.push({
    //     id: i.toString(),
    //     file: 'test-data/2002 Districts 2010.xlsx',
    //     name: "2002 Districts 2010.xlsx",
    //     tags: {
    //       "locations": ["Arizona", "Bushwick", "California"],
    //       "orgs": ["RNC", "GOP", "DNC"],
    //       "groups": ["Latinos", "Asians"],
    //       "time": ["2002", "2020"]
    //     },
    //     text: "Ant Design, a design language for background applications, is refined by Ant UED Team.",
    //     type: "xlsx"
    //   });
    // }

    const search = (values : any, page_ : number, pageSize_ : number) => {
        setLoaded(false);
        setShowResults(true);
        setPage(1);
        axios.post<PostQuery>("http://localhost:5000/api/search", {
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
                    tags[tag] = tagList;
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
                <SearchResultsList page = {page} showResults={showResults} results={results} resultsLoaded = {loaded} onPageChange = {onPageChange} totalResults = {totalResults}></SearchResultsList>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hofeller Files</Footer>
        </Layout>
    );
};

export default Home;
