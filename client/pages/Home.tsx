import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import axios, { AxiosResponse, AxiosError } from 'axios';

import { Layout, Breadcrumb, Row, Col, Input, Button } from 'antd';
const { Search } = Input;
const { Content, Footer } = Layout;
import Navbar from "../components/Navbar";
import FilterModal from "../components/FilterModal";
import Banner from "../assets/banner.svg";

interface Filter {
    attribute: string;
    filter: string;
    value: string;
}

interface PostQuery {
    query: string;
    filters: Array<Filter>;
    isOr: boolean
}

const Home: React.FC = () => {
    const [isModalShowing, setModalShowing] = useState(false);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [query, setQuery] = useState("");
    const [isOr, setIsOr] = useState(false);

    const search = (values : any) => {
        axios.post<PostQuery>("http://localhost:5000/api/search", {
            query,
            filters,
            isOr
        }).then( (res) => {
            console.log(res);
        }).catch( (err) => {
            console.log(err)
        })
    };

    const closeModal = () => {
      setModalShowing(false);
    };

    const updateFilters = (filters: Array<Filter>) => {
      setFilters(filters);
    }

    const updateIsOr = (or: boolean) => {
      setIsOr(or);
    }

    return (
        <Layout>
            <Navbar></Navbar>
            <Content className="site-layout" style={{ padding: '50px', paddingBottom: 0, marginTop: 64 }}>
              <div className="site-layout-content" style={{ background: "#fff", padding: 24 }}>
                <Search placeholder="Search for files..." onSearch={search} onChange={(e) => setQuery(e.target.value)} size="large" enterButton />
                <Button type="link" style={{ paddingLeft: 0 }} onClick={() => setModalShowing(true)}>Filter</Button>
                <FilterModal show={isModalShowing} onClose={closeModal} updateFilters={updateFilters} updateIsOr={updateIsOr} isOr={isOr}/>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>The Hoeffler Files</Footer>

        </Layout>
    );
}

export default Home
