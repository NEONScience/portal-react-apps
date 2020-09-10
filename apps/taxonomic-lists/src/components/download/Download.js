import React, { Component } from "react";

import Button from "@material-ui/core/Button";
import DownloadIcon from '@material-ui/icons/SaveAlt';

import NeonApi from "portal-core-components/lib/components/NeonApi";
import Theme from 'portal-core-components/lib/components/Theme';

import { getTaxonDownloadApiPath } from "../../api/taxon";
import { fetch as fetchPolyfill } from "whatwg-fetch";

const checkStatus = (response) => {
  if (typeof response === "undefined") {
    let error = Error("Error occurred");
    error.response = null;
    throw error;
  }
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = Error(response.statusText);
    error.response = response;
    throw error;
	}
}

const getFetch = () => {
  let fetchFunc = fetch;
  if (typeof fetchFunc === "undefined") {
    fetchFunc = fetchPolyfill;
  }
  return fetchFunc;
}

class Download extends Component {
  getTaxonDownloadApiQuery() {
    return getTaxonDownloadApiPath() + "?taxonTypeCode=" + this.props.taxonTypeCode;
  }

  getDownloadButtonLabel() {
    return "Download Taxonomic List";
  }

  getTaxonDownloadLoadingIcon() {
    return "<i class=\"fa fa-circle-o-notch fa-spin fa-fw\" style=\"margin-left: 8px;\"></i>";
  }

  handleDownload() {
		this.handleDownloadProcessing();

		let fetchFunc = getFetch();
		let fetchInit = {
			headers: NeonApi.getApiTokenHeader()
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
        console.log(error);
        this.handleDownloadError();
      });
    }

    handleDownloadProcessing() {
      this.message.innerHTML = "";
      this.button.disabled = true;
      this.button.innerHTML = this.button.innerHTML + this.getTaxonDownloadLoadingIcon();
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

    render() {
      let messageStyle = {
        color: "#75030E",
        marginLeft: "10px",
        verticalAlign: "text-top"
      }

      let buttonLabel = this.getDownloadButtonLabel();

      return (
        <div>
          <Button
            ref={button => this.button = button}
            variant="contained"
            color="primary"
            onClick={() => this.handleDownload()}
            data-selenium="download-taxonomic-list-button"
          >
            {buttonLabel}
            <DownloadIcon fontSize="small" style={{ marginLeft: Theme.spacing(1) }} />
          </Button>
          <span ref={message => this.message = message} style={messageStyle}></span>
        </div>
      );
    }
}

export default Download;
