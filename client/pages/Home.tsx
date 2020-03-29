import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'
import axios, { AxiosResponse, AxiosError } from 'axios';

import { Layout, Breadcrumb, Row, Col } from 'antd';
import Navbar from "../components/Navbar";

import Banner from "../assets/banner.svg";

interface ServerResponse {
    testing: string
}

const Home: React.FC = () => {
    // How to use axios with react-hooks

    // const [name, setName] = useState("default");

    // useEffect(() => {
    //     axios.get<ServerResponse>("api").then((res: AxiosResponse<ServerResponse>) => {
    //         alert("Hey")
    //         console.log(res.data.testing)
    //     }).catch((error: AxiosError) => {
    //         console.log("Error");
    //     })
    // })

    return (
        <Layout>
            <Navbar></Navbar>
            <Layout.Content className="site-layout" style={{ padding: '0', marginTop: 64 }}>
                
            </Layout.Content>
            <Layout.Footer style={{ textAlign: 'center' }}>The Hoeffler Files</Layout.Footer>

        </Layout>
    );
}

export default Home  
