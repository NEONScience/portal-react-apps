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
      <div className="samples-container">
        <div className="text">
          <InfoPresentation {...props} />
        </div>
        <div className="query">
          <SampleQueryPresentation {...props} />
        </div>
        {queryErrorStr !== 'success' ? null : (
          <React.Fragment>
            <SampleEventPresentation {...props} />
            <SampleGraphContainer />
          </React.Fragment>
        )}
      </div>
    </NeonPage>
  );
};

export default TopPresentation;
