import React from 'react';
import PropTypes from 'prop-types';
import Download from '../download/Download';

function DownloadPresentation(props) {
  const { taxonQuery } = props;
  return (
    <div>
      <Download taxonTypeCode={taxonQuery.taxonTypeCode} />
    </div>
  );
}

DownloadPresentation.propTypes = {
  taxonQuery: PropTypes.shape({
    taxonTypeCode: PropTypes.string,
    locationName: PropTypes.string,
    rootApiUrl: PropTypes.string,
  }).isRequired,
};

export default DownloadPresentation;
