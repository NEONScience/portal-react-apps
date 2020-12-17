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
    { name: 'Data & Samples', href: 'https://www.neonscience.org/data-samples/' },
    { name: 'Samples & Specimens', href: 'https://www.neonscience.org/samples/' },
    { name: 'Sample Explorer' },
  ];
  return (
    <NeonPage
      title="Sample Explorer"
      breadcrumbs={breadcrumbs}
      breadcrumbHomeHref="https://www.neonscience.org/"
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
