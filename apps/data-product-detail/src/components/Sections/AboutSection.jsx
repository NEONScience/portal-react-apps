import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ComponentErrorBoundary from 'portal-core-components/lib/components/Error/ComponentErrorBoundary';
import CustomComponentFallback from 'portal-core-components/lib/components/Error/CustomComponentFallback';

import DataProductContext from '../DataProductContext';

import Section from './Section';
import SkeletonSection from './SkeletonSection';

import Detail from '../Details/Detail';
import IdentifierDetail from '../Details/IdentifierDetail';
import ThemesDetail from '../Details/ThemesDetail';
import DataRangeDetail from '../Details/DataRangeDetail';
import CitationDetail from '../Details/CitationDetail';
import KeywordsDetail from '../Details/KeywordsDetail';
import TaxonDetail from '../Details/TaxonDetail';
import BioRepoCollectionsDetail from '../Details/BioRepoCollectionsDetail';

const AboutSectionTextComponent = (props) => {
  const { content } = props;
  return (
    <Typography variant="body2" component="p">
      {content}
    </Typography>
  );
};
AboutSectionTextComponent.propTypes = {
  content: PropTypes.string,
};
AboutSectionTextComponent.defaultProps = {
  content: null,
};

const MarkdownFallbackComponent = (props) => ((
  <CustomComponentFallback
    // eslint-disable-next-line react/no-unstable-nested-components
    FallbackComponent={() => ((<AboutSectionTextComponent {...props} />))}
  />
));

const AboutSection = (props) => {
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  return !product ? <SkeletonSection {...props} /> : (
    <Section {...props}>
      <Grid container spacing={3}>

        <Grid item xs={12} md={7} lg={8}>
          <Detail
            title="Description"
            content={(
              <ComponentErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                fallbackComponent={() => ((
                  <MarkdownFallbackComponent content={product.productDescription || '_n/a_'} />
                ))}
                onReset={() => { /* noop for boundary reset */ }}
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {product.productDescription || '_n/a_'}
                </Markdown>
              </ComponentErrorBoundary>
            )}
          />
          <Detail
            title="Abstract"
            content={(
              <ComponentErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                fallbackComponent={() => ((
                  <MarkdownFallbackComponent content={product.productAbstract || '_n/a_'} />
                ))}
                onReset={() => { /* noop for boundary reset */ }}
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {product.productAbstract || '_n/a_'}
                </Markdown>
              </ComponentErrorBoundary>
            )}
          />
          {product.productRemarks ? (
            <Detail
              title="Additional Information"
              content={(
                <ComponentErrorBoundary
                  // eslint-disable-next-line react/no-unstable-nested-components
                  fallbackComponent={() => ((
                    <MarkdownFallbackComponent content={product.productRemarks} />
                  ))}
                  onReset={() => { /* noop for boundary reset */ }}
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {product.productRemarks}
                  </Markdown>
                </ComponentErrorBoundary>
              )}
            />
          ) : null}
          <CitationDetail />
        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <IdentifierDetail />
          <ThemesDetail />
          <Detail
            title="Responsible Science Team"
            content={product.productScienceTeam}
          />
          <DataRangeDetail />
          <KeywordsDetail />
          <BioRepoCollectionsDetail />
          <TaxonDetail dataProductCode={product.productCode} />
        </Grid>

        <Grid item xs={12}>
          <Detail
            title="Study Description"
            content={(
              <ComponentErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                fallbackComponent={() => ((
                  <MarkdownFallbackComponent content={product.productStudyDescription || '_n/a_'} />
                ))}
                onReset={() => { /* noop for boundary reset */ }}
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {product.productStudyDescription || '_n/a_'}
                </Markdown>
              </ComponentErrorBoundary>
            )}
          />
          <Detail
            title="Design Description"
            tooltip="More information about the science design can be found in this data product's documentation."
            content={(
              <ComponentErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                fallbackComponent={() => ((
                  <MarkdownFallbackComponent content={product.productDesignDescription || '_n/a_'} />
                ))}
                onReset={() => { /* noop for boundary reset */ }}
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {product.productDesignDescription || '_n/a_'}
                </Markdown>
              </ComponentErrorBoundary>
            )}
          />
          <Detail
            title="Instrumentation"
            content={product.productSensor}
          />
        </Grid>

      </Grid>
    </Section>
  );
};

export default AboutSection;
