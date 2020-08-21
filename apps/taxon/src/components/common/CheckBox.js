import React, { Component } from "react";

class CheckBox extends Component {
  constructor(props) {
    super(props)

    this.handleCheckedChanged = this.handleCheckedChanged.bind(this)
  }

  handleCheckedChanged(checked) {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, this.props.value, checked)
    }
  }

  render() {
    return (
      <div className={this.props.containerClassName}>
        <input
          type="checkbox"
          checked={this.props.checked ? "checked" : ""}
          onChange={() => this.handleCheckedChanged(!this.props.checked)}
        />
        <label
          onClick={() => this.handleCheckedChanged(!this.props.checked)}>
          {this.props.displayName}
        </label>
      </div>
    );
  }
}

export default CheckBox;
