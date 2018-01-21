/* global gapi */

import React, {
    Component
} from 'react';
import fire from './fire';
import Navbar from './Navbar';
import Item from './Item';

// var fs = require('fs');
// var readline = require('readline');
// var google = require('googleapis');
// var googleAuth = require('google-auth-library');

const API_KEY = 'AIzaSyCwCNH9_XIylVTrGLUxXoFs_mZdocFjXzg';
// var CLIENT_ID = '106678752149-b866dj46pea661up5rog69raduuilefc.apps.googleusercontent.com';
var SCOPES = ['https://mail.google.com/',
	'https://www.googleapis.com/auth/gmail.send',
	'https://www.googleapis.com/auth/gmail.readonly',
	'https://www.googleapis.com/auth/gmail.labels'];

var headerStyle = {
	textAlign: 'center'
}

class User extends Component {
	constructor(props) {
        super(props);
		this.state = {
			items: [],
			gapiReady: false
		}
    }

	loadGmailAPI() {
	    const script = document.createElement("script");
		script.src = "https://apis.google.com/js/client.js";

		script.onload = () => {
		    gapi.load('client', () => {
		        gapi.client.setApiKey(API_KEY);
		        gapi.client.load('gmail', 'v1', () => {
		        	this.setState({ gapiReady: true });

					this.sendEmail();
		        });
		    });
		};

		document.body.appendChild(script);
	}

	sendEmail() {
		console.log("Email sent");
	}

	componentDidMount() {
		let itemsRef = fire.database().ref('/items').orderByKey();
		itemsRef.on('child_added', snapshot => {
			let item = {child: snapshot.val(), id: snapshot.key };
			this.setState({
				items: [item].concat(this.state.items)
			});
		})

		itemsRef.on('child_changed', snapshot => {
			let item = {child: snapshot.val(), id: snapshot.key };
			var newItems = this.state.items;
			for(var i = 0; i < newItems.length; i++) {
				if(newItems[i].id === item.id) {
					newItems[i].child = snapshot.val();
				}
			}

			this.setState({
				items: newItems
			});
		})

		this.loadGmailAPI();
    }

	filterItems() {
		var itemFilter = this.filter.value;

		var myElements = document.querySelectorAll(".item");

		for (var i = 0; i < myElements.length; i++) {
		    myElements[i].style.display = "none";
		}

		if(document.getElementById(itemFilter) !== null) {
			document.getElementById(itemFilter).style.display = "inline";
		}
	}

    render() {
        return (
			<div>
			{ this.state.gapiReady ?
				<div>
					<Navbar userType="User" username={this.props.username} logout={this.props.logout} />
					<h1 style={headerStyle}>CFTK Silent Auction</h1>
					<div className="itemSearch">
						<input type="text" placeholder="Search Item!" ref={ el => this.filter = el }/>
						<button type="submit" onClick={this.filterItems.bind(this)}>Search</button>
					</div>
					<div className="itemDisplay">
						{this.state.items.map( item => <Item key={item.id} item={item} bidder={ this.props.username }/>)}
					</div>
					<div id="test"></div>
				</div>
			:
				<div></div>
			}
			</div>
		)
    }
}

export default User;
