import React from 'react';
import Markdown from 'markdown-to-jsx';

import Grid from '@material-ui/core/Grid';

import DataProductContext from '../DataProductContext';

import Section from './Section';
import SkeletonSection from './SkeletonSection';

import Detail from '../Details/Detail';
import IdentifierDetail from '../Details/IdentifierDetail';
import ThemesDetail from '../Details/ThemesDetail';
import DataRangeDetail from '../Details/DataRangeDetail';
import CitationDetail from '../Details/CitationDetail';
import KeywordsDetail from '../Details/KeywordsDetail';
import DoiDetail from '../Details/DoiDetail';
// import ReleaseLinksDetail from '../Details/ReleaseLinksDetail';

const AboutSection = (props) => {
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const { route: { release: currentRelease } } = state;

  return !product ? <SkeletonSection {...props} /> : (
    <Section {...props}>
      <Grid container spacing={3}>

        <Grid item xs={12} md={5} lg={4}>
          <IdentifierDetail />
          {currentRelease ? <DoiDetail /> : null}
          <ThemesDetail />
          <Detail
            title="Responsible Science Team"
            content={product.productScienceTeam}
          />
          <DataRangeDetail />
          {/* <ReleaseLinksDetail /> */ }
          <KeywordsDetail />
        </Grid>

        <Grid item xs={12} md={7} lg={8}>
          <Detail
            title="Description"
            content={(
              <Markdown>{product.productDescription || '_n/a_'}</Markdown>
            )}
          />
          <Detail
            title="Abstract"
            content={(
              <Markdown>{product.productAbstract || '_n/a_'}</Markdown>
            )}
          />
          {product.productRemarks ? (
            <Detail
              title="Additional Information"
              content={(
                <Markdown>{product.productRemarks}</Markdown>
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
