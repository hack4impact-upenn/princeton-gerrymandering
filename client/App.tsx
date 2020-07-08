import React from 'react';
import {BrowserRouter as Router, Switch, Route, BrowserRouter} from 'react-router-dom';

import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import Resource from "./pages/Resource";
import Login from './pages/Login';
import Unauthorized from "./pages/Unauthorized"
import Users from './pages/Users';

const App : React.FC = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path = "/" exact component = { Home } />
                <Route path = "/unauthorized" exact component = { Unauthorized } />
                <Route path = "/login" exact component = {Login} />
                <Route path = "/resource/:id" exact component = { Resource } />
                <Route path = "/users" exact component = { Users } /> 
                <Route path = "/" component = { PageNotFound } />
            </Switch>
        </BrowserRouter>
    )
}

export default App;
