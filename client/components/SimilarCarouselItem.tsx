import React from 'react';
import ReactDOM from 'react-dom';
import Link from "react-router";
import { Carousel, Card, Avatar } from 'antd';
import SearchResultsIcon from "../components/SearchResultsIcon";
import { Result, Tags } from "../types/interfaces"


interface SimilarCarouselItemProps {
    resource: Result
};

const SimilarCarouselItem: React.FC<SimilarCarouselItemProps> = ({ resource }) => {

    const avatarIcon = <SearchResultsIcon filetype={resource.type} />;

    var str = resource.text;
    if(str.length > 10) str = str.substring(0,30);

    return (
      <div>
        <Card>
          <Card.Meta
            avatar={<Avatar size={64} style={{ textAlign: "center" }} shape="square" icon={avatarIcon} />}
            title={<a href={`${resource.id}`}>{resource.name}</a>}
            description={str}
          />
        </Card>
      </div>
    );
}

export default SimilarCarouselItem
