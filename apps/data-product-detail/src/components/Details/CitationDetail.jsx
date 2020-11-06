/* eslint-disable react/jsx-one-expression-per-line */

import React, { useContext } from 'react';
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

import { StoreContext } from '../../Store';

const useStyles = makeStyles(theme => ({
  copyButton: {
    padding: Theme.spacing(0.5, 2),
    backgroundColor: '#fff',
  },
  citationCard: {
    marginTop: theme.spacing(2),
  },
  citationText: {
    marginTop: theme.spacing(1.5),
    fontFamily: 'monospace',
  },
}));

const CitationDetail = () => {
  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const {
    product,
    release,
  } = state;

  const doi = null;

  const dataPolicyLink = (
    <a href="https://preview.neonscience.org/data-samples/data-policies-citation">
      Data Policies &amp; Citation Guidelines
    </a>
  );

  const getCitationText = (releaseId) => {
    const provisional = releaseId === 'provisional';
    const now = new Date();
    const today = dateFormat(now, 'mmmm d, yyyy');
    const neon = 'NEON (National Ecological Observatory Network)';
    const productName = provisional
      ? `${product.productName} (${product.productCode})`
      : `${product.productName}, ${releaseId} (${product.productCode})`;
    const doiText = provisional && doi ? `. ${doi}` : '';
    const url = 'https://data.neonscience.org';
    const accessed = provisional
      ? `${url} (accessed ${today})`
      : `Dataset accessed from ${url} on ${today}`;
    return `${neon}. ${productName}${doiText}. ${accessed}`;
  };

  const renderCitationCard = (releaseId, conditional = false) => {
    const provisional = releaseId === 'provisional';
    let conditionalText = null;
    if (conditional) {
      conditionalText = (
        <Typography variant="subtitle1" component="h5">
          {(
            provisional
              ? 'If Provisional data are used, include:'
              : 'If Released data are used, include:'
          )}
        </Typography>
      );
    }
    const citationText = getCitationText(releaseId);
    return (
      <Card className={classes.citationCard}>
        <CardContent>
          {conditionalText}
          <Typography variant="body1" className={classes.citationText}>
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
          release.focused
            ? 'Please use the appropriate citation(s) from below in your publications. If you using both provisional and release data please include both citations. '
            : 'Please use this citation in your publications. '
        )}
        See {dataPolicyLink} for more info.
      </Typography>
      {release.focused ? (
        renderCitationCard(release.focused)
      ) : (
        <React.Fragment>
          {renderCitationCard('provisional', true)}
          {renderCitationCard(release.latestForProduct, true)}
        </React.Fragment>
      )}
    </Detail>
  );
};

export default CitationDetail;
