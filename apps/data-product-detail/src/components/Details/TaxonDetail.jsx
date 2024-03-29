import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import RouteService from 'portal-core-components/lib/service/RouteService';
import Theme from 'portal-core-components/lib/components/Theme';
import { exists } from 'portal-core-components/lib/util/typeUtil';

/**
 * Style the component using the imported theme
 */
const useStyles = makeStyles(() => ({
  linkList: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  link: {
    marginBottom: Theme.spacing(1),
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
    const baseUrl = NeonEnvironment.getDataProductTaxonTypesPath();
    const fullUrl = `${baseUrl}/${productCode}`;
    const init = {
      mode: 'cors',
      credentials: NeonEnvironment.requireCors() ? 'include' : 'same-origin',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    };
    fetch(fullUrl, init)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((json) => {
        if (!exists(json) || !exists(json.data)) {
          return;
        }
        const { taxonTypeCodes } = json.data;
        setTaxonTypes(taxonTypeCodes || null);
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

  /**
  * Capitalize the first letter of a string.
  * @param s the string
  * @returns the string with the first letter capitalized
  */
  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

  /**
   * Parse the taxon type code into a more readable format.
   * @param s the string
   * @returns the string with each embedded word capitalized
   */
  const parseTaxonType = (s) => {
    if (s.includes('_')) {
      const spaceDelimited = s.split('_').join(' ');
      const words = spaceDelimited.split(' ');
      const capitalized = words.map((word) => capitalize(word.toLowerCase()));
      return capitalized.join(' ');
    }
    return capitalize(s.toLowerCase());
  };

  /* Return the component */
  if (taxonTypes !== null) {
    return (
      <div>
        <Typography variant="h6" component="div">Associated Taxon Types</Typography>
        <ul className={classes.linkList}>
          {taxonTypes.map((taxonType) => (
            <li key={taxonType} className={classes.link}>
              <Link href={`${RouteService.getTaxonomicListsPath()}?taxonTypeCode=${taxonType}`}>
                {parseTaxonType(taxonType)}
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
