import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TextField from 'material-ui/TextField';

export default class LoginDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
    this.state.user = "";
    this.state.password = "";
  }

  getState = () => {
    return {
      open: BoardStore.getLoginOpen(),
      //errors: ErrorStore.getLoginErrors()
    };
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  _onError = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
    ErrorStore.removeChangeListener(this._onError);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
    ErrorStore.addChangeListener(this._onError);
  }

  handleLogin = () => {
    var user = this.state.user;
    var password = this.state.password;
    BoardActions.login(user, password);
  }

  onUserChange = (key, value) => {
    this.setState({user: value});
  }

  onPasswordChange = (key, value) => {
    this.setState({password: value});
  }

  showForm = () => {
    return <Dialog
        title={"Login"}
        modal={false}
        open={this.state.open}
        onRequestClose={BoardActions.toggleLogin}
        autoScrollBodyContent={false}
      >
      <TextField ref="user_name"
        value={this.state.user}
        hintText="User name"
        onChange={this.onUserChange}
      />
      <br />
      <TextField ref="user_password"
        value={this.state.password}
        type="password"
        hintText="Password"
        onChange={this.onPasswordChange}
      />
      <br />
      <FlatButton
        label="Login"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleLogin}
      />
      </Dialog>;
  }

  render() {
    return this.showForm();
  }

  static childContextTypes = {
    muiTheme: React.PropTypes.object
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    };
  }
}
