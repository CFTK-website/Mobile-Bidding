import React, {
    Component
} from 'react';
import fire from './fire';

class Item extends Component {
	constructor(props) {
        super(props);

		this.state = {
			bid: false,
			winning: false
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

		this.props.hideLog();
	}

	placeBid = () => {
		var bidder = this.props.bidder;
		var bidderName = this.props.bidderName;
		var itemId = this.props.item.id;
		var itemName = this.props.item.child.itemName;
        var newBid = this.newBid.value;
		var toggleBid = this.toggleBid;
        var ref = fire.database().ref('items/' + itemId);

		var that = this;

        ref.once("value", snapshot => {
            if (parseInt(newBid) > parseInt(snapshot.val()["bid"])) {
				var currentWinner = snapshot.val()["currentWinner"];

				var message = "You have been outbid for Item " + itemId + ", " + itemName + ".";

				if(currentWinner !== "" && currentWinner !== bidder) {
					var ref = fire.database().ref('/users/' + parseInt(currentWinner));
					ref.once("value", carrierInfo => {
						var info = carrierInfo.val();
						this.props.sendEmail(currentWinner, info.carrier, itemId, message);
					});
				}

                fire.database().ref('items/' + itemId).update({
                    bid: newBid,
					currentWinner: bidder,
					winnerName: bidderName
                }, function(err) {
					toggleBid();
                    if (err !== null) {
                        // Insert error handling here for admin page
                        console.log(err);
						that.props.displayLog("Error: refresh page.")
                    } else {
						that.props.displayLog("Sucessful bid!");
					}
                });
            } else {
				this.props.displayLog("Error: Bid must be higher!");
            }
        });
	}

	componentWillMount() {
		var itemId = this.props.item.id;
        var ref = fire.database().ref('items/' + itemId);

		ref.on('value', snapshot => {
			var info = snapshot.val();
			if(info.currentWinner === this.props.bidder) {
				this.setState({
					winning: true
				});
			} else {
				this.setState({
					winning: false
				});
			}
		});
	}

    render() {
        return (
			<div className="item" id={this.props.item.id}>
				{this.state.winning ?
					<div className="itemMeta">
						<p>ID: {this.props.item.id}</p>
						<p><b>{this.props.item.child.itemName}</b></p>
						<p><i>Currently winning item</i></p>
					</div>
				:
					<div className="itemMeta">
						<p>ID: {this.props.item.id}</p>
						<p><b>{this.props.item.child.itemName}</b></p>
						<p><i>Currently not winning item</i></p>
					</div>
				}
				{this.props.item.child.isOpen ?
					<div>
					{this.state.bid ?
						<div className="itemInfo">
							<p>Current Bid: <input placeholder={this.props.item.child.bid} ref={el => this.newBid = el}/></p>
							<button onClick={this.toggleBid}>Cancel</button>
							<button onClick={this.placeBid}>Confirm Bid</button>
						</div>
					:
						<div className="itemInfo">
							<p>Current Bid: {this.props.item.child.bid}</p>
							<button onClick={this.toggleBid}>Bid</button>
						</div>
					}
					</div>
				:
					<div className="isClosed">
						<p><b>Closed</b></p>
					</div>
				}
			</div>
		)
    }
}

export default Item;
