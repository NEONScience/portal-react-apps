import React from 'react';
import PropTypes from 'prop-types';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

import RouteService from 'portal-core-components/lib/service/RouteService';

import SampleQueryPresentation from './SampleQueryPresentation';
import SampleEventPresentation from './SampleEventPresentation';
import SampleGraphContainer from '../Containers/SampleGraphContainer';
import InfoPresentation from './InfoPresentation';

function TopPresentation(props) {
  const {
    query: { queryErrorStr },
  } = props;

  const breadcrumbs = [
    { name: 'Data', href: RouteService.getDataSamplesDataPath() },
    { name: 'Samples & Specimens', href: RouteService.getSamplesPath() },
    { name: 'Sample Explorer' },
  ];
  return (
    <NeonPage
      title="Sample Explorer"
      breadcrumbs={breadcrumbs}
      breadcrumbHomeHref={RouteService.getWebHomePath()}
    >
      <InfoPresentation {...props} />
      <SampleQueryPresentation {...props} />
      {queryErrorStr !== 'success' ? null : (
        <React.Fragment>
          <SampleEventPresentation {...props} />
          <SampleGraphContainer />
        </React.Fragment>
      )}
    </NeonPage>
  );
}

TopPresentation.propTypes = {
  query: PropTypes.shape({
    queryErrorStr: PropTypes.string.isRequired,
  }).isRequired,
};

export default TopPresentation;
