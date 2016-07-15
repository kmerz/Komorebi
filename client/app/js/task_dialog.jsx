import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import TextField from 'material-ui/TextField';
import Ajax from  'basic-ajax';
import ReactDOM from 'react-dom';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import StoryPointPicker from './story_point_picker';

class StorySelect extends React.Component {
  constructor(props) {
    super(props);
    this.state={select_value: this.props.story_id};
  }

  handleStoryChange= (event, index, value) => {
    this.setState({select_value: value});
    if (this.props.onChange) {
      this.props.onChange(event, index, value);
    }
  }
  render() {
    return <SelectField value={this.state.select_value}
      onChange={this.handleStoryChange}>
      {this.props.stories.map((story, key) => {
        return <MenuItem key={key} value={story.id} primaryText={story.name} />}
      )}
    </SelectField>
  }
}

export default class TaskDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      task_name_error: "",
      task_desc_error: "",
      last_sel_story_id: null
    }
    this.setDefaultFormValues();
  }

  setDefaultFormValues = () => {
    this.form_values = {
      name: "",
      desc: "",
      story_id: null,
      column_id: null,
      priority: 1
    }
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    this.form_values.name = this.getInputValue(this.refs.task_name, "input");
    this.form_values.desc = this.getInputValue(this.refs.task_desc, "textarea");
    this.form_values.story_id = this.state.last_sel_story_id;
    this.form_values.column_id = this.props.columns[0].id;

    Ajax.postJson('/tasks', this.form_values).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        this.handleClose(true);
      } else {
        this.setState({
          task_name_error: response_obj.message,
          task_desc_error: response_obj.message,
        });
      }
   });
  }

  handleClose = (reload) => {
    this.setDefaultFormValues();
    this.setState({
      task_name_error: "",
      task_desc_error: "",
    });
    this.props.handleClose(reload);
  }

  handleStoryIdChange = (event, index, value) => {
    this.setState({last_sel_story_id: value});
  }

  valueHandler = (value) => {
    this.form_values.points = value;
  }

  priorityHandler = (value) => {
    this.form_values.priority = value;
  }

  render() {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleFormSubmit}
      />,
    ];

    return (
      <Dialog
        title={"Add Task"}
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.handleClose}
        autoScrollBodyContent={true}
      >
        <br />
        Select Story
        <br />
        <StorySelect onChange={this.handleStoryIdChange}
          stories={this.props.stories} story_id={this.state.last_sel_story_id}
        />
        <br />
         <StoryPointPicker title="Priority" key='1' valueHandler={this.priorityHandler}
         range={[1,2,3,4,5,6,7,8,9,10]}/>
        <br />
        Add a name
        <br />
        <TextField ref="task_name" hintText="Task Name"
          errorText={this.state.task_name_error} />
        <br />
        <br />
        Add a Description
        <br />
        <TextField ref="task_desc"
          hintText="Task Description"
          errorText={this.state.task_desc_error}
          multiLine={true}
          fullWidth={true}
        />
        <br />
        <br />
      </Dialog>
    );
  }
}
export default TaskDialog;
