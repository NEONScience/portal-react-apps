/* eslint-disable class-methods-use-this */
import React, { Component } from "react";
import PropTypes from 'prop-types';

import Button from "@mui/material/Button";
import DownloadIcon from '@mui/icons-material/SaveAlt';

import NeonApi from "portal-core-components/lib/components/NeonApi";
import Theme from 'portal-core-components/lib/components/Theme';

import { fetch as fetchPolyfill } from "whatwg-fetch";
import { getTaxonDownloadApiPath } from "../../api/taxon";

const checkStatus = (response) => {
  if (typeof response === "undefined") {
    const error = Error("Error occurred");
    error.response = null;
    throw error;
  }
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = Error(response.statusText);
  error.response = response;
  throw error;
};

const getFetch = () => {
  let fetchFunc = fetch;
  if (typeof fetchFunc === "undefined") {
    fetchFunc = fetchPolyfill;
  }
  return fetchFunc;
};

class Download extends Component {
  handleDownload() {
    this.handleDownloadProcessing();
    const fetchFunc = getFetch();
    const fetchInit = {
      headers: NeonApi.getApiTokenHeader(),
    };

    fetchFunc(this.getTaxonDownloadApiQuery(), fetchInit)
      .then(checkStatus)
      .then((response) => response.json())
      .then((data) => {
        if (!data || !data.data || (data.data.length === 0)) {
          throw Error("Request failed");
        }
        return data.data;
      })
      .then((url) => {
        if (!url) {
          this.handleDownloadError();
          return;
        }

        window.location.href = url;
        this.handleDownloadSuccess();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        this.handleDownloadError();
      });
  }

  handleDownloadProcessing() {
    this.message.innerHTML = "";
    this.button.disabled = true;
    this.button.innerHTML += this.getTaxonDownloadLoadingIcon();
  }

  handleDownloadSuccess() {
    this.message.innerHTML = "";
    this.button.innerHTML = this.getDownloadButtonLabel();
    this.button.disabled = false;
  }

  handleDownloadError() {
    this.message.innerHTML = "Download failed";
    this.button.innerText = this.getDownloadButtonLabel();
    this.button.disabled = false;
  }

  getTaxonDownloadApiQuery() {
    const { taxonTypeCode } = this.props;
    return `${getTaxonDownloadApiPath()}?taxonTypeCode=${taxonTypeCode}`;
  }

  getDownloadButtonLabel() {
    return "Download Taxonomic List";
  }

  getTaxonDownloadLoadingIcon() {
    return "<i class=\"fa fa-circle-o-notch fa-spin fa-fw\" style=\"margin-left: 8px;\"></i>";
  }

  render() {
    const messageStyle = {
      color: "#75030E",
      marginLeft: "10px",
      verticalAlign: "text-top",
    };

    const buttonLabel = this.getDownloadButtonLabel();

    return (
      <div>
        <Button
          ref={(button) => { this.button = button; }}
          variant="contained"
          color="primary"
          onClick={() => this.handleDownload()}
          data-selenium="download-taxonomic-list-button"
        >
          {buttonLabel}
          <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
        </Button>
        <span ref={(message) => { this.message = message; }} style={messageStyle} />
      </div>
    );
  }
}

Download.propTypes = {
  taxonTypeCode: PropTypes.string.isRequired,
};

export default Download;
