import React, {
    Component
} from 'react';
import fire from './fire';

class Item extends Component {
	constructor(props) {
        super(props);

		this.state = {
			bid: false
		}
    }

	toggleBid = () => {
		if(this.state.bid) {
			this.setState({
				bid: false
			})
		} else {
			this.setState({
				bid: true
			})
		}
	}

	placeBid = () => {
		var bidder = this.props.bidder;
		var itemId = this.props.item.id;
        var newBid = this.newBid.value;
		var toggleBid = this.toggleBid;
        var ref = fire.database().ref('items/' + itemId);

        ref.once("value", snapshot => {
            if (newBid > snapshot.val()["bid"]) {
                fire.database().ref('items/' + itemId).update({
                    bid: newBid,
					currentWinner: bidder
                }, function(err) {
					toggleBid();
                    if (err !== null) {
                        // Insert error handling here for admin page
                        console.log(err);
                    }
                });
            } else {
                console.log("Error: bid must be higher");
            }
        });
	}

	// componentDidMount() {
	// 	console.log(this.props.item);
    // }

    render() {
        return (
			<div className="item" id={this.props.item.id}>
				<div className="itemInfo">
					<p>ID: {this.props.item.id}</p>
					<p>{this.props.item.child.itemName}</p>
				</div>
				{this.props.item.child.isOpen ?
					<div>
					{this.state.bid ?
						<section>
							<p>Current Bid: <input placeholder={this.props.item.child.bid} ref={el => this.newBid = el}/></p>
							<button onClick={this.toggleBid}>Cancel</button>
							<button onClick={this.placeBid}>Confirm Bid</button>
						</section>
					:
						<section>
							<p>Current Bid: {this.props.item.child.bid}</p>
							<button onClick={this.toggleBid}>Bid</button>
						</section>
					}
					</div>
				:
					<p>Closed</p>
				}
			</div>
		)
    }
}

export default Item;
