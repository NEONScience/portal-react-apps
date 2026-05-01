import React, { Component } from "react";
import PropTypes from 'prop-types';

class SampleBreadcrumbPresentation extends Component {
  render() {
    const { endpoint, onQueryClick, uuidBreadcrumbs } = this.props;
    return (
      <div id="sample-breadcrumb-presentation">
        <p>
          <b>Sample Bread Crumb:</b>
          <br />
        </p>
        <ul>
          {
            uuidBreadcrumbs.map((breadcrumb, i) => {
              const clickHandler = () => {
                const url = `${endpoint}sampleUuid=${breadcrumb}`;
                return onQueryClick(url);
              };
              const item = (
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <li
                  key={i}
                  onClick={clickHandler}
                  onKeyDown={clickHandler}
                >
                  {breadcrumb}
                </li>
              );
              return item;
            })
          }
        </ul>
      </div>
    );
  }
}

SampleBreadcrumbPresentation.propTypes = {
  endpoint: PropTypes.string.isRequired,
  onQueryClick: PropTypes.func.isRequired,
  uuidBreadcrumbs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SampleBreadcrumbPresentation;
