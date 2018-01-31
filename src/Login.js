import React, {
    Component
} from 'react';
import fire from './fire';
import Admin from './Admin';
import User from './User';

const CLIENT_ID = '106678752149-b866dj46pea661up5rog69raduuilefc.apps.googleusercontent.com';
const CLIENT_SECRET = 'yWd8Dbpbca0JvRDj49N-cYrg';
const REFRESH_TOKEN = '1/WpR-AFo8Y5QATskuQg8RVMS4Nmkq3AXcdsRiS0U2Y04';

const REFRESH_URL = "https://www.googleapis.com/oauth2/v4/token";
const GMAIL_API = "https://www.googleapis.com/gmail/v1/users/me/messages/send";

const ACCESS_REQUEST = `grant_type=refresh_token&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}&refresh_token=${encodeURIComponent(REFRESH_TOKEN)}`;

var activePane = {
	backgroundColor: '#D1D1D1'
}

var carrierForm = {
	backgroundColor: 'white'
}

function parseCarrier(carrier) {
	switch(carrier) {
		case "att":
			return "@txt.att.net";
		case "alltell":
			return "@message.alltel.com";
		case "boost":
			return "@myboostmobile.com";
		case "cricket":
			return "@mms.cricketwireless.net";
		case "fi":
			return "@msg.fi.google.com";
		case "sprint":
			return "@messaging.sprintpcs.com";
		case "tmobile":
			return "@tmomail.net";
		case "uscellular":
			return "@email.uscc.net";
		case "verizon":
			return "@vtext.com";
		case "virgin":
			return "@vmobl.com";
		case "republic":
			return "@text.republicwireless.com";
		default:
			return null;
	}
}

class Login extends Component {
    constructor() {
        super();

        this.state = {
			register: false,
			loggedIn: false,
			isAdmin: false,
			checkPassword: false,
			username: null,
			name: null,
			password: null,
			bidding: true,
			showLog: false,
			logMessage: ""
        };

		this.showLogin = this.showLogin.bind(this);
		this.showRegister = this.showRegister.bind(this);
		this.setLogin = this.setLogin.bind(this);
		this.logout = this.logout.bind(this);
		this.displayLog = this.displayLog.bind(this);
		this.hideLog = this.hideLog.bind(this);
		this.formatPhoneNumber = this.formatPhoneNumber.bind(this);

		this.requestSend = this.requestSend.bind(this);
		this.sendEmail = this.sendEmail.bind(this);
    }

	requestSend(phone, carrier, itemID, message) {
		console.log("Request send");
		let REFRESH_REQUEST = {
	        body: ACCESS_REQUEST,
	        method: "POST",
	        headers: new Headers({
	            'Content-Type': 'application/x-www-form-urlencoded'
	        })
	    }

		var carrier_mail = parseCarrier(carrier);
		console.log(carrier);

		if(carrier_mail !== null) {
			var phone_mail = phone + carrier_mail;

			fetch(REFRESH_URL, REFRESH_REQUEST).then( response => {
	            return(response.json());
	        }).then( response_json =>  {
	            this.sendEmail(phone_mail, itemID, response_json.access_token, message);
	    	});
		}
	}

	sendEmail(phone_mail, itemID, access_token, message) {
		console.log("Send email " + message);

		var headers_obj = {
			'From': "technology@carolinaftk.org",
	    	'To': phone_mail,
	    	'Subject': "CFTK Silent Auction"
	    }

		var email = '';
		for(var header in headers_obj)
    		email += header + ": " + headers_obj[header] + "\r\n";

		email += "\r\n" + message;
		email = window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_');

		let SEND_EMAIL = {
			body: JSON.stringify({'raw': email}),
			method: "POST",
			headers: new Headers({
				'Authorization': "Bearer " + access_token,
				'Content-Type': 'application/json'
			})
		}

		fetch(GMAIL_API, SEND_EMAIL).then( response => {
	        return(response.json());
	    }).then( response_json =>  {
	        console.log(response_json);
	    });
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
		this.hideLog();
	}

	showRegister() {
		this.setState({register: true})
		this.phoneNumber.value = '';
		this.hideLog();
	}

