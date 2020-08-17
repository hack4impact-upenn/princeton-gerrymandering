import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Collapse, Tag, Empty } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { Result, Tags, TagsMap } from "../types/interfaces"

import secureRequest from "../util/secureRequest";

interface TagListProps {
    resource: undefined | Result;
    isAdmin: boolean;
    refresh: () => void;
}

const ResourceTagList: React.FC<TagListProps> = ( {resource, isAdmin, refresh} ) => {
    const tagsToShow = ["locations", "people", "orgs"];
    const isFalsy = (elt: any) => elt.length == 0;
    const entries = resource && resource.tags && Object.entries(resource.tags) ? Object.entries(resource.tags).map(x => x[1]) : [];
    const noTags = entries.every(isFalsy);
    if (noTags) {
        return null;
    }

    const removeTag = (tagType, tagValue) => {
        secureRequest("/api/tags/remove", "POST", {
            tagType,
            tagValue, 
            resourceId: resource?.id
        }).then( (_) => {
            refresh();
        })
    }

    const renderTags = (tagName: string, color: string) => {
        const tagsList = resource && resource.tags && resource.tags[tagName] ? resource.tags[tagName] : [];
        const tags: { text: string; color: string; }[] = [];
        tagsList.forEach(tag => {
            tags.push({
                "text": tag,
                "color": color
            });
        });
        return (
            tags.map(
                (tag, index) => (
                    <Tag closable = {isAdmin} onClose = {(e) => removeTag(tagName, tag.text)} key={index} color={tag.color} style={{ margin: "5px !important" }}>{tag.text}</Tag>
                )
            )
        );
    }

    const renderTagsListItem = (tag: string) => {
        const colorMap: TagsMap = {
            "locations": "magenta",
            "orgs": "orange",
            "groups": "green",
            "time": "geekblue",
            "people": "purple"
        };

        const displayTags: TagsMap = {
            "locations": "Locations",
            "orgs": "Organizations",
            "groups": "Groups",
            "time": "Dates and Times",
            "people": "People",
        }

        if (resource && resource.tags && resource.tags[tag] && resource.tags[tag].length > 0) {
            return (
                <Collapse.Panel header={displayTags[tag]} key={tag}>
                    {renderTags(tag, colorMap[tag])}
                </Collapse.Panel>
            )
        }
        return null;
    }

    let tagList = tagsToShow.map(
        tag => (
            renderTagsListItem(tag)
        )
    )

    // Check if any tags
    let reducer = (acc, x) => (x != null || acc);
    let hasTags = tagList.reduce( reducer, false );

    console.log(hasTags)

    return (
        <React.Fragment>
            { hasTags && 
                <Collapse bordered={true} expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
                    { tagList }
                </Collapse>
            }
            { !hasTags && <Empty description = {"No file tags available"}></Empty>}
        </React.Fragment>
    );
}

export default ResourceTagList