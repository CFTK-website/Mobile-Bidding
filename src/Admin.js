import React, {
    Component
} from 'react';
import fire from './fire';
import Navbar from './Navbar';
import ReactFileReader from 'react-file-reader';

var tableHeader = {
	cursor: 'pointer'
}

class Admin extends Component {
    constructor(props) {
        super(props);

		this.state = {
			items: [],
			itemsChecked: false,
			newItemBox: false
		};

		this.sendEmail = this.sendEmail.bind(this);
    }

	sendEmail(phone, carrier, itemId, message) {
		this.props.sendEmail(phone, carrier, itemId, message);
	}

	componentDidMount() {
		let itemsRef = fire.database().ref('/items').orderByKey();
		itemsRef.on('child_added', snapshot => {
			let item = { child: snapshot.val(), id: snapshot.key, isChecked: false };
			this.setState({
				items: [item].concat(this.state.items)
			});
		})

		itemsRef.on('child_changed', snapshot => {
			let item = { child: snapshot.val(), id: snapshot.key, isChecked: false };
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

		itemsRef.on('child_removed', snapshot => {
			console.log("Child removed");
			let item = { child: snapshot.val(), id: snapshot.key, isChecked: false };
			var newItems = [];
			for(var i = 0; i < this.state.items.length; i++) {
				if(this.state.items[i].id !== item.id) {
					newItems.push(this.state.items[i]);
				}
			}

			this.setState({
				items: newItems
			});

    		document.getElementById(item.id).remove();
		})
	}

	toggleCheckboxes(id) {
		let itemsCopy = this.state.items;

		if(id === true) {
			for(var i = 0; i < this.state.items.length; i++) {
				itemsCopy[i].isChecked = !this.state.itemsChecked;
			}
			this.setState({
				itemsChecked: !this.state.itemsChecked
			});
		} else {
			for(i = 0; i < this.state.items.length; i++) {
				if(id === itemsCopy[i].id) {
					itemsCopy[i].isChecked = !itemsCopy[i].isChecked;
				}
			}
		}

		this.setState({
			items: itemsCopy
		});
	}

	open() {
		let itemsCopy = this.state.items;

		for(var i = 0; i < this.state.items.length; i++) {
			if(itemsCopy[i].isChecked === true) {
				itemsCopy[i].isChecked = false;

				fire.database().ref('items/' + itemsCopy[i].id).update({
					isOpen: true
				}, function(err) {
					if (err !== null) {
		                console.log(err);
						return;
		            }
				});
			}
		}

		this.setState({
			items: itemsCopy,
			itemsChecked: false
		});
	}

	close() {
		var itemsCopy = this.state.items;

		for(var i = 0; i < this.state.items.length; i++) {
			if(itemsCopy[i].isChecked === true) {
				itemsCopy[i].isChecked = false;

				var itemRef = fire.database().ref('items/' + itemsCopy[i].id);
				itemRef.once("value", itemInfo => {
					var itemId = itemsCopy[i].id;
					var itemName = itemsCopy[i].child.itemName;
					
					var currentWinner = itemInfo.val()["currentWinner"];
					if(currentWinner !== "") {
						var ref = fire.database().ref('/users/' + parseInt(currentWinner));

						ref.once("value", carrierInfo => {
							var info = carrierInfo.val();
							var message = "You have won " + itemName + "!";
							console.log(message);
							console.log("Sending email");
							this.props.sendEmail(currentWinner, info.carrier, itemId, message);
						});
					}
				});

				fire.database().ref('items/' + itemsCopy[i].id).update({
					isOpen: false
				}, function(err) {
					if (err !== null) {
		                console.log(err);
						return;
		            }
				});
			}
		}

		this.setState({
			items: itemsCopy,
			itemsChecked: false
		});
	}

	toggleItemBox() {
		if(this.state.newItemBox === false) {
			this.setState({
				newItemBox: true
			});
		} else {
			this.setState({
				newItemBox: false
			});
		}
	}

	addItem() {
		if(this.itemID.value.length > 0 && this.itemName.value.length > 0) {
			var itemID = this.itemID;
			var itemName = this.itemName;
			var itemCategory = this.itemCategory;
			var startingBid = this.startingBid;

			var that = this;

			fire.database().ref('items/' + this.itemID.value).set({
				category: this.itemCategory.value,
	            bid: this.startingBid.value,
	            currentWinner: "",
				winnerName: "",
				isOpen: false,
	            itemName: this.itemName.value
	        }, function(err) {
	            if (err !== null) {
	                // Insert error handling here for register page
	                console.log(err);
					alert("Item could not be added...")

					return;
	            } else {
					alert("Item added!");

					itemID.value = '';
					itemName.value = '';
					itemCategory.value = '';
					startingBid.value = '';

					that.toggleItemBox();
				}
	        });
		}
	}

	removeItems() {
		let itemsCopy = this.state.items;

		for(var i = 0; i < this.state.items.length; i++) {
			if(itemsCopy[i].isChecked === true) {
				fire.database().ref('items/').child(itemsCopy[i].id).remove(
					function(err) {
						if (err !== null) {
			                console.log(err);
							return;
			            }
					}
				);
			}
		}

		this.setState({
			items: itemsCopy,
			itemsChecked: false
		});
	}

	sortTable(n) {
		var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
		table = document.getElementById("adminTable");
		switching = true;
		// Set the sorting direction to ascending:
		dir = "asc";
		/* Make a loop that will continue until
		no switching has been done: */
		while (switching) {
		    // Start by saying: no switching is done:
		    switching = false;
		    rows = table.getElementsByTagName("TR");
		    /* Loop through all table rows (except the
		    first, which contains table headers): */
		    for (i = 1; i < (rows.length - 1); i++) {
		        // Start by saying there should be no switching:
		        shouldSwitch = false;
		        /* Get the two elements you want to compare,
		        one from current row and one from the next: */
		        x = rows[i].getElementsByTagName("TD")[n];
		        y = rows[i + 1].getElementsByTagName("TD")[n];
		        /* Check if the two rows should switch place,
		        based on the direction, asc or desc: */
		        if (dir === "asc") {
					if(isNaN(parseInt(x.innerHTML)) && isNaN(parseInt(y.innerHTML))) {
						if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
			                // If so, mark as a switch and break the loop:
			                shouldSwitch = true;
			                break;
			            }
					} else {
						if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
			                // If so, mark as a switch and break the loop:
			                shouldSwitch = true;
			                break;
			            }
					}
		        } else if (dir === "desc") {
					if(isNaN(parseInt(x.innerHTML)) && isNaN(parseInt(y.innerHTML))) {
						if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
			                // If so, mark as a switch and break the loop:
			                shouldSwitch = true;
			                break;
			            }
					} else {
						if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
			                // If so, mark as a switch and break the loop:
			                shouldSwitch = true;
			                break;
			            }
					}
		        }
		    }
		    if (shouldSwitch) {
		        /* If a switch has been marked, make the switch
		        and mark that a switch has been done: */
		        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
		        switching = true;
		        // Each time a switch is done, increase this count by 1:
		        switchcount++;
		    } else {
		        /* If no switching has been done AND the direction is "asc",
		        set the direction to "desc" and run the while loop again. */
		        if (switchcount === 0 && dir === "asc") {
		            dir = "desc";
		            switching = true;
		        }
		    }
		}
	}

	handleFiles = files => {
		var reader = new FileReader();
		reader.onload = function(e) {
			var results = reader.result.split("\n");
			for(var i = 0; i < results.length; i++) {
				var row = results[i].split(",");
				if(row[0].length > 0 && row[1].length > 0 && row[2].length > 0) {
					var itemID = row[1];
					var itemName = row[2];
					var startingBid = row[3];
					var itemCategory = row[0];

					fire.database().ref('items/' + itemID).set({
						category: itemCategory,
			            bid: startingBid,
			            currentWinner: "",
						winnerName: "",
						isOpen: false,
			            itemName: itemName
			        }, function(err) {
			            if (err !== null) {
			                // Insert error handling here for register page
			                console.log(err);
							return;
			            }
			        });
				}
			}
		}
		reader.readAsText(files[0]);
	}

    render() {
        return (
			<div>
				<Navbar userType="Admin" username={this.props.username} logout={this.props.logout} />
				<h1 className="title">Mobile Bidding Admin</h1>
				<div className="buttonDashboard">
					<button className="adminButton" id="openButton" onClick={() => this.open()}>Open Item(s)</button>
					<button className="adminButton" id="closeButton" onClick={() => this.close()}>Close Items(s)</button>
					<button className="adminButton" id="addButton" onClick={() => this.toggleItemBox()}>Add Item</button>
					<button className="adminButton" id="removeItem" onClick={() => this.removeItems()}>Remove Items</button>
					<ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'}>
					    <button className="adminButton" id="uploadFile">Upload</button>
					</ReactFileReader>
				</div>
				{this.state.newItemBox ?
					<div className="newItemPanel">
						<div className="form" id="newItemBox">
							<div className="formGroup">
								<input type="text" className="formInput" placeholder="Category*" ref={ el => this.itemCategory = el } />
							</div>
							<div className="formGroup">
								<input type="text" className="formInput" placeholder="ID*" ref={ el => this.itemID = el } />
							</div>
							<div className="formGroup">
								<input type="text" className="formInput" placeholder="Name*" ref={ el => this.itemName = el} />
							</div>
							<div className="formGroup">
								<input type="text" className="formInput" placeholder="Starting Bid*" ref={ el => this.startingBid = el} />
							</div>
							<input type="submit" className="formButton" onClick={this.addItem.bind(this)} />
							<button className="formButton" onClick={() => this.toggleItemBox()}>Cancel</button>
						</div>
					</div>
				:
					<div></div>
				}
				<table className="adminTable" id="adminTable">
					<tr>
						<th><input type="checkbox" onClick={() => this.toggleCheckboxes(true)} checked={this.state.itemsChecked}/></th>
						<th onClick={() => this.sortTable(1)} style={tableHeader}>ID</th>
						<th onClick={() => this.sortTable(2)} style={tableHeader}>Category</th>
						<th onClick={() => this.sortTable(3)} style={tableHeader}>Item Name</th>
						<th onClick={() => this.sortTable(4)} style={tableHeader}>Current Winner</th>
						<th onClick={() => this.sortTable(5)} style={tableHeader}>Phone Number</th>
						<th onClick={() => this.sortTable(6)} style={tableHeader}>Current Bid ($)</th>
						<th onClick={() => this.sortTable(7)} style={tableHeader}>Status</th>
					</tr>
					{this.state.items.map( item => <tr className=".adminItem" id={item.id}>
						<td><input type="checkbox" name="itemCheckbox" value={item.id} checked={item.isChecked} onClick={() => this.toggleCheckboxes(item.id)}/></td>
						<td>{item.id}</td>
						<td>{item.child.category}</td>
						<td>{item.child.itemName}</td>
						<td>{item.child.winnerName}</td>
						<td>{item.child.currentWinner}</td>
						<td>{item.child.bid}</td>
						{item.child.isOpen ?
							<td>Open</td>
						:
							<td><b>Closed</b></td>
						}
					</tr>
					)}
				</table>
			</div>
		)
    }
}

export default Admin;
