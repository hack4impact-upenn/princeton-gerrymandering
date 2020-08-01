import React from 'react';
import ReactDOM from 'react-dom'
import { Carousel, Button } from 'antd';
import SimilarCarouselItem from "../components/SimilarCarouselItem";
import '../css/SimilarCarousel.css';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Result, Tags } from "../types/interfaces"

interface SimilarCarouselSuggestions {
  suggestions: Result[];
  refresh: () => void;
}

const SimilarCarousel: React.FC<SimilarCarouselSuggestions> = ({suggestions,  refresh}) => {
    const listData : Result[] = suggestions;
    
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
