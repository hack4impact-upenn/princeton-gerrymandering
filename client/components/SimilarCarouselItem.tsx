import React from 'react';
import ReactDOM from 'react-dom';
import Link from "react-router";
import { Carousel, Card, Avatar } from 'antd';
import SearchResultsIcon from "../components/SearchResultsIcon";

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

interface SimilarCarouselItemProps {
    resource: Result
};

const SimilarCarouselItem: React.FC<SimilarCarouselItemProps> = ({ resource }) => {

    const avatarIcon = <SearchResultsIcon filetype={resource.type} />;

    return (
      <div>
        <Card>
          <Card.Meta
            avatar={<Avatar size={64} style={{ textAlign: "center" }} shape="square" icon={avatarIcon} />}
            title={<a href={`${resource.id}`}>{resource.name}</a>}
            description="This is the description"
          />
        </Card>
      </div>
    );
}

export default SimilarCarouselItem
