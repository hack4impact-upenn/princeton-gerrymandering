import React from 'react';
import ReactDOM from 'react-dom'
import { Carousel, Button } from 'antd';
import SimilarCarouselItem from "../components/SimilarCarouselItem";
import '../css/SimilarCarousel.css';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Result, Tags } from "../types/interfaces"

const SimilarCarousel: React.FC = () => {

    const listData : Result[] = [];
    for (let i = 0; i < 11; i++) {
      listData.push({
        id: i.toString(),
        file: 'test-data/2002 Districts 2010.xlsx',
        name: "2002 Districts 2010.xlsx",
        tags: {
          "locations": ["Arizona", "Bushwick", "California"],
          "orgs": ["RNC", "GOP", "DNC"],
          "groups": ["Latinos", "Asians"],
          "time": ["2002", "2020"]
        },
        text: "Ant Design, a design language for background applications, is refined by Ant UED Team.",
        type: "xlsx"
      });
    }

    function NextArrow(props:any) {
      const { className, style, onClick } = props;
      return (
        <div
          className={className}
          style={{ ...style }}
          onClick={onClick}
        >
        <Button type="primary" icon={<RightOutlined />} size="large" />
        </div>
      );
    }

    function PrevArrow(props:any) {
      const { className, style, onClick } = props;
      return (
        <div
          className={className}
          style={{ ...style}}
          onClick={onClick}
        >
        <Button type="primary" icon={<LeftOutlined />} size="large" />
        </div>
      );
    }

    const settings = {
      dots: false,
      infinite: false,
      slidesToShow: 3,
      slidesToScroll: 1,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      arrows: true
    };

    const resources = listData.map((resource, index) => (
        <SimilarCarouselItem key={index} resource={resource} />)
    );

    return (
      <Carousel {...settings}>
        {resources}
      </Carousel>
    );
}

export default SimilarCarousel
