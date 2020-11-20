/* eslint-disable react/jsx-one-expression-per-line */

import React from 'react';
import dateFormat from 'dateformat';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CopyIcon from '@material-ui/icons/Assignment';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';
import DataProductContext from '../DataProductContext';

const useStyles = makeStyles(theme => ({
  copyButton: {
    padding: Theme.spacing(0.5, 2),
    backgroundColor: '#fff',
  },
  citationCard: {
    marginTop: theme.spacing(2),
  },
  citationText: {
    fontFamily: 'monospace',
  },
  citationTextWithQualifier: {
    marginTop: theme.spacing(1.5),
    fontFamily: 'monospace',
  },
}));

const CitationDetail = () => {
  const classes = useStyles(Theme);
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const {
    route: {
      release: currentRelease,
    },
    data: {
      product: {
        dois,
      },
    },
  } = state;

  const latestDoi = dois && dois.length ? dois[0] : null;

  const dataPolicyLink = (
    <a href="https://preview.neonscience.org/data-samples/data-policies-citation">
      Data Policies &amp; Citation Guidelines
    </a>
  );

  const getCitationText = (release) => {
    const provisional = release === 'provisional';
    const citationDoi = release && !provisional ? dois.find(doi => doi.release === release) : null;
    const now = new Date();
    const today = dateFormat(now, 'mmmm d, yyyy');
    const neon = 'NEON (National Ecological Observatory Network)';
    const productName = provisional
      ? `${product.productName} (${product.productCode})`
      : `${product.productName}, ${release} (${product.productCode})`;
    const doiText = citationDoi ? `. ${citationDoi.url}` : '';
    const url = 'https://data.neonscience.org';
    const accessed = provisional
      ? `${url} (accessed ${today})`
      : `Dataset accessed from ${url} on ${today}`;
    return `${neon}. ${productName}${doiText}. ${accessed}`;
  };

  const renderCitationCard = (release, conditional = false) => {
    const provisional = release === 'provisional';
    let conditionalText = null;
    let citationClassName = classes.citationText;
    if (conditional) {
      conditionalText = (
        <Typography variant="body1" component="h6">
          {(
            provisional
              ? 'If Provisional data are used, include:'
              : 'If Released data are used, include:'
          )}
        </Typography>
      );
      citationClassName = classes.citationTextWithQualifier;
    }
    const citationText = getCitationText(release);
    return (
      <Card className={classes.citationCard}>
        <CardContent>
          {conditionalText}
          <Typography variant="body1" className={citationClassName}>
            {citationText}
          </Typography>
        </CardContent>
        <CardActions>
          <CopyToClipboard text={citationText}>
            <Button color="primary" variant="outlined" size="small" className={classes.copyButton}>
              <CopyIcon fontSize="small" style={{ marginRight: Theme.spacing(1) }} />
              Copy
            </Button>
          </CopyToClipboard>
        </CardActions>
      </Card>
    );
  };

  return (
    <Detail title="Citation">
      <Typography variant="subtitle2">
        {(
          currentRelease
            ? 'Please use this citation in your publications. '
            : 'Please use the appropriate citation(s) from below in your publications. If using both provisional and release data please include both citations. '
        )}
        See {dataPolicyLink} for more info.
      </Typography>
      {currentRelease ? (
        renderCitationCard(currentRelease)
      ) : (
        <React.Fragment>
          {renderCitationCard('provisional', true)}
          {latestDoi ? renderCitationCard(latestDoi.release, true) : null}
        </React.Fragment>
      )}
    </Detail>
  );
};

export default CitationDetail;
