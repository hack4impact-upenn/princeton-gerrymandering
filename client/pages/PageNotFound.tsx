import React from "react";
import ReactDOM from 'react-dom';

import { Result, Button } from "antd";

const PageNotFound : React.FC = () => {
    document.title = "Page Not Found"
    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary" href = "/">Back Home</Button>}
        />
    );
}

export default PageNotFound;