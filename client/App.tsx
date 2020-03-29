import React from 'react';
import {BrowserRouter as Router, Switch, Route, BrowserRouter} from 'react-router-dom';

import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";

const App : React.FC = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path = "/" exact component = { Home }></Route>
                <Route path = "/" component = { PageNotFound }></Route>
            </Switch>
        </BrowserRouter>
    )
}

export default App;