import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import RouteService from 'portal-core-components/lib/service/RouteService';
import Theme from 'portal-core-components/lib/components/Theme';

/**
 * Style the component using the imported theme
 */
const useStyles = makeStyles(() => ({
  linkList: {
    listStyleType: 'none',
    padding: 0,
  },
  taxonTypes: {
    textTransform: 'lowercase',
    '&:first-letter': {
      textTransform: 'uppercase',
    },
  },
}));

/**
 * Define the taxon detail component
 * @param {*} dataProductCode
 * @returns The component
 */
const TaxonDetail = ({ dataProductCode }) => {
  /* use state for the popover */
  const [taxonTypes, setTaxonTypes] = useState(null);

  /* Get the taxon types from the API service */
  const getTaxonTypes = (productCode) => {
    const url = NeonEnvironment.getDataProductsTaxonTypesPath();
    const fullUrl = `${url}/${productCode}`;
    const headers = { 'Content-Type': 'application/json;charset=UTF-8' };
    fetch(fullUrl, { headers })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((json) => {
        const { taxonTypeCodes } = json.data;
        setTaxonTypes(taxonTypeCodes);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(`Could not fetch data products: ${error.message}.`);
      });
  };

  /**
   * Retrieve the taxon types from the API service
   */
  useEffect(() => {
    getTaxonTypes(dataProductCode);
  }, [dataProductCode]);

  const classes = useStyles(Theme);

  /* Return the component */
  if (taxonTypes !== null) {
    return (
      <div>
        <Typography variant="h6" component="div">Associated Taxon Types</Typography>
        <ul className={classes.linkList}>
          {taxonTypes.map((taxonType) => (
            <li key={taxonType}>
              <Link href={`${RouteService.getTaxonomicListsPath()}?taxonTypeCode=${taxonType}`}>
                <p className={classes.taxonTypes}>{taxonType}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

/* Define the component prop types */
TaxonDetail.propTypes = {
  dataProductCode: PropTypes.string,
};

/* Define the default prop values */
TaxonDetail.defaultProps = {
  dataProductCode: '',
};

/* export the component */
export default TaxonDetail;
