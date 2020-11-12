import React, { useContext } from 'react';
import Markdown from 'markdown-to-jsx';

import Grid from '@material-ui/core/Grid';

import { StoreContext } from '../../Store';
import Section from './Section';
import Detail from '../Details/Detail';
import IdentifierDetail from '../Details/IdentifierDetail';
import ThemesDetail from '../Details/ThemesDetail';
import DataRangeDetail from '../Details/DataRangeDetail';
import CitationDetail from '../Details/CitationDetail';
import KeywordsDetail from '../Details/KeywordsDetail';
import ReleaseLinksDetail from '../Details/ReleaseLinksDetail';

const AboutSection = (props) => {
  const { state } = useContext(StoreContext);

  return (
    <Section {...props}>
      <Grid container spacing={3}>

        <Grid item xs={12} md={5} lg={4}>
          <IdentifierDetail />
          <ThemesDetail />
          <Detail
            title="Responsible Science Team"
            content={state.product.productScienceTeam}
          />
          <DataRangeDetail />
          <ReleaseLinksDetail />
          <KeywordsDetail />
        </Grid>

        <Grid item xs={12} md={7} lg={8}>
          <Detail
            title="Description"
            content={(
              <Markdown>{state.product.productDescription || '_n/a_'}</Markdown>
            )}
          />
          <Detail
            title="Abstract"
            content={(
              <Markdown>{state.product.productAbstract || '_n/a_'}</Markdown>
            )}
          />
          {state.product.productRemarks ? (
            <Detail
              title="Additional Information"
              content={(
                <Markdown>{state.product.productRemarks}</Markdown>
              )}
            />
          ) : null}
          <CitationDetail />
        </Grid>

      </Grid>
    </Section>
  );
};

export default AboutSection;
