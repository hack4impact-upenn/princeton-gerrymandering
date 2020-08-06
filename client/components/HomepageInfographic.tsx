import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom'

import { Steps, Layout, Carousel } from 'antd'
import { ReactNode } from 'react';

const { Content, Sider } = Layout;
const { Step } = Steps;

const contentStyle = {
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};

interface Slide {
    name: string;
    description?: string;
    body: ReactNode;
}

const HomepageInfographic = () => {
    const carousel = useRef(null)
    const [slideNum, setSlideNum] = useState(0)

    const slides : Slide[] = [
        {
            name: "Search Documents",
            description: "This is a description",
            body: <h1>Hello world, it is I</h1>
        },
        {
            name: "Filter Search Results",
            description: "This is a description",
            body: <h1>Hello world, it is I second</h1>
        },
        {
            name: "Explore Individual Documents",
            description: "This is a description",
            body: <h1>Hello world, it is I third</h1>
        }
    ]

    useEffect( () => {
        if(carousel != null && carousel.current != null){
            (carousel!.current! as any).goTo(slideNum);
        }
    }, [slideNum])

    return (
        <Layout style = {{margin: 50, backgroundColor: "white", padding: 20}}>
            <Sider>
                <Steps current = {slideNum} progressDot direction="vertical" onChange = {setSlideNum}>
                    { slides.map( (slide : Slide) => (
                        <Step title={slide.name} description={slide.description} />
                    ))}
                </Steps>
            </Sider>
            <Content>
                <Carousel dots = {false} dotPosition='right' ref = {carousel}>
                    { slides.map( (slide: Slide) => (
                        <div>
                            {slide.body}
                        </div>
                    )) }
                </Carousel>
            </Content>
        </Layout>
    )
}

export default HomepageInfographic