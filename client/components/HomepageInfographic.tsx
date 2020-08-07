import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom'

import { Steps, Layout, Carousel, Card, Row, Col, Tag, Typography, Button } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

const { Content, Sider } = Layout;
const { Step } = Steps;
const { Meta } = Card;

import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import slide4 from "../assets/slide4.png";

import "../css/HomepageInfographic.css";

interface Slide {
    name: string;
    img: string; 
    tagline?: string;
    description: ReactNode;
}

interface HomepageInfographicProps {
    searchBarRef: any;
}

// Thank you to https://stackoverflow.com/questions/43441856/how-to-scroll-to-an-element
const scrollToRef = (ref) => {
    window.scrollTo({
        top: ref.current.offsetTop - 116,
        left: 0,
        behavior: "smooth"
    })
}

const HomepageInfographic : React.FC<HomepageInfographicProps> = ({ searchBarRef }) => { 
    const carousel = useRef(null)
    const [slideNum, setSlideNum] = useState(0)
    const [carouselHeight, setCarouselHeight] = useState(0);

    const slideContainerStyles = {
        minHeight: "576px", 
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto"
    }

    const slides : Slide[] = [
        {
            name: "Search for Documents",
            tagline: "",
            description: (
                <div className = "info-slide">
                    Begin your exploration by searching for keywords using the search bar. This will search both the file names and file contents. Once you search, you'll see a list of files, and can navigate through different pages on results on the bottom.
                    <br/>
                    <br/>
                    Under each the search results, you'll see a preview of relevant tags. Tags are broken down into <Tag color = "magenta">locations</Tag>, <Tag color = "orange">organizations</Tag>, and <Tag color = "purple">people</Tag>. Tags are supported for most relevant files, including spreadsheets, text documents, PDFs, and images.
                </div>
            ),
            img: `static${slide1}`,
        },
        {
            name: "Narrow your Search Results",
            tagline: "",
            description: 
            <div className = "info-slide">
                    Once you've made a search, you may want to further refine your search. You can filter the results only to files tagged with particular tags.
                    <br/>
                    <br/>
                    You can join together up to 5 different filters to further narrow down your results. You can also use filters to exlude documents that have specific tags.
                </div>,
            img: `static${slide2}`,
        },
        {
            name: "View Individual Document Information",
            tagline: "",
            description: 
            <div className = "info-slide">
                    On the document's page, you can view all tags associated with the document, broken down by category. If you feel that a document is missing and important tag, you can use the <PlusCircleOutlined></PlusCircleOutlined> button next to the header to add tags. 
                    <br/>
                    <br/>
                    You can join together up to 5 different filters to further narrow down your results. You can also use filters to exlude documents that have specific tags.
                </div>,
            img: `static${slide3}`,
        },
        {
            name: "Preview Documents and View Suggested Documents",
            tagline: "",
            description: 
                <div className = "info-slide">
                    The document page will often show a preview of the document for many filetypes. Below the preview is a list of links files that might be relevant to the current document you're viewing
                </div>,
            img: `static${slide4}`,
        }
    ]

    useEffect( () => {
        if(carousel != null && carousel.current != null){
            (carousel!.current! as any).goTo(slideNum);
        }
    }, [slideNum])

    return (
        <Row id = "info-layout" style = {{margin: 50}}>
            <Col xs = {24} sm = {8} md = {6} style = {{ minHeight: 500 }}>
                <div className = 'steps-container'>
                    <h1>A Typical Workflow</h1>
                    <Steps current = {slideNum} progressDot direction="vertical" onChange = {setSlideNum}>
                        { slides.map( (slide : Slide, ind: number) => (
                            <Step key = {ind} title={slide.name} description={slide.tagline} />
                        ))}
                    </Steps>
                    <Button style = {{ margin: 20 }} type="primary" onClick = {() => scrollToRef(searchBarRef)}>Get Started Exploring</Button>
                </div>
            </Col>
            <Col xs = {24} sm = {16} md = {18}>
                <Carousel className = {carouselHeight.toString()} dots = {false} dotPosition='right' ref = {carousel}>
                    { slides.map( (slide: Slide, ind: number) => {
                        // updateHeight();
                        return (
                            <div key = {ind} className = "info-slide-container">
                                <Card style = {slideContainerStyles} title = {slide.name} cover = {<img src = {slide.img}></img>}>
                                    <Meta description={slide.description}/>
                                </Card>
                            </div>
                        )
                }) }
                </Carousel>
            </Col>
            {/* Might add better mobile support later */}
            {/* <Row gutter={[16, 16]}>
            { slides.map( (slide : Slide) => (
                <Col xs = {24} sm = {24} md = {12} lg = {12} xl = {12}>
                <Card title = {slide.name} cover = {<img style = {{ padding: 20 }} src = {slide.img}></img>}>
                <Meta description= {slide.description}/>
                </Card>
                </Col>
            ))}
            </Row> */}
        </Row>
    )
}

export default HomepageInfographic