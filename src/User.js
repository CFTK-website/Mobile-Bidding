import React, {
    Component
} from 'react';
import fire from './fire';
import Navbar from './Navbar';
import Item from './Item';

var headerStyle = {
	textAlign: 'center'
}

class User extends Component {
	constructor(props) {
        super(props);
		this.state = {
			items: []
		}

		this.sendEmail = this.sendEmail.bind(this);
    }

	sendEmail(phone, carrier, itemId, message) {
		this.props.sendEmail(phone, carrier, itemId, message);
	}

	componentWillMount() {
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
    }

	filterItems() {
		var itemFilter = this.filter.value.toUpperCase();

		var myElements = document.querySelectorAll(".item");

		for (var i = 0; i < myElements.length; i++) {
		    myElements[i].style.display = "none";
		}

		if(document.getElementById(itemFilter) !== null) {
			document.getElementById(itemFilter).style.display = "inline";
		}

		this.props.hideLog();
	}

    render() {
        return (
			<div>
				<Navbar userType="User" username={this.props.username} logout={this.props.logout} />
				<h1 style={headerStyle}>CFTK Silent Auction</h1>
				<div className="itemSearch">
					<input type="number" min="1" max="999" placeholder="Search Item by ID..." ref={ el => this.filter = el }/>
					<button type="submit" onClick={this.filterItems.bind(this)}>Search</button>
				</div>
				<div className="itemDisplay">
					{this.state.items.map( item => <Item key={item.id} displayLog={this.props.displayLog} hideLog={this.props.hideLog} sendEmail={this.sendEmail} item={item} bidder={ this.props.username } bidderName={ this.props.name } />)}
				</div>
				<div id="test"></div>
			</div>
		)
    }
}

export default User;
