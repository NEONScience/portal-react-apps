import React from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

import RouteService from 'portal-core-components/lib/service/RouteService';

import SampleQueryPresentation from './SampleQueryPresentation';
import SampleEventPresentation from './SampleEventPresentation';
import SampleGraphContainer from '../Containers/SampleGraphContainer';
import InfoPresentation from './InfoPresentation';

const TopPresentation = (props) => {
  const {
    query: { queryErrorStr },
  } = props;

  const breadcrumbs = [
    { name: 'Data & Samples', href: RouteService.getDataSamplesPath() },
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
};

export default TopPresentation;
