import React, {
    Component
} from 'react';

class Navbar extends Component {
	logout = () => {
		this.props.logout();
	}

    render() {
        return (
			<div>
			{ this.props.userType === "User" ?
				<div className="navbar">
					<p id="username">{this.props.username}</p>
					<button onClick={this.logout} id="logoutButton">Logout</button>
				</div>
			:
				<div className="navbar">
					<p id="username">Admin</p>
					<button onClick={this.logout} id="logoutButton">Logout</button>
				</div>
			}
			</div>
		)
    }
}

export default Navbar;
