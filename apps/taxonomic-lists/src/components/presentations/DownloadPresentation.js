import React from "react";
import PropTypes from 'prop-types';
import Download from "../download/Download";

function DownloadPresentation(props) {
  const { taxonQuery } = props;
  return (
    <div>
      <Download taxonTypeCode={taxonQuery.taxonTypeCode} />
    </div>
  );
}

DownloadPresentation.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  taxonQuery: PropTypes.object.isRequired,
};

export default DownloadPresentation;
