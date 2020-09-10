import React from 'react';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

import SampleQueryPresentation from './SampleQueryPresentation';
import SampleEventPresentation from './SampleEventPresentation';
import SampleGraphContainer from '../Containers/SampleGraphContainer';
import InfoPresentation from './InfoPresentation';

const TopPresentation = (props) => {
  const {
    query: { queryErrorStr },
  } = props;

  const breadcrumbs = [
    { name: 'Sample Explorer' },
  ];
  return (
    <NeonPage
      title="Sample Explorer"
      breadcrumbs={breadcrumbs}
      useCoreHeader
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
