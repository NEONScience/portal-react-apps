import React from 'react';

import Typography from '@material-ui/core/Typography';

import NeonPage from 'portal-core-components/lib/components/NeonPage';

const App: React.FC = (): JSX.Element => {
  const title = 'App Name';
  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Data & Samples', href: 'https://www.neonscience.org/data-samples/' },
    { name: 'Data Portal', href: 'https://www.neonscience.org/data-samples/data' },
    { name: title },
  ];
  return (
    <NeonPage
      title={title}
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={breadcrumbs}
    >
      <Typography>
        Hello, NEON App!
      </Typography>
    </NeonPage>
  );
};

export default App;
