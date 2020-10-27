import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArchiveIcon from '@material-ui/icons/Archive';
import CodeIcon from '@material-ui/icons/Code';
import DocumentIcon from '@material-ui/icons/DescriptionOutlined';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import ImageIcon from '@material-ui/icons/Photo';
import PresentationIcon from '@material-ui/icons/PresentToAll';
import SpreadsheetIcon from '@material-ui/icons/GridOn';


import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const useStyles = makeStyles(theme => ({
  list: {
    paddingTop: theme.spacing(0),
  },
  listItem: {
    paddingLeft: theme.spacing(1),
  },
  listItemIcon: {
    minWidth: theme.spacing(4),
  },
}));

export const formatBytes = (bytes) => {
  if (!Number.isInteger(bytes) || bytes < 0) {
    return '0.000 B';
  }
  const scales = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const log = Math.log(bytes) / Math.log(1024);
  const scale = Math.floor(log);
  const precision = Math.floor(3 - ((log - scale) * 3));
  return `${(bytes / (1024 ** scale)).toFixed(precision)} ${scales[scale]}`;
};

const documentTypes = {
  pdf: {
    match: type => (type === 'application/pdf' || type.includes('pdf')),
    title: 'PDF',
    Icon: DocumentIcon,
  },
  image: {
    match: type => (['image/gif', 'image/png', 'image/jpeg'].includes(type) || type.startsWith('image')),
    title: type => `Image (${(type.match(/\/(.*)$/) || [])[1] || 'unknown type'})`,
    Icon: ImageIcon,
  },
  csv: {
    match: type => (type === 'text/csv' || type.includes('csv')),
    title: 'CSV',
    Icon: SpreadsheetIcon,
  },
  text: {
    match: type => (type === 'text/plain'),
    title: 'Plain text file',
    Icon: DocumentIcon,
  },
  document: {
    match: type => (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type)),
    title: 'Document',
    Icon: DocumentIcon,
  },
  spreadsheet: {
    match: type => (type.includes('spreadsheet') || type.includes('excel')),
    title: 'Spreadsheet',
    Icon: SpreadsheetIcon,
  },
  presentation: {
    match: type => (type.includes('presentation') || type.includes('powerpoint')),
    title: 'Presentation',
    Icon: PresentationIcon,
  },
  archive: {
    match: type => (type.includes('zip')),
    title: 'ZIP archive',
    Icon: ArchiveIcon,
  },
  binary: {
    match: type => (type === 'application/octet-stream'),
    title: 'Raw binary data',
    Icon: FileIcon,
  },
  xml: {
    match: type => (type === 'application/xml'),
    title: 'XML',
    Icon: CodeIcon,
  },
};

const documentTypeKeys = Object.keys(documentTypes);

const defaultDocumentType = {
  Icon: FileIcon,
  title: 'Unknown file type',
};

const DocumentationDetail = () => {
  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const renderDocument = (spec) => {
    if (!spec) { return null; }
    const apiPath = `${NeonEnvironment.getFullApiPath('documents')}/${spec.specNumber}`;
    const {
      specId: id,
      specNumber: number,
      specType: type,
      specSize: size,
      specDescription: description,
    } = spec;
    // Determine document type
    let documentType = defaultDocumentType;
    if (typeof type === 'string') {
      const matchKey = documentTypeKeys.find(key => documentTypes[key].match(type));
      if (matchKey) {
        documentType = documentTypes[matchKey];
      }
    }
    const { title: typeTitle, Icon: TypeIcon } = documentType;
    // Generate description strings
    const primary = description || number;
    const typeTitleString = typeof typeTitle === 'function' ? typeTitle(type) : typeTitle.toString();
    const secondary = size ? `${typeTitleString} - ${formatBytes(size)}` : typeTitleString;
    // Render
    return (
      <ListItem
        key={id}
        className={classes.listItem}
        component="a"
        href={apiPath}
        title={`Click to download ${secondary}`}
        button
      >
        <ListItemIcon className={classes.listItemIcon}>
          <TypeIcon />
        </ListItemIcon>
        <ListItemText primary={primary} secondary={secondary} />
      </ListItem>
    );
  };

  const { specs } = state.product;

  return (
    <Detail
      title="Documentation"
    >
      {(specs || []).length ? (
        <List dense className={classes.list}>
          {specs.map(renderDocument)}
        </List>
      ) : (
        <i>n/a</i>
      )}
    </Detail>
  );
};

export default DocumentationDetail;
