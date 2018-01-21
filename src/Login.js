import React, {
    Component
} from 'react';
import fire from './fire';
import Admin from './Admin';
import User from './User';

var activePane = {
	backgroundColor: '#D1D1D1'
}

class Login extends Component {
    constructor() {
        super();

        this.state = {
			register: false,
			loggedIn: false,
			isAdmin: false,
			username: null,
			bidding: true,
			logMessage: ""
        };

		this.showLogin = this.showLogin.bind(this);
		this.showRegister = this.showRegister.bind(this);
		this.setLogin = this.setLogin.bind(this);
		this.logout = this.logout.bind(this);
		this.formatPhoneNumber = this.formatPhoneNumber.bind(this);
    }

	logout() {
		this.setState({
			register: false,
			loggedIn: false,
			isAdmin: false,
			username: null,
			logMessage: ""
		});
	}

	showLogin() {
		this.setState({register: false});
		this.firstName.value = '';
		this.lastName.value = '';
		this.phoneNumber.value = '';
	}

	showRegister() {
		this.setState({register: true})
		this.phoneNumber.value = '';
	}

	setLogin(username, isAdmin) {
		this.setState({
			loggedIn: true,
			username: username,
			isAdmin: isAdmin
		})
	}

	login() {
		var that = this;

		var phoneNumber = this.formatPhoneNumber(this.phoneNumber.value);
		var ref = fire.database().ref('/users/' + phoneNumber);

		ref.once("value", snapshot => {
			var info = snapshot.val();
			if(info === null) {
				console.log("The read failed: invalid phone number");
				return;
			}

			if(info.phoneNumber === phoneNumber) {
				// that.setState({
				// 	loggedIn: true,
				// 	username: username,
				// 	isAdmin: isAdmin
				// });
				that.setLogin(info.phoneNumber, info.isAdmin);
				// state.username = info.email;
				// state.loggedIn = true;
				// state.isAdmin = info.isAdmin;
			} else {
				alert("User not found.");
			}
		});
	}

	register() {
		// var userId = this.email.value.split(".")[0];

		var firstName = this.firstName;
		var lastName = this.lastName;
		var phoneNumber = this.formatPhoneNumber(this.phoneNumber.value);
		var phoneCell = this.phoneNumber;

		fire.database().ref('users/' + phoneNumber).set({
            firstName: this.firstName.value,
            lastName: this.lastName.value,
			phoneNumber: phoneNumber,
            isAdmin: false
        }, function(err) {
            if (err !== null) {
                // Insert error handling here for register page
                console.log(err);
				return;
            } else {
				firstName.value = '';
				lastName.value = '';
				phoneCell.value = '';
				// displayLog("User successfully registered!");
			}
        });

		//showLog("User successfully registered!");
	}

	toggleBidding = () => {
		if(this.state.bidding) {
			this.setState({
				bidding: false
			})
		} else {
			this.setState({
				bidding: true
			})
		}
	}

	formatPhoneNumber(s) {
		var s2 = (""+s).replace(/\D/g, '');
		var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
		return (!m) ? null : m[1] + m[2] + m[3];
	}

    render() {
        return (
			<div className="overall">
			{ this.state.loggedIn ?
				<div>
				{this.state.isAdmin ?
					<Admin bidding={this.state.bidding} username={this.state.username} logout={this.logout} />
				:
					<User bidding={this.state.bidding} username={this.state.username} logout={this.logout} />
				}
				</div>
			:
				<div className="container">
				{ this.state.register ?
					<div className="panel">
						<div className="registrationPanel">
							<p className="loginButton" onClick={this.showLogin}>Login</p>
							<p className="registerButton" style={activePane}>Register</p>
						</div>
						<div className="form">
							<div className="formGroup">
								<input type="text" className="formInput" placeholder="First Name*" ref={ el => this.firstName = el } />
							</div>
							<div className="formGroup">
								<input type="text" className="formInput" placeholder="Last Name*" ref={ el => this.lastName = el} />
							</div>
							<div className="formGroup">
								<input type="tel" className="formInput" placeholder="Phone Number*" ref={ el => this.phoneNumber = el} />
							</div>
							<input type="submit" className="formButton" onClick={this.register.bind(this)} />
						</div>
					</div>
				:
					<div className="panel">
						<div className="registrationPanel">
							<p className="loginButton" style={activePane}>Login</p>
							<p className="registerButton" onClick={this.showRegister}>Register</p>
						</div>
						<div className="form">
							<div className="formGroup">
								<input type="tel" className="formInput" placeholder="Phone Number*" ref={ el => this.phoneNumber = el} />
							</div>
							<input type="submit" className="formButton" onClick={this.login.bind(this)} />
						</div>
					</div>
				}
				</div>
			}
			</div>
		)
    }
}

export default Login;
