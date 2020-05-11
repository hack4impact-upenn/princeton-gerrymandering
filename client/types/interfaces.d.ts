export interface Tags {
    [propName: string]: string[];
};

export interface TagsMap {
    [propName: string]: string;
}

export interface Result {
    id: string;
    file: string;
    name: string;
    tags: Tags;
    text: string;
    type: string;
};

export interface Filter {
    attribute: string;
    filter: string;
    value: string;
    id: number;
    [propName: string]: any;
}