	setLogin(name, username, isAdmin, password) {
		this.setState({
			loggedIn: true,
			name: name,
			username: username,
			isAdmin: isAdmin,
			password: password
		});
	}

	login() {
		var that = this;

		var phoneNumber = this.formatPhoneNumber(this.phoneNumber.value);
		var ref = fire.database().ref('/users/' + phoneNumber);

		ref.once("value", snapshot => {
			var info = snapshot.val();
			if(info === null) {
				console.log("The read failed: invalid phone number");
				this.displayLog("Invalid login.")
				return;
			}

			if(info.phoneNumber === phoneNumber) {
				that.setLogin(info.firstName + ' ' + info.lastName, info.phoneNumber, info.isAdmin, info.password);
				that.hideLog();
			} else {
				alert("User not found.");
			}
		});
	}

	register() {
		var phoneNumber = this.formatPhoneNumber(this.phoneNumber.value);
		var phoneCell = this.phoneNumber;

		if(this.firstName.value === "") {
			this.displayLog("Please enter your first name.");
			return;
		} else if(this.lastName.value === "") {
			this.displayLog("Please enter your last name.");
			return;
		} else if(this.phoneNumber.value === "") {
			this.displayLog("Please enter your phone number.");
			return;
		} else if(this.phoneCarrier.value === "") {
			this.displayLog("Please enter your carrier.");
			return;
		}

		var that = this;

		fire.database().ref('users/' + phoneNumber).set({
            firstName: this.firstName.value,
            lastName: this.lastName.value,
			phoneNumber: phoneNumber,
			carrier: this.phoneCarrier.value,
            isAdmin: false,
			password: ''
        }, function(err) {
            if (err !== null) {
                // Insert error handling here for register page
                console.log(err);
				that.displayLog("Could not register user.");
				return;
            } else {
				that.firstName.value = '';
				that.lastName.value = '';
				that.phoneCarrier.value = '';
				phoneCell.value = '';
				that.displayLog("User successfully registered!");
			}
        });
	}

	checkPassword() {
		if(this.state.password === this.password.value) {
			this.setState({
				correctPassword: true
			});
			this.hideLog();
		} else {
			this.displayLog("Incorrect password");
		}
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

	displayLog(logMessage) {
		this.setState({
			showLog: true,
			logMessage: logMessage
		});
	}

	hideLog() {
		this.setState({
			showLog: false,
			logMessage: ""
		});
	}

    render() {
        return (
			<div className="overall">
				{ this.state.loggedIn ?
					<div>
					{this.state.isAdmin ?
						<div>
						{this.state.correctPassword ?
							<Admin bidding={this.state.bidding} username={this.state.username} logout={this.logout} sendEmail={this.requestSend}/>
						:
							<div className="container">
								<div className="panel">
									<div className="form">
										<div className="formGroup">
											<input type="password" className="formInput" placeholder="Password" ref={ el => this.password = el} />
										</div>
										<input type="submit" className="formButton" onClick={this.checkPassword.bind(this)} />
									</div>
								</div>
							</div>
						}
						</div>
					:
						<User bidding={this.state.bidding} username={this.state.username} name={this.state.name} displayLog={this.displayLog} hideLog={this.hideLog} logout={this.logout} sendEmail={this.requestSend}/>
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
								<div className="formGroup">
									<select style={carrierForm} defaultValue="" className="formInput" ref={ el => this.phoneCarrier = el }>
										<option value="" disabled>Select your option...</option>
										<option value="att">AT&T</option>
										<option value="alltell">Alltell</option>
										<option value="boost">Boost</option>
										<option value="cricket">Cricket</option>
										<option value="fi">Project Fi</option>
										<option value="sprint">Sprint</option>
										<option value="tmobile">T-Mobile</option>
										<option value="uscellular">U.S. Cellular</option>
										<option value="verizon">Verizon</option>
										<option value="virgin">Virgin</option>
										<option value="republic">Republic</option>
										<option value="other">Other</option>
									</select>
								</div>
								<button type="submit" className="formButton" onClick={this.register.bind(this)}>Register</button>
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
				{this.state.showLog ?
					<div className="log">
						<p className="logMessage">{this.state.logMessage}</p>
					</div>
				:
					<div></div>
				}
			</div>
		)
    }
}

export default Login;
