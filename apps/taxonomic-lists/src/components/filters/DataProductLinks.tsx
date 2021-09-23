import * as React from 'react';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

import RouteService from 'portal-core-components/lib/service/RouteService';
import Theme from 'portal-core-components/lib/components/Theme';

/**
 * Style the component using the imported theme
 */
const useStyles = makeStyles((theme) => ({
    linkList: {
        listStyleType: 'none',
        padding: Theme.spacing(3),
    },
}));

/**
 * Display a popover containing links to the detail page for each data product.
 * @param dataProducts An array of data product objects
 * @returns The component
 */
const DataProductLinks = (props: any) => {

    const dataProducts = props.props.dataProducts;
    const classes = useStyles(Theme);

    /* Define state for the popover */
    const [anchorElement, setAnchorElement] = React.useState<HTMLButtonElement | null>(null);

    /* Handle button click events for the popover */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    };

    /* Close the popover using the state method */
    const handleClose = () => {
        setAnchorElement(null);
    };

    /* Return the component */
    const open = Boolean(anchorElement);
    const id = open ? 'popover' : undefined;
    if (typeof dataProducts === 'object' && Array.isArray(dataProducts) && dataProducts.length > 0) {
        return (
            <div>
                <Button
                    aria-describedby={id}
                    variant="contained"
                    onClick={handleClick}
                    style={{ minWidth: '183px' }}
                >
                    View Data Products
                </Button>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorElement}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <ul className={classes.linkList}>
                        {dataProducts.map((dataProduct: any) => (
                            <li key={dataProduct.dataProductCode}>
                                <Link href={RouteService.getProductDetailPath(dataProduct.dataProductCode)}>
                                    {dataProduct.dataProductCode}
                                </Link> - {dataProduct.dataProductName}
                            </li>
                        ))}
                    </ul>
                </Popover>
            </div>
        );
    }
    return null;
}

/* Export the component */
export default DataProductLinks;
