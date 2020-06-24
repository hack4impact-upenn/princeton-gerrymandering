import React from "react";
import ReactDOM from 'react-dom';

import { Result, Button } from "antd";

const PageNotFound : React.FC = () => {
    document.title = "Page Not Found"
    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to view this page"
            extra={<Button type="primary" href = "/login">Log In</Button>}
        />
    );
}

export default PageNotFound;