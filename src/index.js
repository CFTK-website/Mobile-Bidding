import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import Login from './Login';
import Admin from './Admin';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
	<Router>
		<Switch>
			<Route exact={true} path="/" component={Login} />
			<Route exact={false} path="/" component={Admin} /> // TODO: insert Error Page
			<Route exact={true} path="/admin" component={Admin} />
		</Switch>
	</Router>
, root,);
registerServiceWorker();
